"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

function Button({ children, onClick, disabled, variant = "primary", href }) {
  const base =
    "inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold shadow-sm disabled:opacity-60 disabled:cursor-not-allowed";
  const styles =
    variant === "primary"
      ? "bg-primary text-white hover:opacity-90"
      : "border border-gray-200 bg-white text-gray-900 hover:bg-gray-50";

  const className = `${base} ${styles}`;

  if (href) return <Link className={className} href={href}>{children}</Link>;

  return (
    <button type="button" className={className} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}

function Card({ title, children }) {
  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      <div className="mt-3 text-sm text-gray-600">{children}</div>
    </div>
  );
}

export default function MembersPage() {
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(false);
  const [classUrl, setClassUrl] = useState("");
  const [error, setError] = useState("");

  const [portalLoading, setPortalLoading] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [bannerText, setBannerText] = useState("");

  const sessionId = useMemo(() => {
    if (typeof window === "undefined") return "";
    const sp = new URLSearchParams(window.location.search);
    return sp.get("session_id") || "";
  }, []);

  useEffect(() => {
    if (!sessionId) return;

    setShowBanner(true);
    setBannerText("Payment received. Setting up your access…");

    const t = setTimeout(() => setShowBanner(false), 8000);
    return () => clearTimeout(t);
  }, [sessionId]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");

      if (!sessionId) {
        setLoading(false);
        setActive(false);
        setError("Missing session info. If you just checked out, use the link from your confirmation page or email.");
        setShowBanner(false);
        return;
      }

      try {
        // This endpoint should return { ok:true, active:true/false, url?: "..." }
        const res = await fetch(`/api/members/teams-link?session_id=${encodeURIComponent(sessionId)}`);
        const data = await res.json();

        if (!res.ok || !data?.ok) {
          throw new Error(data?.error || "Could not verify membership.");
        }

        setActive(!!data.active);
        setClassUrl(data.url || "");
        if (data.active) {
          setBannerText("Membership active. Your class link is ready.");
        } else {
          setBannerText("Payment confirmed. Your membership may take a moment to activate.");
        }
        setShowBanner(true);
      } catch (e) {
        setActive(false);
        setClassUrl("");
        setError(e.message || "Something went wrong.");
        setBannerText("We couldn’t confirm your access yet. Please refresh in a moment.");
        setShowBanner(true);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [sessionId]);

  async function handleCopy() {
    if (!classUrl) return;
    try {
      await navigator.clipboard.writeText(classUrl);
      alert("Class link copied!");
    } catch {
      alert("Couldn’t copy automatically. You can select and copy the link.");
    }
  }

  async function handlePortal() {
    if (!sessionId || portalLoading) return;
    setPortalLoading(true);

    try {
      const res = await fetch("/api/stripe/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId }),
      });
      const data = await res.json();
      if (!res.ok || !data?.ok) throw new Error(data?.error || "Portal failed");
      window.location.href = data.url;
    } catch (e) {
      alert(e.message || "Could not open billing portal.");
      setPortalLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="text-3xl font-bold text-primary">Members</h1>
      <p className="mt-3 text-gray-600">
        You can join class in two ways: from this Members page, or using the class link emailed to you after checkout.
      </p>

      {showBanner ? (
        <div className="mt-6 rounded-2xl border bg-secondary p-4 text-primary shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <p className="text-sm font-semibold">{bannerText}</p>
            <button
              type="button"
              className="rounded-lg border border-primary/20 bg-white px-3 py-1 text-xs font-semibold text-primary hover:bg-gray-50"
              onClick={() => setShowBanner(false)}
            >
              Dismiss
            </button>
          </div>
        </div>
      ) : null}

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {/* Left: Access */}
        <div className="md:col-span-2 space-y-6">
          <Card title="Your access">
            {loading ? (
              <p>Checking your membership…</p>
            ) : error ? (
              <div className="space-y-3">
                <p className="text-red-600">{error}</p>
                <div className="flex flex-wrap gap-3">
                  <Button variant="secondary" href="/pricing">Go to Pricing</Button>
                  <Button variant="secondary" href="/schedule">View Schedule</Button>
                </div>
              </div>
            ) : active ? (
              <div className="space-y-4">
                <p className="text-gray-900">
                  ✅ Membership active. You’re ready to join.
                </p>

                {classUrl ? (
                  <div className="rounded-xl border bg-gray-50 p-4">
                    <p className="text-xs font-semibold text-gray-700">Your class link</p>
                    <p className="mt-2 break-all text-sm text-gray-900">{classUrl}</p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-600">
                    Your class link is not available yet. Please check your email or refresh in a moment.
                  </p>
                )}

                <div className="flex flex-wrap gap-3">
                  <Button
                    onClick={() => classUrl && window.open(classUrl, "_blank", "noopener,noreferrer")}
                    disabled={!classUrl}
                  >
                    Join Class
                  </Button>

                  <Button variant="secondary" onClick={handleCopy} disabled={!classUrl}>
                    Copy class link
                  </Button>

                  <Button variant="secondary" href="/schedule">
                    View Schedule
                  </Button>
                </div>

                <p className="text-xs text-gray-500">
                  Tip: The email link lets you join without visiting the site. This page is your backup and billing hub.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-gray-900">
                  Your membership doesn’t look active yet.
                </p>
                <p className="text-sm text-gray-600">
                  If you just paid, wait a moment and refresh. Otherwise, go back to pricing to join.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Button href="/pricing">Join Online</Button>
                  <Button variant="secondary" href="/contact">Contact</Button>
                </div>
              </div>
            )}
          </Card>

          <Card title="Need help?">
            <ul className="list-disc pl-5 space-y-2">
              <li>If you can’t find the email, check your spam/junk folder.</li>
              <li>If the class link is missing here, refresh after 30–60 seconds.</li>
              <li>You can always use the emailed link to join directly.</li>
            </ul>
          </Card>
        </div>

        {/* Right: Billing */}
        <div className="space-y-6">
          <Card title="Billing">
            <p>
              Manage billing, update payment method, or cancel anytime.
            </p>
            <div className="mt-4">
              <Button variant="secondary" onClick={handlePortal} disabled={!sessionId || portalLoading}>
                {portalLoading ? "Opening..." : "Manage billing"}
              </Button>
            </div>
          </Card>

          <Card title="Quick links">
            <div className="flex flex-col gap-3">
              <Button variant="secondary" href="/classes">Browse Classes</Button>
              <Button variant="secondary" href="/schedule">Schedule</Button>
              <Button variant="secondary" href="/contact">Contact</Button>
            </div>
          </Card>
        </div>
      </div>
    </main>
  );
}