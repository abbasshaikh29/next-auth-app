import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { User } from "../models/User";
import { dbconnect } from "./db";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
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
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          console.log("Missing credentials");
          return null;
        }
        try {
          console.log("Attempting to connect to database");
          await dbconnect();
          console.log("Searching for user:", credentials.email);
          const user = await User.findOne({ email: credentials.email });
          if (!user) {
            console.log("User not found");
            return null;
          }
          console.log("Comparing password hash");
          const isvaild = await bcrypt.compare(
            credentials.password,
            user.password
          );
          if (!isvaild) {
            console.log("Password comparison failed");
            return null;
          }
          console.log("Authentication successful for user:", user.email);
          // Return a user object with all required fields
          return {
            id: user._id.toString(),
            email: user.email,
            username: user.username, // Include the username
            name: user.username, // Use username as the name
            image: user.profileImage, // Add profile image if available
            // Add slug to the user
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
        token.id = user.id || "";
        token.email = user.email || "";
        token.username = user.username || user.name || "";
      }

      // Add account type (oauth provider info)
      if (account) {
        token.provider = account.provider;
      }

      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.username = token.username as string;
        session.user.provider = token.provider as string;
      }

      return session;
    },
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        try {
          await dbconnect();

          // Check if user already exists
          const existingUser = await User.findOne({ email: user.email });

          if (!existingUser) {
            // Create a new user with Google OAuth data
            const newUser = new User({
              email: user.email,
              username: user.name,
              password: bcrypt.hashSync(
                Math.random().toString(36).slice(-8),
                10
              ), // Generate random password
              profileImage: user.image,
            });

            await newUser.save();
          }

          return true;
        } catch (error) {
          console.error("Google SignIn error:", error);
          return false;
        }
      }

      return true;
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
