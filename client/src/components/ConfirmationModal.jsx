import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title = 'Confirm Action', message = 'Are you sure you want to proceed?', confirmText = 'Delete', isDanger = true }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: isDanger ? '#EF4444' : 'var(--color-emerald)' }}>
            <AlertTriangle size={24} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{title}</h3>
          </div>
          <button onClick={onClose} style={{ padding: '4px' }}>
            <X size={20} color="#6B7280" />
          </button>
        </div>

        <p style={{ fontSize: '0.95rem', color: 'var(--color-text-muted)', marginBottom: '1.5rem', lineHeight: 1.5 }}>
          {message}
        </p>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <button onClick={onClose} className="btn btn-outline btn-sm">
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="btn btn-sm"
            style={{
              backgroundColor: isDanger ? '#EF4444' : 'var(--color-emerald)',
              color: '#fff'
            }}
          >
            {confirmText}
          </button>
        </div>

      </div>
    </div>
  );
};

export default ConfirmationModal;
