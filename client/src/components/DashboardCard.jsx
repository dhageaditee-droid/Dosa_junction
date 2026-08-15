import React from 'react';

const DashboardCard = ({ title, value, icon: Icon, color = 'emerald', subtitle }) => {
  const colorMap = {
    emerald: { bg: '#ECFDF5', text: '#059669', border: '#A7F3D0' },
    gold: { bg: '#FEF3C7', text: '#D97706', border: '#FDE68A' },
    orange: { bg: '#FFEDD5', text: '#EA580C', border: '#FDBA74' },
    blue: { bg: '#EFF6FF', text: '#2563EB', border: '#BFDBFE' },
    purple: { bg: '#F3E8FF', text: '#9333EA', border: '#E9D5FF' }
  };

  const styleConfig = colorMap[color] || colorMap.emerald;

  return (
    <div style={{
      backgroundColor: '#fff',
      borderRadius: 'var(--radius-md)',
      padding: '1.5rem',
      boxShadow: 'var(--shadow-md)',
      border: `1px solid ${styleConfig.border}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }}>
      <div>
        <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {title}
        </span>
        <div style={{ fontSize: '1.9rem', fontWeight: 800, color: 'var(--color-emerald)', marginTop: '0.2rem', fontFamily: 'var(--font-heading)' }}>
          {value}
        </div>
        {subtitle && (
          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{subtitle}</span>
        )}
      </div>

      <div style={{
        width: '52px',
        height: '52px',
        borderRadius: '50%',
        backgroundColor: styleConfig.bg,
        color: styleConfig.text,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
      }}>
        <Icon size={26} />
      </div>
    </div>
  );
};

export default DashboardCard;
