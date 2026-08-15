import React from 'react';
import { UtensilsCrossed } from 'lucide-react';
import { Link } from 'react-router-dom';

const EmptyState = ({ title = 'No items found', description = 'Try adjusting your filters or search terms.', actionText, actionLink, onAction }) => {
  return (
    <div style={{
      textCenter: 'center',
      padding: '4rem 1.5rem',
      backgroundColor: '#fff',
      borderRadius: 'var(--radius-lg)',
      border: '1px border var(--color-border)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      maxWidth: '500px',
      margin: '2rem auto'
    }}>
      <div style={{
        width: '64px',
        height: '64px',
        borderRadius: '50%',
        backgroundColor: 'rgba(217, 119, 6, 0.1)',
        color: 'var(--color-gold)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '1rem'
      }}>
        <UtensilsCrossed size={32} />
      </div>

      <h3 style={{ fontSize: '1.4rem', fontFamily: 'var(--font-heading)', color: 'var(--color-emerald)', marginBottom: '0.4rem' }}>
        {title}
      </h3>
      
      <p style={{ fontSize: '0.95rem', color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
        {description}
      </p>

      {actionText && actionLink && (
        <Link to={actionLink} className="btn btn-primary btn-sm">
          {actionText}
        </Link>
      )}

      {actionText && onAction && (
        <button onClick={onAction} className="btn btn-primary btn-sm">
          {actionText}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
