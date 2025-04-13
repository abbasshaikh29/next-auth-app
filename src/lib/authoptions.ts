import type { NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { User } from "../models/User";
import { dbconnect } from "./db";
import bcrypt from "bcryptjs";
import type { JWT } from "next-auth/jwt";

// Environment variable validation
if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  console.warn(
    "Warning: Google OAuth credentials missing in environment variables"
  );
}

if (!process.env.NEXTAUTH_SECRET) {
  console.warn("Warning: NEXTAUTH_SECRET is missing in environment variables");
}

export const authOptions: NextAuthConfig = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }
        try {
          await dbconnect();
          const user = await User.findOne({ email: credentials.email });
          if (!user) {
            return null;
          }
          const isValid = await bcrypt.compare(
            credentials.password as string,
            user.password as string
          );
          if (!isValid) {
            return null;
          }

          // Check if email is verified for credential login
          if (user.emailVerified === false && user.provider !== "google") {
            throw new Error("Please verify your email before logging in");
          }

          return {
            id: user._id.toString(),
            email: user.email,
            username: user.username,
            name: user.name || user.username,
            image: user.profileImage,
            emailVerified: user.emailVerified,
          };
        } catch (error) {
          console.error("Authentication error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id as string;
        token.email = user.email as string;
        token.name = user.name as string;
        token.picture = user.image as string;
        token.username = user.username as string;
      }
      if (account) {
        token.provider = account.provider;
      }
      return token;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async session({ session, token }: { session: any; token: JWT }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.image = token.picture as string;
        session.user.username = token.username as string;
        session.user.provider = token.provider as string;
      }
      return session;
    },
    async signIn({ user, account }) {
      try {
        await dbconnect();

        if (account?.provider === "google") {
          // Check if user exists
          let dbUser = await User.findOne({ email: user.email });

          if (!dbUser) {
            // Create new user if doesn't exist
            const username = user.name || user.email!.split("@")[0];
            dbUser = await User.create({
              email: user.email,
              username: username,
              name: user.name,
              profileImage: user.image,
              provider: "google",
              emailVerified: true, // Google users are automatically verified
              password: bcrypt.hashSync(
                Math.random().toString(36).slice(-8),
                10
              ),
            });
          } else {
            // Update existing user's Google-specific information
            await User.findOneAndUpdate(
              { email: user.email },
              {
                $set: {
                  name: user.name,
                  profileImage: user.image,
                  provider: "google",
                },
              },
              { new: true }
            );
          }

          // Update user object with database ID and username
          user.id = dbUser._id.toString();
          user.username = dbUser.username;
        }

        return true;
      } catch (error) {
        console.error("SignIn error:", error);
        return false;
      }
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
