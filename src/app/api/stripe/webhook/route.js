import Stripe from "stripe";
import { NextResponse } from "next/server";
import { Resend } from "resend";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

export async function POST(req) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const sig = req.headers.get("stripe-signature");

  if (!process.env.STRIPE_SECRET_KEY) {
    console.error("Missing STRIPE_SECRET_KEY");
    return NextResponse.json({ received: true });
  }
  if (!webhookSecret) {
    console.error("Missing STRIPE_WEBHOOK_SECRET");
    return NextResponse.json({ received: true });
  }
  if (!sig) {
    console.error("Missing stripe-signature header");
    return new NextResponse("Missing signature", { status: 400 });
  }

  let event;
  try {
    const body = await req.text(); // IMPORTANT: raw body
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
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

    // 1) SEND EMAIL FIRST (so DB issues won't block it)
    const shouldSendEmail = process.env.SEND_CLASS_EMAIL === "true";
    const resendKey = process.env.RESEND_API_KEY;
    const emailFrom = process.env.EMAIL_FROM;

    // keep backward compatibility with your old env var name
    const classLink = process.env.CLASS_JOIN_LINK || process.env.TEAMS_CLASS_LINK;

    if (shouldSendEmail && resendKey && emailFrom && classLink && email) {
      try {
        const resend = new Resend(resendKey);
        await resend.emails.send({
          from: emailFrom,
          to: email,
          subject: "Your Third Limb Yoga class link",
          html: `
            <div style="font-family: Arial, sans-serif; line-height:1.5">
              <h2>Welcome to Third Limb Yoga 🧘</h2>
              <p>Your membership is active. Here is your class link:</p>
              <p>
                <a href="${classLink}" style="display:inline-block;padding:10px 14px;text-decoration:none;border-radius:10px;background:#111;color:#fff">
                  Open class link
                </a>
              </p>
              <p style="color:#555;font-size:12px">
                Tip: Save this email so you can open your class link quickly next time.
              </p>
              <p style="color:#555;font-size:12px">
                If the button doesn’t work, copy/paste:<br/>
                ${classLink}
              </p>
            </div>
          `,
        });
        console.log("Class link email sent to:", email);
      } catch (mailErr) {
        console.error("Resend email failed:", mailErr?.message || mailErr);
      }
    } else {
      console.log("Email not sent (missing env/flag/email).", {
        shouldSendEmail,
        hasResendKey: Boolean(resendKey),
        hasEmailFrom: Boolean(emailFrom),
        hasClassLink: Boolean(classLink),
        hasEmail: Boolean(email),
      });
    }

    // 2) UPDATE DB (best effort; DO NOT block webhook if it fails)
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
            stripeSubscriptionStatus: subStatus ?? "active",
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