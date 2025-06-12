import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
  }

  interface User {
    profile_image_url?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    profile_image_url?: string | null;
  }
} 