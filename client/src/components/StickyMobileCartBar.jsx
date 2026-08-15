import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';

const StickyMobileCartBar = () => {
  const { cartCount, grandTotal } = useCart();
  const location = useLocation();

  // Hide on cart, checkout, order success pages or when cart is empty
  const hidePaths = ['/cart', '/checkout', '/order-success', '/admin'];
  const isHiddenPage = hidePaths.some((p) => location.pathname.startsWith(p));

  if (cartCount === 0 || isHiddenPage) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '16px',
        left: '16px',
        right: '16px',
        zIndex: 90,
        animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
      }}
    >
      <Link
        to="/cart"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'var(--color-emerald)',
          color: '#FFFFFF',
          padding: '12px 20px',
          borderRadius: '16px',
          boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.4), 0 8px 10px -6px rgba(15, 23, 42, 0.2)',
          textDecoration: 'none',
          border: '1px solid rgba(255,255,255,0.15)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255,255,255,0.18)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <ShoppingBag size={20} color="#F59E0B" />
          </div>

          <div>
            <span style={{ fontSize: '0.95rem', fontWeight: 800, display: 'block', lineHeight: 1.2 }}>
              {cartCount} {cartCount === 1 ? 'Item' : 'Items'} | ₹{grandTotal.toFixed(2)}
            </span>
            <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.85)', letterSpacing: '0.3px' }}>
              Extra discounts applied
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 800, fontSize: '0.95rem', color: '#F59E0B' }}>
          <span>View Cart</span>
          <ArrowRight size={18} />
        </div>
      </Link>
    </div>
  );
};

export default StickyMobileCartBar;
