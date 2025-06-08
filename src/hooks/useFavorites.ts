import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';

interface UseFavoritesReturn {
  favoriteIds: number[];
  isFavorite: (itemId: number) => boolean;
  toggleFavorite: (itemId: number) => Promise<void>;
  loading: boolean;
  error: string | null;
}

export const useFavorites = (): UseFavoritesReturn => {
  const { data: session, status } = useSession();
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch user's favorites on mount and when authentication changes
  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      fetchFavorites();
    } else if (status === 'unauthenticated') {
      setFavoriteIds([]);
    }
  }, [status, session]);

  const fetchFavorites = async () => {
    if (!session?.user) return;

    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/favorites');
      if (response.ok) {
        const data = await response.json();
        console.log('useFavorites - fetchFavorites response:', data);
        setFavoriteIds(data.favoriteIds || []);
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

  const isFavorite = useCallback((itemId: number): boolean => {
    return favoriteIds.includes(itemId);
  }, [favoriteIds]);

  const toggleFavorite = async (itemId: number): Promise<void> => {
    if (!session?.user) {
      throw new Error('Authentication required');
    }

    const isCurrentlyFavorited = isFavorite(itemId);
    console.log('useFavorites - toggleFavorite:', { itemId, isCurrentlyFavorited, currentFavorites: favoriteIds });
    
    // Optimistic UI update
    setFavoriteIds(prev => {
      const newIds = isCurrentlyFavorited 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId];
      console.log('useFavorites - optimistic update:', { prev, newIds });
      return newIds;
    });

    try {
      const response = await fetch('/api/favorites', {
        method: isCurrentlyFavorited ? 'DELETE' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ itemId }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to ${isCurrentlyFavorited ? 'remove from' : 'add to'} favorites`);
      }

      // Note: We don't need to refetch immediately as the optimistic update
      // is already applied. The server-side state should match our optimistic state.
      
    } catch (err) {
      // Revert optimistic update on error
      setFavoriteIds(prev => 
        isCurrentlyFavorited 
          ? [...prev, itemId]
          : prev.filter(id => id !== itemId)
      );
      
      console.error('Error toggling favorite:', err);
      setError(err instanceof Error ? err.message : 'Failed to update favorites');
      throw err; // Re-throw to allow components to handle the error
    }
  };

  return {
    favoriteIds,
    isFavorite,
    toggleFavorite,
    loading,
    error,
  };
}; 