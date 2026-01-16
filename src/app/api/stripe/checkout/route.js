import Stripe from "stripe";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST() {
  const secret = process.env.STRIPE_SECRET_KEY;
  const priceId = process.env.STRIPE_PRICE_ID;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  if (!secret) {
    return NextResponse.json({ ok: false, error: "Missing STRIPE_SECRET_KEY" }, { status: 500 });
  }
  if (!priceId) {
    return NextResponse.json({ ok: false, error: "Missing STRIPE_PRICE_ID" }, { status: 500 });
  }
  if (!siteUrl) {
    return NextResponse.json({ ok: false, error: "Missing NEXT_PUBLIC_SITE_URL" }, { status: 500 });
  }

  try {
    const stripe = new Stripe(secret);

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${siteUrl}/members?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/pricing`,
      // good idea: ensure Stripe collects email
      customer_email: undefined, // leave undefined; Stripe will collect email in Checkout
    });

    return NextResponse.json({ ok: true, url: session.url });
  } catch (err) {
    console.error("Stripe checkout error:", err);
    return NextResponse.json(
      { ok: false, error: err?.message || "Stripe checkout failed" },
      { status: 500 }
    );
  }
}