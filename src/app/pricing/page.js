"use client";

import { useState } from "react";

export default function PricingPage() {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function startCheckout() {
    setErr("");
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Checkout failed");
      window.location.href = data.url;
    } catch (e) {
      setErr(e.message);
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="text-3xl font-bold text-primary">Pricing</h1>
      <p className="mt-3 text-gray-600">
        Simple monthly membership for live online classes.
      </p>

      <div className="mt-10 max-w-md rounded-2xl border bg-white p-8 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900">Online Yoga Membership</h2>
        <p className="mt-2 text-gray-600">Access all live online classes.</p>

        <ul className="mt-6 space-y-2 text-sm text-gray-700">
          <li>• Monthly subscription</li>
          <li>• Join from home (Microsoft Teams)</li>
          <li>• Beginner-friendly options</li>
        </ul>

        {err ? <p className="mt-4 text-sm text-red-600">{err}</p> : null}

        <button
          onClick={startCheckout}
          disabled={loading}
          className="mt-8 w-full rounded-md bg-accent px-5 py-3 text-white hover:opacity-90 disabled:opacity-60"
        >
          {loading ? "Redirecting…" : "Join Online"}
        </button>

        <p className="mt-4 text-xs text-gray-500">
          You can cancel anytime from Stripe’s customer portal (we’ll add this later).
        </p>
      </div>
    </main>
  );
}
