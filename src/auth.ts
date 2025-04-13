import NextAuth from "next-auth";
import { authOptions } from "./lib/authoptions";

export const { auth, handlers, signIn, signOut } = NextAuth(authOptions);
