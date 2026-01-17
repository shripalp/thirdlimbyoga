import Link from "next/link";

function PrimaryButton({ href, children }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white shadow-sm hover:opacity-90"
    >
      {children}
    </Link>
  );
}

function SecondaryButton({ href, children }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-50"
    >
      {children}
    </Link>
  );
}

function FeatureCard({ title, text }) {
  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      <p className="mt-2 text-sm text-gray-600">{text}</p>
    </div>
  );
}

function StepCard({ step, title, text }) {
  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm">
      <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-sm font-bold text-primary">
        {step}
      </div>
      <h3 className="mt-4 text-lg font-semibold text-gray-900">{title}</h3>
      <p className="mt-2 text-sm text-gray-600">{text}</p>
    </div>
  );
}

export default function HomePage() {
  return (
    <main>
      {/* HERO */}
      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-6 py-14 md:py-20">
          <div className="grid gap-10 md:grid-cols-2 md:items-center">
            <div>
              <p className="inline-flex rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-primary">
                Live online yoga
              </p>

              <h1 className="mt-4 text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">
                Online yoga that fits your life.
              </h1>

              <p className="mt-4 text-base text-gray-600 md:text-lg">
                Join live guided yoga classes from home. Build strength,
                mobility, and calm — without pressure or overwhelm. You can join from your Members page or directly from the class link emailed to you.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <PrimaryButton href="/pricing">Join Online</PrimaryButton>
                <SecondaryButton href="/schedule">View Schedule</SecondaryButton>
              </div>

              <div className="mt-6 flex flex-wrap gap-3 text-sm text-gray-600">
                <span className="rounded-full bg-gray-50 px-3 py-1">
                  Beginner-friendly
                </span>
                <span className="rounded-full bg-gray-50 px-3 py-1">
                  Live online classes
                </span>
                <span className="rounded-full bg-gray-50 px-3 py-1">
                  Cancel anytime
                </span>
              </div>
            </div>

            {/* INFO CARD */}
            <div className="rounded-3xl border bg-gradient-to-br from-secondary to-white p-8 shadow-sm">
              <div className="rounded-2xl bg-white p-6">
                <h2 className="text-lg font-semibold text-gray-900">
                  What you get
                </h2>
                <ul className="mt-4 space-y-2 text-sm text-gray-600">
                  <li>• Live online yoga classes</li>
                  <li>• Weekly class schedule</li>
                  <li>• Members page access after checkout</li>
                  <li>• Class link sent by email (or join from your Members page)</li>
                </ul>

                <div className="mt-6">
                  <SecondaryButton href="/classes">
                    Browse Classes
                  </SecondaryButton>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST */}
      <section className="bg-gray-50">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <div className="grid gap-6 md:grid-cols-3">
            <FeatureCard
              title="Clear, supportive guidance"
              text="Easy-to-follow cues with options so you can move at your own pace."
            />
            <FeatureCard
              title="Practice from home"
              text="All classes are live online — no commuting, no pressure."
            />
            <FeatureCard
              title="Build consistency"
              text="Short, effective classes that fit into real schedules."
            />
          </div>

          {/* INSTRUCTOR */}
          <div className="mt-10 rounded-3xl border bg-white p-8 shadow-sm">
            <div className="grid gap-6 md:grid-cols-3 md:items-center">
              <div className="md:col-span-2">
                <h2 className="text-2xl font-bold text-gray-900">
                  Meet your instructor
                </h2>
                <p className="mt-2 text-sm text-gray-600">
                  Add a short, friendly bio here. Share your teaching style,
                  who your classes are for, and what students can expect.
                </p>
                <div className="mt-5 flex gap-3">
                  <SecondaryButton href="/contact">
                    Ask a question
                  </SecondaryButton>
                  <PrimaryButton href="/pricing">
                    Start membership
                  </PrimaryButton>
                </div>
              </div>

              <div className="rounded-2xl bg-gray-50 p-6 text-sm text-gray-600">
                <p className="font-semibold text-gray-900">Class style</p>
                <ul className="mt-3 space-y-2">
                  <li>• Gentle flow & strength</li>
                  <li>• Focus on mobility & calm</li>
                  <li>• Beginner to intermediate</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <h2 className="text-3xl font-bold text-gray-900">
            How it works
          </h2>

          <div className="mt-8 grid gap-6 md:grid-cols-3">
            <StepCard
              step="1"
              title="Join online"
              text="Choose your membership and checkout securely with Stripe."
            />
            <StepCard
              step="2"
              title="Get access"
              text="You’ll get a class link by email, and it will also appear on your Members page."
            />
            <StepCard
              step="3"
              title="Join live"
              text="At class time, join using your email link or your Members page."
            />
          </div>

          <div className="mt-10 flex flex-wrap gap-3">
            <PrimaryButton href="/pricing">Join Online</PrimaryButton>
            <SecondaryButton href="/schedule">
              View Schedule
            </SecondaryButton>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="bg-gray-50">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <div className="rounded-3xl border bg-white p-10 shadow-sm">
            <h2 className="text-3xl font-bold text-gray-900">
              Ready to practice?
            </h2>
            <p className="mt-3 text-sm text-gray-600">
              Join live online yoga today and start building a consistent
              practice from home.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <PrimaryButton href="/pricing">Join Online</PrimaryButton>
              <SecondaryButton href="/schedule">
                Check class times
              </SecondaryButton>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}