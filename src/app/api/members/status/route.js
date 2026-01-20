import Stripe from "stripe";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs"; // important for Stripe + consistent cookie handling

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function GET(request) {
  // ✅ pass request so auth can read cookies in route handlers
  const session = await auth(request);
  const email = session?.user?.email;

  if (!email) {
    return Response.json(
      { active: false, reason: "not_logged_in" },
      { status: 200 }
    );
  }

  try {
    const customers = await stripe.customers.list({ email, limit: 1 });
    const customer = customers.data[0];

    if (!customer) {
      return Response.json(
        { active: false, reason: "no_customer", email },
        { status: 200 }
      );
    }

    const subs = await stripe.subscriptions.list({
      customer: customer.id,
      status: "all",
      limit: 20,
    });

    const hasActive = subs.data.some((sub) => {
      const statusOk = sub.status === "active" || sub.status === "trialing";
      const priceMatch = sub.items.data.some(
        (item) => item.price.id === process.env.STRIPE_PRICE_ID
      );
      return statusOk && priceMatch;
    });

    return Response.json({ active: hasActive, email }, { status: 200 });
  } catch (err) {
    return Response.json(
      { active: false, reason: "stripe_error", message: err?.message },
      { status: 500 }
    );
  }
}