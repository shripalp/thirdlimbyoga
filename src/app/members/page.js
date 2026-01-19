import Link from "next/link";
import { auth, signOut } from "@/auth";

export const dynamic = "force-dynamic";

function ButtonLink({ href, children, variant = "primary" }) {
  const base =
    "inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold shadow-sm transition";
  const styles =
    variant === "primary"
      ? "bg-primary text-white hover:opacity-90"
      : "border border-gray-200 bg-white text-gray-900 hover:bg-gray-50";

  return (
    <Link href={href} className={`${base} ${styles}`}>
      {children}
    </Link>
  );
}

export default async function MembersPage() {
  const session = await auth();

  // ─────────────────────────────────────────────
  // NOT LOGGED IN
  // ─────────────────────────────────────────────
  if (!session?.user?.email) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="text-3xl font-bold text-primary">Members</h1>

        <p className="mt-3 text-gray-600">
          Please sign in to access your online yoga classes.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <ButtonLink href="/members/login">Sign in</ButtonLink>
          <ButtonLink href="/pricing" variant="secondary">
            Join Online
          </ButtonLink>
        </div>
      </main>
    );
  }

  const email = session.user.email;

  // ─────────────────────────────────────────────
  // LOGGED IN
  // ─────────────────────────────────────────────
  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      {/* Success banner */}
      <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">
        You’re logged in successfully.
      </div>

      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary">Members</h1>
          <p className="mt-2 text-sm text-gray-600">
            Signed in as{" "}
            <span className="font-medium text-gray-900">{email}</span>
          </p>
        </div>

        {/* Sign out */}
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/" });
          }}
        >
          <button className="text-sm text-gray-500 hover:text-gray-900">
            Sign out
          </button>
        </form>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {/* Main content */}
        <div className="md:col-span-2 space-y-6">
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">
              Join your online class
            </h2>

            <p className="mt-2 text-sm text-gray-600">
              You can join your live yoga classes using the link sent to your
              email after checkout.
            </p>

            <p className="mt-2 text-sm text-gray-600">
              You can also view the class schedule below.
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
              <ButtonLink href="/schedule">View Schedule</ButtonLink>
              <ButtonLink href="/contact" variant="secondary">
                Need help?
              </ButtonLink>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">Quick links</h2>

            <div className="mt-4 flex flex-col gap-3">
              <ButtonLink href="/classes" variant="secondary">
                Classes
              </ButtonLink>
              <ButtonLink href="/schedule" variant="secondary">
                Schedule
              </ButtonLink>
              <ButtonLink href="/contact" variant="secondary">
                Contact
              </ButtonLink>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}