"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";

const ShopContext = createContext();

export function ShopProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [user, setUser] = useState(null);
  const [toast, setToast] = useState(null); // { message, type }
  const [stockLevels, setStockLevels] = useState({}); // { [productId]: { stock, allowBackorder } }

  const supabase = createClient();

  // Fetch real-time stock levels for all products in the cart
  const refreshStockLevels = async (items = cart) => {
    if (!items || items.length === 0) return;
    const productIds = items.map((item) => item.id);
    try {
      const { data, error } = await supabase
        .from("products")
        .select("id, stock, allow_backorder")
        .in("id", productIds);
      if (!error && data) {
        const levels = {};
        data.forEach((p) => {
          levels[p.id] = { stock: p.stock, allowBackorder: p.allow_backorder };
        });
        setStockLevels((prev) => ({ ...prev, ...levels }));
      }
    } catch (err) {
      console.error("Failed to fetch stock levels:", err);
    }
  };

  useEffect(() => {
    Promise.resolve().then(() => {
      refreshStockLevels();
    });
  }, [cart.map(item => item.id).join(",")]);
  
  // Keep refs for rolling back state in case of server failures
  const previousCartRef = useRef([]);
  const previousWishlistRef = useRef([]);

  const showToast = (message, type = "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };


  // 2. Load Cart & Wishlist (Handles both guests and authenticated users)
  const loadShopData = async (currentUser) => {
    if (currentUser) {
      try {
        // Load Wishlist from Supabase
        const { data: dbWishlist, error: wishlistErr } = await supabase
          .from("wishlist_items")
          .select("product_id")
          .eq("user_id", currentUser.id);

        if (wishlistErr) throw wishlistErr;
        setWishlist((dbWishlist || []).map((w) => w.product_id));

        // Load Cart from Supabase (with product details join)
        const { data: dbCart, error: cartErr } = await supabase
          .from("cart_items")
          .select(`
            id,
            product_id,
            quantity,
            custom_options,
            product:products (
              name,
              price,
              image_url,
              category_id,
              wood_type
            )
          `)
          .eq("user_id", currentUser.id);

        if (cartErr) throw cartErr;

        const mappedCart = (dbCart || []).map((item) => ({
          cartItemId: item.id, // DB id serves as cartItemId
          id: item.product_id,
          name: item.product?.name || "Bespoke Woodcraft",
          price: Number(item.product?.price || 0),
          image: item.product?.image_url || "",
          category: item.product?.category_id || "",
          woodType: item.product?.wood_type || "",
          quantity: item.quantity,
          customOptions: item.custom_options,
        }));
        setCart(mappedCart);
      } catch (err) {
        console.error("Failed to load shop data from Supabase:", err);
        showToast("Could not load your saved cart/wishlist.");
      }
    } else {
      // Guest: Load from localStorage
      try {
        const savedCart = localStorage.getItem("epcraft_cart");
        const savedWishlist = localStorage.getItem("epcraft_wishlist");
        if (savedCart) setCart(JSON.parse(savedCart));
        if (savedWishlist) setWishlist(JSON.parse(savedWishlist));
      } catch (e) {
        console.error("Failed to load cart/wishlist from localStorage:", e);
      }
    }
    setIsLoaded(true);
  };

  // 3. Sync guest cart/wishlist to localStorage (Guest-only)
  useEffect(() => {
    if (!isLoaded || user) return;
    try {
      localStorage.setItem("epcraft_cart", JSON.stringify(cart));
    } catch (e) {
      console.error("Failed to save cart:", e);
    }
  }, [cart, isLoaded, user]);

  useEffect(() => {
    if (!isLoaded || user) return;
    try {
      localStorage.setItem("epcraft_wishlist", JSON.stringify(wishlist));
    } catch (e) {
      console.error("Failed to save wishlist:", e);
    }
  }, [wishlist, isLoaded, user]);

  // 4. Merge Guest localStorage Cart/Wishlist into Supabase on Login
  const handleMergeOnLogin = async (currentUser) => {
    try {
      const savedCartJson = localStorage.getItem("epcraft_cart");
      const savedWishlistJson = localStorage.getItem("epcraft_wishlist");
      
      const guestCart = savedCartJson ? JSON.parse(savedCartJson) : [];
      const guestWishlist = savedWishlistJson ? JSON.parse(savedWishlistJson) : [];

      // A. Merge Wishlist
      if (guestWishlist.length > 0) {
        const { data: currentDbWishlist } = await supabase
          .from("wishlist_items")
          .select("product_id")
          .eq("user_id", currentUser.id);

        const existingProductIds = new Set((currentDbWishlist || []).map((w) => w.product_id));
        const itemsToInsert = guestWishlist
          .filter((prodId) => !existingProductIds.has(prodId))
          .map((prodId) => ({ user_id: currentUser.id, product_id: prodId }));

        if (itemsToInsert.length > 0) {
          await supabase.from("wishlist_items").insert(itemsToInsert);
        }
      }

      // B. Merge Cart Items
      if (guestCart.length > 0) {
        // Fetch current user database cart
        const { data: currentDbCart } = await supabase
          .from("cart_items")
          .select("id, product_id, quantity, custom_options")
          .eq("user_id", currentUser.id);

        for (const guestItem of guestCart) {
          // Find matching item in DB (same product id & identical custom options)
          const matchedItem = (currentDbCart || []).find(
            (dbItem) =>
              dbItem.product_id === guestItem.id &&
              JSON.stringify(dbItem.custom_options) === JSON.stringify(guestItem.customOptions)
          );

          if (matchedItem) {
            // Update quantity
            await supabase
              .from("cart_items")
              .update({ quantity: matchedItem.quantity + guestItem.quantity })
              .eq("id", matchedItem.id);
          } else {
            // Insert item
            await supabase.from("cart_items").insert({
              user_id: currentUser.id,
              product_id: guestItem.id,
              quantity: guestItem.quantity,
              custom_options: guestItem.customOptions,
            });
          }
        }
      }

      // Clear local guest cache
      localStorage.removeItem("epcraft_cart");
      localStorage.removeItem("epcraft_wishlist");
    } catch (err) {
      console.error("Error merging guest cart on login:", err);
    } finally {
      await loadShopData(currentUser);
    }
  };

  // 1. Listen to Auth State Changes & Load User
  useEffect(() => {
    async function initAuth() {
      const { data: { user: initialUser } } = await supabase.auth.getUser();
      setUser(initialUser);
      await loadShopData(initialUser);
    }
    
    initAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      
      if (event === "SIGNED_IN" && currentUser) {
        await handleMergeOnLogin(currentUser);
      } else {
        await loadShopData(currentUser);
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  // 5. Actions (CRUD with Optimistic UI updates)
  const addToCart = async (product, quantity = 1, customOptions = null) => {
    previousCartRef.current = [...cart];
    
    // Construct optimistic item
    const tempCartItemId = customOptions ? `${product.id}-${Date.now()}` : `${product.id}`;
    
    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex(
        (item) => !customOptions && item.id === product.id && !item.customOptions
      );

      if (existingIndex > -1) {
        const updated = [...prevCart];
        updated[existingIndex].quantity += quantity;
        return updated;
      } else {
        return [
          ...prevCart,
          {
            cartItemId: tempCartItemId,
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image_url || product.image || "",
            category: product.category || "",
            woodType: product.woodType || "",
            quantity,
            customOptions,
          },
        ];
      }
    });

    if (user) {
      try {
        // Query to check if the exact non-customized product is in database cart
        let dbResponse;
        if (!customOptions) {
          const { data: existing } = await supabase
            .from("cart_items")
            .select("id, quantity")
            .eq("user_id", user.id)
            .eq("product_id", product.id)
            .is("custom_options", null)
            .maybeSingle();

          if (existing) {
            dbResponse = await supabase
              .from("cart_items")
              .update({ quantity: existing.quantity + quantity })
              .eq("id", existing.id)
              .select("id");
          } else {
            dbResponse = await supabase
              .from("cart_items")
              .insert({
                user_id: user.id,
                product_id: product.id,
                quantity,
                custom_options: null,
              })
              .select("id");
          }
        } else {
          // Custom options items are always inserted as new rows
          dbResponse = await supabase
            .from("cart_items")
            .insert({
              user_id: user.id,
              product_id: product.id,
              quantity,
              custom_options: customOptions,
            })
            .select("id");
        }

        if (dbResponse.error) throw dbResponse.error;

        // Update optimistic temp ID with real database ID
        const realId = dbResponse.data?.[0]?.id;
        if (realId) {
          setCart((prev) =>
            prev.map((item) =>
              item.cartItemId === tempCartItemId ? { ...item, cartItemId: realId } : item
            )
          );
        }
      } catch (err) {
        console.error("addToCart DB save failed:", err);
        setCart(previousCartRef.current); // Rollback
        showToast(err.message || "Failed to add item to your online cart. Restored local state.");
      }
    }
  };

  const removeFromCart = async (cartItemId) => {
    previousCartRef.current = [...cart];
    setCart((prev) => prev.filter((item) => item.cartItemId !== cartItemId));

    if (user) {
      try {
        const { error } = await supabase
          .from("cart_items")
          .delete()
          .eq("id", cartItemId);

        if (error) throw error;
      } catch (err) {
        console.error("removeFromCart DB failed:", err);
        setCart(previousCartRef.current); // Rollback
        showToast("Failed to remove item. Restored local state.");
      }
    }
  };

  const updateQuantity = async (cartItemId, quantity) => {
    if (quantity <= 0) {
      await removeFromCart(cartItemId);
      return;
    }

    previousCartRef.current = [...cart];
    setCart((prev) =>
      prev.map((item) =>
        item.cartItemId === cartItemId ? { ...item, quantity } : item
      )
    );

    if (user) {
      try {
        const { error } = await supabase
          .from("cart_items")
          .update({ quantity })
          .eq("id", cartItemId);

        if (error) throw error;
      } catch (err) {
        console.error("updateQuantity DB failed:", err);
        setCart(previousCartRef.current); // Rollback
        showToast(err.message || "Failed to update quantity. Restored local state.");
      }
    }
  };

  const clearCart = async () => {
    previousCartRef.current = [...cart];
    setCart([]);

    if (user) {
      try {
        const { error } = await supabase
          .from("cart_items")
          .delete()
          .eq("user_id", user.id);

        if (error) throw error;
      } catch (err) {
        console.error("clearCart DB failed:", err);
        setCart(previousCartRef.current); // Rollback
        showToast("Failed to clear online cart.");
      }
    }
  };

  const toggleWishlist = async (productId) => {
    previousWishlistRef.current = [...wishlist];
    const exists = wishlist.includes(productId);

    // Optimistic UI toggle
    setWishlist((prev) =>
      exists ? prev.filter((id) => id !== productId) : [...prev, productId]
    );

    if (user) {
      try {
        if (exists) {
          const { error } = await supabase
            .from("wishlist_items")
            .delete()
            .eq("user_id", user.id)
            .eq("product_id", productId);

          if (error) throw error;
        } else {
          const { error } = await supabase
            .from("wishlist_items")
            .insert({ user_id: user.id, product_id: productId });

          if (error) throw error;
        }
      } catch (err) {
        console.error("toggleWishlist DB failed:", err);
        setWishlist(previousWishlistRef.current); // Rollback
        showToast("Failed to update wishlist. Restored local state.");
      }
    }
  };

  const isInWishlist = (productId) => wishlist.includes(productId);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

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
        stockLevels,
        refreshStockLevels,
      }}
    >
      {children}
      
      {/* Dynamic Aesthetic Toast System */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[100] max-w-sm rounded-xl border border-red-200 bg-white/95 p-4 shadow-card backdrop-blur-md animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-red-600 animate-pulse" />
            <p className="font-sans text-sm font-medium text-ink">{toast.message}</p>
          </div>
        </div>
      )}
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
