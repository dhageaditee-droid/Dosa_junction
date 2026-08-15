import React, { createContext, useContext, useState } from 'react';
import { useToast } from './ToastContext';
import { apiService } from '../services/api';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  // Do not persist old added cart items across page refresh as requested by user
  const [cartItems, setCartItems] = useState([]);
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  const { addToast } = useToast();

  const addToCart = (item, quantity = 1) => {
    setCartItems((prev) => {
      const existingIndex = prev.findIndex((i) => i.id === item.id);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      } else {
        return [...prev, { ...item, price: parseFloat(item.price), quantity }];
      }
    });
    if (addToast) addToast(`Added "${item.name}" to cart.`, 'success');
  };

  const removeFromCart = (itemId) => {
    setCartItems((prev) => {
      const target = prev.find((i) => i.id === itemId);
      if (target && addToast) {
        addToast(`Removed "${target.name}" from cart.`, 'info');
      }
      return prev.filter((i) => i.id !== itemId);
    });
  };

  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, quantity: newQuantity } : item))
    );
  };

  const getItemQuantity = (itemId) => {
    const found = cartItems.find((i) => i.id === itemId);
    return found ? found.quantity : 0;
  };

  const clearCart = () => {
    setCartItems([]);
    setAppliedCoupon(null);
  };

  // Pricing derivation
  const subtotal = cartItems.reduce((sum, item) => sum + parseFloat(item.price) * item.quantity, 0);
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // Calculate dynamic coupon discount amount
  let discountAmount = 0;
  if (appliedCoupon && subtotal > 0) {
    if (appliedCoupon.calculatedDiscount) {
      discountAmount = Math.min(subtotal, appliedCoupon.calculatedDiscount);
    }
  }

  const netSubtotal = Math.max(0, subtotal - discountAmount);
  const tax = parseFloat((netSubtotal * 0.05).toFixed(2));
  const packingFee = cartItems.length > 0 ? 15.0 : 0;
  const freeDeliveryThreshold = 400.0;
  const deliveryFee = cartItems.length > 0 ? (subtotal >= freeDeliveryThreshold ? 0 : 30.0) : 0;
  const grandTotal = parseFloat((netSubtotal + tax + packingFee + deliveryFee).toFixed(2));

  const applyCoupon = async (code) => {
    try {
      const res = await apiService.validateCoupon(code, subtotal);
      if (res.success && res.coupon) {
        setAppliedCoupon(res.coupon);
        if (addToast) addToast(res.message, 'success');
        return { success: true, message: res.message };
      }
    } catch (err) {
      if (addToast) addToast(err.message || 'Invalid coupon code.', 'error');
      return { success: false, message: err.message };
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    if (addToast) addToast('Coupon removed.', 'info');
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
