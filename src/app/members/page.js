import Link from "next/link";
import Stripe from "stripe";
import { auth, signOut } from "@/auth";
import ManageMembershipButton from "@/components/ManageMembershipButton";
import CancelMembershipButton from "@/components/CancelMembershipButton";
import ClassLinkCard from "@/components/ClassLinkCard";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function getStripeClient() {
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) return null;
  return new Stripe(secret);
}

function formatUnixDate(unixSeconds) {
  if (!unixSeconds) return null;
  const d = new Date(unixSeconds * 1000);
  return d.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
}

async function getMembershipSummary(email) {
  const stripe = getStripeClient();
  const priceId = process.env.STRIPE_PRICE_ID;

  if (!stripe) return { state: "error", error: "Missing STRIPE_SECRET_KEY" };
  if (!priceId) return { state: "error", error: "Missing STRIPE_PRICE_ID" };

  // Find Stripe customer for this email
  const customers = await stripe.customers.list({ email, limit: 1 });
  const customer = customers.data?.[0];
  if (!customer?.id) return { state: "inactive", reason: "no_customer" };

  // List subs and find the one that matches our monthly price
  const subs = await stripe.subscriptions.list({
    customer: customer.id,
    status: "all",
    limit: 20,
  });

  const okStatuses = new Set(["active", "trialing", "past_due", "unpaid"]);

  // newest first
  const sorted = [...(subs.data || [])].sort((a, b) => (b.created || 0) - (a.created || 0));

  const match = sorted.find((sub) => {
    if (!okStatuses.has(sub.status)) return false;
    return sub.items?.data?.some((it) => it?.price?.id === priceId);
  });

  if (!match) return { state: "inactive", reason: "no_matching_subscription", customerId: customer.id };

  const accessUntil = formatUnixDate(match.current_period_end);
  const canceling = Boolean(match.cancel_at_period_end || match.cancel_at);

  // Best-effort: keep DB in sync (helps later actions)
  try {
    await prisma.user.update({
      where: { email },
      data: {
        stripeCustomerId: customer.id,
        stripeSubscriptionId: match.id,
        stripeSubscriptionStatus: match.status,
      },
    });
  } catch {
    // ignore
  }

  return {
    state: canceling ? "canceling" : "active",
    subscriptionStatus: match.status,
    customerId: customer.id,
    subscriptionId: match.id,
    accessUntil,
    canceling,
  };
}

function Card({ title, children }) {
  return (
    <section className="rounded-2xl border bg-white p-6 shadow-sm">
      {title ? <h2 className="text-lg font-semibold text-gray-900">{title}</h2> : null}
      <div className={title ? "mt-3" : ""}>{children}</div>
    </section>
  );
}

