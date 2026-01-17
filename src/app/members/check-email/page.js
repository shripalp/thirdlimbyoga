import Link from "next/link";

export default function CheckEmailPage() {
  return (
    <main className="mx-auto max-w-lg px-6 py-12">
      <h1 className="text-3xl font-bold text-primary">Check your email</h1>
      <p className="mt-3 text-gray-600">
        We sent a secure sign-in link. Open it to access your Members page.
      </p>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-50"
        >
          Back to home
        </Link>
        <Link
          href="/pricing"
          className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white shadow-sm hover:opacity-90"
        >
          View pricing
        </Link>
      </div>
    </main>
  );
}