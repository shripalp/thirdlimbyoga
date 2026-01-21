"use client";

import { useState } from "react";

export default function CancelMembershipButton() {
  const [loading, setLoading] = useState(false);

  async function go() {
    setLoading(true);
    const res = await fetch("/api/stripe/portal-cancel", { method: "POST" });
    const data = await res.json();

    if (data?.url) {
      window.location.href = data.url;
      return;
    }

    setLoading(false);
    alert(data?.error || "Could not open cancellation.");
  }

  return (
    <button
      onClick={go}
      disabled={loading}
      className="rounded-xl border border-red-200 bg-white px-5 py-3 text-sm font-semibold text-red-700 shadow-sm hover:bg-red-50 disabled:opacity-60"
    >
      {loading ? "Opening…" : "Cancel membership"}
    </button>
  );
}