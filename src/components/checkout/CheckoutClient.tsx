"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useRouter } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

type Item = {
  id: number;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
  users: {
    name: string;
    profile_image_url: string;
  };
};

interface CheckoutClientProps {
  initialItem: Item | null;
}

export default function CheckoutClient({ initialItem }: CheckoutClientProps) {
  const [item, setItem] = useState<Item | null>(initialItem);
  const [loading, setLoading] = useState(!initialItem);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
      console.error("Stripe publishable key is missing. Make sure to set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY in your .env file.");
    }
  }, []);

  const handleCheckout = async () => {
    if (!item) {
      console.error("Item not found");
      return;
    }

    const stripe = await stripePromise;

    if (!stripe) {
      console.error("Stripe failed to load");
      return;
    }

    try {
      const checkoutSession = await fetch('/api/create-stripe-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          item: {
            id: item.id,
            name: item.name,
            imageUrl: item.image_url,
            price: item.price,
          },
        }),
      });

      const response = await checkoutSession.json();

      if (response.sessionId) {
        const result = await stripe.redirectToCheckout({
          sessionId: response.sessionId,
        });

        if (result.error) {
          console.error(result.error.message);
          setError("Failed to redirect to checkout");
        }
      } else {
        console.error("Failed to create Stripe session", response);
        setError("Failed to create checkout session");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      setError("An unexpected error occurred");
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4 flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold text-red-600 mb-2">Error</h2>
            <p className="text-gray-600">{error || "Item not found"}</p>
            <Button 
              onClick={() => router.back()} 
              className="mt-4"
              variant="outline"
            >
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>{item.name}</CardTitle>
          <CardDescription>{item.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <img
            src={item.image_url}
            alt={item.name}
            className="rounded-md mb-2 w-full h-48 object-cover"
          />
          <div className="flex items-center justify-between">
            <span>Price: ${item.price}</span>
            <Badge>{item.category}</Badge>
          </div>
          <div className="flex items-center mt-2">
            <Avatar>
              <AvatarImage src={item.users.profile_image_url} alt={item.users.name} />
              <AvatarFallback>{item.users.name.substring(0, 2)}</AvatarFallback>
            </Avatar>
            <span className="ml-2">{item.users.name}</span>
          </div>
          <Button 
            onClick={handleCheckout}
            className="w-full mt-4 bg-teal-600 hover:bg-teal-700 text-white transition-colors duration-200"
          >
            Proceed to Checkout
          </Button>
        </CardContent>
      </Card>
    </div>
  );
} 