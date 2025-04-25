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
  imageUrl: string;
  category: string;
  seller: {
    name: string;
    avatarUrl: string;
  };
};

const initialItems: Item[] = [
  {
    id: 1,
    name: "Vintage Dress",
    description: "Beautiful vintage dress, perfect for summer.",
    price: 45,
    imageUrl: "https://picsum.photos/200/300",
    category: "Clothing",
    seller: {
      name: "Jane Doe",
      avatarUrl: "https://picsum.photos/50/50",
    },
  },
  {
    id: 2,
    name: "Leather Boots",
    description: "High-quality leather boots, worn only a few times.",
    price: 80,
    imageUrl: "https://picsum.photos/200/301",
    category: "Shoes",
    seller: {
      name: "John Smith",
      avatarUrl: "https://picsum.photos/51/51",
    },
    },
    {
      id: 3,
      name: "Gold Bracelet",
      description: "Authentic gold bracelet, like new",
      price: 300,
      imageUrl: "https://picsum.photos/200/303",
      category: "Accessories",
      seller: {
        name: "Bob Miller",
        avatarUrl: "https://picsum.photos/53/53",
      },
    },
  {
    id: 4,
    name: "Designer Handbag",
    description: "Authentic designer handbag in excellent condition.",
    price: 120,
    imageUrl: "https://picsum.photos/200/302",
    category: "Bags",
    seller: {
      name: "Alice Johnson",
      avatarUrl: "https://picsum.photos/52/52",
    },
  },
];

interface Props {
  params: {
    itemId: string;
  };
}

export default function CheckoutPage({ params }: Props) {
  const { itemId } = params;
  const item = initialItems.find((item) => item.id === parseInt(itemId));
  const router = useRouter();

  useEffect(() => {
      // Check if Stripe publishable key is available
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

    const checkoutSession = await fetch('/api/create-stripe-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        item: {
          id: item.id,
          name: item.name,
          imageUrl: item.imageUrl,
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
      }
    } else {
      console.error("Failed to create Stripe session", response);
    }
  };


  if (!item) {
    return <div>Item not found</div>;
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
            src={item.imageUrl}
            alt={item.name}
            className="rounded-md mb-2 w-full h-48 object-cover"
          />
          <div className="flex items-center justify-between">
            <span>Price: ${item.price}</span>
            <Badge>{item.category}</Badge>
          </div>
          <div className="flex items-center mt-2">
            <Avatar>
              <AvatarImage src={item.seller.avatarUrl} alt={item.seller.name} />
              <AvatarFallback>{item.seller.name.substring(0, 2)}</AvatarFallback>
            </Avatar>
            <span className="ml-2">{item.seller.name}</span>
          </div>
          <Button onClick={handleCheckout}>Proceed to Checkout</Button>
        </CardContent>
      </Card>
    </div>
  );
}
