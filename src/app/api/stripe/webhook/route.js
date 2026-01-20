import Stripe from "stripe";
import { NextResponse } from "next/server";
import { Resend } from "resend";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-06-20",
});

function isActiveStripeStatus(status) {
  // Stripe subscription statuses: active, trialing, past_due, canceled, unpaid, incomplete, incomplete_expired, paused
  return status === "active" || status === "trialing";
}

async function upsertUserByEmail(email, data) {
  if (!email) return null;

  // If the user already exists (Auth.js created it), update it.
  // If it doesn’t exist (paid before login), create it so membership can be recognized later.
  return prisma.user.upsert({
    where: { email },
    update: data,
    create: {
      email,
      ...data,
    },
  });
}

export async function POST(req) {
  const stripeSecret = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripeSecret) {
    console.error("Missing STRIPE_SECRET_KEY");
    return NextResponse.json({ received: true });
  }
  if (!webhookSecret) {
    console.error("Missing STRIPE_WEBHOOK_SECRET");
    return NextResponse.json({ received: true });
  }

  const sig = req.headers.get("stripe-signature");
  if (!sig) return new NextResponse("Missing stripe-signature", { status: 400 });

  let event;
  try {
    const body = await req.text();
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err?.message);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  try {
    const shouldSendEmail = process.env.SEND_CLASS_EMAIL === "true";
    const resendKey = process.env.RESEND_API_KEY;
    const emailFrom = process.env.EMAIL_FROM;

    // Backward compatible env var name:
    const classJoinLink =
      process.env.CLASS_JOIN_LINK || process.env.TEAMS_CLASS_LINK || "";

    // -----------------------------
    // 1) Checkout completed
    // -----------------------------
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      // Email
      let email = session.customer_details?.email || null;

      // Stripe customer id
      const customerId =
        typeof session.customer === "string" ? session.customer : null;

      // Subscription id (only if this checkout created a subscription)
      const subscriptionId =
        typeof session.subscription === "string" ? session.subscription : null;

      // If Stripe didn’t include email in customer_details, fetch customer
      if (!email && customerId) {
        const customer = await stripe.customers.retrieve(customerId);
        email = customer?.email || null;
      }

      // If we have a subscription, fetch it to get status
      let subStatus = null;
      if (subscriptionId) {
        const sub = await stripe.subscriptions.retrieve(subscriptionId);
        subStatus = sub?.status || null;
      }

      // Save to DB (this is the key fix)
      if (email) {
        await upsertUserByEmail(email, {
          stripeCustomerId: customerId || undefined,
          stripeSubscriptionId: subscriptionId || undefined,
          stripeSubscriptionStatus: subStatus || undefined,
        });
      } else {
        console.warn("checkout.session.completed: no email found; cannot link to user");
      }

      // Send class link email (optional)
      if (
        shouldSendEmail &&
        resendKey &&
        emailFrom &&
        classJoinLink &&
        email
      ) {
        const resend = new Resend(resendKey);

        await resend.emails.send({
          from: emailFrom,
          to: email,
          subject: "Your Third Limb Yoga class link",
          html: `
            <div style="font-family: Arial, sans-serif; line-height:1.5">
              <h2>Welcome to Third Limb Yoga 🧘</h2>
              <p>Your membership is active (or activating). Here is your class link:</p>
              <p>
                <a href="${classJoinLink}" style="display:inline-block;padding:10px 14px;text-decoration:none;border-radius:10px;background:#111;color:#fff">
                  Open class link
                </a>
              </p>
              <p style="color:#555;font-size:12px">
                If the button doesn’t work, copy/paste:<br/>
                ${classJoinLink}
              </p>
              <p style="color:#555;font-size:12px">
                Tip: Save this email so you can join without visiting the website.
              </p>
            </div>
          `,
        });
      }
    }

    // -----------------------------
    // 2) Subscription lifecycle sync
    // -----------------------------
    if (
      event.type === "customer.subscription.created" ||
      event.type === "customer.subscription.updated" ||
      event.type === "customer.subscription.deleted"
    ) {
      const sub = event.data.object;

      const customerId = typeof sub.customer === "string" ? sub.customer : null;
      const subscriptionId = sub.id;
      const status = sub.status; // active, trialing, canceled, etc.

      if (customerId) {
        await prisma.user.updateMany({
          where: { stripeCustomerId: customerId },
          data: {
            stripeSubscriptionId: subscriptionId,
            stripeSubscriptionStatus: status,
          },
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Webhook handler error:", err);
    // Return 200 so Stripe doesn’t endlessly retry while you debug
    return NextResponse.json({ received: true });
  }
}