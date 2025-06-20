import { DefaultSession, NextAuthOptions } from "next-auth";
import { createClient } from "@supabase/supabase-js";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import jwt from "jsonwebtoken";

// Create a Supabase admin client for secure database queries
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

// We are extending the default NextAuth types to include properties
// we need in our application
declare module "next-auth" {
  interface Session {
    supabaseAccessToken?: string;
    user: {
      id: string;
    } & DefaultSession["user"];
  }
  
  // The User object comes from the database
  interface User {
    image?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    supabaseAccessToken?: string;
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

        // Use Supabase's native auth system for password verification
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        const { data, error } = await supabase.auth.signInWithPassword({
          email: credentials.email,
          password: credentials.password,
        });

        if (error) {
          console.error("[AUTH] Supabase login error:", error.message);
          return null;
        }

        // If login is successful, return the user object with profile data
        const { data: profileData } = await supabase
          .from('users')
          .select('name, profile_image_url')
          .eq('id', data.user.id)
          .single();

        return {
          id: data.user.id,
          email: data.user.email,
          name: profileData?.name,
          image: profileData?.profile_image_url
        };
      }
    })
  ],

  callbacks: {
    async jwt({ token, user, account }) {
      // If the 'account' object exists, it's a sign-in event.
      if (account && user) {
        // Look for the user in your public 'users' table using their email.
        const { data: supabaseUser, error } = await supabaseAdmin
          .from('users') // IMPORTANT: Change 'users' to your profile table name if it's different.
          .select('id') // Select the 'id' column, which should be the UUID.
          .eq('email', user.email)
          .single();

        if (error) {
            console.error("Error fetching Supabase user:", error);
        }

        // If a user is found in your table, overwrite the token's subject ('sub')
        // with the correct Supabase User UUID.
        if (supabaseUser) {
          token.sub = supabaseUser.id;
        }
      }

      // Now, create the custom Supabase JWT. The 'sub' field will now
      // correctly contain the Supabase User UUID.
      const payload = {
        aud: 'authenticated',
        exp: Math.floor((token.exp as number) * 1000) / 1000,
        sub: token.sub || '',
        email: token.email,
        role: 'authenticated',
      };

      token.supabaseAccessToken = jwt.sign(
        payload,
        process.env.SUPABASE_JWT_SECRET || ''
      );

      return token;
    },

    async session({ session, token }) {
      // Pass the custom access token and the correct user ID (the UUID)
      // to the client-side session object.
      session.supabaseAccessToken = token.supabaseAccessToken;
      
      if (token.sub) {
        session.user.id = token.sub;
        try {
          const { data: userData } = await supabaseAdmin
            .from('users')
            .select('name, profile_image_url')
            .eq('id', token.sub)
            .single();
          
          if (userData) {
            session.user.name = userData.name;
            // Map the database profile_image_url to session.user.image
            session.user.image = userData.profile_image_url;
          }
        } catch (error) {
          console.error('Error fetching user data for session:', error);
        }
      }
      
      return session;
    },
  },

  session: {
    strategy: "jwt",
  },

  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
};
