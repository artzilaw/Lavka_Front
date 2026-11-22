import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Ad } from '@/entities/ad/model';
import { adApi } from '@/entities/ad/api';
import { useAuth } from './AuthContext';

interface FavoritesContextValue {
  favorites: Ad[];
  favoritesCount: number;
  isLoading: boolean;
  isFavorite: (adId: number) => boolean;
  toggleFavorite: (adId: number) => Promise<boolean>;
  refreshFavorites: () => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextValue | undefined>(undefined);

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [favorites, setFavorites] = useState<Ad[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(false);

  const refreshFavorites = useCallback(async () => {
    if (!isAuthenticated) {
      setFavorites([]);
      setFavoriteIds(new Set());
      return;
    }
    setIsLoading(true);
    const res = await adApi.getFavorites();
    if (res.success && Array.isArray(res.data)) {
      setFavorites(res.data);
      setFavoriteIds(new Set(res.data.map((a) => a.id)));
    }
    setIsLoading(false);
  }, [isAuthenticated]);

  useEffect(() => {
    refreshFavorites();
  }, [refreshFavorites]);

  const isFavorite = useCallback((adId: number) => favoriteIds.has(adId), [favoriteIds]);

  const toggleFavorite = useCallback(
    async (adId: number) => {
      if (!isAuthenticated) return false;
      const currentlyFav = favoriteIds.has(adId);

      // Optimistic update
      setFavoriteIds((prev) => {
        const next = new Set(prev);
        if (currentlyFav) next.delete(adId);
        else next.add(adId);
        return next;
      });

      const res = currentlyFav
        ? await adApi.removeFavorite(adId)
        : await adApi.addFavorite(adId);

      if (res.success) {
        await refreshFavorites();
        return true;
      }

      // Rollback on failure
      setFavoriteIds((prev) => {
        const next = new Set(prev);
        if (currentlyFav) next.add(adId);
        else next.delete(adId);
        return next;
      });
      return false;
    },
    [isAuthenticated, favoriteIds, refreshFavorites]
  );

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        favoritesCount: favoriteIds.size,
        isLoading,
        isFavorite,
        toggleFavorite,
        refreshFavorites,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};

export function useFavorites(): FavoritesContextValue {
  const ctx = useContext(FavoritesContext);
  if (!ctx) {
    throw new Error('useFavorites must be used within FavoritesProvider');
  }
  return ctx;
}
