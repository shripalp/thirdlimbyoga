import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function getMemberStatus(email) {
  // simple DB lookup (we’ll keep it minimal)
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      stripeSubscriptionStatus: true,
      stripeCustomerId: true,
      stripeSubscriptionId: true,
    },
  });

  return {
    active:
      user?.stripeSubscriptionStatus === "active" ||
      user?.stripeSubscriptionStatus === "trialing",
    user,
  };
}

function ButtonLink({ href, children, variant = "primary" }) {
  const base =
    "inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold shadow-sm";
  const styles =
    variant === "primary"
      ? "bg-primary text-white hover:opacity-90"
      : "border border-gray-200 bg-white text-gray-900 hover:bg-gray-50";
  return (
    <Link className={`${base} ${styles}`} href={href}>
      {children}
    </Link>
  );
}

export default async function MembersPage() {
  const session = await auth();

  if (!session?.user?.email) {
    // not logged in
    return (
      <main className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="text-3xl font-bold text-primary">Members</h1>
        <p className="mt-3 text-gray-600">
          Please sign in to access your class link and billing portal.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <ButtonLink href="/members/login">Sign in</ButtonLink>
          <ButtonLink href="/pricing" variant="secondary">
            Join Online
          </ButtonLink>
        </div>
      </main>
    );
  }

  const email = session.user.email;
  const { active } = await getMemberStatus(email);

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="text-3xl font-bold text-primary">Members</h1>
      <p className="mt-3 text-gray-600">
        Signed in as <span className="font-semibold text-gray-900">{email}</span>
      </p>

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">Your access</h2>

            {active ? (
              <div className="mt-4 space-y-4">
                <p className="text-gray-900">✅ Membership active.</p>

                <p className="text-sm text-gray-600">
                  You can join class from the email link you received after checkout.
                  (Next step: we’ll also show the class link here automatically for logged-in users.)
                </p>

                <div className="flex flex-wrap gap-3">
                  <ButtonLink href="/schedule">View Schedule</ButtonLink>
                  <ButtonLink href="/contact" variant="secondary">
                    Need help?
                  </ButtonLink>
                </div>
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                <p className="text-gray-900">No active membership found.</p>
                <p className="text-sm text-gray-600">
                  If you just paid, wait a minute and refresh. Otherwise, join from Pricing.
                </p>
                <div className="flex flex-wrap gap-3">
                  <ButtonLink href="/pricing">Join Online</ButtonLink>
                  <ButtonLink href="/schedule" variant="secondary">
                    View Schedule
                  </ButtonLink>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">Billing</h2>
            <p className="mt-3 text-sm text-gray-600">
              Manage billing, update payment method, or cancel.
            </p>
            <div className="mt-4">
              <ButtonLink href="/members/billing" variant="secondary">
                Manage billing
              </ButtonLink>
            </div>
          </div>

          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">Quick links</h2>
            <div className="mt-4 flex flex-col gap-3">
              <ButtonLink href="/classes" variant="secondary">Classes</ButtonLink>
              <ButtonLink href="/schedule" variant="secondary">Schedule</ButtonLink>
              <ButtonLink href="/contact" variant="secondary">Contact</ButtonLink>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}