"use client";

import { useEffect, useState } from "react";

export default function MembersPage() {
  const [state, setState] = useState({ loading: true, active: false, error: "" });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");

    if (!sessionId) {
      setState({ loading: false, active: false, error: "Missing session information. Please return from checkout." });
      return;
    }

    fetch(`/api/stripe/verify-session?session_id=${encodeURIComponent(sessionId)}`)
      .then((r) => r.json())
      .then((data) => {
        if (!data.ok) throw new Error(data.error || "Verification failed");
        setState({ loading: false, active: !!data.active, error: "" });
      })
      .catch((e) => setState({ loading: false, active: false, error: e.message }));
  }, []);

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="text-3xl font-bold text-primary">Members</h1>

      {state.loading ? (
        <p className="mt-4 text-gray-700">Checking your membership…</p>
      ) : state.error ? (
        <p className="mt-4 text-red-600">{state.error}</p>
      ) : state.active ? (
        <div className="mt-6 rounded-2xl border bg-white p-6 shadow-sm">
          <p className="font-semibold text-gray-900">You’re active ✅</p>
          <p className="mt-2 text-gray-600">Join your live class on Microsoft Teams:</p>
          <button
  className="mt-4 rounded-md border border-primary px-5 py-3 text-primary hover:bg-primary hover:text-white"
  onClick={async () => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");
    const res = await fetch("/api/stripe/portal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: sessionId }),
    });
    const data = await res.json();
    window.location.href = data.url;
  }}
>
  Manage billing
</button>

          <TeamsLink />
        </div>
      ) : (
        <p className="mt-4 text-gray-700">
          Your subscription isn’t active. If you just paid, wait a moment and refresh.
        </p>
      )}
    </main>
  );
}

function TeamsLink() {
  const [link, setLink] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");

    fetch(`/api/members/teams-link?session_id=${encodeURIComponent(sessionId)}`)
      .then((r) => r.json())
      .then((data) => {
        if (!data.ok) throw new Error(data.error || "Failed");
        if (!data.active) throw new Error("Not active");
        setLink(data.url);
      })
      .catch((e) => setErr(e.message));
  }, []);

  if (err) return <p className="mt-4 text-red-600">{err}</p>;
  if (!link) return <p className="mt-4 text-gray-700">Loading class link…</p>;

  return (
    <a
      className="mt-4 inline-block rounded-md bg-primary px-5 py-3 text-white hover:opacity-90"
      href={link}
      target="_blank"
      rel="noreferrer"
    >
      Join on Teams
    </a>
  );
}


