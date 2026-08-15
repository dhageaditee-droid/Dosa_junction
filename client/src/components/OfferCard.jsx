import React from 'react';
import { Tag } from 'lucide-react';

const OfferCard = ({ offer }) => {
  return (
    <div style={{
      background: 'linear-gradient(135deg, #0B3C26 0%, #135537 100%)',
      borderRadius: 'var(--radius-lg)',
      overflow: 'hidden',
      boxShadow: 'var(--shadow-lg)',
      color: '#fff',
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      border: '1px solid rgba(217,119,6,0.3)'
    }}>
      
      <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.4rem',
          backgroundColor: 'rgba(217, 119, 6, 0.2)',
          color: 'var(--color-yellow)',
          padding: '4px 12px',
          borderRadius: '20px',
          fontSize: '0.75rem',
          fontWeight: 700,
          width: 'fit-content',
          marginBottom: '1rem',
          border: '1px solid rgba(217, 119, 6, 0.3)'
        }}>
          <Tag size={14} /> SPECIAL PROMO
        </div>

        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.6rem', color: '#fff', marginBottom: '0.5rem', lineHeight: 1.25 }}>
          {offer.title}
        </h3>

        <p style={{ fontSize: '0.95rem', color: '#D1D5DB', marginBottom: '0.5rem', lineHeight: 1.5 }}>
          {offer.description}
        </p>
      </div>

      <div style={{ position: 'relative', minHeight: '220px' }}>
        <img
          src={offer.image_url || 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=600&q=80'}
          alt={offer.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to right, #0B3C26 0%, transparent 100%)'
        }} />
      </div>

    </div>
  );
};

export default OfferCard;
