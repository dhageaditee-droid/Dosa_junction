import React from 'react';
import { ShoppingBag, ArrowLeft, CheckCircle2, X } from 'lucide-react';

const OrderConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  orderType = 'Home Delivery',
  totalAmount = 0,
  paymentMethod = 'Cash on Delivery',
  placingOrder = false
}) => {
  if (!isOpen) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(5px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        animation: 'fadeIn 0.25s ease-out'
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'relative',
          backgroundColor: '#FFFDF9',
          border: '1px solid #EAE3D2',
          borderRadius: '24px',
          width: '100%',
          maxWidth: '430px',
          boxShadow: '0 25px 50px -12px rgba(15, 56, 37, 0.35)',
          overflow: 'hidden',
          textAlign: 'center',
          paddingTop: '2rem'
        }}
      >
        {/* Close Button (X) */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: '#F4EFE6',
            border: '1px solid #E0D6C3',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#0F3825',
            transition: 'all 0.2s ease'
          }}
          aria-label="Close"
        >
          <X size={16} />
        </button>

        {/* Top Circular Emblem with Laurel Leaf Accents */}
        <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
          {/* Laurel Leaf Wreath SVG */}
          <svg width="100" height="100" viewBox="0 0 100 100" fill="none" style={{ position: 'absolute' }}>
            <path d="M 22 50 C 22 32, 34 22, 50 22 C 66 22, 78 32, 78 50 C 78 68, 66 78, 50 78 C 34 78, 22 68, 22 50" stroke="#C8A155" strokeWidth="1.5" strokeDasharray="3 3" />
            <circle cx="16" cy="50" r="3" fill="#D4AF37" />
            <circle cx="84" cy="50" r="3" fill="#D4AF37" />
            <path d="M26 36 L20 30 M30 26 L26 18 M50 18 L50 12 M70 26 L74 18 M74 36 L80 30" stroke="#C8A155" strokeWidth="1.5" strokeLinecap="round" />
          </svg>

          {/* Deep Green Inner Circle with Gold Border */}
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: '#0F3825',
              border: '3px solid #D4AF37',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 6px 16px rgba(15, 56, 37, 0.3)',
              zIndex: 1
            }}
          >
            <ShoppingBag size={28} color="#FFC83B" />
          </div>
        </div>

        {/* Modal Title */}
        <h2
          style={{
            fontFamily: 'var(--font-heading), Georgia, serif',
            fontSize: '1.65rem',
            fontWeight: 800,
            color: '#0F3825',
            margin: '0 0 0.35rem 0',
            letterSpacing: '-0.3px'
          }}
        >
          Confirm Your Order
        </h2>

        {/* Subtext */}
        <p
          style={{
            fontSize: '0.88rem',
            fontWeight: 600,
            color: '#5A6B5C',
            margin: 0,
            lineHeight: 1.4,
            padding: '0 1.5rem'
          }}
        >
          Are you sure you want to place this<br />
          <span style={{ color: '#0F3825', fontWeight: 800 }}>{orderType}</span> order for
        </p>

        {/* Golden Dashed Price Box */}
        <div
          style={{
            backgroundColor: '#FFF8EE',
            border: '1.5px dashed #D4A359',
            borderRadius: '16px',
            padding: '0.6rem 2.2rem',
            margin: '0.85rem auto 0.35rem auto',
            display: 'inline-block',
            boxShadow: 'inset 0 1px 4px rgba(212, 163, 89, 0.12)'
          }}
        >
          <span
            style={{
              fontSize: '1.85rem',
              fontWeight: 900,
              color: '#D97706',
              letterSpacing: '-0.5px'
            }}
          >
            ₹{parseFloat(totalAmount || 0).toFixed(2)}
          </span>
        </div>

        {/* Payment Method Subtext */}
        <p
          style={{
            fontSize: '0.85rem',
            fontWeight: 600,
            color: '#4B5563',
            margin: '0 0 1.4rem 0'
          }}
        >
          via <strong style={{ color: '#0F3825' }}>{paymentMethod}</strong>?
        </p>

        {/* Action Buttons Row */}
        <div
          style={{
            display: 'flex',
            gap: '0.6rem',
            justifyContent: 'center',
            padding: '0 1rem 1.2rem 1rem',
            flexWrap: 'nowrap'
          }}
        >
          {/* No, Go Back Pill Button */}
          <button
            type="button"
            onClick={onClose}
            disabled={placingOrder}
            style={{
              flex: '1',
              minWidth: '120px',
              maxWidth: '160px',
              padding: '0.65rem 0.75rem',
              borderRadius: '50px',
              fontSize: '0.82rem',
              fontWeight: 700,
              backgroundColor: '#FFFFFF',
              color: '#0F3825',
              border: '1.5px solid #0F3825',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
              whiteSpace: 'nowrap'
            }}
          >
            <ArrowLeft size={15} /> No, Go Back
          </button>

          {/* Yes, Confirm Order Pill Button */}
          <button
            type="button"
            onClick={onConfirm}
            disabled={placingOrder}
            style={{
              flex: '1.2',
              minWidth: '140px',
              maxWidth: '190px',
              padding: '0.65rem 0.85rem',
              borderRadius: '50px',
              fontSize: '0.82rem',
              fontWeight: 800,
              background: 'linear-gradient(135deg, #0F3825 0%, #175237 100%)',
              color: '#FFFFFF',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '5px',
              boxShadow: '0 4px 14px rgba(15, 56, 37, 0.35)',
              transition: 'all 0.2s ease',
              opacity: placingOrder ? 0.75 : 1,
              whiteSpace: 'nowrap'
            }}
          >
            <CheckCircle2 size={15} color="#FFC83B" />
            {placingOrder ? 'Processing...' : 'Yes, Confirm Order'}
          </button>
        </div>

        {/* Bottom Dark Green Curved Section with Gold Lotus Accent */}
        <div
          style={{
            position: 'relative',
            backgroundColor: '#0F3825',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: '-10px',
              width: '32px',
              height: '16px',
              backgroundColor: '#0F3825',
              borderRadius: '16px 16px 0 0'
            }}
          />
          <span style={{ color: '#D4AF37', fontSize: '1rem', zIndex: 1, lineHeight: 1 }}>
            ✦
          </span>
        </div>

      </div>
    </div>
  );
};

export default OrderConfirmationModal;
