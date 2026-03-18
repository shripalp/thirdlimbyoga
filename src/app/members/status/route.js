import Stripe from "stripe";
import { auth } from "@/auth";
import {
  getConfiguredMonthlyPrice,
  getMonthlyPriceId,
  getOneTimeAccessUntil,
} from "@/lib/stripe";

export const dynamic = "force-dynamic";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function GET() {
  const priceId = getMonthlyPriceId();
  const session = await auth();
  const email = session?.user?.email;

  if (!email) {
    return Response.json({ active: false, reason: "not_logged_in" }, { status: 200 });
  }

  if (!priceId) {
    return Response.json({ active: false, reason: "missing_price_id" }, { status: 500 });
  }

  try {
    const configuredPrice = await getConfiguredMonthlyPrice(stripe);
    if (!configuredPrice.ok) {
      return Response.json(
        { active: false, reason: "invalid_price", message: configuredPrice.error },
        { status: configuredPrice.status }
      );
    }

    // 1) Find customer by email (Stripe supports filtering by exact email)
    const customers = await stripe.customers.list({ email, limit: 1 }); //  [oai_citation:3‡Stripe Docs](https://docs.stripe.com/api/customers/list?utm_source=chatgpt.com)
    const customer = customers.data?.[0];

    if (!customer) {
      return Response.json({ active: false, reason: "no_customer" }, { status: 200 });
    }

    let hasActive = false;

    if (configuredPrice.price.type === "recurring") {
      // 2) List subscriptions for customer
      const subs = await stripe.subscriptions.list({
        customer: customer.id,
        status: "all",
        limit: 20,
      }); //  [oai_citation:4‡Stripe Docs](https://docs.stripe.com/api/subscriptions/list?utm_source=chatgpt.com)

      hasActive = subs.data.some((s) => {
        const statusOk = s.status === "active" || s.status === "trialing"; //  [oai_citation:5‡Stripe Docs](https://docs.stripe.com/api/subscriptions/object?utm_source=chatgpt.com)
        const matchesPrice = (s.items?.data || []).some((it) => it.price?.id === priceId);
        return statusOk && matchesPrice;
      });
    } else {
      const sessions = await stripe.checkout.sessions.list({
        customer: customer.id,
        limit: 20,
      });

      for (const session of sessions.data || []) {
        if (session.mode !== "payment" || session.payment_status !== "paid") continue;
        const accessUntilUnix = getOneTimeAccessUntil(session.created);
        if (!accessUntilUnix || accessUntilUnix * 1000 < Date.now()) continue;

        const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
          limit: 20,
        });
        const matchesPrice = (lineItems.data || []).some(
          (item) => item.price?.id === priceId
        );
        if (matchesPrice) {
          hasActive = true;
          break;
        }
      }
    }

    return Response.json(
      {
        active: hasActive,
        email,
        customerId: customer.id,
      },
      { status: 200 }
    );
  } catch (err) {
    return Response.json(
      { active: false, reason: "stripe_error", message: err?.message || "Unknown error" },
      { status: 500 }
    );
  }
}
