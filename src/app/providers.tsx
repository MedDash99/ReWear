// src/app/providers.tsx
"use client";

import { SessionProvider } from "next-auth/react";
import React from "react";
import { MessagingProvider } from "../contexts/MessagingContext";
import { Toaster } from "sonner";

interface ProvidersProps {
  children: React.ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <MessagingProvider>
        {children}
        <Toaster position="top-right" />
      </MessagingProvider>
    </SessionProvider>
  );
}
