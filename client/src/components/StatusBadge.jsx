import React from 'react';

const StatusBadge = ({ status }) => {
  const getColors = (st) => {
    switch (st) {
      case 'Pending':
        return { bg: '#FEF3C7', text: '#B45309', border: '#FDE68A' };
      case 'Confirmed':
        return { bg: '#E0F2FE', text: '#0369A1', border: '#BAE6FD' };
      case 'Preparing':
        return { bg: '#F3E8FF', text: '#6B21A8', border: '#E9D5FF' };
      case 'Ready':
        return { bg: '#ECFDF5', text: '#047857', border: '#A7F3D0' };
      case 'Out for Delivery':
        return { bg: '#FFEDD5', text: '#C2410C', border: '#FDBA74' };
      case 'Completed':
        return { bg: '#DCFCE7', text: '#15803D', border: '#86EFAC' };
      case 'Cancelled':
        return { bg: '#FEE2E2', text: '#B91C1C', border: '#FCA5A5' };
      default:
        return { bg: '#F3F4F6', text: '#374151', border: '#E5E7EB' };
    }
  };

  const colors = getColors(status);

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: '3px 10px',
      borderRadius: '12px',
      fontSize: '0.75rem',
      fontWeight: 700,
      backgroundColor: colors.bg,
      color: colors.text,
      border: `1px solid ${colors.border}`,
      whiteSpace: 'nowrap'
    }}>
      {status}
    </span>
  );
};

export default StatusBadge;
