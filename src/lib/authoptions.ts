import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { User } from "../models/User";
import { dbconnect } from "./db";
import bcrypt from "bcryptjs";

export const authoption: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
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
          // Return a user object with all required fields
          return {
            id: user._id.toString(),
            email: user.email,
            username: user.username, // Include the username
            name: user.username, // Use username as the name
            image: user.profileImage, // Add profile image if available
          };
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
        token.email = user.email;
        token.username = user.username; // Add username to the token
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.username = token.username as string; // Add username to the session
      }

      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET,
};
