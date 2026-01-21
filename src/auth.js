// src/auth.js
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Resend from "next-auth/providers/resend";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";

// ✅ Prisma singleton (prevents creating too many clients in serverless)
const globalForPrisma = globalThis;
const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  debug: process.env.NODE_ENV !== "production",

  // ✅ REQUIRED for magic-link email login (stores verification tokens)
  adapter: PrismaAdapter(prisma),

  // ✅ Keep JWT sessions (fast) while still using DB for email tokens
  session: { strategy: "jwt" },

  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,

  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
    Resend({
      apiKey: process.env.RESEND_API_KEY,
      from: process.env.EMAIL_FROM, // example: "ThirdLimb Yoga <hello@send.thirdlimbyoga.com>"
    }),
  ],

  pages: {
    signIn: "/members/login",
    verifyRequest: "/members/check-email",
    error: "/members/error",
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user?.email) token.email = user.email;
      return token;
    },
    async session({ session, token }) {
      if (token?.email) session.user.email = token.email;
      return session;
    },
  },
});