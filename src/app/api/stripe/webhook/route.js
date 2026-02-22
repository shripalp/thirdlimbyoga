import Stripe from "stripe";
import { NextResponse } from "next/server";
import { Resend } from "resend";
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

    // 1) SEND EMAIL FIRST (so DB issues won't block it)
    const shouldSendEmail =
      process.env.SEND_CLASS_EMAIL === "true" ||
      process.env.SEND_CLASS_EMAILS === "true";
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
          subject: "Your Third Limb Yoga class link 🌿",
          html: `
            <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;line-height:1.6;color:#111;">
              <h2 style="margin:0 0 8px;">Welcome to Third Limb Yoga 🧘</h2>

              <p style="margin:0;">Your membership is active. You’re all set for this month.</p>

              <p style="margin:16px 0 0;">Use the button below to access your live classes:</p>

              <p style="margin:24px 0;">
                <a href="${classLink}" style="display:inline-block;padding:14px 20px;border-radius:10px;background-color:#111;color:#fff;text-decoration:none;font-weight:600;">
                  Open your class link
                </a>
              </p>

              <p style="margin:0;font-size:14px;color:#555;">
                <strong>Tip:</strong> Save this email so you can open your class link quickly next time.
              </p>

              <hr style="border:none;border-top:1px solid #eee;margin:24px 0;" />

              <p style="margin:0;font-size:14px;color:#555;">
                You don’t need to sign in each time. Simply open this email and join your class.
              </p>

              <p style="margin:16px 0 0;font-size:13px;color:#777;">
                If the button doesn’t work, copy and paste this link into your browser:
                <br />
                <span style="word-break:break-all;">${classLink}</span>
              </p>

              <p style="margin:24px 0 0;font-size:13px;color:#777;">💛 Third Limb Yoga</p>
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
