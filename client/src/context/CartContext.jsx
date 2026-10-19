import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/api.js';
import { useAuth } from './AuthContext.jsx';

const CartContext = createContext(null);

export function CartProvider({ children, onNotify }) {
  const { user } = useAuth();
  const [cart, setCart] = useState({ items: [], subtotal: 0, itemCount: 0 });
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Sync cart whenever authentication changes
  useEffect(() => {
    if (user) {
      loadServerCart();
    } else {
      loadGuestCart();
    }
  }, [user]);

  const loadServerCart = async () => {
    try {
      const data = await api.getCart();
      setCart(data);
    } catch (err) {
      console.error('Failed to load server cart:', err);
    }
  };

  const loadGuestCart = () => {
    const guestItems = JSON.parse(localStorage.getItem('lumina_guest_cart') || '[]');
    let subtotal = 0;
    guestItems.forEach((item) => {
      subtotal += (item.product?.price || 0) * item.quantity;
    });
    setCart({
      items: guestItems,
      itemCount: guestItems.reduce((sum, i) => sum + i.quantity, 0),
      subtotal: parseFloat(subtotal.toFixed(2))
    });
  };

  const saveGuestCart = (items) => {
    localStorage.setItem('lumina_guest_cart', JSON.stringify(items));
    let subtotal = 0;
    items.forEach((item) => {
      subtotal += (item.product?.price || 0) * item.quantity;
    });
    setCart({
      items,
      itemCount: items.reduce((sum, i) => sum + i.quantity, 0),
      subtotal: parseFloat(subtotal.toFixed(2))
    });
  };

  const addToCart = async (product, quantity = 1) => {
    if (product.stock < quantity) {
      if (onNotify) onNotify(`Only ${product.stock} units available in stock.`, 'error');
      return;
    }

    if (user) {
      try {
        await api.addToCart(product.id, quantity);
        await loadServerCart();
        if (onNotify) onNotify(`Added "${product.name}" to cart!`, 'success');
        setIsCartOpen(true);
      } catch (err) {
        if (onNotify) onNotify(err.message || 'Failed to add item to cart', 'error');
      }
    } else {
      const guestItems = JSON.parse(localStorage.getItem('lumina_guest_cart') || '[]');
      const existing = guestItems.find((i) => i.productId === product.id);
      let updated;
      if (existing) {
        existing.quantity += quantity;
        updated = [...guestItems];
      } else {
        updated = [
          ...guestItems,
          { id: 'guest_' + Date.now(), productId: product.id, product, quantity }
        ];
      }
      saveGuestCart(updated);
      if (onNotify) onNotify(`Added "${product.name}" to cart!`, 'success');
      setIsCartOpen(true);
    }
  };

  const updateQuantity = async (cartItemId, newQty) => {
    if (user) {
      try {
        await api.updateCartItem(cartItemId, newQty);
        await loadServerCart();
      } catch (err) {
        if (onNotify) onNotify(err.message || 'Failed to update quantity', 'error');
      }
    } else {
      let guestItems = JSON.parse(localStorage.getItem('lumina_guest_cart') || '[]');
      if (newQty <= 0) {
        guestItems = guestItems.filter((i) => i.id !== cartItemId);
      } else {
        const item = guestItems.find((i) => i.id === cartItemId);
        if (item) item.quantity = newQty;
      }
      saveGuestCart(guestItems);
    }
  };

  const removeItem = async (cartItemId) => {
    if (user) {
      try {
        await api.removeCartItem(cartItemId);
        await loadServerCart();
        if (onNotify) onNotify('Item removed from cart.', 'info');
      } catch (err) {
        if (onNotify) onNotify(err.message || 'Failed to remove item', 'error');
      }
    } else {
      let guestItems = JSON.parse(localStorage.getItem('lumina_guest_cart') || '[]');
      guestItems = guestItems.filter((i) => i.id !== cartItemId);
      saveGuestCart(guestItems);
      if (onNotify) onNotify('Item removed from cart.', 'info');
    }
  };

  const clearCart = async () => {
    if (user) {
      try {
        await api.clearCart();
        await loadServerCart();
        if (onNotify) onNotify('Cart cleared.', 'info');
      } catch (err) {
        if (onNotify) onNotify(err.message || 'Failed to clear cart', 'error');
      }
    } else {
      localStorage.removeItem('lumina_guest_cart');
      setCart({ items: [], subtotal: 0, itemCount: 0 });
      if (onNotify) onNotify('Cart cleared.', 'info');
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
        refreshCart: user ? loadServerCart : loadGuestCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
