import Stripe from "stripe";
import { NextResponse } from "next/server";
import { Resend } from "resend";

export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req) {
  const sig = req.headers.get("stripe-signature");

  let event;
  try {
    const body = await req.text();
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  try {
    // Send email after successful checkout
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      // In Stripe Checkout, email is typically here:
      const email = session.customer_details?.email;

      // If missing, we can fetch customer:
      // const customer = await stripe.customers.retrieve(session.customer);
      // const email = customer.email;

      if (email) {
        const teamsLink = process.env.TEAMS_CLASS_LINK;
        const from = process.env.EMAIL_FROM;

        await resend.emails.send({
          from,
          to: email,
          subject: "Your ThirdLimb Yoga classes link (Microsoft Teams)",
          html: `
            <div style="font-family: Arial, sans-serif; line-height:1.5">
              <h2>Welcome to ThirdLimb Yoga 🧘‍♀️</h2>
              <p>Your membership is active. Here’s your link to join online classes:</p>
              <p>
                <a href="${teamsLink}" style="display:inline-block;padding:10px 14px;text-decoration:none;border-radius:8px;background:#111;color:#fff">
                  Join on Microsoft Teams
                </a>
              </p>
              <p style="color:#555;font-size:12px">
                If the button doesn’t work, copy and paste this link:<br/>
                ${teamsLink}
              </p>
            </div>
          `,
        });
      }
    }

    // Always respond 200 so Stripe doesn't keep retrying
    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Webhook handler error:", err);
    // Return 200 to Stripe but log the issue; otherwise it will retry repeatedly
    return NextResponse.json({ received: true });
  }
}
