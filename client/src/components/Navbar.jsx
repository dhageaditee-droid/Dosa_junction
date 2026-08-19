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


      {/* 2. Main Floating White Card Navbar Container */}
      <div 
        className="main-navbar-wrapper"
        style={{
          backgroundColor: 'rgba(255, 253, 249, 0.95)',
          backdropFilter: 'blur(8px)',
          borderBottom: '1px solid #EAE3D2',
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
                border: '2px solid var(--color-gold)',
                boxShadow: '0 4px 10px rgba(0,0,0,0.12)',
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
                  color: '#0F3825',
                  letterSpacing: '-0.5px',
                  display: 'block',
                  lineHeight: 1.1,
                  whiteSpace: 'nowrap'
                }}
              >
                Dosa <span style={{ color: '#EA580C' }}>Junction</span>
              </span>
              <span 
                className="brand-text-sub"
                style={{ fontSize: '0.6rem', color: '#D97706', letterSpacing: '0.8px', textTransform: 'uppercase', fontWeight: 700, whiteSpace: 'nowrap', display: 'block' }}
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
                    gap: '5px',
                    fontSize: '0.92rem',
                    fontWeight: active ? 800 : 600,
                    color: active ? '#EA580C' : '#0F3825',
                    position: 'relative',
                    transition: 'all 0.2s ease',
                    padding: '6px 0',
                    textDecoration: 'none'
                  }}
                >
                  <IconComp size={15} color={active ? '#EA580C' : '#0F3825'} />
                  <span>{link.name}</span>
                  {active && (
                    <span
                      style={{
                        position: 'absolute',
                        bottom: '0px',
                        left: 0,
                        right: 0,
                        height: '2.5px',
                        backgroundColor: '#EA580C',
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
              <Globe size={15} color="#D97706" style={{ position: 'absolute', left: '10px', pointerEvents: 'none', zIndex: 1 }} />
              <select
                value={language}
                onChange={(e) => changeLanguage(e.target.value)}
                style={{
                  paddingLeft: '30px',
                  paddingRight: '22px',
                  paddingTop: '6px',
                  paddingBottom: '6px',
                  borderRadius: '30px',
                  border: '1.5px solid #EAE3D2',
                  backgroundColor: '#FFFDF9',
                  color: '#0F3825',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  outline: 'none',
                  appearance: 'none',
                  WebkitAppearance: 'none',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
                }}
                title="Select Language / भाषा चुनें"
              >
                <option value="en">English</option>
                <option value="mr">मराठी</option>
                <option value="hi">हिंदी</option>
              </select>
              <ChevronDown size={14} color="#0F3825" style={{ position: 'absolute', right: '8px', pointerEvents: 'none' }} />
            </div>

            {/* Bright Orange Order Now Pill Button with Cart Count */}
            <Link
              to="/cart"
              className="order-now-btn"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: 'linear-gradient(135deg, #EA580C 0%, #D97706 100%)',
                color: '#FFFFFF',
                padding: '0.55rem 1.25rem',
                borderRadius: '30px',
                fontWeight: 800,
                fontSize: '0.88rem',
                textDecoration: 'none',
                boxShadow: '0 4px 14px rgba(234, 88, 12, 0.35)',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap'
              }}
            >
              <ShoppingBag size={17} />
              <span className="order-now-text">Order Now</span>
              {cartCount > 0 && (
                <span
                  style={{
                    backgroundColor: '#FFFFFF',
                    color: '#EA580C',
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
              backgroundColor: '#FFFDF9',
              borderRadius: '0 0 14px 14px',
              borderBottom: '1px solid #EAE3D2',
              borderLeft: '1px solid #EAE3D2',
              borderRight: '1px solid #EAE3D2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 2
            }}
          >
            <span style={{ color: '#0F3825', fontSize: '0.7rem', lineHeight: 1 }}>🌿</span>
          </div>

        </div>
      </div>

      {/* Mobile Sub-Navbar: Horizontal Scrolling Links Row under Logo Bar */}
      <div 
        className="mobile-sub-navbar"
        style={{
          backgroundColor: '#FFFDF9',
          borderBottom: '1px solid #EAE3D2',
          padding: '8px 12px',
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
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
                color: active ? '#FFFFFF' : '#0F3825',
                backgroundColor: active ? '#EA580C' : 'rgba(15, 56, 37, 0.06)',
                border: active ? '1px solid #EA580C' : '1px solid #EAE3D2',
                textDecoration: 'none',
                whiteSpace: 'nowrap',
                flexShrink: 0,
                boxShadow: active ? '0 2px 8px rgba(234, 88, 12, 0.25)' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              <IconComp size={14} color={active ? '#FFFFFF' : '#0F3825'} />
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
