// src/app/page.tsx
"use client";
import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
// Card related imports are no longer needed directly here if ContentCard handles all card UI
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
// import { Badge } from "@/components/ui/badge";
import Header from '../components/ui/fullHeader';       // Your Header component
import LoginCard from '../components/ui/loginCard';
import ContentCard from '../components/ui/contentCard'; // <<< IMPORT THE NEW ContentCard COMPONENT

// This Item type definition should be consistent with the one in ContentCard.tsx
// and what your /api/products endpoint returns.
// Consider moving this to a shared types file (e.g., src/types/index.ts)
type Item = {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  sellerId: number | string;
  seller: {
    name: string | null;
    avatarUrl: string | null;
  };
};

const categories = ["Clothing", "Shoes", "Accessories", "Bags"];

export default function StoreLandingPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [items, setItems] = useState<Item[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // useRouter is now used within ContentCard for navigation
  // const router = useRouter();

  const filteredItems = items.filter((item) => {
    const searchMatch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const categoryMatch = selectedCategory ? item.category === selectedCategory : true;
    return searchMatch && categoryMatch;
  });

  const fetchItems = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      console.log('Fetching items from API...');
      const response = await fetch('/api/products');
      if (!response.ok) {
        let errorData;
        try { errorData = await response.json(); } catch { errorData = { message: response.statusText}}
        throw new Error(errorData.message || 'Failed to fetch products');
      }
      const data: Item[] = await response.json();
      console.log('Received items from API:', data);
      setItems(data);
    } catch (err) {
      console.error('Error fetching items:', err);
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category === selectedCategory ? null : category);
  };

  // handleItemCardClick is now handled within ContentCard.tsx

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header
        onSignInClick={() => setIsLoginOpen(true)}
        onSignUpClick={() => setIsLoginOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
     <main className="w-full max-w-screen-xl mx-auto p-2 flex-grow">
        {/* Category Filters */}
        <div className="flex flex-wrap gap-2 mb-6 justify-center">
          <Button
            variant={selectedCategory === null ? "default" : "outline"}
            onClick={() => setSelectedCategory(null)}
          >
            All
          </Button>
          {categories.map((category) => (
            <Button
              variant={selectedCategory === category ? "default" : "outline"}
              key={category}
              onClick={() => handleCategoryClick(category)}
            >
              {category}
            </Button>
          ))}
        </div>

        {isLoading && <div className="text-center py-10"><p>Loading items...</p></div>}
        {error && <div className="text-center py-10 text-red-500"><p>Error: {error}</p></div>}

        {/* Items Grid - Now uses ContentCard */}
        {!isLoading && !error && filteredItems.length > 0 ? (
   <div className="
   grid
   grid-cols-[repeat(auto-fill,minmax(240px,1fr))]
   gap-2
 ">
 {filteredItems.map(item => (
   <ContentCard key={item.id} item={item} />
 ))}
</div>

        ) : (
          !isLoading && !error && <div className="text-center py-10 text-gray-500">
            <p>No items found matching your criteria.</p>
          </div>
        )}
      </main>

      {isLoginOpen && <LoginCard onClose={() => setIsLoginOpen(false)} />}
    </div>
  );
}
