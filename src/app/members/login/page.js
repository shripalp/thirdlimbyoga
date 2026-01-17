"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";

export default function MembersLoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    await signIn("resend", { email, callbackUrl: "/members" });
    setLoading(false);
  }

  return (
    <main className="mx-auto max-w-lg px-6 py-12">
      <h1 className="text-3xl font-bold text-primary">Member login</h1>
      <p className="mt-3 text-gray-600">
        Enter your email and we’ll send you a secure sign-in link.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <label className="block">
          <span className="text-sm font-semibold text-gray-900">Email</span>
          <input
            className="mt-2 w-full rounded-xl border px-4 py-3"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white shadow-sm hover:opacity-90 disabled:opacity-60"
        >
          {loading ? "Sending link..." : "Email me a sign-in link"}
        </button>
      </form>

      <p className="mt-6 text-sm text-gray-600">
        Not a member yet?{" "}
        <Link className="font-semibold text-primary underline" href="/pricing">
          Join online
        </Link>
      </p>
    </main>
  );
}