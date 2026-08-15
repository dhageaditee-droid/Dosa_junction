import React from 'react';
import { Utensils } from 'lucide-react';

const Loader = ({ message = 'Brewing authentic flavors...' }) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '4rem 1rem',
      gap: '1rem'
    }}>
      <div style={{
        width: '56px',
        height: '56px',
        borderRadius: '50%',
        backgroundColor: 'var(--color-emerald)',
        color: 'var(--color-gold)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        animation: 'pulse 1.5s infinite ease-in-out',
        boxShadow: '0 10px 25px rgba(11,60,38,0.3)'
      }}>
        <Utensils size={28} />
      </div>
      <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-emerald)' }}>
        {message}
      </span>
      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.85; }
        }
      `}</style>
    </div>
  );
};

export default Loader;
