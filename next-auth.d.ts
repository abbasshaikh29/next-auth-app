import { DefaultSession } from "next-auth";
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      username: string;
      provider?: string;
      image?: string;
      name?: string;
      profileImage?: string;
    };
  }
  interface User {
    username: string;
    name: string;
    profileImage?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    email: string;
    username: string;
    provider?: string;
    profileImage?: string;
  }
}
