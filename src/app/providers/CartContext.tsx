import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { CartResponse } from '@/entities/cart/model';
import { cartApi } from '@/entities/cart/api';
import { useAuth } from './AuthContext';

interface CartContextValue {
  cart: CartResponse;
  totalItems: number;
  isLoading: boolean;
  refreshCart: () => Promise<void>;
  addToCart: (adId: number, quantity?: number) => Promise<{ success: boolean; error?: string }>;
  updateQuantity: (adId: number, quantity: number) => Promise<{ success: boolean; error?: string }>;
  removeItem: (adId: number) => Promise<{ success: boolean; error?: string }>;
  clearCart: () => Promise<{ success: boolean; error?: string }>;
  isInCart: (adId: number) => boolean;
}

const EMPTY_CART: CartResponse = {
  items: [],
  total_items: 0,
  total_price: 0,
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState<CartResponse>(EMPTY_CART);
  const [isLoading, setIsLoading] = useState(false);

  const refreshCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCart(EMPTY_CART);
      return;
    }
    setIsLoading(true);
    const res = await cartApi.getCart();
    if (res.success && res.data) {
      setCart(res.data);
    }
    setIsLoading(false);
  }, [isAuthenticated]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const addToCart = useCallback(async (adId: number, quantity = 1) => {
    const res = await cartApi.addItem(adId, quantity);
    if (res.success && res.data) {
      setCart(res.data);
      return { success: true };
    }
    return { success: false, error: res.error };
  }, []);

  const updateQuantity = useCallback(async (adId: number, quantity: number) => {
    const res = await cartApi.updateQuantity(adId, quantity);
    if (res.success && res.data) {
      setCart(res.data);
      return { success: true };
    }
    return { success: false, error: res.error };
  }, []);

  const removeItem = useCallback(async (adId: number) => {
    const res = await cartApi.removeItem(adId);
    if (res.success && res.data) {
      setCart(res.data);
      return { success: true };
    }
    return { success: false, error: res.error };
  }, []);

  const clearCart = useCallback(async () => {
    const res = await cartApi.clearCart();
    if (res.success) {
      setCart(EMPTY_CART);
      return { success: true };
    }
    return { success: false, error: res.error };
  }, []);

  const isInCart = useCallback(
    (adId: number) => cart.items.some((item) => item.ad_id === adId),
    [cart.items]
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        totalItems: cart.total_items,
        isLoading,
        refreshCart,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
        isInCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error('useCart must be used within CartProvider');
  }
  return ctx;
}
