import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function SuccessPage({ searchParams }) {
  const sessionId = searchParams?.session_id;

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
          Your class link has been sent to your email. Save that email so you can open the
          class link quickly next time.
        </p>

        <div className="mt-6 rounded-xl bg-gray-50 p-5">
          <p className="text-sm font-semibold text-gray-900">What to do next</p>
          <ul className="mt-2 list-disc space-y-2 pl-5 text-sm text-gray-700">
            <li>Check your inbox (and spam/junk) for your class link email.</li>
            <li>View the schedule any time on the website.</li>
            <li>Use the Members page to manage or cancel your membership.</li>
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