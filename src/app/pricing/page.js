"use client";

import Link from "next/link";
import { useState } from "react";

function PrimaryButton({ onClick, href, children, disabled }) {
  const className =
    "inline-flex items-center justify-center rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white shadow-sm hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed";
  if (href) return <Link className={className} href={href}>{children}</Link>;
  return (
    <button className={className} onClick={onClick} type="button" disabled={disabled}>
      {children}
    </button>
  );
}

function SecondaryButton({ href, children }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-50"
    >
      {children}
    </Link>
  );
}

function InfoCard({ title, children }) {
  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      <div className="mt-3 text-sm text-gray-600">{children}</div>
    </div>
  );
}

function FAQItem({ q, a }) {
  return (
    <details className="rounded-2xl border bg-white p-6 shadow-sm">
      <summary className="cursor-pointer list-none font-semibold text-gray-900">
        {q}
      </summary>
      <p className="mt-3 text-sm text-gray-600">{a}</p>
    </details>
  );
}

export default function PricingPage() {
  const [loading, setLoading] = useState(false);

  async function handleCheckout() {
    if (loading) return;
    setLoading(true);

    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Checkout failed");
      window.location.href = data.url;
    } catch (e) {
      alert(e.message || "Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      {/* Header */}
      <header className="max-w-2xl">
        <h1 className="text-3xl font-bold text-primary">Online Membership</h1>
        <p className="mt-3 text-gray-600">
          Live online yoga classes. Simple monthly membership.
        </p>
      </header>

      {/* Main grid */}
      <div className="mt-10 grid gap-8 md:grid-cols-3">
        {/* Plan card */}
        <div className="md:col-span-1">
          <div className="rounded-3xl border bg-white p-7 shadow-sm">
            <p className="text-sm font-semibold text-gray-900">Monthly Membership</p>

            <div className="mt-4 flex items-end gap-2">
              <p className="text-4xl font-bold text-gray-900">$30</p>
              <p className="pb-1 text-sm text-gray-600">/ month</p>
            </div>

            <p className="mt-3 text-sm text-gray-600">
              Access to live online classes + schedule updates.
            </p>

            <div className="mt-6 grid gap-3">
              <PrimaryButton onClick={handleCheckout} disabled={loading}>
                {loading ? "Redirecting..." : "Join Online"}
              </PrimaryButton>
              <SecondaryButton href="/schedule">View Schedule</SecondaryButton>
            </div>

            <p className="mt-4 text-xs text-gray-500">
              Secure checkout powered by Stripe. Cancel anytime from your billing portal.
            </p>
          </div>
        </div>

        {/* Clarity blocks */}
        <div className="md:col-span-2 grid gap-6">
          <InfoCard title="What you get">
            <ul className="list-disc pl-5 space-y-2">
              <li>Live online yoga classes (beginner-friendly options)</li>
              <li>Weekly schedule you can check anytime</li>
              <li>Members page access after checkout</li>
              <li>Class link sent by email for quick joining</li>
              <li>Manage billing and cancel anytime</li>
            </ul>
          </InfoCard>

          <InfoCard title="After checkout (important)">
            <ul className="list-disc pl-5 space-y-2">
              <li>You’ll be redirected to your <span className="font-semibold text-gray-900">Members</span> page.</li>
              <li>You’ll also receive an email with your <span className="font-semibold text-gray-900">class link</span>.</li>
              <li>
                At class time, join using either:
                <ul className="mt-2 list-disc pl-5 space-y-1">
                  <li>your Members page</li>
                  <li>the class link from your email</li>
                </ul>
              </li>
            </ul>
          </InfoCard>

          <div className="grid gap-6 md:grid-cols-2">
            <InfoCard title="Who this is for">
              <ul className="list-disc pl-5 space-y-2">
                <li>Beginners who want clear guidance</li>
                <li>Busy people who need structure</li>
                <li>Anyone building strength + mobility</li>
              </ul>
            </InfoCard>

            <InfoCard title="What you need">
              <ul className="list-disc pl-5 space-y-2">
                <li>Yoga mat</li>
                <li>Small space to move</li>
                <li>Water + comfy clothes</li>
              </ul>
            </InfoCard>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <section className="mt-12">
        <h2 className="text-2xl font-bold text-gray-900">FAQ</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <FAQItem
            q="How do I join the class after paying?"
            a="Right after checkout, you’ll land on your Members page. You’ll also get a class link by email. At class time, you can join from either place."
          />
          <FAQItem
            q="Can I cancel anytime?"
            a="Yes. You can manage billing and cancel from the billing portal. Your access stays active until the end of the paid period."
          />
          <FAQItem
            q="Do I need experience?"
            a="No. Classes include beginner-friendly options and clear cues so you can follow along at your own pace."
          />
          <FAQItem
            q="What if I miss a class?"
            a="No problem. Check the schedule and join the next one that fits your week."
          />
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="mt-12 rounded-3xl border bg-white p-10 shadow-sm">
        <h2 className="text-2xl font-bold text-gray-900">Ready to start?</h2>
        <p className="mt-2 text-sm text-gray-600">
          Join today and get your Members access + email class link immediately after checkout.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <PrimaryButton onClick={handleCheckout} disabled={loading}>
            {loading ? "Redirecting..." : "Join Online"}
          </PrimaryButton>
          <SecondaryButton href="/classes">Browse Classes</SecondaryButton>
        </div>
      </section>
    </main>
  );
}