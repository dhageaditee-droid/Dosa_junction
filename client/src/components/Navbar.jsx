import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, Menu as MenuIcon, X, UtensilsCrossed, User, LogOut } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const Navbar = ({ onOpenAuthModal }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { cartCount } = useCart();
  const { isCustomerAuthenticated, customerUser, logoutCustomer } = useAuth();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Menu', path: '/menu' },
    { name: 'Offers', path: '/offers' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
    { name: 'My Orders', path: '/my-orders' }
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <header className="header-sticky">
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '76px' }}>
        
        {/* Brand Logo & Name */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', textDecoration: 'none' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #0F172A, #1E293B)',
            color: '#D97706',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(217, 119, 6, 0.25)',
            border: '1px solid rgba(217, 119, 6, 0.3)'
          }}>
            <UtensilsCrossed size={24} />
          </div>
          <div>
            <span style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '1.45rem',
              fontWeight: 800,
              color: 'var(--color-emerald)',
              letterSpacing: '-0.5px',
              display: 'block',
              lineHeight: 1.1
            }}>
              Dakshin <span style={{ color: 'var(--color-gold)' }}>Bhavan</span>
            </span>
            <span style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 600 }}>
              Authentic South Indian Flavours
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
                padding: '4px 0'
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

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          
          {/* Customer Profile / Login */}
          {isCustomerAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Link
                to="/my-orders"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: 'var(--color-emerald)',
                  backgroundColor: 'var(--color-cream-alt)',
                  padding: '6px 12px',
                  borderRadius: '20px',
                  textDecoration: 'none'
                }}
              >
                <User size={16} />
                <span>{customerUser?.name?.split(' ')[0] || 'Profile'}</span>
              </Link>
              <button
                onClick={logoutCustomer}
                title="Logout"
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#EF4444',
                  cursor: 'pointer',
                  padding: '6px'
                }}
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="btn btn-outline btn-sm desktop-only"
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <User size={16} />
              <span>Login</span>
            </button>
          )}

          {/* Cart Icon Button */}
          <Link
            to="/cart"
            style={{
              position: 'relative',
              padding: '0.6rem',
              borderRadius: '50%',
              backgroundColor: 'var(--color-cream-alt)',
              color: 'var(--color-emerald)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'var(--transition-fast)'
            }}
            aria-label="View Shopping Cart"
          >
            <ShoppingBag size={22} />
            {cartCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  backgroundColor: 'var(--color-saffron)',
                  color: '#fff',
                  fontSize: '0.75rem',
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

          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="mobile-toggle"
            style={{
              padding: '0.5rem',
              color: 'var(--color-emerald)',
              display: 'none',
              background: 'none',
              border: 'none'
            }}
            aria-label="Toggle Menu"
          >
            {mobileOpen ? <X size={28} /> : <MenuIcon size={28} />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer Navigation */}
      {mobileOpen && (
        <div
          style={{
            position: 'fixed',
            inset: '76px 0 0 0',
            backgroundColor: 'var(--color-cream)',
            zIndex: 99,
            padding: '2rem 1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.2rem',
            boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
            overflowY: 'auto'
          }}
        >
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMobileOpen(false)}
              style={{
                fontSize: '1.15rem',
                fontWeight: isActive(link.path) ? 700 : 500,
                color: isActive(link.path) ? 'var(--color-gold)' : 'var(--color-emerald)',
                padding: '0.5rem 0',
                borderBottom: '1px solid var(--color-border)'
              }}
            >
              {link.name}
            </Link>
          ))}
          
          {!isCustomerAuthenticated ? (
            <button
              onClick={() => { setMobileOpen(false); onOpenAuthModal(); }}
              className="btn btn-outline"
              style={{ marginTop: '0.5rem', width: '100%' }}
            >
              Customer Login / Register
            </button>
          ) : (
            <button
              onClick={() => { setMobileOpen(false); logoutCustomer(); }}
              className="btn btn-outline"
              style={{ marginTop: '0.5rem', width: '100%', borderColor: '#EF4444', color: '#EF4444' }}
            >
              Logout ({customerUser?.name})
            </button>
          )}

          <Link
            to="/menu"
            onClick={() => setMobileOpen(false)}
            className="btn btn-primary"
            style={{ width: '100%', textAlign: 'center' }}
          >
            Explore Menu & Order Now
          </Link>
        </div>
      )}

      {/* Responsive Inline Styles */}
      <style>{`
        @media (max-width: 900px) {
          .desktop-nav, .desktop-only {
            display: none !important;
          }
          .mobile-toggle {
            display: block !important;
          }
        }
      `}</style>
    </header>
  );
};

export default Navbar;
