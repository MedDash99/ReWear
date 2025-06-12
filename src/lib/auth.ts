import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { compare } from "bcryptjs";
import { findUserByEmail, createUser, updateUserGoogleId } from "@/lib/database";

interface User {
  id: string;
  email: string;
  name: string | null;
  password_hash?: string | null;
  googleId?: string | null;
  profile_image_url?: string | null;
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
      async authorize(credentials): Promise<any> {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials: Email and password required.");
        }
        if (credentials.password.trim().length === 0) {
          throw new Error("Password cannot be empty");
        }

        try {
          const user = await findUserByEmail(credentials.email) as User | undefined;

          if (!user || !user.password_hash) {
            throw new Error("Invalid credentials: User not found or no password set.");
          }

          const isCorrectPassword = await compare(
            credentials.password,
            user.password_hash
          );

          if (!isCorrectPassword) {
            throw new Error("Invalid credentials: Incorrect password.");
          }

          const userResult = {
            id: user.id,
            email: user.email,
            name: user.name,
            profile_image_url: user.profile_image_url
          };
          
          return userResult;
        } catch (error) {
          console.error("[AUTH] Authorization error:", error);
          throw error;
        }
      }
    })
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        try {
          const existingUser = await findUserByEmail(user.email!) as any;

          if (!existingUser) {
            // No existing user - create a new one with Google ID
            const newUser = await createUser(
              user.email!,
              "", // No password for Google auth
              user.name || undefined,
              account.providerAccountId // Google sub ID
            );
            user.id = newUser.id;
          } else {
            // Existing user found - link Google account if not already linked
            if (!existingUser.google_id) {
              // User exists but doesn't have Google ID - link the accounts
              await updateUserGoogleId(existingUser.id, account.providerAccountId);
              console.log(`[AUTH] Linked Google account to existing user: ${existingUser.email}`);
            }
            user.id = existingUser.id;
          }
        } catch (error) {
          console.error("[AUTH] Google sign-in error:", error);
          return false; 
        }
      }
      
      return true;
    },
 
    async jwt({ token, user, account }) {
      if (user) {
        token.sub = user.id;
        token.name = user.name;
        token.profile_image_url = user.profile_image_url;
      }
      return token;
    },
 
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub as string;
        session.user.name = token.name as string;
        (session.user as any).profile_image_url = token.profile_image_url as string;
      }
      return session;
    }
  },
  session: {
    strategy: "jwt"
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: false,
  logger: {
    error(code, metadata) {
      console.error("[NEXTAUTH ERROR]", code, metadata);
    },
    warn(code) {
      if (process.env.NODE_ENV === "development") {
        console.warn("[NEXTAUTH WARN]", code);
      }
    },
    debug(code, metadata) {
      
    }
  },
  events: {
    async signIn({ user, account, profile, isNewUser }) {
      if (process.env.NODE_ENV === "development") {
        console.log("[AUTH] User signed in:", { email: user?.email, provider: account?.provider });
      }
    }
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
}; 