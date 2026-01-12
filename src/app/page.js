import Button from "../components/Button";

function BenefitCard({ title, text }) {
  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm">
      <p className="font-semibold text-gray-900">{title}</p>
      <p className="mt-2 text-sm text-gray-600">{text}</p>
    </div>
  );
}

function ClassCard({ title, level, text }) {
  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="font-semibold text-gray-900">{title}</p>
        <span className="rounded-full bg-secondary px-3 py-1 text-xs text-primary">
          {level}
        </span>
      </div>
      <p className="mt-2 text-sm text-gray-600">{text}</p>
    </div>
  );
}

export default function Home() {
  return (
    <main>
      {/* HERO */}
      <section className="bg-secondary">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="max-w-2xl">
            <h1 className="text-5xl md:text-6xl font-bold text-primary leading-tight">
              Yoga for strength, calm, and consistency.
            </h1>

            <p className="mt-6 text-lg text-gray-700">
              Join online classes from home or practice in-person in Calgary. A
              simple monthly membership that supports your body and your nervous
              system.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <Button href="/pricing" variant="primary">
                Join Online Classes
              </Button>
              <Button href="/schedule" variant="outline">
                View Schedule
              </Button>
            </div>

            <p className="mt-6 text-sm text-gray-600">
              New? Start with beginner-friendly sessions and progress at your
              own pace.
            </p>
          </div>
        </div>
      </section>

      {/* BENEFITS */}
      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="text-3xl font-bold text-gray-900">
            What you’ll get
          </h2>
          <p className="mt-3 text-gray-600">
            A steady practice that fits real life.
          </p>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            <BenefitCard
              title="Monthly membership"
              text="One subscription for all live online classes (and updates as new sessions are added)."
            />
            <BenefitCard
              title="Clear weekly schedule"
              text="Consistent class times so you can build a habit without overthinking."
            />
            <BenefitCard
              title="Supportive teaching"
              text="Options and modifications so you feel safe, challenged, and confident."
            />
          </div>
        </div>
      </section>

      {/* CLASS HIGHLIGHTS (Sanity-ready later) */}
      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-6 pb-16">
          <div className="flex items-end justify-between gap-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Class styles</h2>
              <p className="mt-3 text-gray-600">
                A mix of strength, mobility, and recovery.
              </p>
            </div>

            <div className="hidden sm:block">
              <Button href="/classes" variant="outline">
                Browse all classes
              </Button>
            </div>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            <ClassCard
              title="Flow & Strength"
              level="All levels"
              text="Build heat, strength, and focus with smart sequencing and options."
            />
            <ClassCard
              title="Mobility + Core"
              level="Intermediate"
              text="Improve range of motion and stability with controlled, strong work."
            />
            <ClassCard
              title="Restorative"
              level="Beginner"
              text="Slow down, breathe, and reset—perfect for stress and recovery."
            />
          </div>

          <div className="mt-8 sm:hidden">
            <Button href="/classes" variant="outline" className="w-full">
              Browse all classes
            </Button>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-secondary">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="rounded-2xl border bg-white p-8 md:p-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">
                Ready to practice with us?
              </h3>
              <p className="mt-2 text-gray-600">
                Join the monthly membership and get instant access after payment.
              </p>
            </div>
            <Button href="/pricing" variant="primary">
              View Pricing
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
