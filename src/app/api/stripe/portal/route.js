import Stripe from "stripe";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req) {
  const secret = process.env.STRIPE_SECRET_KEY;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  if (!secret) {
    return NextResponse.json({ ok: false, error: "Missing STRIPE_SECRET_KEY" }, { status: 500 });
  }
  if (!siteUrl) {
    return NextResponse.json({ ok: false, error: "Missing NEXT_PUBLIC_SITE_URL" }, { status: 500 });
  }

  let sessionId;
  try {
    const body = await req.json();
    sessionId = body?.session_id;
  } catch {
    sessionId = null;
  }

  if (!sessionId) {
    return NextResponse.json({ ok: false, error: "Missing session_id" }, { status: 400 });
  }

  try {
    const stripe = new Stripe(secret);

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const customerId = session.customer;

    if (!customerId) {
      return NextResponse.json({ ok: false, error: "No customer found for session" }, { status: 400 });
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${siteUrl}/members?session_id=${encodeURIComponent(sessionId)}`,
    });

    return NextResponse.json({ ok: true, url: portalSession.url });
  } catch (err) {
    console.error("Stripe portal error:", err);
    return NextResponse.json(
      { ok: false, error: err?.message || "Failed to create portal session" },
      { status: 500 }
    );
  }
}