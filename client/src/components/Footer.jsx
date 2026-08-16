import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Clock, Instagram, Facebook, MessageCircle, Utensils, Lock, Navigation } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer style={{ backgroundColor: 'var(--color-emerald-dark)', color: '#E5E7EB', paddingTop: '3.5rem', paddingBottom: '2rem' }}>
      <div className="container">
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '2rem',
          marginBottom: '2.5rem'
        }}>
          
          {/* Column 1: Restaurant Story */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <img
                src="/dosa-junction-logo.jpg"
                alt="Dosa Junction Logo"
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '2px solid var(--color-gold)',
                  flexShrink: 0
                }}
              />
              <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', fontWeight: 800, color: '#fff' }}>
                Dosa <span style={{ color: 'var(--color-gold)' }}>Junction</span>
              </span>
            </div>
            <p style={{ fontSize: '0.88rem', color: '#9CA3AF', lineHeight: 1.6, marginBottom: '1.25rem' }}>
              {t('footerDesc')}
            </p>

            {/* Mobile Call & WhatsApp Buttons */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '1rem' }}>
              <a
                href="tel:+917020758779"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: 'var(--color-gold)',
                  color: '#FFF',
                  padding: '6px 12px',
                  borderRadius: '14px',
                  fontSize: '0.8rem',
                  fontWeight: 800
                }}
              >
                <Phone size={14} /> {t('callUs')} +91 70207 58779
              </a>
              <a
                href="https://wa.me/917020758779"
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: '#25D366',
                  color: '#FFF',
                  padding: '6px 12px',
                  borderRadius: '14px',
                  fontSize: '0.8rem',
                  fontWeight: 800
                }}
              >
                <MessageCircle size={14} /> WhatsApp
              </a>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <a href="https://instagram.com" target="_blank" rel="noreferrer" style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D97706', transition: '0.2s' }}>
                <Instagram size={18} />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noreferrer" style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D97706', transition: '0.2s' }}>
                <Facebook size={18} />
              </a>
              <a href="https://wa.me/917020758779" target="_blank" rel="noreferrer" style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#25D366', transition: '0.2s' }}>
                <MessageCircle size={18} />
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 style={{ color: '#fff', fontSize: '1.05rem', marginBottom: '1rem', fontFamily: 'var(--font-heading)' }}>Quick Navigation</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.88rem' }}>
              <li><Link to="/" style={{ color: '#9CA3AF', transition: '0.2s' }}>Home Page</Link></li>
              <li><Link to="/menu" style={{ color: '#9CA3AF', transition: '0.2s' }}>Full South Indian Menu</Link></li>
              <li><Link to="/offers" style={{ color: '#9CA3AF', transition: '0.2s' }}>Special Offers & Combos</Link></li>
              <li><Link to="/about" style={{ color: '#9CA3AF', transition: '0.2s' }}>About Dosa Junction</Link></li>
              <li><Link to="/contact" style={{ color: '#9CA3AF', transition: '0.2s' }}>Contact Us & Google Map</Link></li>
              <li><Link to="/cart" style={{ color: '#9CA3AF', transition: '0.2s' }}>Cart & Order Checkout</Link></li>
            </ul>
          </div>

          {/* Column 3: Contact & Location */}
          <div>
            <h4 style={{ color: '#fff', fontSize: '1.05rem', marginBottom: '1rem', fontFamily: 'var(--font-heading)' }}>📍 Contact & Location</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', fontSize: '0.88rem', color: '#9CA3AF' }}>
              <div style={{ display: 'flex', gap: '0.6rem' }}>
                <MapPin size={18} color="var(--color-gold)" style={{ flexShrink: 0, marginTop: '3px' }} />
                <div>
                  <span style={{ color: '#FFF', fontWeight: 700, display: 'block' }}>Sinnar Gaurav, Near Panchvati Hotel, Sinnar</span>
                  <a
                    href="https://maps.google.com/?q=Sinnar+Gaurav,+Near+Panchvati+Hotel,+Sinnar"
                    target="_blank"
                    rel="noreferrer"
                    style={{ fontSize: '0.78rem', color: 'var(--color-gold)', display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '2px', fontWeight: 700 }}
                  >
                    <Navigation size={12} /> Get GPS Directions ➔
                  </a>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                <Phone size={18} color="var(--color-gold)" style={{ flexShrink: 0 }} />
                <a href="tel:+917020758779" style={{ color: '#FFF', fontWeight: 700 }}>+91 70207 58779</a>
              </div>
              <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                <Mail size={18} color="var(--color-gold)" style={{ flexShrink: 0 }} />
                <span>info@dosajunction.com</span>
              </div>
              <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                <Clock size={18} color="var(--color-gold)" style={{ flexShrink: 0 }} />
                <span>Open Daily: 7:00 AM – 10:30 PM</span>
              </div>
            </div>
          </div>

          {/* Column 4: Customer Favorites & Admin Login */}
          <div>
            <h4 style={{ color: '#fff', fontSize: '1.05rem', marginBottom: '1rem', fontFamily: 'var(--font-heading)' }}>Customer Favorites</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1.2rem' }}>
              {['Masala Dosa', 'Ghee Podi Roast', 'Button Idli', 'Medu Vada', 'Coffee', 'Pineapple Sheera'].map((tag) => (
                <span key={tag} style={{
                  fontSize: '0.75rem',
                  padding: '4px 10px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(255,255,255,0.06)',
                  color: '#D1D5DB',
                  border: '1px solid rgba(255,255,255,0.08)'
                }}>
                  {tag}
                </span>
              ))}
            </div>

            <Link
              to="/admin/login"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.8rem',
                color: 'var(--color-gold)',
                border: '1px solid rgba(217,119,6,0.3)',
                padding: '6px 14px',
                borderRadius: '20px',
                transition: '0.2s'
              }}
            >
              <Lock size={14} /> Admin Portal Login
            </Link>
          </div>

        </div>

        {/* Bottom Bar */}
        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.1)',
          paddingTop: '1.2rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.82rem',
          color: '#6B7280',
          gap: '0.8rem'
        }}>
          <p>© {new Date().getFullYear()} Dosa Junction Restaurant. All Rights Reserved.</p>
          <p style={{ display: 'flex', gap: '1rem' }}>
            <Link to="/contact" style={{ color: '#9CA3AF' }}>Location & Map</Link>
            <span>FSSAI Lic. #11223344556677</span>
          </p>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
