"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from 'next/navigation';

export default function CancelPage() {
  const router = useRouter();

  useEffect(() => {
    // You can add logic here to handle payment cancellation,
    // such as displaying an error message.
    console.log("Payment cancelled.");
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-background">
      <h1 className="text-4xl font-bold text-foreground mb-4">Payment Cancelled</h1>
      <p className="text-lg text-muted-foreground mb-8">Your payment has been cancelled.</p>
      <Button onClick={() => router.push('/')}>Back to Home</Button>
    </div>
  );
}
