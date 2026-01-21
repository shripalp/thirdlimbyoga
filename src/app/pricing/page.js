"use client";

import { useState } from "react";
import Link from "next/link";

function FAQItem({ q, a }) {
  return (
    <details className="rounded-xl border bg-white p-4 shadow-sm">
      <summary className="cursor-pointer select-none font-semibold text-gray-900">
        {q}
      </summary>
      <p className="mt-2 text-sm text-gray-600">{a}</p>
    </details>
  );
}

export default function PricingPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleCheckout() {
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) throw new Error(data?.error || "Could not start checkout.");
      if (!data?.url) throw new Error("Checkout URL missing.");

      window.location.href = data.url;
    } catch (e) {
      setError(e?.message || "Something went wrong.");
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="text-3xl font-bold text-primary">Pricing</h1>
      <p className="mt-3 max-w-2xl text-gray-600">
        Simple monthly membership for live online yoga. No long-term commitment.
      </p>

      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        <section className="lg:col-span-2 rounded-2xl border bg-white p-8 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-primary">Monthly Membership</p>
              <h2 className="mt-1 text-2xl font-bold text-gray-900">
                Online yoga classes
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Pay monthly. Cancel anytime from your Members area.
              </p>
            </div>

            <div className="rounded-xl bg-gray-50 px-5 py-4 text-right">
              <p className="text-xs text-gray-500">Billed monthly</p>
              <p className="mt-1 text-3xl font-bold text-gray-900">$ / month</p>
              <p className="mt-1 text-xs text-gray-500">Secure checkout</p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-xl bg-gray-50 p-5">
              <p className="font-semibold text-gray-900">What you get</p>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-gray-700">
                <li>Access to all live online classes during your active month</li>
                <li>Updated class schedule on the website</li>
                <li>Manage your membership (cancel anytime)</li>
              </ul>
            </div>

            <div className="rounded-xl bg-gray-50 p-5">
              <p className="font-semibold text-gray-900">What happens after payment</p>
              <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-gray-700">
                <li>You’ll see a payment confirmation</li>
                <li>You’ll receive an email with your class link</li>
                <li>You can also sign in to the Members page anytime</li>
              </ol>
              <p className="mt-3 text-xs text-gray-500">
                Tip: Save the email so you can open your class link quickly.
              </p>
            </div>
          </div>

          {error ? (
            <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
              {error}
            </div>
          ) : null}

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={handleCheckout}
              disabled={loading}
              className="inline-flex items-center justify-center rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-sm transition disabled:opacity-60"
            >
              {loading ? "Redirecting…" : "Start monthly membership"}
            </button>

            <Link
              href="/classes"
              className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-50"
            >
              View classes
            </Link>
          </div>

          <p className="mt-3 text-xs text-gray-500">
            By continuing, you agree to a monthly subscription. You can cancel anytime.
          </p>
        </section>

        <aside className="rounded-2xl border bg-white p-8 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900">Good to know</h3>

          <div className="mt-4 space-y-4 text-sm text-gray-700">
            <div className="rounded-xl bg-gray-50 p-4">
              <p className="font-semibold text-gray-900">Cancel anytime</p>
              <p className="mt-1 text-gray-600">
                You can cancel from the Members page. Your access continues until
                the end of your paid period.
              </p>
            </div>

            <div className="rounded-xl bg-gray-50 p-4">
              <p className="font-semibold text-gray-900">
                No account required to open your class link
              </p>
              <p className="mt-1 text-gray-600">
                After payment, you’ll receive an email with your class link. You can
                open it directly.
              </p>
            </div>

            <div className="rounded-xl bg-gray-50 p-4">
              <p className="font-semibold text-gray-900">Secure payment</p>
              <p className="mt-1 text-gray-600">Checkout is handled securely by Stripe.</p>
            </div>
          </div>

          <div className="mt-6">
            <Link href="/members" className="text-sm font-semibold text-primary hover:underline">
              Already a member? Go to Members →
            </Link>
          </div>
        </aside>
      </div>

      <section className="mt-12">
        <h2 className="text-2xl font-bold text-gray-900">FAQ</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <FAQItem
            q="When do I get my class link?"
            a="Right after checkout, you’ll receive an email with your class link. Save that email for next time."
          />
          <FAQItem
            q="Do I need to sign in every time?"
            a="No. You can open your class link directly from the email. The Members page is optional."
          />
          <FAQItem
            q="Can I cancel anytime?"
            a="Yes. You can cancel from the Members page. Your access continues until the end of your paid period."
          />
          <FAQItem
            q="What if I don’t see the email?"
            a="Check spam/junk first. If it’s not there, use the Members page and contact us from the Contact page."
          />
        </div>
      </section>

      <p className="mt-8 text-xs text-gray-500">
        Note: Replace the \"$ / month\" placeholder with your real monthly price.
      </p>
    </main>
  );
}