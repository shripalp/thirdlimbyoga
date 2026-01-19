import NextAuth from "next-auth";

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  secret: process.env.AUTH_SECRET || "test-secret",
  session: { strategy: "jwt" },
  providers: [],
});