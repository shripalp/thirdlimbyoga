import { Suspense } from "react";
import LoginClient from "./LoginClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function MembersLoginPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto max-w-lg px-6 py-12">
          <h1 className="text-3xl font-bold text-primary">Member login</h1>
          <p className="mt-3 text-gray-600">Loading sign-in options…</p>
        </main>
      }
    >
      <LoginClient />
    </Suspense>
  );
}