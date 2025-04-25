"use client";

import {Button} from "@/components/ui/button";
import {signIn} from "next-auth/react";
import {Input} from "@/components/ui/input";
import {useState} from "react";

export default function SignInWithGoogle() {
  const [email, setEmail] = useState("");

  return (
    <div className="flex items-center justify-center h-screen bg-background">
      <div className="w-full max-w-md p-6 bg-card rounded-lg shadow-md">
        <div className="flex flex-col items-center">
          <svg
            className="w-12 h-12 mb-4 text-primary"
            viewBox="0 0 48 48"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M46 24c0-1.1-.9-2-2-2H26v-6c0-1.1-.9-2-2-2s-2 .9-2 2v6H4c-1.1 0-2 .9-2 2s.9 2 2 2h18v16c0 1.1.9 2 2 2s2-.9 2-2V24h18c1.1 0 2-.9 2-2z"
              fill="currentColor"
            />
          </svg>
          <h1 className="text-2xl font-semibold text-foreground mb-2">Sign in</h1>
          <p className="text-sm text-muted-foreground mb-6">Use your Google Account</p>
        </div>

        <Input
          type="email"
          placeholder="Email or phone"
          className="mb-2"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <a href="#" className="text-sm text-primary hover:underline block mb-4">
          Forgot email?
        </a>
        <p className="text-xs text-muted-foreground mb-4">
          Not your computer? Use Guest mode to sign in privately.{" "}
          <a href="#" className="text-primary hover:underline">
            Learn more
          </a>
        </p>

        <div className="flex items-center justify-between">
          <a href="#" className="text-sm text-primary hover:underline">
            Create account
          </a>
          <Button onClick={() => signIn("google")} className="bg-primary text-primary-foreground hover:bg-primary/90">
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
