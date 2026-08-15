import React from 'react';

const SkeletonLoader = ({ count = 6, type = 'card' }) => {
  if (type === 'card') {
    return (
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '1.5rem'
      }}>
        {Array.from({ length: count }).map((_, idx) => (
          <div key={idx} style={{ background: '#fff', borderRadius: '16px', overflow: 'hidden', padding: '1rem', border: '1px solid #E5E7EB' }}>
            <div className="skeleton" style={{ height: '180px', width: '100%', borderRadius: '12px', marginBottom: '1rem' }} />
            <div className="skeleton" style={{ height: '22px', width: '70%', marginBottom: '0.5rem' }} />
            <div className="skeleton" style={{ height: '14px', width: '90%', marginBottom: '1rem' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="skeleton" style={{ height: '24px', width: '35%' }} />
              <div className="skeleton" style={{ height: '36px', width: '30%', borderRadius: '20px' }} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'table') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {Array.from({ length: count }).map((_, idx) => (
          <div key={idx} className="skeleton" style={{ height: '48px', width: '100%', borderRadius: '8px' }} />
        ))}
      </div>
    );
  }

  return <div className="skeleton" style={{ height: '120px', width: '100%', borderRadius: '12px' }} />;
};

export default SkeletonLoader;
