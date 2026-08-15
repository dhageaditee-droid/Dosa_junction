import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Clock, Instagram, Facebook, MessageCircle, Utensils, Lock } from 'lucide-react';

const Footer = () => {
  return (
    <footer style={{ backgroundColor: 'var(--color-emerald-dark)', color: '#E5E7EB', paddingTop: '4rem', paddingBottom: '2rem' }}>
      <div className="container">
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '2.5rem',
          marginBottom: '3rem'
        }}>
          
          {/* Column 1: Restaurant Story */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-gold)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Utensils size={20} />
              </div>
              <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', fontWeight: 800, color: '#fff' }}>
                Dosa <span style={{ color: 'var(--color-gold)' }}>Junction</span>
              </span>
            </div>
            <p style={{ fontSize: '0.9rem', color: '#9CA3AF', lineHeight: 1.6, marginBottom: '1.25rem' }}>
              Preserving centuries of authentic South Indian culinary heritage. Crafted with hand-ground urad dal batter, fresh coconut chutneys, and pure A2 cow ghee.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <a href="https://instagram.com" target="_blank" rel="noreferrer" style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D97706', transition: '0.2s' }}>
                <Instagram size={18} />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noreferrer" style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D97706', transition: '0.2s' }}>
                <Facebook size={18} />
              </a>
              <a href="https://whatsapp.com" target="_blank" rel="noreferrer" style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D97706', transition: '0.2s' }}>
                <MessageCircle size={18} />
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '1.2rem', fontFamily: 'var(--font-heading)' }}>Quick Navigation</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.9rem' }}>
              <li><Link to="/" style={{ color: '#9CA3AF', transition: '0.2s' }}>Home Page</Link></li>
              <li><Link to="/menu" style={{ color: '#9CA3AF', transition: '0.2s' }}>Full Menu & Categories</Link></li>
              <li><Link to="/offers" style={{ color: '#9CA3AF', transition: '0.2s' }}>Special Combos & Offers</Link></li>
              <li><Link to="/about" style={{ color: '#9CA3AF', transition: '0.2s' }}>Our Heritage & Process</Link></li>
              <li><Link to="/contact" style={{ color: '#9CA3AF', transition: '0.2s' }}>Contact & Location</Link></li>
              <li><Link to="/cart" style={{ color: '#9CA3AF', transition: '0.2s' }}>Shopping Cart & Checkout</Link></li>
            </ul>
          </div>

          {/* Column 3: Contact & Hours */}
          <div>
            <h4 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '1.2rem', fontFamily: 'var(--font-heading)' }}>Visit & Connect</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', fontSize: '0.9rem', color: '#9CA3AF' }}>
              <div style={{ display: 'flex', gap: '0.6rem' }}>
                <MapPin size={18} color="var(--color-gold)" style={{ flexShrink: 0, marginTop: '3px' }} />
                <span>Sinnar Gaurav, Near Panchvati Hotel, Sinnar</span>
              </div>
              <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                <Phone size={18} color="var(--color-gold)" style={{ flexShrink: 0 }} />
                <span>+91 70207 58779</span>
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

          {/* Column 4: Popular Items & Admin Portal */}
          <div>
            <h4 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '1.2rem', fontFamily: 'var(--font-heading)' }}>Customer Favorites</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1.5rem' }}>
              {['Masala Dosa', 'Ghee Podi Roast', 'Button Idli Sambar', 'Medu Vada', 'Degree Coffee', 'Pineapple Shira', 'Mysore Masala Dosa'].map((tag) => (
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
          paddingTop: '1.5rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.85rem',
          color: '#6B7280',
          gap: '1rem'
        }}>
          <p>© {new Date().getFullYear()} Dosa Junction Restaurant System. All Rights Reserved.</p>
          <p style={{ display: 'flex', gap: '1rem' }}>
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>FSSAI Lic. #11223344556677</span>
          </p>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
