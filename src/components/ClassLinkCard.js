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
      // user can still select & copy manually
    }
  }

  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900">Your class link</h2>
      <p className="mt-2 text-sm text-gray-600">
        You can use the email link anytime, and you can also open it from here.
      </p>

      <div className="mt-4 rounded-xl bg-gray-50 p-4">
        <p className="break-all text-sm text-gray-800">{classLink}</p>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <a
          href={classLink}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white shadow-sm hover:opacity-90"
        >
          Open class link
        </a>

        <button
          onClick={copy}
          className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-50"
        >
          {copied ? "Copied" : "Copy link"}
        </button>
      </div>

      <p className="mt-3 text-xs text-gray-500">
        Tip: Save the email you received after checkout for fastest access.
      </p>
    </div>
  );
}