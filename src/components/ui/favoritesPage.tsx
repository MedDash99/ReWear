"use client";

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Heart, Loader2 } from 'lucide-react';
import ContentCard from './contentCard';
import MinimalHeader from './minimalHeader';

// Define the type for favorited items
type FavoriteItem = {
  id: number;
  name: string;
  description?: string;
  price: number;
  imageUrl: string;
  category: string;
  sellerId: number | string;
  seller: {
    name: string | null;
    avatarUrl: string | null;
  };
  favorited_at: string;
};

interface FavoritesPageProps {
  onLoginRequired?: () => void;
}

const FavoritesPage: React.FC<FavoritesPageProps> = ({ onLoginRequired }) => {
  const { data: session, status } = useSession();
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isAuthenticated = !!session?.user;

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      fetchFavorites();
    } else if (status === 'unauthenticated') {
      setLoading(false);
    }
  }, [status, session]);

  const fetchFavorites = async () => {
    if (!session?.user) return;

    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/favorites?returnItems=true');
      if (response.ok) {
        const data = await response.json();
        setFavorites(data.favorites || []);
      } else {
        throw new Error('Failed to fetch favorites');
      }
    } catch (err) {
      console.error('Error fetching favorites:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch favorites');
    } finally {
      setLoading(false);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F6F6F6]">
        <MinimalHeader />
        <div className="py-10 px-2 sm:px-6">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">My Favorites</h1>
            <div className="flex justify-center items-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
              <span className="ml-2 text-gray-600">Loading your favorites...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show authentication required message
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#F6F6F6]">
        <MinimalHeader />
        <div className="py-10 px-2 sm:px-6">
          <div className="max-w-md mx-auto">
            <div className="bg-white rounded-2xl shadow-md p-6 text-center">
              <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Sign In Required</h2>
              <p className="text-gray-600 mb-6">
                You need to be logged in to view your favorites.
              </p>
              <button
                onClick={onLoginRequired}
                className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors min-h-[44px]"
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-[#F6F6F6]">
        <MinimalHeader />
        <div className="py-10 px-2 sm:px-6">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">My Favorites</h1>
            <div className="bg-white rounded-2xl shadow-md p-8 text-center">
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={fetchFavorites}
                className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors min-h-[44px]"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show empty state
  if (favorites.length === 0) {
    return (
      <div className="min-h-screen bg-[#F6F6F6]">
        <MinimalHeader />
        <div className="py-10 px-2 sm:px-6">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">My Favorites</h1>
            <div className="bg-white rounded-2xl shadow-md p-12 text-center">
              <Heart className="w-20 h-20 text-gray-300 mx-auto mb-6" />
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">No favorites yet</h2>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Start browsing items and click the heart icon to add them to your favorites. 
                They'll appear here for easy access later.
              </p>
              <button
                onClick={() => window.location.href = '/'}
                className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors min-h-[44px]"
              >
                Browse Items
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show favorites grid
  return (
    <div className="min-h-screen bg-[#F6F6F6]">
      <MinimalHeader />
      <div className="py-10 px-2 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center mb-8">
            <Heart className="w-8 h-8 text-red-500 fill-red-500 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">
              My Favorites ({favorites.length})
            </h1>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {favorites.map((item) => (
              <ContentCard
                key={item.id}
                item={item}
                isAuthenticated={isAuthenticated}
                onLoginRequired={onLoginRequired}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FavoritesPage; 