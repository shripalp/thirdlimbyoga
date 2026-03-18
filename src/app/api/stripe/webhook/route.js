import Stripe from "stripe";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

function getWebhookSecrets() {
  const raw =
    process.env.STRIPE_WEBHOOK_SECRETS || process.env.STRIPE_WEBHOOK_SECRET || "";
  const hadWhitespace = raw
    .split(",")
    .some((s) => /\s/.test(s.replace(/^['"]|['"]$/g, "")));
  const parsed = raw
    .split(",")
    .map((s) => s.trim().replace(/^['"]|['"]$/g, "").replace(/\s+/g, ""))
    .map((s) => {
      const match = s.match(/whsec_[A-Za-z0-9]+/);
      return match ? match[0] : s;
    })
    .filter(Boolean);
  if (hadWhitespace) {
    console.warn("Webhook secret had whitespace; normalized before verification.");
  }
  return parsed;
}

export async function POST(req) {
  const webhookSecrets = getWebhookSecrets();
  const sig = req.headers.get("stripe-signature");

  if (!process.env.STRIPE_SECRET_KEY) {
    console.error("Missing STRIPE_SECRET_KEY");
    return NextResponse.json({ received: true });
  }
  if (!webhookSecrets.length) {
    console.error("Missing STRIPE_WEBHOOK_SECRET / STRIPE_WEBHOOK_SECRETS");
    return NextResponse.json({ received: true });
  }
  if (!sig) {
    console.error("Missing stripe-signature header");
    return new NextResponse("Missing signature", { status: 400 });
  }

  let event;
  try {
    const body = Buffer.from(await req.arrayBuffer()); // IMPORTANT: raw body bytes
    let verified = false;
    let lastErr = null;

    for (const secret of webhookSecrets) {
      try {
        event = stripe.webhooks.constructEvent(body, sig, secret);
        verified = true;
        break;
      } catch (err) {
        lastErr = err;
      }
    }

    if (!verified) {
      throw lastErr || new Error("Unable to verify webhook signature");
    }
  } catch (err) {
    console.error("Webhook signature verification failed:", err?.message || err);
    return new NextResponse("Invalid signature", { status: 400 });
  }

  try {
    // Only handle what we need
    if (event.type !== "checkout.session.completed") {
      return NextResponse.json({ received: true });
    }

    const session = event.data.object;

    const customerId = typeof session.customer === "string" ? session.customer : null;
    const subscriptionId =
      typeof session.subscription === "string" ? session.subscription : null;

    // Find email
    let email = session.customer_details?.email || null;
    if (!email && customerId) {
      try {
        const customer = await stripe.customers.retrieve(customerId);
        email = customer?.email || null;
      } catch (e) {
        console.error("Failed to retrieve customer email:", e?.message || e);
      }
    }

    // Update DB as a best effort; do not block webhook retries on DB errors.
    if (email) {
      try {
        // fetch subscription status when possible
        let subStatus = null;
        if (subscriptionId) {
          try {
            const sub = await stripe.subscriptions.retrieve(subscriptionId);
            subStatus = sub?.status || null;
          } catch (e) {
            console.error("Failed to retrieve subscription:", e?.message || e);
          }
        }

        await prisma.user.update({
          where: { email },
          data: {
            stripeCustomerId: customerId ?? undefined,
            stripeSubscriptionId: subscriptionId ?? undefined,
            stripeSubscriptionStatus: subStatus ?? session.payment_status ?? "active",
          },
        });
      } catch (dbErr) {
        console.error("Failed to update user with Stripe info:", dbErr?.message || dbErr);
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Webhook handler error:", err?.message || err);
    // Return 200 so Stripe doesn’t keep retrying while you debug
    return NextResponse.json({ received: true });
  }
}
