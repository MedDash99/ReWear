"use client";

import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export default function SignInWithGoogle() {
  const [email, setEmail] = useState("");

  return (
    <div className="flex items-center justify-center h-screen bg-background">
      <div className="w-full max-w-md p-6 bg-card rounded-lg shadow-md">
        <div className="flex flex-col items-center">

          <div id="container">
            <div id="logo">
              <div className="g-line"></div>
              <span className="red"></span>
              <span className="yellow"></span>
              <span className="green"></span>
              <span className="blue"></span>
            </div>
          </div>

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
          <button className="gsi-material-button" onClick={() => signIn("google")}>
            <div className="gsi-material-button-state"></div>
            <div className="gsi-material-button-content-wrapper">
              <div className="gsi-material-button-icon">
                <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" xmlnsXlink="http://www.w3.org/1999/xlink" style={{ display: 'block' }}>
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                  <path fill="none" d="M0 0h48v48H0z"></path>
                </svg>
              </div>
              <span className="gsi-material-button-contents">Sign in with Google</span>
              <span style={{ display: 'none' }}>Sign in with Google</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
