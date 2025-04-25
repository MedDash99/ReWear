"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const categories = ["Clothing", "Shoes", "Accessories", "Bags"];

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [items, setItems] = useState([
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
  ]);

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center justify-between mb-4">
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
          <Button variant="outline" key={category}>{category}</Button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredItems.map((item) => (
          <Card key={item.id}>
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
