import NextAuth from "next-auth";
import Resend from "next-auth/providers/resend";

export const {
  handlers,
  auth,
  signIn,
  signOut, // ✅ ADD THIS
} = NextAuth({
  debug: true,

  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  trustHost: true,

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