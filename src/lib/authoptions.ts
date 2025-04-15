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
  trustHost: true,
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
            profileImage: user.profileImage,
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
      console.log("JWT callback - Input:", {
        tokenId: token?.id,
        userId: user?.id,
      });

      if (user) {
        token.id = user.id as string;
        token.email = user.email as string;
        token.name = user.name as string;
        token.picture = user.image as string;
        token.username = user.username as string;

        // Add profileImage to token
        if (user.profileImage) {
          console.log("Setting profileImage from user:", user.profileImage);
          token.profileImage = user.profileImage;
        }
      }
      if (account) {
        token.provider = account.provider;
      }

      // If token already exists but we need to update the profileImage
      if (token.id && !token.profileImage) {
        try {
          await dbconnect();
          const dbUser = await User.findById(token.id);
          if (dbUser?.profileImage) {
            console.log(
              "Setting profileImage from database:",
              dbUser.profileImage
            );
            token.profileImage = dbUser.profileImage;
          }
        } catch (error) {
          console.error("Error fetching user profile image for token:", error);
        }
      }

      console.log("JWT callback - Output token:", {
        id: token.id,
        profileImage: token.profileImage,
      });

      return token;
    },
    // Using any for session type to match Auth.js v5 structure
    async session({ session, token }: { session: any; token: JWT }) {
      console.log("Session callback - Input token:", {
        id: token?.id,
        profileImage: token?.profileImage,
      });

      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.image = token.picture as string;
        session.user.username = token.username as string;
        session.user.provider = token.provider as string;

        // Add profileImage to session
        if (token.profileImage) {
          console.log(
            "Setting profileImage in session from token:",
            token.profileImage
          );
          session.user.profileImage = token.profileImage as string;
        } else {
          console.log("No profileImage found in token");

          // Try to get profileImage from database as a fallback
          try {
            await dbconnect();
            const dbUser = await User.findById(token.id);
            if (dbUser?.profileImage) {
              console.log(
                "Setting profileImage in session from database:",
                dbUser.profileImage
              );
              session.user.profileImage = dbUser.profileImage;
            }
          } catch (error) {
            console.error(
              "Error fetching user profile image for session:",
              error
            );
          }
        }
      }

      console.log("Session callback - Output session:", {
        id: session?.user?.id,
        profileImage: session?.user?.profileImage,
      });

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
  secret: "a9b7c5d3e1f02468ace0987654321fedcba8901234567890abcdef12345678",
};
