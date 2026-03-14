import Link from "next/link";
import Stripe from "stripe";

export const dynamic = "force-dynamic";

async function getTeamsLinkForSession(sessionId) {
  const secret = process.env.STRIPE_SECRET_KEY;
  const teamsLink =
    process.env.TEAMS_CLASS_LINK?.trim() ||
    process.env.CLASS_JOIN_LINK?.trim() ||
    "";

  if (!secret || !teamsLink || !sessionId) {
    return { active: false, teamsLink: null };
  }

  try {
    const stripe = new Stripe(secret);
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["subscription"],
    });

    const subscription = session.subscription;
    const active =
      subscription &&
      (subscription.status === "active" || subscription.status === "trialing");

    return { active: Boolean(active), teamsLink: active ? teamsLink : null };
  } catch (err) {
    console.error("Success page session verification failed:", err);
    return { active: false, teamsLink: null };
  }
}

export default async function SuccessPage({ searchParams }) {
  const params = await Promise.resolve(searchParams);
  const sessionId = params?.session_id;
  const { active, teamsLink } = await getTeamsLinkForSession(sessionId);

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <div className="rounded-2xl border bg-white p-8 shadow-sm">
        <div className="inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-4 py-2 text-sm font-semibold text-green-800">
          Payment successful
        </div>

        <h1 className="mt-4 text-3xl font-bold text-gray-900">
          You’re all set for this month
        </h1>

        <p className="mt-3 text-gray-600">
          Your payment was confirmed by Stripe. You can open your class link below and
          you’ll also be able to access it from the Members page.
        </p>

        {active && teamsLink ? (
          <div className="mt-6 rounded-xl border border-green-200 bg-green-50 p-5">
            <p className="text-sm font-semibold text-green-900">Your Teams class link</p>
            <p className="mt-2 text-sm text-green-800">
              Bookmark this page for today, and use the Members page any time you need the
              link again in future months.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <a
                href={teamsLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-sm hover:opacity-90"
              >
                Open Teams Link
              </a>
              <Link
                href="/members"
                className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-50"
              >
                Go to Members
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-5">
            <p className="text-sm font-semibold text-amber-900">
              We’re still confirming your membership
            </p>
            <p className="mt-2 text-sm text-amber-800">
              If the class link does not appear yet, refresh this page in a moment or check
              your Members page after signing in.
            </p>
          </div>
        )}

        <div className="mt-6 rounded-xl bg-gray-50 p-5">
          <p className="text-sm font-semibold text-gray-900">What to do next</p>
          <ul className="mt-2 list-disc space-y-2 pl-5 text-sm text-gray-700">
            <li>View the schedule any time on the website.</li>
            <li>Use the Members page to manage or cancel your membership.</li>
            <li>Future monthly renewals won’t return here, so use the Members page for your class link.</li>
            <li>Sign in with the same Google email you used for checkout.</li>
          </ul>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/schedule"
            className="inline-flex items-center justify-center rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-sm hover:opacity-90"
          >
            View Schedule
          </Link>

          <Link
            href="/members"
            className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-50"
          >
            Go to Members
          </Link>
        </div>

        {sessionId ? (
          <p className="mt-6 text-xs text-gray-400">
            Reference: {sessionId}
          </p>
        ) : null}
      </div>
    </main>
  );
}
