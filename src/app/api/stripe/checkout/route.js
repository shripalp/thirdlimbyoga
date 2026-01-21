import Stripe from "stripe";
import { NextResponse } from "next/server";
import { auth } from "@/auth";

export const runtime = "nodejs";

export async function POST() {
  const secret = process.env.STRIPE_SECRET_KEY;
  const priceId = process.env.STRIPE_PRICE_ID;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  if (!secret) {
    return NextResponse.json(
      { ok: false, error: "Missing STRIPE_SECRET_KEY" },
      { status: 500 }
    );
  }
  if (!priceId) {
    return NextResponse.json(
      { ok: false, error: "Missing STRIPE_PRICE_ID" },
      { status: 500 }
    );
  }
  if (!siteUrl) {
    return NextResponse.json(
      { ok: false, error: "Missing NEXT_PUBLIC_SITE_URL" },
      { status: 500 }
    );
  }

  try {
    const stripe = new Stripe(secret);

    // If the user is logged in, prefill Checkout with their email.
    // If not logged in, Stripe will still collect an email during Checkout.
    const session = await auth();
    const email = session?.user?.email || undefined;

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],

      // Post-checkout pages
      success_url: `${siteUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/cancel`,

      // Prefill email when available (helps link Stripe to the correct member)
      customer_email: email,

      // Optional small UX upgrade
      allow_promotion_codes: true,

      // Keep subscription active until user cancels
      subscription_data: {
        // You can add metadata here later if needed
      },
    });

    return NextResponse.json({ ok: true, url: checkoutSession.url });
  } catch (err) {
    console.error("Stripe checkout error:", err);
    return NextResponse.json(
      { ok: false, error: err?.message || "Stripe checkout failed" },
      { status: 500 }
    );
  }
}