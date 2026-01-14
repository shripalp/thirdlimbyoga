import Stripe from "stripe";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
  const { session_id } = await req.json();
  if (!session_id) {
    return NextResponse.json({ error: "Missing session_id" }, { status: 400 });
  }

  const session = await stripe.checkout.sessions.retrieve(session_id);
  const customer = session.customer;

  const portalSession = await stripe.billingPortal.sessions.create({
    customer,
    return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/members?session_id=${encodeURIComponent(session_id)}`,
  });

  return NextResponse.json({ url: portalSession.url });
}
