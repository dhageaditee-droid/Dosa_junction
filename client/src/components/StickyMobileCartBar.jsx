import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';

const StickyMobileCartBar = () => {
  const { cartCount } = useCart();
  const location = useLocation();

  // Hide on cart, checkout, order success pages or when cart is empty
  const hidePaths = ['/cart', '/checkout', '/order-success', '/admin'];
  const isHiddenPage = hidePaths.some((p) => location.pathname.startsWith(p));

  useEffect(() => {
    if (cartCount > 0 && !isHiddenPage) {
      document.body.classList.add('has-floating-cart-btn');
    } else {
      document.body.classList.remove('has-floating-cart-btn');
    }
    return () => {
      document.body.classList.remove('has-floating-cart-btn');
    };
  }, [cartCount, isHiddenPage]);

  if (cartCount === 0 || isHiddenPage) return null;

  return (
    <div
      className="floating-cart-bar-wrapper"
      style={{
        position: 'fixed',
        right: '24px',
        zIndex: 990,
        animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
      }}
    >
      <Link
        to="/cart"
        className="proceed-to-order-btn"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '14px',
          background: 'linear-gradient(180deg, #0A4D28 0%, #032A15 100%)',
          color: '#FFFFFF',
          padding: '6px 6px 6px 22px',
          borderRadius: '50px',
          border: '2.5px solid #D4AF37',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.35), inset 0 1px 1px rgba(255, 255, 255, 0.2)',
          textDecoration: 'none',
          cursor: 'pointer',
          transition: 'transform 0.2s ease, boxShadow 0.2s ease'
        }}
      >
        <span
          style={{
            fontSize: '1rem',
            fontWeight: 800,
            letterSpacing: '0.3px',
            fontFamily: 'system-ui, -apple-system, sans-serif'
          }}
        >
          Proceed to Order
        </span>

        <div
          style={{
            width: '42px',
            height: '42px',
            borderRadius: '50%',
            background: 'linear-gradient(145deg, #FFE066 0%, #F59E0B 60%, #B47400 100%)',
            border: '2px solid #FFF5CC',
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1px',
            flexShrink: 0
          }}
        >
          <ShoppingCart size={19} color="#1E1E1E" strokeWidth={2.5} />
          <ArrowRight size={13} color="#1E1E1E" strokeWidth={3} style={{ marginLeft: '-3px' }} />
        </div>
      </Link>

      <style>{`
        .floating-cart-bar-wrapper {
          bottom: 24px;
        }
        .proceed-to-order-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 28px rgba(0, 0, 0, 0.4);
        }
        body.has-floating-cart-btn {
          padding-bottom: 110px !important;
        }
        @media (max-width: 768px) {
          .floating-cart-bar-wrapper {
            bottom: 78px !important;
            right: 16px !important;
          }
          body.has-floating-cart-btn {
            padding-bottom: 140px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default StickyMobileCartBar;
