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
      className="floating-cart-bar-wrapper"
      style={{
        position: 'fixed',
        left: '12px',
        right: '12px',
        zIndex: 990,
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
          padding: '10px 16px',
          borderRadius: '16px',
          boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.4), 0 8px 10px -6px rgba(15, 23, 42, 0.2)',
          textDecoration: 'none',
          border: '1px solid rgba(255,255,255,0.15)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '34px',
            height: '34px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255,255,255,0.18)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <ShoppingBag size={18} color="#F59E0B" />
          </div>

          <div>
            <span style={{ fontSize: '0.9rem', fontWeight: 800, display: 'block', lineHeight: 1.2 }}>
              {cartCount} {cartCount === 1 ? 'Item' : 'Items'} | ₹{grandTotal.toFixed(2)}
            </span>
          </div>
        </div>

        <div
          style={{
            backgroundColor: '#F59E0B',
            color: '#111827',
            padding: '6px 16px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontWeight: 800,
            fontSize: '0.88rem',
            boxShadow: '0 2px 8px rgba(245, 158, 11, 0.4)'
          }}
        >
          <span>Confirm</span>
          <ArrowRight size={16} />
        </div>
      </Link>

      <style>{`
        .floating-cart-bar-wrapper {
          bottom: 16px;
        }
        @media (max-width: 768px) {
          .floating-cart-bar-wrapper {
            bottom: 70px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default StickyMobileCartBar;
