import Stripe from "stripe";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getCheckoutModeForPrice, getConfiguredMonthlyPrice } from "@/lib/stripe";

export const runtime = "nodejs";

export async function POST() {
  const secret = process.env.STRIPE_SECRET_KEY;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  if (!secret) {
    return NextResponse.json(
      { ok: false, error: "Missing STRIPE_SECRET_KEY" },
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
    const monthlyPrice = await getConfiguredMonthlyPrice(stripe);

    if (!monthlyPrice.ok) {
      return NextResponse.json(
        { ok: false, error: monthlyPrice.error },
        { status: monthlyPrice.status }
      );
    }
    const mode = getCheckoutModeForPrice(monthlyPrice.price);

    // If the user is logged in, prefill Checkout with their email.
    // If not logged in, Stripe will still collect an email during Checkout.
    const session = await auth();
    const email = session?.user?.email || undefined;

    const checkoutSession = await stripe.checkout.sessions.create({
      mode,
      line_items: [{ price: monthlyPrice.priceId, quantity: 1 }],

      // Post-checkout pages
      success_url: `${siteUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/cancel`,

      // Prefill email when available (helps link Stripe to the correct member)
      customer_email: email,
      customer_creation: mode === "payment" ? "always" : undefined,

      // Optional small UX upgrade
      allow_promotion_codes: true,

      subscription_data:
        mode === "subscription"
          ? {
              // You can add metadata here later if needed
            }
          : undefined,
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
