"use client";

import { useState } from "react";

export default function ManageMembershipButton() {
  const [loading, setLoading] = useState(false);

  async function openPortal() {
    setLoading(true);

    try {
      const res = await fetch("/api/stripe/portal", {
        method: "POST",
      });

      const data = await res.json();

      if (data?.url) {
        window.location.href = data.url;
        return;
      }

      alert(data?.error || "Could not open membership portal.");
    } catch {
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={openPortal}
      disabled={loading}
      className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white shadow-sm transition disabled:opacity-60"
    >
      {loading ? "Opening…" : "Manage membership"}
    </button>
  );
}