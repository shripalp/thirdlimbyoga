import Stripe from "stripe";
import { auth } from "@/auth";
import {
  getConfiguredMonthlyPrice,
  getMonthlyPriceId,
  getOneTimeAccessUntil,
} from "@/lib/stripe";

export const dynamic = "force-dynamic";
export const runtime = "nodejs"; // important for Stripe + consistent cookie handling

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function GET(request) {
  const priceId = getMonthlyPriceId();

  // ✅ pass request so auth can read cookies in route handlers
  const session = await auth(request);
  const email = session?.user?.email;

  if (!email) {
    return Response.json(
      { active: false, reason: "not_logged_in" },
      { status: 200 }
    );
  }

  if (!priceId) {
    return Response.json(
      { active: false, reason: "missing_price_id" },
      { status: 500 }
    );
  }

  try {
    const configuredPrice = await getConfiguredMonthlyPrice(stripe);
    if (!configuredPrice.ok) {
      return Response.json(
        { active: false, reason: "invalid_price", message: configuredPrice.error },
        { status: configuredPrice.status }
      );
    }

    const customers = await stripe.customers.list({ email, limit: 1 });
    const customer = customers.data[0];

    if (!customer) {
      return Response.json(
        { active: false, reason: "no_customer", email },
        { status: 200 }
      );
    }

    let hasActive = false;

    if (configuredPrice.price.type === "recurring") {
      const subs = await stripe.subscriptions.list({
        customer: customer.id,
        status: "all",
        limit: 20,
      });

      hasActive = subs.data.some((sub) => {
        const statusOk = sub.status === "active" || sub.status === "trialing";
        const priceMatch = sub.items.data.some((item) => item.price.id === priceId);
        return statusOk && priceMatch;
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
        const priceMatch = (lineItems.data || []).some((item) => item.price?.id === priceId);
        if (priceMatch) {
          hasActive = true;
          break;
        }
      }
    }

    return Response.json({ active: hasActive, email }, { status: 200 });
  } catch (err) {
    return Response.json(
      { active: false, reason: "stripe_error", message: err?.message },
      { status: 500 }
    );
  }
}
