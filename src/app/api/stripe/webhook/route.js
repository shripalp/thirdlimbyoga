import Stripe from "stripe";
import { NextResponse } from "next/server";

export const runtime = "nodejs"; // important for Stripe signature verification

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
  const sig = req.headers.get("stripe-signature");

  let event;
  try {
    const body = await req.text();

    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  // MVP: log events (next step we store membership status)
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    console.log("✅ checkout.session.completed", {
      id: session.id,
      customer: session.customer,
      subscription: session.subscription,
      email: session.customer_details?.email,
    });
  }

  if (event.type === "customer.subscription.updated" || event.type === "customer.subscription.deleted") {
    const sub = event.data.object;
    console.log("✅ subscription change", { id: sub.id, status: sub.status });
  }

  return NextResponse.json({ received: true });
}
