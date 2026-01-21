import Stripe from "stripe";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  const secret = process.env.STRIPE_SECRET_KEY;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  if (!secret || !siteUrl) {
    return Response.json(
      { error: "Server configuration error" },
      { status: 500 }
    );
  }

  const stripe = new Stripe(secret);

  const session = await auth();
  const email = session?.user?.email;

  if (!email) {
    return Response.json({ error: "Not logged in" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      stripeCustomerId: true,
      stripeSubscriptionId: true,
    },
  });

  if (!user?.stripeCustomerId || !user?.stripeSubscriptionId) {
    return Response.json(
      { error: "No active subscription found" },
      { status: 400 }
    );
  }

  // 🔑 This is the important part: flow_data + after_completion redirect
  const portalSession = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    flow_data: {
      type: "subscription_cancel",
      subscription_cancel: {
        subscription: user.stripeSubscriptionId,
      },
      after_completion: {
        type: "redirect",
        redirect: {
          return_url: `${siteUrl}/members?cancel=1`,
        },
      },
    },
  });

  return Response.json({ url: portalSession.url });
}