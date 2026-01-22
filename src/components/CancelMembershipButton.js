"use client";

import { useState } from "react";

export default function CancelMembershipButton() {
  const [loading, setLoading] = useState(false);

  async function go() {
    try {
      setLoading(true);

      const res = await fetch("/api/stripe/portal-cancel", { method: "POST" });

      // Safely parse JSON only if it is JSON
      const contentType = res.headers.get("content-type") || "";
      const data = contentType.includes("application/json") ? await res.json() : null;

      if (!res.ok) {
        const msg = data?.error || `Request failed (${res.status})`;
        alert(msg);
        return;
      }

      if (data?.url) {
        window.location.href = data.url;
        return;
      }

      alert("No portal URL returned.");
    } catch (e) {
      alert(e?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={go}
      disabled={loading}
      className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-900 shadow-sm transition hover:bg-gray-50 disabled:opacity-60"
    >
      {loading ? "Opening…" : "Cancel membership"}
    </button>
  );
}