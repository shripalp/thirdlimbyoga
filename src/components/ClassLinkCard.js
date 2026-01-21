"use client";

import { useState } from "react";

export default function ClassLinkCard({ classLink }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(classLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // fallback: user can still select & copy manually
    }
  }

  return (
    <section
      aria-labelledby="class-link-heading"
      className="rounded-2xl border bg-white p-6 shadow-sm"
    >
      <div className="flex items-start justify-between gap-3">
        <h2
          id="class-link-heading"
          className="text-lg font-semibold text-gray-900"
        >
          Your live class link
        </h2>

        <span className="inline-flex items-center rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-800 border border-green-200">
          Active
        </span>
      </div>

      <p className="mt-2 text-sm text-gray-600">
        This is the same link we emailed you after checkout. You can open it from
        here anytime.
      </p>

      <div className="mt-4 rounded-xl bg-gray-50 p-4">
        <p className="break-all text-sm text-gray-800">{classLink}</p>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <a
          href={classLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-sm hover:opacity-90"
        >
          Join class now
        </a>

        <button
          type="button"
          onClick={copy}
          className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-50"
        >
          {copied ? "Link copied" : "Copy link"}
        </button>
      </div>

      <p className="mt-4 text-xs text-gray-500">
        Tip: You don’t need to sign in each time. Saving the email or this page
        gives you fastest access.
      </p>
    </section>
  );
}