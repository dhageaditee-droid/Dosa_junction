import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, Menu as MenuIcon, X, UtensilsCrossed, User, LogOut, Home, Utensils, Tag, Info, PhoneCall, PackageCheck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const Navbar = ({ onOpenAuthModal }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { cartCount } = useCart();
  const { isCustomerAuthenticated, customerUser, logoutCustomer } = useAuth();

  const navLinks = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Menu', path: '/menu', icon: Utensils },
    { name: 'Offers', path: '/offers', icon: Tag },
    { name: 'About', path: '/about', icon: Info },
    { name: 'Contact', path: '/contact', icon: PhoneCall },
    { name: 'My Orders', path: '/my-orders', icon: PackageCheck }
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <header className="header-sticky" style={{ position: 'sticky', top: 0, zIndex: 1000, backgroundColor: '#FFFFFF', borderBottom: '1px solid var(--color-border)' }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '76px' }}>
        
        {/* Brand Logo & Name */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', textDecoration: 'none' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #0F172A, #1E293B)',
            color: '#D97706',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(217, 119, 6, 0.25)',
            border: '1px solid rgba(217, 119, 6, 0.3)',
            flexShrink: 0
          }}>
            <UtensilsCrossed size={22} />
          </div>
          <div>
            <span style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '1.35rem',
              fontWeight: 800,
              color: 'var(--color-emerald)',
              letterSpacing: '-0.5px',
              display: 'block',
              lineHeight: 1.1
            }}>
              Dosa <span style={{ color: 'var(--color-gold)' }}>Junction</span>
            </span>
            <span style={{ fontSize: '0.62rem', color: 'var(--color-text-muted)', letterSpacing: '0.8px', textTransform: 'uppercase', fontWeight: 600 }}>
              South Indian Flavours
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '1.8rem' }} className="desktop-nav">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              style={{
                fontSize: '0.95rem',
                fontWeight: isActive(link.path) ? 700 : 500,
                color: isActive(link.path) ? 'var(--color-gold)' : 'var(--color-emerald)',
                position: 'relative',
                transition: 'var(--transition-fast)',
                padding: '4px 0',
                textDecoration: 'none'
              }}
            >
              {link.name}
              {isActive(link.path) && (
                <span
                  style={{
                    position: 'absolute',
                    bottom: '-2px',
                    left: 0,
                    right: 0,
                    height: '2.5px',
                    backgroundColor: 'var(--color-gold)',
                    borderRadius: '2px'
                  }}
                />
              )}
            </Link>
          ))}
        </nav>

        {/* Right Action Controls: Cart Icon */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          
          {/* Cart Icon Button */}
          <Link
            to="/cart"
            style={{
              position: 'relative',
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-cream-alt)',
              color: 'var(--color-emerald)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textDecoration: 'none'
            }}
          >
            <ShoppingBag size={20} />
            {cartCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  backgroundColor: 'var(--color-saffron)',
                  color: '#FFFFFF',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 6px rgba(234, 88, 12, 0.4)'
                }}
              >
                {cartCount}
              </span>
            )}
          </Link>

          {/* Mobile Hamburger Toggle Button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="mobile-toggle-btn"
            style={{
              padding: '0.5rem',
              color: 'var(--color-emerald)',
              display: 'none',
              background: 'none',
              border: 'none',
              cursor: 'pointer'
            }}
            aria-label="Toggle Navigation Menu"
          >
            {mobileOpen ? <X size={28} color="var(--color-emerald)" /> : <MenuIcon size={28} color="var(--color-emerald)" />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer Navigation Screen */}
      {mobileOpen && (
        <div
          style={{
            position: 'fixed',
            inset: '76px 0 0 0',
            backgroundColor: '#FFFFFF',
            zIndex: 9999,
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.8rem',
            boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
            overflowY: 'auto'
          }}
        >
          <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--color-gold)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.4rem' }}>
            Navigation Menu
          </div>

          {navLinks.map((link) => {
            const LinkIcon = link.icon;
            const isSel = isActive(link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.8rem',
                  fontSize: '1.1rem',
                  fontWeight: isSel ? 800 : 600,
                  color: isSel ? 'var(--color-gold)' : 'var(--color-emerald)',
                  padding: '0.8rem 1rem',
                  borderRadius: '12px',
                  backgroundColor: isSel ? 'var(--color-cream-alt)' : '#F8FAFC',
                  textDecoration: 'none'
                }}
              >
                <LinkIcon size={20} color={isSel ? 'var(--color-gold)' : 'var(--color-emerald)'} />
                <span>{link.name}</span>
              </Link>
            );
          })}

          <div style={{ margin: '0.4rem 0' }} />

          <Link
            to="/menu"
            onClick={() => setMobileOpen(false)}
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.9rem', fontSize: '1.05rem', fontWeight: 800, textAlign: 'center', borderRadius: '12px', textDecoration: 'none' }}
          >
            Explore Menu & Order Now
          </Link>
        </div>
      )}

      {/* Responsive Breakpoint CSS */}
      <style>{`
        @media (max-width: 880px) {
          .desktop-nav {
            display: none !important;
          }
          .mobile-toggle-btn {
            display: block !important;
          }
        }
      `}</style>
    </header>
  );
};

export default Navbar;
