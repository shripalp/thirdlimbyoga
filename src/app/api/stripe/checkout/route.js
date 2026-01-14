import Stripe from "stripe";
import { NextResponse } from "next/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const priceId = process.env.STRIPE_PRICE_ID;

  if (!siteUrl || !priceId) {
    return NextResponse.json(
      { error: "Missing NEXT_PUBLIC_SITE_URL or STRIPE_PRICE_ID" },
      { status: 500 }
    );
  }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${siteUrl}/members?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/pricing`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Stripe checkout error:", err);
    return NextResponse.json(
      { error: err?.message || "Stripe checkout failed" },
      { status: 500 }
    );
  }
}
