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
      {/* 1. Top Announcement Bar (Dark Green Background) */}
      <div 
        className="top-announcement-bar" 
        style={{
          backgroundColor: '#0F3825',
          color: '#E2E8F0',
          fontSize: '0.78rem',
          fontWeight: 600,
          padding: '6px 0',
          borderBottom: '1px solid rgba(212, 175, 55, 0.25)'
        }}
      >
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
          {/* Left Info: Location & Phone */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.4rem', flexWrap: 'wrap' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
              <MapPin size={13} color="#FFC83B" /> Sinnar Gaurav, Near Panchvati Hotel, Sinnar
            </span>
            <a href="tel:+919158075480" style={{ color: '#E2E8F0', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
              <Phone size={13} color="#FFC83B" /> +91 91580 75480
            </a>
          </div>

          {/* Right Info: Operating Hours & Social Icons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.4rem' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }} className="top-bar-hours">
              <Clock size={13} color="#FFC83B" /> Mon - Sun: 8:00 AM - 10:30 PM
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <a href="https://instagram.com" target="_blank" rel="noreferrer" style={{ color: '#E2E8F0', display: 'flex' }} aria-label="Instagram"><Instagram size={14} /></a>
              <a href="https://facebook.com" target="_blank" rel="noreferrer" style={{ color: '#E2E8F0', display: 'flex' }} aria-label="Facebook"><Facebook size={14} /></a>
              <a href="https://wa.me/919158075480" target="_blank" rel="noreferrer" style={{ color: '#E2E8F0', display: 'flex' }} aria-label="WhatsApp"><MessageCircle size={14} /></a>
            </div>
          </div>
        </div>
      </div>

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
              <span style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.35rem',
                fontWeight: 800,
                color: '#0F3825',
                letterSpacing: '-0.5px',
                display: 'block',
                lineHeight: 1.1
              }}>
                Dosa <span style={{ color: '#EA580C' }}>Junction</span>
              </span>
              <span style={{ fontSize: '0.6rem', color: '#D97706', letterSpacing: '0.8px', textTransform: 'uppercase', fontWeight: 700 }}>
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
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
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
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
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
              <span>Order Now</span>
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

            {/* Mobile Hamburger Toggle Button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="mobile-toggle-btn"
              style={{
                padding: '0.5rem',
                color: '#0F3825',
                display: 'none',
                background: 'none',
                border: 'none',
                cursor: 'pointer'
              }}
              aria-label="Toggle Navigation Menu"
            >
              {mobileOpen ? <X size={28} color="#0F3825" /> : <MenuIcon size={28} color="#0F3825" />}
            </button>
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

      {/* Mobile Drawer Navigation Screen */}
      {mobileOpen && (
        <div
          style={{
            position: 'fixed',
            inset: '110px 0 0 0',
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
          {/* Mobile Language Selector */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '0.8rem', borderBottom: '1px solid #EAE3D2' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F3825', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Globe size={18} color="#D97706" /> Select Language:
            </span>
            <div style={{ display: 'flex', gap: '6px' }}>
              {[
                { code: 'en', label: 'English' },
                { code: 'mr', label: 'मराठी' },
                { code: 'hi', label: 'हिंदी' }
              ].map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => changeLanguage(lang.code)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '12px',
                    border: '1px solid #D97706',
                    backgroundColor: language === lang.code ? '#D97706' : '#FFFFFF',
                    color: language === lang.code ? '#FFFFFF' : '#0F3825',
                    fontWeight: 800,
                    fontSize: '0.8rem',
                    cursor: 'pointer'
                  }}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#D97706', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.2rem' }}>
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
                  fontSize: '1.05rem',
                  fontWeight: isSel ? 800 : 600,
                  color: isSel ? '#EA580C' : '#0F3825',
                  padding: '0.8rem 1rem',
                  borderRadius: '12px',
                  backgroundColor: isSel ? '#FFF9ED' : '#F8FAFC',
                  textDecoration: 'none'
                }}
              >
                <LinkIcon size={20} color={isSel ? '#EA580C' : '#0F3825'} />
                <span>{link.name}</span>
              </Link>
            );
          })}

          <div style={{ margin: '0.4rem 0' }} />

          <Link
            to="/cart"
            onClick={() => setMobileOpen(false)}
            style={{
              width: '100%',
              padding: '0.9rem',
              fontSize: '1.05rem',
              fontWeight: 800,
              textAlign: 'center',
              borderRadius: '12px',
              textDecoration: 'none',
              backgroundColor: '#EA580C',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <ShoppingBag size={20} />
            <span>Order Now ({cartCount})</span>
          </Link>
        </div>
      )}

      {/* Responsive Breakpoint CSS */}
      <style>{`
        @media (max-width: 960px) {
          .desktop-nav, .desktop-nav-crest {
            display: none !important;
          }
          .mobile-toggle-btn {
            display: block !important;
          }
        }
        @media (max-width: 640px) {
          .top-bar-hours {
            display: none !important;
          }
        }
      `}</style>
    </header>
  );
};

export default Navbar;
