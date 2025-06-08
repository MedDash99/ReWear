// src/components/ui/ContentCard.tsx
"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { Heart, ImageIcon } from 'lucide-react';
import { useFavorites } from '@/hooks/useFavorites';

// Define the type for the item prop
type Item = {
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
    // rating?: number;
    // reviewCount?: number;
  };
};

interface ContentCardProps {
  item: Item;
  isAuthenticated?: boolean;
  onLoginRequired?: () => void;
}

const ContentCard: React.FC<ContentCardProps> = ({ item, isAuthenticated, onLoginRequired }) => {
  const router = useRouter();
  const [imageError, setImageError] = React.useState(false);
  const { isFavorite, toggleFavorite } = useFavorites();

  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const isFavoriteButton = target.closest('[aria-label="Favorite"]') || 
                            target.closest('button[data-favorite="true"]') ||
                            target.tagName === 'svg' ||
                            target.closest('svg');
    
    if (isFavoriteButton) {
      return;
    }
    
    // Check authentication status
    if (!isAuthenticated) {
      // Show login modal for unauthenticated users
      onLoginRequired?.();
      return;
    }
    
    // Redirect authenticated users to product page
    router.push(`/products/${item.id}`);
  };

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    if (!isAuthenticated) {
      onLoginRequired?.();
      return;
    }

    try {
      await toggleFavorite(item.id);
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
      // The error will be logged and the optimistic update will be reverted
      // The useFavorites hook handles the error state
    }
  };

  const getInitials = (name: string | null | undefined): string => {
    if (!name) return '';
    const parts = name.trim().split(' ');
    return parts.length > 1
      ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
      : name.substring(0, 1).toUpperCase();
  };

  const handleImageError = () => setImageError(true);

  return (
    <div 
      className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1 cursor-pointer overflow-hidden flex flex-col w-full max-w-[280px] sm:max-w-[320px] lg:max-w-[280px] xl:max-w-[300px] mx-auto"
      onClick={handleCardClick}
    >
      {/* Image Container */}
      <div className="relative w-full aspect-square overflow-hidden bg-gray-200">
        {!imageError ? (
          <img
            src={item.imageUrl}
            alt={item.name}
            className="w-full h-full object-cover"
            onError={handleImageError}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <ImageIcon className="w-16 h-16" />
          </div>
        )}

        {/* Favorite Button Overlay */}
        <button
          onClick={handleFavoriteClick}
          data-favorite="true"
          aria-label={isFavorite(item.id) ? "Remove from favorites" : "Add to favorites"}
          title={isFavorite(item.id) ? "Remove from favorites" : "Add to favorites"}
          className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white/95 transition-colors shadow-sm group"
        >
          <Heart 
            className={`w-5 h-5 transition-colors ${
              isFavorite(item.id) 
                ? 'text-red-500 fill-red-500' 
                : 'text-gray-600 group-hover:text-red-500'
            }`} 
          />
        </button>

        {/* Price Badge Overlay */}
        <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-sm">
          <span className="text-base font-bold text-gray-900">
            ${item.price.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex-grow flex flex-col">
        <h3 className="font-medium text-gray-900 text-base leading-tight mb-3 line-clamp-2 min-h-[2.5rem]">
          {item.name}
        </h3>

        {/* Seller Info */}
        <div className="flex items-center mt-auto">
          <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center mr-3 flex-shrink-0">
            {item.seller.avatarUrl ? (
              <img
                src={item.seller.avatarUrl}
                alt={item.seller.name || ''}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <span className="text-sm font-medium text-gray-600">
                {getInitials(item.seller.name)}
              </span>
            )}
          </div>

          <div className="flex-grow min-w-0 mr-2">
            <span className="text-sm text-gray-500 block truncate">
              {item.seller.name || 'Unknown Seller'}
            </span>
          </div>

          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full flex-shrink-0">
            {item.category}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ContentCard;
