"use client";

import Link from "next/link";
import { useState } from "react";

const links = [
  { href: "/classes", label: "Classes" },
  { href: "/schedule", label: "Schedule" },
  { href: "/members", label: "Members" }, // 👈 ADDED
  { href: "/pricing", label: "Pricing" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b">
      <nav className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="font-bold text-xl text-primary"
          onClick={() => setOpen(false)}
        >
          Third Limb Yoga
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-6">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-gray-700 hover:text-primary"
            >
              {l.label}
            </Link>
          ))}

          {/* Primary CTA stays Join Online */}
          <Link
            href="/pricing"
            className="rounded-md bg-accent px-4 py-2 text-white hover:opacity-90"
          >
            Join Online
          </Link>
        </div>

        {/* Mobile button */}
        <button
          className="md:hidden inline-flex items-center justify-center rounded-md border px-3 py-2"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          <span className="text-sm font-medium">Menu</span>
        </button>
      </nav>

      {/* Mobile panel */}
      {open && (
        <div className="md:hidden border-t bg-white">
          <div className="mx-auto max-w-6xl px-6 py-4 flex flex-col gap-4">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-gray-800 hover:text-primary"
                onClick={() => setOpen(false)}
              >
                {l.label}
              </Link>
            ))}

            <Link
              href="/pricing"
              className="text-center rounded-md bg-accent px-4 py-2 text-white hover:opacity-90"
              onClick={() => setOpen(false)}
            >
              Join Online
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}