import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Soft background glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-44 right-[-120px] h-[520px] w-[520px] rounded-full bg-secondary/20 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl px-6 py-16 md:py-24">
        <div className="grid items-center gap-12 md:grid-cols-2">
          {/* Left: Copy */}
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border bg-white px-4 py-2 text-xs font-semibold text-gray-700 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-green-500" />
              Live online yoga • Monthly membership
            </span>

            <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-gray-900 md:text-5xl">
              Feel calmer, stronger, and more flexible—
              <span className="text-primary"> one class at a time.</span>
            </h1>

            <p className="mt-5 text-lg leading-relaxed text-gray-600">
              Join live online yoga designed for real life: beginner-friendly,
              steady progress, and a supportive vibe.
            </p>

            {/* CTAs */}
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/pricing"
                className="inline-flex items-center justify-center rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-sm hover:opacity-90"
              >
                View pricing
              </Link>

              <Link
                href="/schedule"
                className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-50"
              >
                See schedule
              </Link>
            </div>

            {/* Mini trust bullets */}
            <div className="mt-8 grid gap-3 text-sm text-gray-600 sm:grid-cols-3">
              <div className="rounded-xl border bg-white p-4 shadow-sm">
                <p className="font-semibold text-gray-900">Beginner-friendly</p>
                <p className="mt-1">Clear cues + options.</p>
              </div>
              <div className="rounded-xl border bg-white p-4 shadow-sm">
                <p className="font-semibold text-gray-900">Live classes</p>
                <p className="mt-1">Real guidance in real time.</p>
              </div>
              <div className="rounded-xl border bg-white p-4 shadow-sm">
                <p className="font-semibold text-gray-900">Monthly access</p>
                <p className="mt-1">One plan. Simple.</p>
              </div>
            </div>
          </div>

          {/* Right: “Beautiful card” preview */}
          <div className="relative">
            <div className="rounded-3xl border bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-900">This week</p>
                <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-primary">
                  Live online
                </span>
              </div>

              <div className="mt-6 space-y-4">
                <PreviewRow title="Gentle Flow" meta="30 min • All levels" />
                <PreviewRow title="Strength + Mobility" meta="45 min • Beginner+" />
                <PreviewRow title="Deep Stretch" meta="30 min • Calm" />
              </div>

              <div className="mt-6 rounded-2xl bg-gray-50 p-4">
                <p className="text-sm font-semibold text-gray-900">
                  What you get after checkout
                </p>
                <ul className="mt-2 space-y-2 text-sm text-gray-600">
                  <li className="flex gap-2">
                    <CheckIcon /> A class link sent to your email
                  </li>
                  <li className="flex gap-2">
                    <CheckIcon /> Members area access (optional)
                  </li>
                  <li className="flex gap-2">
                    <CheckIcon /> Manage or cancel anytime
                  </li>
                </ul>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/pricing"
                  className="flex-1 rounded-xl bg-primary px-6 py-3 text-center text-sm font-semibold text-white shadow-sm hover:opacity-90"
                >
                  Join now
                </Link>
                <Link
                  href="/classes"
                  className="flex-1 rounded-xl border border-gray-200 bg-white px-6 py-3 text-center text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-50"
                >
                  Browse classes
                </Link>
              </div>
            </div>

            {/* tiny floating accent */}
            <div className="pointer-events-none absolute -right-6 -top-6 hidden h-24 w-24 rounded-3xl bg-primary/10 blur-xl md:block" />
          </div>
        </div>
      </div>
    </section>
  );
}

function PreviewRow({ title, meta }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border bg-white p-4">
      <div>
        <p className="font-semibold text-gray-900">{title}</p>
        <p className="mt-1 text-xs text-gray-500">{meta}</p>
      </div>
      <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
        Live
      </span>
    </div>
  );
}

function CheckIcon() {
  return (
    <span className="mt-[2px] inline-flex h-5 w-5 items-center justify-center rounded-full bg-green-100 text-green-700">
      ✓
    </span>
  );
}