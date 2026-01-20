import Stripe from "stripe";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST() {
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

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/members`,
  });

  return Response.json({ url: portalSession.url });
}