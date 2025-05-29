// src/app/store/page.tsx
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useRouter } from 'next/navigation'; // Keep useRouter if needed for item clicks etc.

// --- Keep your types and initial data ---
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
// --- End of types and initial data ---


export default function StorePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [items, setItems] = useState<Item[]>(initialItems); // In real app, fetch data here
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const router = useRouter();

  // --- Keep your filtering logic ---
  const filteredItems = items.filter((item) => {
    const searchMatch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const categoryMatch = selectedCategory ? item.category === selectedCategory : true;
    return searchMatch && categoryMatch;
  });

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category === selectedCategory ? null : category);
  };

  const handleItemClick = (itemId: number) => {
    // You might want to navigate to a specific item details page instead of checkout
    // e.g., router.push(`/item/${itemId}`);
    router.push(`/checkout/${itemId}`); // Keep as is for now
  };
  // --- End of filtering logic ---


  // --- Fetch data effect (Example - replace initialItems) ---
  // useEffect(() => {
  //   // Fetch items from your API when the component mounts
  //   const fetchItems = async () => {
  //     // const response = await fetch('/api/items'); // Your API endpoint
  //     // const data = await response.json();
  //     // setItems(data);
  //     setItems(initialItems); // Using static data for now
  //   };
  //   fetchItems();
  // }, []);
  // --- End of fetch data effect ---


  return (
    <div className="container mx-auto p-4">
      {/* Header Section: Title and Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
        <h1 className="text-3xl font-bold text-gray-800">Discover Items</h1>
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <Input
            type="text"
            placeholder="Search for items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-grow sm:flex-grow-0 sm:w-64"
          />
          {/* Consider removing the explicit search button if search updates live */}
          {/* <Button>Search</Button> */}
        </div>
      </div>

      {/* Category Filters */}
      <div className="flex flex-wrap gap-2 mb-6 justify-center">
         <Button
          variant={selectedCategory === null ? "default" : "outline"} // Highlight 'All' when active
          onClick={() => setSelectedCategory(null)}
        >
          All
        </Button>
        {categories.map((category) => (
          <Button
            variant={selectedCategory === category ? "default" : "outline"} // Highlight selected category
            key={category}
            onClick={() => handleCategoryClick(category)}
          >
            {category}
          </Button>
        ))}
      </div>

      {/* Items Grid */}
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredItems.map((item) => (
            <Card
              key={item.id}
              onClick={() => handleItemClick(item.id)}
              className="cursor-pointer overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-200 ease-in-out flex flex-col"
            >
              {/* Image container */}
              <div className="relative w-full h-56"> {/* Fixed height for image */}
                 <img
                    src={item.imageUrl}
                    alt={item.name}
                    // Use layout="fill" and objectFit="cover" with Next Image for better performance
                    className="absolute inset-0 w-full h-full object-cover" // Make image cover the container
                 />
              </div>
              {/* Content container */}
              <div className="p-4 flex flex-col flex-grow"> {/* Use flex-grow to push footer down */}
                <CardHeader className="p-0 mb-2">
                  <CardTitle className="text-lg font-semibold">{item.name}</CardTitle>
                  {/* Optional: Limit description length */}
                  {/* <CardDescription className="text-sm text-gray-600 truncate">{item.description}</CardDescription> */}
                </CardHeader>
                <CardContent className="p-0 flex-grow"> {/* Use flex-grow */}
                   <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                   <div className="flex items-center justify-between mb-3">
                     <span className="text-lg font-bold text-blue-600">${item.price}</span>
                     <Badge variant="secondary">{item.category}</Badge>
                   </div>
                </CardContent>
                 {/* Footer section within the card */}
                 <div className="flex items-center mt-auto pt-3 border-t border-gray-100"> {/* mt-auto pushes this down */}
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={item.seller.avatarUrl} alt={item.seller.name} />
                      <AvatarFallback>{item.seller.name.substring(0, 1)}</AvatarFallback>
                    </Avatar>
                    <span className="ml-2 text-sm text-gray-700">{item.seller.name}</span>
                 </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
         <div className="text-center py-10 text-gray-500">
            <p>No items found matching your criteria.</p>
         </div>
      )}
    </div>
  );
}
