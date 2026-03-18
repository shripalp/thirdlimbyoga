import Stripe from "stripe";
import { NextResponse } from "next/server";
import { isCheckoutSessionActive } from "@/lib/stripe";

export const runtime = "nodejs";

export async function GET(req) {
  const secret = process.env.STRIPE_SECRET_KEY;

  if (!secret) {
    return NextResponse.json({ ok: false, error: "Missing STRIPE_SECRET_KEY" }, { status: 500 });
  }

  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("session_id");

  if (!sessionId) {
    return NextResponse.json({ ok: false, error: "Missing session_id" }, { status: 400 });
  }

  try {
    const stripe = new Stripe(secret);

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["subscription"],
    });

    const active = isCheckoutSessionActive(session);

    return NextResponse.json({ ok: true, active: !!active });
  } catch (err) {
    console.error("Stripe verify-session error:", err);
    return NextResponse.json(
      { ok: false, error: err?.message || "Failed to verify session" },
      { status: 500 }
    );
  }
}
