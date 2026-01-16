import Stripe from "stripe";
import { NextResponse } from "next/server";
import { Resend } from "resend";

export const runtime = "nodejs";

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

  let event;
  try {
    const body = await req.text();
    const stripe = new Stripe(stripeSecret);
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err?.message);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  try {
    // Only send emails in production (Hostinger) if you set this env var
    const shouldSendEmail = process.env.SEND_TEAMS_EMAIL === "true";

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      if (shouldSendEmail) {
        const resendKey = process.env.RESEND_API_KEY;
        const emailFrom = process.env.EMAIL_FROM;
        const teamsLink = process.env.TEAMS_CLASS_LINK;

        if (!resendKey || !emailFrom || !teamsLink) {
          console.error("Missing RESEND_API_KEY or EMAIL_FROM or TEAMS_CLASS_LINK");
          return NextResponse.json({ received: true });
        }

        const stripe = new Stripe(stripeSecret);

        // Get email from session or customer
        let email = session.customer_details?.email || null;

        if (!email && session.customer) {
          const customer = await stripe.customers.retrieve(session.customer);
          email = customer?.email || null;
        }

        if (!email) {
          console.error("No email found for checkout.session.completed");
          return NextResponse.json({ received: true });
        }

        const resend = new Resend(resendKey);

        const sendResult = await resend.emails.send({
          from: emailFrom,
          to: email,
          subject: "Your ThirdLimb Yoga online class link (Microsoft Teams)",
          html: `
            <div style="font-family: Arial, sans-serif; line-height:1.5">
              <h2>Welcome to ThirdLimb Yoga 🧘‍♀️</h2>
              <p>Your membership is active. Use this link to join your online classes:</p>
              <p>
                <a href="${teamsLink}" style="display:inline-block;padding:10px 14px;text-decoration:none;border-radius:10px;background:#111;color:#fff">
                  Join on Microsoft Teams
                </a>
              </p>
              <p style="color:#555;font-size:12px">
                If the button doesn’t work, copy/paste:<br/>
                ${teamsLink}
              </p>
            </div>
          `,
        });

        console.log("Resend result:", sendResult);
      }
    }

    // You can also handle subscription updates/cancellations here if you want:
    // if (event.type === "customer.subscription.updated") { ... }
    // if (event.type === "customer.subscription.deleted") { ... }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Webhook handler error:", err);
    // Return 200 so Stripe doesn’t endlessly retry while you debug
    return NextResponse.json({ received: true });
  }
}
