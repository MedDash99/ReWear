// app/api/auth/[...nextauth]/route.ts

import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { compare } from "bcryptjs";
import { findUserByEmail, createUser } from "@/lib/supabase"; // Updated import
import NextAuth from "next-auth/next";
import { DefaultSession } from "next-auth";

interface User { // This is your local User interface, ensure it matches your DB functions' return type
  id: string;
  email: string;
  name: string | null;
  password_hash?: string | null; // Made optional if not always present
  googleId?: string | null;    // Made optional
  profile_image_url?: string | null; // Made optional
  rating?: number;
  cart?: string | null;
  wishlist?: string | null;
  address?: string | null;
  phone?: string | null;
  created_at?: string;
  updated_at?: string;
}

// Extend the NextAuth User type to include our custom properties
declare module "next-auth" {
  interface User {
    profile_image_url?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    profile_image_url?: string | null;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials): Promise<any> { // Return type for authorize should be Promise<User | null> or Promise<any>
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials: Email and password required.");
        }
        if (credentials.password.trim().length === 0) {
          throw new Error("Password cannot be empty");
        }

        // Ensure findUserByEmail is awaited if it's an async function
        const user = await findUserByEmail(credentials.email) as User | undefined;

        if (!user || !user.password_hash) { // Check password_hash existence
          throw new Error("Invalid credentials: User not found or no password set.");
        }

        const isCorrectPassword = await compare(
          credentials.password,
          user.password_hash
        );

        if (!isCorrectPassword) {
          throw new Error("Invalid credentials: Incorrect password.");
        }

        // Return only the properties NextAuth expects for the user object in the session/token
        // or the properties you'll explicitly pass through in callbacks.
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          profile_image_url: user.profile_image_url
        };
      }
    })
  ],
  callbacks: { // This is the single, main callbacks object
    async signIn({ user, account, profile }) {
      console.log(`[signIn callback] Attempting sign-in with provider: ${account?.provider}`);

      if (account?.provider === "google") {
        try {
          console.log("[signIn Google] Initial user object from provider:", JSON.stringify(user, null, 2));
          console.log(`[signIn Google] Initial user.id (from Google provider): ${user.id}, Type: ${typeof user.id}`);

          // Ensure findUserByEmail is awaited if it's an async function
          const existingUser = await findUserByEmail(user.email!) as User | undefined;

          if (!existingUser) {
            console.log(`[signIn Google] User with email ${user.email} not found. Creating new user.`);
            // Ensure createUser is awaited
            const newUser = await createUser(
              user.email!,
              "", // No password for Google auth
              user.name || undefined
              // Consider also passing profile.sub (Google's ID) to store in your 'googleId' column
              // e.g., await createUser(user.email!, "", user.name || undefined, profile?.sub)
            );
            
            console.log("[signIn Google] New user object returned by createUser:", JSON.stringify(newUser, null, 2));
            user.id = newUser.id; // This 'newUser.id' should be your UUID from the database
          } else {
            console.log("[signIn Google] Existing user object returned by findUserByEmail:", JSON.stringify(existingUser, null, 2));
            user.id = existingUser.id; // This 'existingUser.id' should be your UUID from the database
          }

          console.log(`[signIn Google] AFTER assignment, user.id is now: ${user.id} (Type: ${typeof user.id})`);

        } catch (error) {
          console.error("[signIn Google] Error during signIn process:", error);
          return false; 
        }
      } else if (account?.provider === "credentials") {
        console.log(`[signIn Credentials] User object from credentials:`, JSON.stringify(user, null, 2));
        console.log(`[signIn Credentials] user.id is: ${user.id} (Type: ${typeof user.id})`);
      }
      
      return true; 
    },
 
    async jwt({ token, user, account }) { // jwt callback correctly placed inside 'callbacks'
      if (account) {
        console.log(`[jwt callback] Called with account provider: ${account.provider}`);
      }
      if (user) { // The 'user' object is only passed on initial sign-in
        console.log(`[jwt callback] Received user object with user.id: ${user.id} (Type: ${typeof user.id})`);
        token.sub = user.id; // user.id here should be your database UUID from signIn or authorize
        token.name = user.name;
        token.profile_image_url = user.profile_image_url;
        console.log(`[jwt callback] token.sub is now set to: ${token.sub} (Type: ${typeof token.sub})`);
      }
      return token;
    },
 
    async session({ session, token }) { // session callback correctly placed inside 'callbacks'
      console.log(`[session callback] Received token with token.sub: ${token.sub} (Type: ${typeof token.sub})`);
      if (session.user && token.sub) { // Ensure token.sub exists
        session.user.id = token.sub as string; // This token.sub should be your database UUID
        session.user.name = token.name as string;
        (session.user as any).profile_image_url = token.profile_image_url as string;
        console.log(`[session callback] session.user.id is now set to: ${session.user.id} (Type: ${typeof session.user.id})`);
      }
      return session;
    },
  }, // This closes the main 'callbacks' object
  session: {
    strategy: "jwt"
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development", // Enable debug messages in development
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };