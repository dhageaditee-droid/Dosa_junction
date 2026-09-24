import React, { createContext, useContext, useState } from 'react';
import { useToast } from './ToastContext';
import { apiService } from '../services/api';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = sessionStorage.getItem('dakshin_cart') || localStorage.getItem('dakshin_cart');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  const { addToast } = useToast();

  const persistCart = (items) => {
    try {
      sessionStorage.setItem('dakshin_cart', JSON.stringify(items));
      localStorage.setItem('dakshin_cart', JSON.stringify(items));
    } catch (e) {}
  };

  const addToCart = (item, quantity = 1) => {
    setCartItems((prev) => {
      const existingIndex = prev.findIndex((i) => i.id === item.id);
      let updated;
      if (existingIndex > -1) {
        updated = [...prev];
        updated[existingIndex].quantity += quantity;
      } else {
        updated = [...prev, { ...item, price: parseFloat(item.price), quantity }];
      }
      persistCart(updated);
      return updated;
    });
    if (addToast) addToast(`Added "${item.name}" to cart.`, 'success');
  };

  const removeFromCart = (itemId) => {
    setCartItems((prev) => {
      const target = prev.find((i) => i.id === itemId);
      if (target && addToast) {
        addToast(`Removed "${target.name}" from cart.`, 'info');
      }
      const updated = prev.filter((i) => i.id !== itemId);
      persistCart(updated);
      return updated;
    });
  };

  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCartItems((prev) => {
      const updated = prev.map((item) => (item.id === itemId ? { ...item, quantity: newQuantity } : item));
      persistCart(updated);
      return updated;
    });
  };

  const getItemQuantity = (itemId) => {
    const found = cartItems.find((i) => i.id === itemId);
    return found ? found.quantity : 0;
  };

  const clearCart = () => {
    setCartItems([]);
    setAppliedCoupon(null);
    try {
      sessionStorage.removeItem('dakshin_cart');
      localStorage.removeItem('dakshin_cart');
    } catch (e) {}
  };

  // Pricing derivation
  const subtotal = cartItems.reduce((sum, item) => sum + parseFloat(item.price) * item.quantity, 0);
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // Calculate dynamic coupon discount amount (Disabled)
  const discountAmount = 0;

  const netSubtotal = Math.max(0, subtotal - discountAmount);
  const tax = 0;
  const packingFee = cartItems.length > 0 ? 15.0 : 0;
  const freeDeliveryThreshold = 400.0;
  const deliveryFee = cartItems.length > 0 ? (subtotal >= freeDeliveryThreshold ? 0 : 29.0) : 0;
  const grandTotal = parseFloat((netSubtotal + tax + packingFee + deliveryFee).toFixed(2));

  const applyCoupon = async () => {
    return { success: false, message: 'Coupons are currently disabled.' };
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        getItemQuantity,
        clearCart,
        cartCount,
        subtotal,
        discountAmount,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        tax,
        packingFee,
        deliveryFee,
        freeDeliveryThreshold,
        grandTotal
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
