"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from 'next/navigation';

export default function SuccessPage() {
  const router = useRouter();

  useEffect(() => {
    // You can add logic here to handle successful payment,
    // such as updating the database or displaying a confirmation message.
    console.log("Payment successful!");
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-background">
      <h1 className="text-4xl font-bold text-foreground mb-4">Payment Successful!</h1>
      <p className="text-lg text-muted-foreground mb-8">Thank you for your purchase.</p>
      <Button onClick={() => router.push('/')}>Back to Home</Button>
    </div>
  );
}
