import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';

const StickyMobileCartBar = () => {
  const { cartCount } = useCart();
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
        right: '20px',
        zIndex: 990,
        animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
      }}
    >
      <Link
        to="/cart"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          backgroundColor: '#F59E0B',
          color: '#111827',
          padding: '12px 22px',
          borderRadius: '50px',
          boxShadow: '0 10px 25px -5px rgba(245, 158, 11, 0.5), 0 4px 14px rgba(0, 0, 0, 0.2)',
          textDecoration: 'none',
          fontWeight: 800,
          fontSize: '0.95rem',
          border: 'none'
        }}
      >
        <ShoppingBag size={18} />
        <span>Confirm</span>
        <ArrowRight size={18} />
      </Link>

      <style>{`
        .floating-cart-bar-wrapper {
          bottom: 20px;
        }
        @media (max-width: 768px) {
          .floating-cart-bar-wrapper {
            bottom: 76px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default StickyMobileCartBar;
