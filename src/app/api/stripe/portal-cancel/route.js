import { NextResponse } from "next/server";
import Stripe from "stripe";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function getBaseUrl() {
  // Prefer explicit site URL, fall back to localhost for dev.
  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.AUTH_URL ||
    "http://localhost:3000"
  );
}

export async function POST() {
  try {
    const session = await auth();
    const email = session?.user?.email;

    if (!email) {
      return NextResponse.json({ error: "Not logged in" }, { status: 401 });
    }

    const secret = process.env.STRIPE_SECRET_KEY;
    if (!secret) {
      return NextResponse.json({ error: "Missing STRIPE_SECRET_KEY" }, { status: 500 });
    }

    const stripe = new Stripe(secret);

    // Find user + stripe ids
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, stripeCustomerId: true, stripeSubscriptionId: true },
    });

    if (!user?.stripeCustomerId) {
      // Try to recover by email in Stripe (useful if DB is missing the customer id)
      const foundCustomers = await stripe.customers.list({ email, limit: 1 });
      const found = foundCustomers.data?.[0];
      if (!found?.id) {
        return NextResponse.json(
          { error: "Missing stripeCustomerId for this user" },
          { status: 400 }
        );
      }

      await prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId: found.id },
      });

      user.stripeCustomerId = found.id;
    }

    // Helper: pick a subscription that is cancellable
    const isCancellableStatus = (s) =>
      s === "active" || s === "trialing" || s === "past_due" || s === "unpaid";

    let subscriptionToCancel = null;

    // 1) Try stored subscription id first
    if (user.stripeSubscriptionId) {
      try {
        const sub = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);
        const subCustomerId = typeof sub.customer === "string" ? sub.customer : sub.customer?.id;

        if (
          sub?.id &&
          subCustomerId === user.stripeCustomerId &&
          isCancellableStatus(sub.status) &&
          !sub.cancel_at_period_end
        ) {
          subscriptionToCancel = sub;
        }
      } catch {
        // ignore and fall back to listing
      }
    }

    // 2) Fall back: list subscriptions for the customer and pick newest cancellable
    if (!subscriptionToCancel) {
      let subs = await stripe.subscriptions.list({
        customer: user.stripeCustomerId,
        status: "all",
        limit: 20,
      });

      // If this customer has no subscriptions, try to recover the right customer by email
      if (!subs.data || subs.data.length === 0) {
        const foundCustomers = await stripe.customers.list({ email, limit: 1 });
        const found = foundCustomers.data?.[0];

        if (found?.id && found.id !== user.stripeCustomerId) {
          await prisma.user.update({
            where: { id: user.id },
            data: { stripeCustomerId: found.id },
          });

          user.stripeCustomerId = found.id;

          subs = await stripe.subscriptions.list({
            customer: user.stripeCustomerId,
            status: "all",
            limit: 20,
          });
        }
      }

      // newest first (created desc)
      const sorted = [...(subs.data || [])].sort((a, b) => (b.created || 0) - (a.created || 0));

      // pick the newest cancellable sub that isn't already set to cancel at period end
      subscriptionToCancel = sorted.find(
        (sub) => isCancellableStatus(sub.status) && !sub.cancel_at_period_end
      );
    }

    const baseUrl = getBaseUrl();
    const returnUrl = `${baseUrl}/members?cancel=1`;

    // If we found a cancellable subscription, send them to a “cancel flow” in portal
    // (Stripe requires a subscription id for this flow).  [oai_citation:4‡Stripe Docs](https://docs.stripe.com/api/customer_portal/sessions/create?utm_source=chatgpt.com)
    if (subscriptionToCancel?.id) {
      const portal = await stripe.billingPortal.sessions.create({
        customer: user.stripeCustomerId,
        return_url: returnUrl,
        flow_data: {
          type: "subscription_cancel",
          subscription_cancel: {
            subscription: subscriptionToCancel.id,
          },
          after_completion: {
            type: "redirect",
            redirect: { return_url: returnUrl },
          },
        },
      });

      return NextResponse.json({ url: portal.url });
    }

    // Otherwise open general portal (still useful if they have other states)
    const portal = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: returnUrl,
    });

    return NextResponse.json({
      url: portal.url,
      warning:
        "No cancellable subscription found (active/trialing/past_due/unpaid) or it is already set to cancel at period end. Opened Billing Portal instead.",
    });
  } catch (err) {
    return NextResponse.json(
      { error: err?.message || "Server error" },
      { status: 500 }
    );
  }
}