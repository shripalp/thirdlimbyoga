import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t bg-white">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <p className="font-semibold text-primary">Third Limb Yoga</p>
            <p className="mt-2 text-sm text-gray-600">
              Online and in-person classes in Calgary.
            </p>
          </div>

          <div className="flex gap-5 text-sm">
            <Link className="text-gray-700 hover:text-primary" href="/classes">
              Classes
            </Link>
            <Link className="text-gray-700 hover:text-primary" href="/schedule">
              Schedule
            </Link>
            <Link className="text-gray-700 hover:text-primary" href="/pricing">
              Pricing
            </Link>
            <Link className="text-gray-700 hover:text-primary" href="/contact">
              Contact
            </Link>
          </div>
        </div>

        <p className="mt-8 text-xs text-gray-500">
          © {new Date().getFullYear()} Third Limb Yoga. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
