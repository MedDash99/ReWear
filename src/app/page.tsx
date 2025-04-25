"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useRouter } from 'next/navigation';

const categories = ["Clothing", "Shoes", "Accessories", "Bags"];

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

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [items, setItems] = useState<Item[]>(initialItems);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const router = useRouter();

  const filteredItems = items.filter((item) => {
    const searchMatch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const categoryMatch = selectedCategory ? item.category === selectedCategory : true;
    return searchMatch && categoryMatch;
  });

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category);
  };

  const handleItemClick = (itemId: number) => {
    router.push(`/checkout/${itemId}`);
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex space-x-4">
          <Button onClick={() => router.push("/login")}>Sign in with Google</Button>
          <Button
            variant="outline"
            onClick={() => router.push("/login-buyer")}
          >
            Buyer Login
          </Button>
          <Button variant="outline" onClick={() => router.push("/login-seller")}>Seller Login</Button>
        </div>
        <h1 className="text-2xl font-bold">ReVinted</h1>
        <div className="flex items-center space-x-2">
          <Input
            type="text"
            placeholder="Search for items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Button>Search</Button>
        </div>
      </div>

      <div className="flex space-x-4 mb-4">
        {categories.map((category) => (
          <Button
            variant="outline"
            key={category}
            onClick={() => handleCategoryClick(category)}
            className={selectedCategory === category ? "bg-accent text-accent-foreground" : ""}
          >
            {category}
          </Button>
        ))}
        <Button
          variant="outline"
          onClick={() => setSelectedCategory(null)}
          className={
            selectedCategory === null ? "bg-accent text-accent-foreground" : ""
          }
        >
          All
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredItems.map((item) => (
          <Card key={item.id} onClick={() => handleItemClick(item.id)} className="cursor-pointer">
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
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
