import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { PrismaClient } from "@prisma/client";
import Stripe from "stripe";

export const dynamic = "force-dynamic";

const prisma = new PrismaClient();

function getStripeClient() {
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) return null;
  return new Stripe(secret);
}

async function isActiveMember(email) {
  if (!email) return false;

  // 1) Fast path: if you already store subscription status in DB
  // (recommended if your webhook updates these fields)
  const user = await prisma.user.findUnique({ where: { email } });
  if (user?.stripeSubscriptionStatus === "active") return true;

  // 2) Stripe fallback: check Stripe directly
  const stripe = getStripeClient();
  if (!stripe) return false;

  const customers = await stripe.customers.list({ email, limit: 1 });
  const customer = customers.data?.[0];
  if (!customer) return false;

  const subs = await stripe.subscriptions.list({
    customer: customer.id,
    status: "active",
    limit: 1,
  });

  return subs.data.length > 0;
}

export default async function MembersRedirectPage() {
  const session = await auth();

  // Not logged in → go to login
  if (!session?.user?.email) {
    redirect("/members/login");
  }

  const email = session.user.email;
  const active = await isActiveMember(email);

  // Active → Members area
  if (active) redirect("/members");

  // Not active → Pricing page
  redirect("/pricing?reason=no_membership");
}