"use client";

import { useEffect, useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function MembersLoginPage() {
  const router = useRouter();
  const { status } = useSession();

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/members/redirect");
    }
  }, [status, router]);

  const [email, setEmail] = useState("");
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);

  async function handleEmailSubmit(e) {
    e.preventDefault();
    if (!email) return;

    setLoadingEmail(true);
    await signIn("resend", { email, callbackUrl: "/members/redirect" });
    // Fallback in case redirect fails
    setTimeout(() => setLoadingEmail(false), 1500);
  }

  async function handleGoogle() {
    setLoadingGoogle(true);
    await signIn("google", { callbackUrl: "/members/redirect" });
    // Fallback in case redirect fails
    setTimeout(() => setLoadingGoogle(false), 1500);
  }

  if (status === "authenticated") {
    return (
      <main className="mx-auto max-w-lg px-6 py-12">
        <h1 className="text-3xl font-bold text-primary">Member login</h1>
        <p className="mt-3 text-gray-600">Redirecting you to your Members area…</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-lg px-6 py-12">
      <h1 className="text-3xl font-bold text-primary">Member login</h1>
      <p className="mt-3 text-gray-600">Sign in to access your Members area.</p>

      {/* Google */}
      <button
        type="button"
        onClick={handleGoogle}
        disabled={loadingGoogle || loadingEmail}
        className="mt-8 w-full rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-50 disabled:opacity-60"
      >
        {loadingGoogle ? "Redirecting…" : "Continue with Google"}
      </button>

      {/* Divider */}
      <div className="my-8 flex items-center gap-4">
        <div className="h-px flex-1 bg-gray-200" />
        <span className="text-xs font-semibold text-gray-500">OR</span>
        <div className="h-px flex-1 bg-gray-200" />
      </div>

      {/* Magic link */}
      <p className="text-gray-600">
        Prefer email? Enter your email and we’ll send you a secure sign-in link.
      </p>

      <form onSubmit={handleEmailSubmit} className="mt-4 space-y-4">
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
          disabled={loadingEmail || loadingGoogle}
          className="w-full rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white shadow-sm hover:opacity-90 disabled:opacity-60"
        >
          {loadingEmail ? "Sending link…" : "Email me a sign-in link"}
        </button>
      </form>

      <p className="mt-6 text-sm text-gray-600">
        Not a member yet?{" "}
        <Link className="font-semibold text-primary underline" href="/pricing">
          Join online
        </Link>
      </p>

      <p className="mt-3 text-xs text-gray-500">
        Tip: Use the same email you used for checkout so your membership is
        detected.
      </p>
    </main>
  );
}