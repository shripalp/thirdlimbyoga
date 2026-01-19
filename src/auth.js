import NextAuth from "next-auth";

export const { handlers, auth } = NextAuth({
  secret: process.env.AUTH_SECRET || "test-secret",
  trustHost: true,
  session: { strategy: "jwt" },
  providers: [],
});