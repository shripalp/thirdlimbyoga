// src/app/members/page.js
import Link from "next/link";
import ManageMembershipButton from "@/components/ManageMembershipButton";
import ClassLinkCard from "@/components/ClassLinkCard";
import Stripe from "stripe";
import { auth, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

function ButtonLink({ href, children, variant = "primary" }) {
  const base =
    "inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold shadow-sm transition";
  const styles =
    variant === "primary"
      ? "bg-primary text-white hover:opacity-90"
      : "border border-gray-200 bg-white text-gray-900 hover:bg-gray-50";

  return (
    <Link href={href} className={`${base} ${styles}`}>
      {children}
    </Link>
  );
}

async function getMembershipStatus(email) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return { active: false, error: "Missing STRIPE_SECRET_KEY" };
  }
  if (!process.env.STRIPE_PRICE_ID) {
    return { active: false, error: "Missing STRIPE_PRICE_ID" };
  }

  try {
    const customers = await stripe.customers.list({ email, limit: 1 });
    const customer = customers.data?.[0];

    if (!customer) return { active: false };

    const subs = await stripe.subscriptions.list({
      customer: customer.id,
      status: "all",
      limit: 20,
    });

    const active = subs.data.some((sub) => {
      const statusOk = sub.status === "active" || sub.status === "trialing";
      const priceMatch = (sub.items?.data || []).some(
        (item) => item?.price?.id === process.env.STRIPE_PRICE_ID
      );
      return statusOk && priceMatch;
    });

    return { active, customerId: customer.id };
  } catch (e) {
    return { active: false, error: e?.message || "Stripe error" };
  }
}

async function getNextBillingDate(email) {
  // We prefer the subscription id we stored during webhook handling
  const user = await prisma.user.findUnique({
    where: { email },
    select: { stripeSubscriptionId: true, stripeSubscriptionStatus: true },
  });

  if (!user?.stripeSubscriptionId) return null;

  try {
    const sub = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);

    // Only show renewal date when membership is effectively active
    const statusOk = sub.status === "active" || sub.status === "trialing";
    if (!statusOk) return null;

    const nextBillingUnix = sub.current_period_end; // seconds
    if (!nextBillingUnix) return null;

    return new Date(nextBillingUnix * 1000).toLocaleDateString("en-CA", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return null;
  }
}

export default async function MembersPage() {
  const session = await auth();

  // ─────────────────────────────────────────────
  // NOT LOGGED IN
  // ─────────────────────────────────────────────
  if (!session?.user?.email) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="text-3xl font-bold text-primary">Members</h1>

        <p className="mt-3 text-gray-600">
          Please sign in to access your schedule and membership status.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <ButtonLink href="/members/login">Sign in</ButtonLink>
          <ButtonLink href="/pricing" variant="secondary">
            Pricing
          </ButtonLink>
        </div>
      </main>
    );
  }

  const email = session.user.email;
  const status = await getMembershipStatus(email);
  const nextBillingDate = status.active ? await getNextBillingDate(email) : null;
  const classLink =
    process.env.CLASS_JOIN_LINK || process.env.TEAMS_CLASS_LINK || null;

  // ─────────────────────────────────────────────
  // LOGGED IN
  // ─────────────────────────────────────────────
  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">
        You’re logged in successfully.
      </div>

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary">Members</h1>
          <p className="mt-2 text-sm text-gray-600">
            Signed in as <span className="font-medium text-gray-900">{email}</span>
          </p>
        </div>

        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/" });
          }}
        >
          <button className="text-sm text-gray-500 hover:text-gray-900">
            Sign out
          </button>
        </form>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {/* Main */}
        <div className="space-y-6 md:col-span-2">
          {/* Membership status */}
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">Membership status</h2>

            {status?.error ? (
              <p className="mt-2 text-sm text-gray-600">
                We couldn’t confirm your membership right now.
                <span className="block mt-1 text-xs text-gray-500">{status.error}</span>
              </p>
            ) : status.active ? (
              <>
                {/* Success badge */}
                <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-green-50 px-4 py-2 text-sm font-semibold text-green-800 border border-green-200">
                  Membership Active
                </div>

                <p className="mt-3 text-sm text-gray-600">
                  You’re all set for this month. Your class link is sent to your email.
                </p>

                {/* What happens next */}
                <div className="mt-4 rounded-xl bg-gray-50 p-4">
                  <p className="text-sm font-semibold text-gray-900">What happens next</p>
                  <ul className="mt-2 space-y-2 text-sm text-gray-700 list-disc pl-5">
                    <li>Check your email for your class link (save it for next time).</li>
                    <li>Use the Schedule page to see upcoming class times.</li>
                    <li>You can manage or cancel your membership anytime.</li>
                  </ul>

                  {nextBillingDate ? (
                    <p className="mt-3 text-xs text-gray-500">Next renewal: {nextBillingDate}</p>
                  ) : null}
                </div>

                <div className="mt-4 flex flex-wrap gap-3">
                  <ButtonLink href="/schedule">View Schedule</ButtonLink>
                  <ManageMembershipButton />
                </div>

                {classLink ? (
                  <div className="mt-6">
                    <ClassLinkCard classLink={classLink} />
                  </div>
                ) : null}
              </>
            ) : (
              <>
                <p className="mt-2 text-sm text-gray-600">
                  We don’t see an active membership for this email yet.
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <ButtonLink href="/pricing">View Pricing</ButtonLink>
                  <ButtonLink href="/contact" variant="secondary">
                    Contact
                  </ButtonLink>
                </div>
              </>
            )}
          </div>

          {/* How to join */}
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">How to join your classes</h2>

            <p className="mt-3 text-sm text-gray-600">
              Your live class links are sent to your email after you join.
            </p>

            <p className="mt-2 text-sm text-gray-600">
              You don’t need to sign in each time — simply open the email and join directly.
            </p>

            <p className="mt-2 text-sm text-gray-600">
              This page is here for your schedule and membership status.
            </p>
          </div>

          {/* Schedule */}
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">Class schedule</h2>
            <p className="mt-2 text-sm text-gray-600">View upcoming live classes and timings.</p>
            <div className="mt-4">
              <ButtonLink href="/schedule">View Schedule</ButtonLink>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">Quick links</h2>

            <div className="mt-4 flex flex-col gap-3">
              <ButtonLink href="/classes" variant="secondary">
                Classes
              </ButtonLink>
              <ButtonLink href="/schedule" variant="secondary">
                Schedule
              </ButtonLink>
              <ButtonLink href="/contact" variant="secondary">
                Contact
              </ButtonLink>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}