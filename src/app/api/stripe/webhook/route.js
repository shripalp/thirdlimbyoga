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
    console.error("❌ Stripe signature error:", err.message);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      // 1) Try session email
      let email = session.customer_details?.email;

      // 2) Fallback: fetch customer email
      if (!email && session.customer) {
        const customer = await stripe.customers.retrieve(session.customer);
        email = customer?.email || null;
      }

      console.log("✅ checkout.session.completed", {
        sessionId: session.id,
        hasEmail: !!email,
      });

      if (!process.env.RESEND_API_KEY) {
        console.error("❌ Missing RESEND_API_KEY");
        return NextResponse.json({ received: true });
      }
      if (!process.env.EMAIL_FROM) {
        console.error("❌ Missing EMAIL_FROM");
        return NextResponse.json({ received: true });
      }
      if (!process.env.TEAMS_CLASS_LINK) {
        console.error("❌ Missing TEAMS_CLASS_LINK");
        return NextResponse.json({ received: true });
      }

      if (!email) {
        console.error("❌ No customer email found on session/customer");
        return NextResponse.json({ received: true });
      }

      const sendResult = await resend.emails.send({
        from: process.env.EMAIL_FROM,
        to: email,
        subject: "Your ThirdLimb Yoga classes link (Microsoft Teams)",
        html: `
          <div style="font-family: Arial, sans-serif; line-height:1.5">
            <h2>Welcome to ThirdLimb Yoga 🧘‍♀️</h2>
            <p>Your membership is active. Here’s your link to join online classes:</p>
            <p><a href="${process.env.TEAMS_CLASS_LINK}">Join on Microsoft Teams</a></p>
            <p style="color:#555;font-size:12px">If the link doesn’t work, copy/paste:<br/>${process.env.TEAMS_CLASS_LINK}</p>
          </div>
        `,
      });

      console.log("📧 Resend send result:", sendResult);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("❌ Webhook handler error:", err);
    // Return 200 so Stripe doesn’t endlessly retry while you debug
    return NextResponse.json({ received: true });
  }
}
