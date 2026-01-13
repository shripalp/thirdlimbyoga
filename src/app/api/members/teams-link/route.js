import Stripe from "stripe";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("session_id");

  if (!sessionId) {
    return NextResponse.json({ ok: false, error: "Missing session_id" }, { status: 400 });
  }

  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ["subscription"],
  });

  const sub = session.subscription;
  const active = sub && (sub.status === "active" || sub.status === "trialing");

  if (!active) {
    return NextResponse.json({ ok: true, active: false });
  }

  return NextResponse.json({
    ok: true,
    active: true,
    url: process.env.TEAMS_CLASS_LINK,
  });
}
