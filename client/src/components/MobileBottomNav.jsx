import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Utensils, Tag, ShoppingBag, User } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const MobileBottomNav = ({ onOpenAuthModal }) => {
  const location = useLocation();
  const { cartCount } = useCart();
  const { isCustomerAuthenticated } = useAuth();

  // Hide on admin routes
  if (location.pathname.startsWith('/admin')) {
    return null;
  }

  const navItems = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Menu', path: '/menu', icon: Utensils },
    { label: 'Offers', path: '/offers', icon: Tag },
    { label: 'Cart', path: '/cart', icon: ShoppingBag, badge: cartCount },
    { label: 'Account', path: isCustomerAuthenticated ? '/my-orders' : '#', icon: User, isAuthTrigger: !isCustomerAuthenticated }
  ];

  return (
    <div className="mobile-bottom-nav">
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        backgroundColor: '#FFFFFF',
        height: '62px',
        borderTop: '1px solid var(--color-border)',
        boxShadow: '0 -4px 16px rgba(0,0,0,0.08)',
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 998
      }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          if (item.isAuthTrigger) {
            return (
              <button
                key={item.label}
                onClick={onOpenAuthModal}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '2px',
                  background: 'none',
                  border: 'none',
                  color: isActive ? 'var(--color-gold)' : 'var(--color-emerald)',
                  cursor: 'pointer',
                  padding: '4px 0'
                }}
              >
                <Icon size={20} color={isActive ? 'var(--color-gold)' : 'var(--color-emerald)'} />
                <span style={{ fontSize: '0.7rem', fontWeight: isActive ? 700 : 500 }}>
                  {item.label}
                </span>
              </button>
            );
          }

          return (
            <Link
              key={item.label}
              to={item.path}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '2px',
                textDecoration: 'none',
                color: isActive ? 'var(--color-gold)' : 'var(--color-emerald)',
                position: 'relative',
                padding: '4px 0',
                width: '20%'
              }}
            >
              <div style={{ position: 'relative' }}>
                <Icon size={20} color={isActive ? 'var(--color-gold)' : 'var(--color-emerald)'} />
                {item.badge > 0 && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '-5px',
                      right: '-8px',
                      backgroundColor: 'var(--color-saffron)',
                      color: '#FFF',
                      fontSize: '0.62rem',
                      fontWeight: 800,
                      width: '16px',
                      height: '16px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </div>
              <span style={{ fontSize: '0.7rem', fontWeight: isActive ? 700 : 500 }}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>

      <style>{`
        .mobile-bottom-nav {
          display: none;
        }
        @media (max-width: 768px) {
          .mobile-bottom-nav {
            display: block;
          }
          /* Adjust page padding for fixed bottom navigation bar */
          body {
            padding-bottom: 64px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default MobileBottomNav;
