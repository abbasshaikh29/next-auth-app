import { NextAuthOptions } from "next-auth";
import Credentialsprovider from "next-auth/providers/credentials";
import { User } from "../models/User";
import { dbconnect } from "./db";
import bcrypt from "bcryptjs";
export const authoption: NextAuthOptions = {
  providers: [
    Credentialsprovider({
      name: "Credentials",
      credentials: {
        Username: { label: "Username", type: "string" },
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }
        try {
          await dbconnect();
          const user = await User.findOne({ email: credentials.email });
          if (!user) {
            return null;
          }
          const isvaild = await bcrypt.compare(
            credentials.password,
            user.password
          );
          if (!isvaild) {
            return null;
          }
          return user;
        } catch (error) {
          console.error("Authentication error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }

      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login ",
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET,
};
