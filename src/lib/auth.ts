import { DefaultSession, NextAuthOptions, getServerSession } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "./db";

// Extend NextAuth's built-in types with the fields this app puts on the session.
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      credits: number;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    credits: number;
  }
}

// Read directly from process.env rather than through `env` so that importing
// this module during `next build` never throws. Misconfiguration surfaces at
// sign-in time, and /api/health reports it explicitly.
export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  callbacks: {
    // Look the user up on every token refresh so `credits` stays current after
    // a generation is spent.
    jwt: async ({ token }) => {
      if (!token.email) return token;

      const db_user = await prisma.user.findFirst({
        where: { email: token.email },
      });

      if (db_user) {
        token.id = db_user.id;
        token.credits = db_user.credits;
      }
      return token;
    },
    session: ({ session, token }) => {
      if (token) {
        session.user.id = token.id;
        session.user.name = token.name;
        session.user.email = token.email;
        // `picture` is the claim Google returns; NextAuth maps it onto the token.
        session.user.image = token.picture;
        session.user.credits = token.credits;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
  ],
};

/** Returns the current server-side session, or null when signed out. */
export const getAuthSession = () => {
  return getServerSession(authOptions);
};
