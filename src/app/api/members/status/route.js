import Stripe from "stripe";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function GET() {
  const session = await auth();
  const email = session?.user?.email;

  if (!email) {
    return Response.json({ active: false, reason: "not_logged_in" }, { status: 200 });
  }

  if (!process.env.STRIPE_PRICE_ID) {
    return Response.json({ active: false, reason: "missing_price_id" }, { status: 500 });
  }

  try {
    // 1) Find customer by email (Stripe supports filtering by exact email)
    const customers = await stripe.customers.list({ email, limit: 1 }); //  [oai_citation:3‡Stripe Docs](https://docs.stripe.com/api/customers/list?utm_source=chatgpt.com)
    const customer = customers.data?.[0];

    if (!customer) {
      return Response.json({ active: false, reason: "no_customer" }, { status: 200 });
    }

    // 2) List subscriptions for customer
    const subs = await stripe.subscriptions.list({
      customer: customer.id,
      status: "all",
      limit: 20,
    }); //  [oai_citation:4‡Stripe Docs](https://docs.stripe.com/api/subscriptions/list?utm_source=chatgpt.com)

    const hasActive = subs.data.some((s) => {
      const statusOk = s.status === "active" || s.status === "trialing"; //  [oai_citation:5‡Stripe Docs](https://docs.stripe.com/api/subscriptions/object?utm_source=chatgpt.com)
      const matchesPrice = (s.items?.data || []).some((it) => it.price?.id === process.env.STRIPE_PRICE_ID);
      return statusOk && matchesPrice;
    });

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