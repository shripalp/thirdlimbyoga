"use client";

import { useEffect, useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function MembersLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status } = useSession();

  useEffect(() => {
    let cancelled = false;

    async function verifyThenRedirect() {
      // If user just signed out, do not auto-redirect (prevents loops)
      if (searchParams?.get("signedout") === "1") return;

      if (status !== "authenticated") return;

      // Guard against stale client session state: verify with server
      try {
        const res = await fetch("/api/auth/session", { cache: "no-store" });
        if (!res.ok) return;

        const s = await res.json();
        if (cancelled) return;

        if (s?.user?.email) {
          setRedirecting(true);
          router.replace("/members/redirect");
        }
      } catch {
        // ignore
      }
    }

    verifyThenRedirect();

    return () => {
      cancelled = true;
    };
  }, [status, router, searchParams]);

  const [email, setEmail] = useState("");
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

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

  if (status === "loading") {
    return (
      <main className="mx-auto max-w-lg px-6 py-12">
        <h1 className="text-3xl font-bold text-primary">Member login</h1>
        <p className="mt-3 text-gray-600">Checking your session…</p>
      </main>
    );
  }

  if (redirecting) {
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
        className="mt-8 flex w-full items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-50 disabled:opacity-60"
      >
        <svg viewBox="0 0 48 48" className="h-5 w-5" aria-hidden="true">
          <path
            fill="#EA4335"
            d="M24 9.5c3.54 0 6.33 1.53 7.79 2.82l5.68-5.68C34.07 3.72 29.44 1.5 24 1.5 14.94 1.5 7.23 6.78 3.68 14.44l6.63 5.15C12.01 13.09 17.52 9.5 24 9.5z"
          />
          <path
            fill="#4285F4"
            d="M46.5 24c0-1.64-.15-3.21-.43-4.74H24v9h12.7c-.55 2.97-2.23 5.49-4.77 7.18l7.29 5.67C43.82 36.88 46.5 30.9 46.5 24z"
          />
          <path
            fill="#FBBC05"
            d="M10.31 28.59c-.48-1.45-.76-2.99-.76-4.59s.28-3.14.76-4.59l-6.63-5.15C2.21 17.26 1.5 20.56 1.5 24s.71 6.74 2.18 9.74l6.63-5.15z"
          />
          <path
            fill="#34A853"
            d="M24 46.5c5.44 0 10.07-1.79 13.43-4.89l-7.29-5.67c-2.03 1.36-4.63 2.16-6.14 2.16-6.48 0-11.99-3.59-14.69-8.59l-6.63 5.15C7.23 41.22 14.94 46.5 24 46.5z"
          />
        </svg>
        <span>{loadingGoogle ? "Redirecting…" : "Continue with Google"}</span>
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
          className="flex w-full items-center justify-center gap-3 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white shadow-sm hover:opacity-90 disabled:opacity-60"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path d="M4 4h16v16H4z" />
            <path d="M4 6l8 7 8-7" />
          </svg>
          <span>{loadingEmail ? "Sending link…" : "Email me a sign-in link"}</span>
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