function Pill({ tone = "gray", children }) {
  const tones = {
    green: "border-green-200 bg-green-50 text-green-900",
    amber: "border-amber-200 bg-amber-50 text-amber-900",
    red: "border-red-200 bg-red-50 text-red-900",
    gray: "border-gray-200 bg-gray-50 text-gray-900",
  };
  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${tones[tone]}`}>
      {children}
    </span>
  );
}

function PrimaryLink({ href, children }) {
  return (
    <Link
      href={href}
      prefetch={false}
      className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white shadow-sm hover:opacity-90"
    >
      {children}
    </Link>
  );
}

function SecondaryLink({ href, children }) {
  return (
    <Link
      href={href}
      prefetch={false}
      className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-50"
    >
      {children}
    </Link>
  );
}

export default async function MembersPage({ searchParams }) {
  // Next 16: searchParams can be a Promise
  const sp =
    searchParams && typeof searchParams.then === "function"
      ? await searchParams
      : searchParams || {};

  const session = await auth();

  // Not logged in
  if (!session?.user?.email) {
    return (
      <main className="mx-auto max-w-6xl px-6 py-10">
        <h1 className="text-3xl font-bold text-primary">Members</h1>
        <p className="mt-3 text-gray-600">
          Sign in to view your membership status and access your class link.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <PrimaryLink href="/members/login">Sign in</PrimaryLink>
          <SecondaryLink href="/pricing">View pricing</SecondaryLink>
        </div>
      </main>
    );
  }

  const email = session.user.email;
  const membership = await getMembershipSummary(email);

  const classLink = process.env.CLASS_JOIN_LINK || process.env.TEAMS_CLASS_LINK || null;
  const hasAccess = membership.state === "active" || membership.state === "canceling";

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      {/* Top banners */}
      {sp.success === "1" ? (
        <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-900">
          Payment successful. Your class link has been sent to your email — save that email for next time.
        </div>
      ) : null}

      {sp.cancel === "1" ? (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          Your cancellation was received.
          {membership?.accessUntil ? (
            <> Your access remains active until <strong>{membership.accessUntil}</strong>.</>
          ) : (
            <> Your access remains active until the end of your billing period.</>
          )}
        </div>
      ) : null}

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-primary">Members</h1>
          <p className="mt-2 text-sm text-gray-600">Signed in as <span className="font-semibold">{email}</span></p>
        </div>

        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/members/login?signedout=1" });
          }}
        >
          <button type="submit" className="text-sm font-semibold text-gray-600 hover:text-gray-900">
            Sign out
          </button>
        </form>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {/* Status card */}
        <Card title="Membership status">
          {membership.state === "error" ? (
            <>
              <Pill tone="gray">Status unavailable</Pill>
              <p className="mt-3 text-sm text-gray-600">
                {membership.error}. Please try again in a minute.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <SecondaryLink href="/schedule">View schedule</SecondaryLink>
                <SecondaryLink href="/pricing">View pricing</SecondaryLink>
              </div>
            </>
          ) : membership.state === "active" ? (
            <>
              <Pill tone="green">Active</Pill>
              <p className="mt-3 text-sm text-gray-700">
                Your membership is active.
                {membership.accessUntil ? <> Next renewal: <strong>{membership.accessUntil}</strong>.</> : null}
              </p>

              {["past_due", "unpaid"].includes(membership.subscriptionStatus) ? (
                <p className="mt-2 text-xs text-amber-800">
                  Payment needs attention. Please update your billing details in Manage membership.
                </p>
              ) : null}

              <div className="mt-5 flex flex-wrap gap-3">
                <SecondaryLink href="/schedule">View schedule</SecondaryLink>
                <ManageMembershipButton />
                <CancelMembershipButton />
              </div>
            </>
          ) : membership.state === "canceling" ? (
            <>
              <Pill tone="amber">Cancelling</Pill>
              <p className="mt-3 text-sm text-gray-700">
                Your membership is set to end.
                {membership.accessUntil ? <> Active until <strong>{membership.accessUntil}</strong>.</> : null}
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <SecondaryLink href="/schedule">View schedule</SecondaryLink>
                <ManageMembershipButton />
                {/* Cancel button hidden because cancellation is already scheduled */}
              </div>
            </>
          ) : (
            <>
              <Pill tone="red">Not active</Pill>
              <p className="mt-3 text-sm text-gray-700">
                No active membership found for this email.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <PrimaryLink href="/pricing">View pricing</PrimaryLink>
                <SecondaryLink href="/classes">Browse classes</SecondaryLink>
              </div>
            </>
          )}
        </Card>

        {/* Class link card (only when access is valid) */}
        <div className="lg:col-span-2">
          {hasAccess && classLink ? (
            <ClassLinkCard classLink={classLink} />
          ) : (
            <Card title="Your class link">
              <p className="text-sm text-gray-600">
                Your class link appears here once your membership is active.
              </p>
              <p className="mt-2 text-xs text-gray-500">
                After checkout, you’ll also receive the class link by email.
              </p>
            </Card>
          )}
        </div>
      </div>
    </main>
  );
}