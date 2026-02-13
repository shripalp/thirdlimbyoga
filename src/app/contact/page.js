import Image from "next/image";

const contactDetails = [
  {
    label: "Email",
    value: "shripalp@gmail.com",
    href: "mailto:shripalp@gmail.com",
  },
  {
    label: "Phone",
    value: "403-805-4070",
    href: "tel:+14038054070",
  },
  {
    label: "Location",
    value: "Calgary, Canada",
  },
];

export const metadata = {
  title: "Contact | Third Limb Yoga",
  description:
    "Connect with Shripal Parikh, eRYT-200h instructor for Third Limb Yoga.",
};

export default function ContactPage() {
  return (
    <main className="bg-gray-50">
      <section className="mx-auto max-w-4xl px-6 py-16">
        <div className="rounded-3xl border bg-white p-8 shadow-sm">
          <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-primary">
                Get in touch
              </p>
              <h1 className="mt-3 text-3xl font-bold text-gray-900 md:text-4xl">
                Shripal Parikh, eRYT-200h
              </h1>
              <p className="mt-4 text-base text-gray-600">
                Reach out any time for membership questions, class guidance, or
                help choosing the best practice plan.
              </p>

              <div className="mt-10 grid gap-6 sm:grid-cols-2">
                {contactDetails.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-2xl border bg-gray-50 p-5 text-sm text-gray-700"
                  >
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                      {item.label}
                    </p>
                    {item.href ? (
                      <a
                        href={item.href}
                        className="mt-2 inline-flex text-base font-semibold text-gray-900 hover:text-primary"
                      >
                        {item.value}
                      </a>
                    ) : (
                      <p className="mt-2 text-base font-semibold text-gray-900">
                        {item.value}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-10 rounded-2xl bg-secondary/20 p-6 text-sm text-gray-700">
                <p className="font-semibold text-gray-900">Office hours</p>
                <p className="mt-2 text-gray-600">
                  Send an email or leave a voicemail anytime. I respond within
                  one business day.
                </p>
              </div>
            </div>

            <aside className="mx-auto w-full max-w-xs lg:max-w-none">
              <div className="overflow-hidden rounded-3xl border bg-gray-50 shadow-sm">
                <Image
                  src="/shripal_parikh.jpg"
                  alt="Shripal Parikh"
                  width={800}
                  height={1000}
                  className="h-full w-full object-cover"
                  priority
                />
              </div>
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}
