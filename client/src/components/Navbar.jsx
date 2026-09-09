import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  ShoppingBag, Menu as MenuIcon, X, Home, Utensils, Tag, Info, PhoneCall, PackageCheck, Globe, 
  MapPin, Phone, Clock, Instagram, Facebook, MessageCircle, ChevronDown 
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
    { name: t('home'), path: '/', icon: Home },
    { name: t('menu'), path: '/menu', icon: Utensils },
    { name: t('offers'), path: '/offers', icon: Tag },
    { name: t('about'), path: '/about', icon: Info },
    { name: t('contact'), path: '/contact', icon: PhoneCall },
    { name: t('myOrders'), path: '/my-orders', icon: PackageCheck }
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 1000 }}>


      {/* 2. Main Floating Elegant Navbar Container */}
      <div 
        className="main-navbar-wrapper"
        style={{
          backgroundColor: 'rgba(38, 24, 14, 0.78)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(251, 191, 36, 0.18)',
          padding: '0.4rem 0'
        }}
      >
        <div 
          className="container" 
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: '68px'
          }}
        >
          {/* Brand Logo & Name */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', textDecoration: 'none' }}>
            <img
              src="/dosa-junction-logo.jpg"
              alt="Dosa Junction Logo"
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '2px solid #FBBF24',
                boxShadow: '0 4px 12px rgba(251, 191, 36, 0.25)',
                flexShrink: 0
              }}
            />
            <div>
              <span 
                className="brand-text-title"
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '1.35rem',
                  fontWeight: 800,
                  color: '#FFFFFF',
                  letterSpacing: '-0.5px',
                  display: 'block',
                  lineHeight: 1.1,
                  whiteSpace: 'nowrap'
                }}
              >
                Dosa <span style={{ color: '#FBBF24' }}>Junction</span>
              </span>
              <span 
                className="brand-text-sub"
                style={{ fontSize: '0.6rem', color: '#FBBF24', letterSpacing: '0.8px', textTransform: 'uppercase', fontWeight: 700, whiteSpace: 'nowrap', display: 'block' }}
              >
                ✦ TASTE OF SOUTH ✦
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links with Icons */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '1.4rem' }} className="desktop-nav">
            {navLinks.map((link) => {
              const IconComp = link.icon;
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.92rem',
                    fontWeight: active ? 800 : 600,
                    color: active ? '#FBBF24' : '#E2E8F0',
                    position: 'relative',
                    transition: 'all 0.2s ease',
                    padding: '6px 0',
                    textDecoration: 'none'
                  }}
                >
                  <IconComp size={15} color={active ? '#FBBF24' : '#94A3B8'} />
                  <span>{link.name}</span>
                  {active && (
                    <span
                      style={{
                        position: 'absolute',
                        bottom: '0px',
                        left: 0,
                        right: 0,
                        height: '2.5px',
                        backgroundColor: '#FBBF24',
                        borderRadius: '2px'
                      }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Controls: Language Selector & Order Now Button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            
            {/* Language Selection Selector Pill */}
            <div className="nav-lang-desktop" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Globe size={15} color="#FBBF24" style={{ position: 'absolute', left: '10px', pointerEvents: 'none', zIndex: 1 }} />
              <select
                value={language}
                onChange={(e) => changeLanguage(e.target.value)}
                style={{
                  paddingLeft: '30px',
                  paddingRight: '22px',
                  paddingTop: '6px',
                  paddingBottom: '6px',
                  borderRadius: '30px',
                  border: '1.5px solid rgba(251, 191, 36, 0.4)',
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  outline: 'none',
                  appearance: 'none',
                  WebkitAppearance: 'none',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
                }}
                title="Select Language / भाषा चुनें"
              >
                <option value="en" style={{ background: '#1C1917', color: '#FFF' }}>English</option>
                <option value="mr" style={{ background: '#1C1917', color: '#FFF' }}>मराठी</option>
                <option value="hi" style={{ background: '#1C1917', color: '#FFF' }}>हिंदी</option>
              </select>
              <ChevronDown size={14} color="#FBBF24" style={{ position: 'absolute', right: '8px', pointerEvents: 'none' }} />
            </div>

            {/* Bright Golden Order Now Pill Button with Cart Count */}
            <Link
              to="/cart"
              className="order-now-btn"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: 'linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%)',
                color: '#1C1917',
                padding: '0.55rem 1.25rem',
                borderRadius: '30px',
                fontWeight: 800,
                fontSize: '0.88rem',
                textDecoration: 'none',
                boxShadow: '0 4px 16px rgba(245, 158, 11, 0.45)',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap'
              }}
            >
              <ShoppingBag size={17} color="#1C1917" />
              <span className="order-now-text">Order Now</span>
              {cartCount > 0 && (
                <span
                  style={{
                    backgroundColor: '#1C1917',
                    color: '#FBBF24',
                    fontSize: '0.75rem',
                    fontWeight: 900,
                    padding: '1px 7px',
                    borderRadius: '20px',
                    marginLeft: '2px'
                  }}
                >
                  {cartCount}
                </span>
              )}
            </Link>
          </div>

          {/* Bottom Curved Lotus Crest Dip Accent */}
          <div
            className="desktop-nav-crest"
            style={{
              position: 'absolute',
              bottom: '-17px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '28px',
              height: '14px',
              backgroundColor: '#26180E',
              borderRadius: '0 0 14px 14px',
              borderBottom: '1px solid rgba(251, 191, 36, 0.2)',
              borderLeft: '1px solid rgba(251, 191, 36, 0.2)',
              borderRight: '1px solid rgba(251, 191, 36, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 2
            }}
          >
            <span style={{ color: '#FBBF24', fontSize: '0.7rem', lineHeight: 1 }}>🌿</span>
          </div>

        </div>
      </div>

      {/* Mobile Sub-Navbar: Horizontal Scrolling Links Row under Logo Bar */}
      <div 
        className="mobile-sub-navbar"
        style={{
          backgroundColor: '#26180E',
          borderBottom: '1px solid rgba(251, 191, 36, 0.2)',
          padding: '8px 12px',
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
        }}
      >
        {navLinks.map((link) => {
          const IconComp = link.icon;
          const active = isActive(link.path);
          return (
            <Link
              key={link.path}
              to={link.path}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '20px',
                fontSize: '0.82rem',
                fontWeight: active ? 800 : 600,
                color: active ? '#1C1917' : '#E2E8F0',
                backgroundColor: active ? '#FBBF24' : 'rgba(255, 255, 255, 0.08)',
                border: active ? '1px solid #FBBF24' : '1px solid rgba(255, 255, 255, 0.15)',
                textDecoration: 'none',
                whiteSpace: 'nowrap',
                flexShrink: 0,
                boxShadow: active ? '0 2px 8px rgba(251, 191, 36, 0.3)' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              <IconComp size={14} color={active ? '#1C1917' : '#94A3B8'} />
              <span>{link.name}</span>
            </Link>
          );
        })}
      </div>



      {/* Responsive Breakpoint CSS */}
      <style>{`
        .mobile-sub-navbar {
          display: none !important;
        }
        @media (max-width: 960px) {
          .desktop-nav, .desktop-nav-crest {
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
          .top-bar-hours {
            display: none !important;
          }
          .nav-lang-desktop select {
            padding-left: 24px !important;
            padding-right: 18px !important;
            font-size: 0.75rem !important;
          }
          .brand-text-title {
            font-size: 1.05rem !important;
            line-height: 1.2 !important;
            white-space: nowrap !important;
          }
          .brand-text-sub {
            font-size: 0.5rem !important;
            white-space: nowrap !important;
          }
          .order-now-text {
            display: none !important;
          }
          .order-now-btn {
            padding: 0.45rem 0.75rem !important;
            border-radius: 20px !important;
          }
        }
      `}</style>
    </header>
  );
};

export default Navbar;
