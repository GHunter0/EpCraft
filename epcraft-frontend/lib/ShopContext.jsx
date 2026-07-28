"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

const ShopContext = createContext();

export function ShopProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("epcraft_cart");
      const savedWishlist = localStorage.getItem("epcraft_wishlist");
      if (savedCart) setCart(JSON.parse(savedCart));
      if (savedWishlist) setWishlist(JSON.parse(savedWishlist));
    } catch (e) {
      console.error("Failed to load cart/wishlist from localStorage:", e);
    }
    setIsLoaded(true);
  }, []);

  // Sync to localStorage
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem("epcraft_cart", JSON.stringify(cart));
    } catch (e) {
      console.error("Failed to save cart:", e);
    }
  }, [cart, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem("epcraft_wishlist", JSON.stringify(wishlist));
    } catch (e) {
      console.error("Failed to save wishlist:", e);
    }
  }, [wishlist, isLoaded]);

  const addToCart = (product, quantity = 1, customOptions = null) => {
    setCart((prevCart) => {
      const cartItemId = customOptions
        ? `${product.id}-${Date.now()}`
        : `${product.id}`;

      const existingIndex = prevCart.findIndex(
        (item) => !customOptions && item.cartItemId === cartItemId
      );

      if (existingIndex > -1) {
        const updated = [...prevCart];
        updated[existingIndex].quantity += quantity;
        return updated;
      } else {
        return [
          ...prevCart,
          {
            cartItemId,
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image || "",
            category: product.category,
            woodType: product.woodType,
            quantity,
            customOptions,
          },
        ];
      }
    });
  };

  const removeFromCart = (cartItemId) => {
    setCart((prev) => prev.filter((item) => item.cartItemId !== cartItemId));
  };

  const updateQuantity = (cartItemId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.cartItemId === cartItemId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const toggleWishlist = (productId) => {
    setWishlist((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const isInWishlist = (productId) => wishlist.includes(productId);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <ShopContext.Provider
      value={{
        cart,
        wishlist,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        toggleWishlist,
        isInWishlist,
        cartCount,
        cartSubtotal,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
}

export function useShop() {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error("useShop must be used within a ShopProvider");
  }
  return context;
}
