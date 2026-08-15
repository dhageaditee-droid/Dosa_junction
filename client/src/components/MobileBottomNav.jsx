import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Utensils, Tag, PhoneCall, PackageCheck } from 'lucide-react';

const MobileBottomNav = () => {
  const location = useLocation();

  // Hide on admin routes
  if (location.pathname.startsWith('/admin')) {
    return null;
  }

  const navItems = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Menu', path: '/menu', icon: Utensils },
    { label: 'Offers', path: '/offers', icon: Tag },
    { label: 'Contact', path: '/contact', icon: PhoneCall },
    { label: 'Orders', path: '/my-orders', icon: PackageCheck }
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
              <div>
                <Icon size={20} color={isActive ? 'var(--color-gold)' : 'var(--color-emerald)'} />
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
