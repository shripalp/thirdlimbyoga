import Stripe from "stripe";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  const secret = process.env.STRIPE_SECRET_KEY;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  if (!secret) {
    return Response.json(
      { error: "Missing STRIPE_SECRET_KEY" },
      { status: 500 }
    );
  }

  if (!siteUrl) {
    return Response.json(
      { error: "Missing NEXT_PUBLIC_SITE_URL" },
      { status: 500 }
    );
  }

  try {
    const session = await auth();
    const email = session?.user?.email;

    if (!email) {
      return Response.json({ error: "Not logged in" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { stripeCustomerId: true },
    });

    if (!user?.stripeCustomerId) {
      return Response.json(
        { error: "No Stripe customer found for this account" },
        { status: 400 }
      );
    }

    const stripe = new Stripe(secret);

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      // Stripe usually shows a "Return" button; this ensures it points back to your Members page
      return_url: `${siteUrl}/members`,
    });

    return Response.json({ url: portalSession.url });
  } catch (err) {
    console.error("Stripe portal error:", err);
    return Response.json(
      { error: err?.message || "Failed to open Stripe portal" },
      { status: 500 }
    );
  }
}