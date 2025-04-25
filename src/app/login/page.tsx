"use client";

import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react";

export default function SignInWithGoogle() {
  return (
    <div>
      <Button onClick={() => signIn("google")}>Sign in with Google</Button>
    </div>
  );
}
