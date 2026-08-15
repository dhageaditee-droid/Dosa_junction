import React, { useState } from 'react';
import { Tag, Copy, Check, Calendar, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const OfferCard = ({ offer }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (offer.code) {
      navigator.clipboard.writeText(offer.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

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
          <Tag size={14} /> LIMITED TIME PROMO
        </div>

        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.6rem', color: '#fff', marginBottom: '0.5rem', lineHeight: 1.25 }}>
          {offer.title}
        </h3>

        <p style={{ fontSize: '0.9rem', color: '#D1D5DB', marginBottom: '1.25rem' }}>
          {offer.description}
        </p>

        {/* Promo Code Box */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          backgroundColor: 'rgba(0,0,0,0.3)',
          padding: '0.6rem 1rem',
          borderRadius: 'var(--radius-md)',
          marginBottom: '1.25rem',
          border: '1px dashed var(--color-gold)',
          width: 'fit-content'
        }}>
          <span style={{ fontSize: '0.75rem', color: '#9CA3AF', textTransform: 'uppercase' }}>CODE:</span>
          <span style={{ fontFamily: 'monospace', fontSize: '1.1rem', fontWeight: 800, color: 'var(--color-yellow)', letterSpacing: '1px' }}>
            {offer.code}
          </span>
          <button
            onClick={handleCopy}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              backgroundColor: copied ? '#16A34A' : 'var(--color-gold)',
              color: '#fff',
              fontSize: '0.75rem',
              fontWeight: 700,
              padding: '4px 10px',
              borderRadius: '6px',
              transition: '0.2s'
            }}
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? 'COPIED' : 'COPY'}
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: '#9CA3AF' }}>
          <Calendar size={14} color="var(--color-yellow)" />
          <span>Valid till {new Date(offer.end_date).toLocaleDateString()}</span>
        </div>
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
