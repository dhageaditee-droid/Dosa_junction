import React from 'react';
import { Trash2 } from 'lucide-react';
import { useCart } from '../context/CartContext';

const CartItem = ({ item }) => {
  const { updateQuantity, removeFromCart } = useCart();
  const price = parseFloat(item.price);
  const lineSubtotal = (price * item.quantity).toFixed(2);

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      padding: '1rem 0',
      borderBottom: '1px solid var(--color-border)'
    }}>
      
      {/* Item Image */}
      <img
        src={item.image_url || 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=600&q=80'}
        alt={item.name}
        style={{
          width: '70px',
          height: '70px',
          borderRadius: 'var(--radius-sm)',
          objectFit: 'cover',
          flexShrink: 0
        }}
      />

      {/* Item Info */}
      <div style={{ flexGrow: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '2px' }}>
          <span className="badge-veg" style={{ fontSize: '0.65rem', padding: '1px 4px' }}>VEG</span>
          <h4 style={{ fontSize: '1rem', color: 'var(--color-emerald)', fontWeight: 700 }}>{item.name}</h4>
        </div>
        <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
          ₹{price.toFixed(2)} each
        </span>
      </div>

      {/* Quantity Stepper */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        border: '1.5px solid var(--color-emerald)',
        borderRadius: 'var(--radius-full)',
        overflow: 'hidden'
      }}>
        <button
          onClick={() => updateQuantity(item.id, item.quantity - 1)}
          style={{ padding: '4px 10px', color: 'var(--color-emerald)', fontWeight: 800, fontSize: '0.9rem' }}
        >
          -
        </button>
        <span style={{ padding: '0 6px', fontSize: '0.9rem', fontWeight: 800, color: 'var(--color-emerald)' }}>
          {item.quantity}
        </span>
        <button
          onClick={() => updateQuantity(item.id, item.quantity + 1)}
          style={{ padding: '4px 10px', color: 'var(--color-emerald)', fontWeight: 800, fontSize: '0.9rem' }}
        >
          +
        </button>
      </div>

      {/* Subtotal */}
      <div style={{ width: '80px', textAlign: 'right' }}>
        <span style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--color-emerald)' }}>
          ₹{lineSubtotal}
        </span>
      </div>

      {/* Remove Button */}
      <button
        onClick={() => removeFromCart(item.id)}
        style={{ color: '#EF4444', padding: '4px', opacity: 0.8, transition: '0.2s' }}
        aria-label="Remove item"
      >
        <Trash2 size={18} />
      </button>

    </div>
  );
};

export default CartItem;
