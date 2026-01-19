import NextAuth from "next-auth";
import Resend from "next-auth/providers/resend";

export const { handlers, auth, signIn, signOut } = NextAuth({
  debug: true,

  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  trustHost: true,

  // ✅ JWT-only sessions (NO database)
  session: {
    strategy: "jwt",
  },

  providers: [
    Resend({
      apiKey: process.env.RESEND_API_KEY,
      from: process.env.EMAIL_FROM,
    }),
  ],

  pages: {
    signIn: "/members/login",
    verifyRequest: "/members/check-email",
  },

  callbacks: {
    async jwt({ token, user }) {
      // When user logs in for the first time
      if (user?.email) {
        token.email = user.email;
      }
      return token;
    },

    async session({ session, token }) {
      if (token?.email) {
        session.user.email = token.email;
      }
      return session;
    },
  },
});