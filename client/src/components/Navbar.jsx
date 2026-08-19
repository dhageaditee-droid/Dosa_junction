import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  ShoppingBag, Menu as MenuIcon, X, Home, Utensils, Tag, Info, PhoneCall, PackageCheck, Globe, 
  MapPin, Phone, Instagram, Facebook, MessageCircle, Sparkles, Image
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const Navbar = ({ onOpenAuthModal }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { cartCount } = useCart();
  const { isCustomerAuthenticated, customerUser, logoutCustomer } = useAuth();
  const { language, changeLanguage, t } = useLanguage();

  const navLinks = [
    { name: 'HOME', path: '/' },
    { name: 'MENU', path: '/menu' },
    { name: 'SPECIALS', path: '/menu?category=special-dosa' },
    { name: 'OFFERS', path: '/offers' },
    { name: 'ABOUT US', path: '/about' },
    { name: 'CONTACT', path: '/contact' },
    { name: 'MY ORDERS', path: '/my-orders' }
  ];

  const isActive = (path) => {
    if (path.includes('?')) {
      return location.pathname + location.search === path;
    }
    return location.pathname === path;
  };

  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 1000, fontFamily: 'var(--font-body)' }}>
      {/* 1. Top Announcement Bar (Black/Dark Background) */}
      <div 
        style={{
          backgroundColor: '#0B0F0D',
          color: '#A1A1AA',
          fontSize: '0.78rem',
          fontWeight: 600,
          padding: '6px 0',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
        }}
      >
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
          {/* Left Info: Phone & Address */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.4rem', flexWrap: 'wrap' }}>
            <a href="tel:+917020758779" style={{ color: '#E4E4E7', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Phone size={13} color="#EA580C" /> +91 70207 58779
            </a>
            <span style={{ color: '#52525B' }}>|</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#D4D4D8' }}>
              <MapPin size={13} color="#EA580C" /> Sinnar Gaurav, Near Panchvati Hotel, Sinnar
            </span>
          </div>

          {/* Right Info: Social Icons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <a href="https://facebook.com" target="_blank" rel="noreferrer" style={{ color: '#A1A1AA', display: 'flex', transition: 'color 0.2s' }} aria-label="Facebook"><Facebook size={14} /></a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer" style={{ color: '#A1A1AA', display: 'flex', transition: 'color 0.2s' }} aria-label="Instagram"><Instagram size={14} /></a>
            <a href="https://wa.me/917020758779" target="_blank" rel="noreferrer" style={{ color: '#A1A1AA', display: 'flex', transition: 'color 0.2s' }} aria-label="WhatsApp"><MessageCircle size={14} /></a>
          </div>
        </div>
      </div>

      {/* 2. Main Dark Header Bar */}
      <div 
        style={{
          backgroundColor: '#0E1411',
          borderBottom: '1px solid rgba(234, 88, 12, 0.2)',
          padding: '0.5rem 0',
          boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
        }}
      >
        <div 
          className="container" 
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: '68px'
          }}
        >
          {/* Brand Logo & Name */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
            <img
              src="/dosa-junction-logo.jpg"
              alt="Dosa Junction Logo"
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '2px solid #EA580C',
                boxShadow: '0 0 12px rgba(234, 88, 12, 0.4)'
              }}
            />
            <div>
              <span 
                className="brand-text-title"
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '1.4rem',
                  fontWeight: 900,
                  color: '#FFFFFF',
                  letterSpacing: '1px',
                  display: 'block',
                  lineHeight: 1.1,
                  whiteSpace: 'nowrap'
                }}
              >
                DOSA <span style={{ color: '#EA580C' }}>JUNCTION</span>
              </span>
              <span 
                className="brand-text-sub"
                style={{ fontSize: '0.58rem', color: '#D97706', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 800, whiteSpace: 'nowrap', display: 'block' }}
              >
                • PURE SOUTH INDIAN •
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '1.6rem' }} className="desktop-nav">
            {navLinks.map((link) => {
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  style={{
                    fontSize: '0.85rem',
                    fontWeight: 800,
                    letterSpacing: '0.8px',
                    color: active ? '#EA580C' : '#E4E4E7',
                    position: 'relative',
                    transition: 'all 0.2s ease',
                    padding: '6px 0',
                    textDecoration: 'none'
                  }}
                >
                  <span>{link.name}</span>
                  {active && (
                    <span
                      style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: '2px',
                        backgroundColor: '#EA580C',
                        borderRadius: '2px',
                        boxShadow: '0 0 8px #EA580C'
                      }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Controls: Order Now Button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Link
              to="/cart"
              className="order-now-btn"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'linear-gradient(135deg, #EA580C 0%, #D97706 100%)',
                color: '#FFFFFF',
                padding: '0.6rem 1.3rem',
                borderRadius: '30px',
                fontWeight: 800,
                fontSize: '0.85rem',
                letterSpacing: '0.5px',
                textDecoration: 'none',
                boxShadow: '0 4px 15px rgba(234, 88, 12, 0.4)',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap'
              }}
            >
              <span>ORDER NOW</span>
              <ShoppingBag size={16} />
              {cartCount > 0 && (
                <span
                  style={{
                    backgroundColor: '#FFFFFF',
                    color: '#EA580C',
                    borderRadius: '50%',
                    width: '20px',
                    height: '20px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.72rem',
                    fontWeight: 900
                  }}
                >
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Mobile Toggle Button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="mobile-toggle-btn"
              style={{
                display: 'none',
                background: 'none',
                border: 'none',
                color: '#FFFFFF',
                cursor: 'pointer',
                padding: '4px'
              }}
              aria-label="Toggle navigation menu"
            >
              {mobileOpen ? <X size={26} color="#EA580C" /> : <MenuIcon size={26} color="#FFFFFF" />}
            </button>
          </div>
        </div>
      </div>

      {/* 3. Mobile Sub-Navbar: Horizontal Scrolling Links Row */}
      <div 
        className="mobile-sub-navbar"
        style={{
          backgroundColor: '#0B0F0D',
          borderBottom: '1px solid rgba(234, 88, 12, 0.2)',
          padding: '8px 12px',
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}
      >
        {navLinks.map((link) => {
          const active = isActive(link.path);
          return (
            <Link
              key={link.path}
              to={link.path}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '6px 14px',
                borderRadius: '20px',
                fontSize: '0.78rem',
                fontWeight: active ? 800 : 700,
                letterSpacing: '0.5px',
                color: active ? '#FFFFFF' : '#A1A1AA',
                backgroundColor: active ? '#EA580C' : 'rgba(255, 255, 255, 0.06)',
                border: active ? '1px solid #EA580C' : '1px solid rgba(255, 255, 255, 0.1)',
                textDecoration: 'none',
                whiteSpace: 'nowrap',
                flexShrink: 0,
                transition: 'all 0.2s ease'
              }}
            >
              <span>{link.name}</span>
            </Link>
          );
        })}
      </div>

      {/* Responsive CSS */}
      <style>{`
        .mobile-sub-navbar {
          display: none !important;
        }
        @media (max-width: 960px) {
          .desktop-nav {
            display: none !important;
          }
          .mobile-toggle-btn {
            display: block !important;
          }
          .mobile-sub-navbar {
            display: flex !important;
          }
        }
        @media (max-width: 640px) {
          .brand-text-title {
            font-size: 1.15rem !important;
          }
          .brand-text-sub {
            font-size: 0.5rem !important;
          }
        }
      `}</style>
    </header>
  );
};

export default Navbar;
