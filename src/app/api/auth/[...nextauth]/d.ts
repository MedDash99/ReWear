// next-auth.d.ts
import NextAuth, { DefaultSession } from "next-auth";
import { JWT as DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string; // Your internal DB user ID
    } & DefaultSession["user"]; // Keeps default properties like name, email, image
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId?: string; // Your internal DB user ID
    // `picture` is a standard field in DefaultJWT for image
  }
}