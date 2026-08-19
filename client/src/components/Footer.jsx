import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Facebook, Instagram, MessageCircle, Globe, Navigation } from 'lucide-react';

const Footer = () => {
  return (
    <footer style={{ backgroundColor: '#0B0F0D', color: '#E4E4E7', fontFamily: 'var(--font-body)', borderTop: '2px solid #EA580C' }}>
      
      {/* Main Footer Body */}
      <div className="container" style={{ padding: '4rem 1rem 3rem 1rem' }}>
        <div 
          style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
            gap: '2.5rem' 
          }}
        >
          {/* Column 1: Logo & Bio */}
          <div>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none', marginBottom: '1.2rem' }}>
              <img
                src="/dosa-junction-logo.jpg"
                alt="Dosa Junction Logo"
                style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '2px solid #EA580C'
                }}
              />
              <div>
                <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', fontWeight: 900, color: '#FFFFFF', letterSpacing: '1px', display: 'block', lineHeight: 1.1 }}>
                  DOSA <span style={{ color: '#EA580C' }}>JUNCTION</span>
                </span>
                <span style={{ fontSize: '0.58rem', color: '#D97706', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 800, display: 'block' }}>
                  • PURE SOUTH INDIAN •
                </span>
              </div>
            </Link>

            <p style={{ fontSize: '0.88rem', color: '#A1A1AA', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              Serving the real taste of South India. Thank you for making us a part of your culinary journey.
            </p>

            {/* Social Icons */}
            <div style={{ display: 'flex', gap: '10px' }}>
              {[
                { icon: Facebook, href: 'https://facebook.com' },
                { icon: Instagram, href: 'https://instagram.com' },
                { icon: MessageCircle, href: 'https://wa.me/917020758779' },
                { icon: Globe, href: 'https://dosa-junction.vercel.app' }
              ].map((s, idx) => {
                const IconComponent = s.icon;
                return (
                  <a
                    key={idx}
                    href={s.href}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(255, 255, 255, 0.08)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#FFFFFF',
                      textDecoration: 'none',
                      transition: 'all 0.2s'
                    }}
                  >
                    <IconComponent size={16} />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 style={{ color: '#EA580C', fontSize: '1rem', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '1.2rem', fontFamily: 'var(--font-heading)' }}>
              QUICK LINKS
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {[
                { label: 'Home', path: '/' },
                { label: 'Menu', path: '/menu' },
                { label: 'Specials', path: '/menu?category=special-dosa' },
                { label: 'Offers', path: '/offers' },
                { label: 'About Us', path: '/about' },
                { label: 'Contact', path: '/contact' },
                { label: 'Order Now', path: '/cart' }
              ].map((item, idx) => (
                <li key={idx}>
                  <Link 
                    to={item.path} 
                    style={{ 
                      color: '#A1A1AA', 
                      fontSize: '0.88rem', 
                      textDecoration: 'none', 
                      transition: 'color 0.2s' 
                    }}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Contact Us */}
          <div>
            <h4 style={{ color: '#EA580C', fontSize: '1rem', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '1.2rem', fontFamily: 'var(--font-heading)' }}>
              CONTACT US
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.88rem', color: '#A1A1AA' }}>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <Phone size={18} color="#EA580C" style={{ flexShrink: 0 }} />
                <a href="tel:+917020758779" style={{ color: '#E4E4E7', textDecoration: 'none' }}>
                  +91 70207 58779
                </a>
              </div>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <Mail size={18} color="#EA580C" style={{ flexShrink: 0 }} />
                <span style={{ color: '#E4E4E7' }}>dosajunction.sinnar@gmail.com</span>
              </div>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <MapPin size={18} color="#EA580C" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span style={{ color: '#E4E4E7', lineHeight: 1.5 }}>
                  Sinnar Gaurav, Near Panchvati Hotel, Sinnar
                </span>
              </div>
            </div>
          </div>

          {/* Column 4: Our Location Card */}
          <div>
            <h4 style={{ color: '#EA580C', fontSize: '1rem', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '1.2rem', fontFamily: 'var(--font-heading)' }}>
              OUR LOCATION
            </h4>
            <div 
              style={{ 
                borderRadius: '12px', 
                overflow: 'hidden', 
                border: '1px solid rgba(234, 88, 12, 0.3)',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                padding: '8px'
              }}
            >
              <div 
                style={{ 
                  height: '110px', 
                  backgroundImage: 'url(https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=600&q=80)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative'
                }}
              >
                <div style={{ backgroundColor: 'rgba(11, 15, 13, 0.65)', position: 'absolute', inset: 0, borderRadius: '8px' }} />
                <div style={{ position: 'relative', textAlign: 'center', color: '#FFFFFF' }}>
                  <MapPin size={28} color="#EA580C" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }} />
                  <div style={{ fontSize: '0.78rem', fontWeight: 800, marginTop: '2px' }}>Dosa Junction Sinnar</div>
                </div>
              </div>

              <a
                href="https://maps.google.com/?q=Sinnar+Gaurav+Near+Panchvati+Hotel+Sinnar"
                target="_blank"
                rel="noreferrer"
                style={{
                  marginTop: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  backgroundColor: 'rgba(234, 88, 12, 0.15)',
                  border: '1px solid #EA580C',
                  color: '#EA580C',
                  padding: '8px',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  textDecoration: 'none',
                  transition: 'all 0.2s'
                }}
              >
                <span>DIRECTIONS</span>
                <Navigation size={14} />
              </a>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom Copyright Bar */}
      <div 
        style={{ 
          backgroundColor: '#EA580C', 
          color: '#FFFFFF', 
          fontSize: '0.82rem', 
          padding: '12px 0', 
          textAlign: 'center',
          fontWeight: 700
        }}
      >
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          <span>© {new Date().getFullYear()} Dosa Junction. All Rights Reserved.</span>
          <span>~ Made with ❤️ for food lovers! ~</span>
        </div>
      </div>

    </footer>
  );
};

export default Footer;
