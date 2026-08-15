import React, { useState } from 'react';
import { X, Star, Clock, Flame, ShoppingBag, Award, CheckCircle2 } from 'lucide-react';
import { useCart } from '../context/CartContext';

const FoodDetailsModal = ({ item, onClose, onSelectRelated }) => {
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();

  if (!item) return null;

  const isVeg = item.is_veg !== false;
  const isAvailable = item.is_available !== false;

  const handleAddToCart = () => {
    addToCart(item, quantity);
    onClose();
  };

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(4px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        animation: 'fadeIn 0.2s ease-out'
      }}
      onClick={onClose}
    >
      <div 
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '20px',
          maxWidth: '650px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            zIndex: 10,
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
          }}
        >
          <X size={20} color="#0F172A" />
        </button>

        {/* Large Image Header */}
        <div style={{ position: 'relative', height: '260px', overflow: 'hidden' }}>
          <img
            src={item.image_url || 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=800&q=80'}
            alt={item.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />

          {/* Badges */}
          <div style={{ position: 'absolute', bottom: '16px', left: '16px', display: 'flex', gap: '8px' }}>
            <span style={{
              backgroundColor: isVeg ? '#16A34A' : '#DC2626',
              color: '#FFFFFF',
              fontSize: '0.75rem',
              fontWeight: 800,
              padding: '4px 10px',
              borderRadius: '20px'
            }}>
              {isVeg ? 'PURE VEG' : 'NON-VEG'}
            </span>

            {item.is_bestseller && (
              <span style={{
                backgroundColor: 'var(--color-saffron)',
                color: '#FFFFFF',
                fontSize: '0.75rem',
                fontWeight: 800,
                padding: '4px 10px',
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <Award size={14} /> Bestseller
              </span>
            )}
          </div>
        </div>

        {/* Details Content */}
        <div style={{ padding: '1.5rem' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-emerald)', marginBottom: '0.3rem' }}>
                {item.name}
              </h2>
              <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                Category: {item.category_name || 'South Indian Special'}
              </span>
            </div>

            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-gold)' }}>
                ₹{parseFloat(item.price).toFixed(2)}
              </span>
            </div>
          </div>

          <p style={{ color: 'var(--color-text)', marginTop: '1rem', lineHeight: '1.6', fontSize: '0.95rem' }}>
            {item.description}
          </p>

          {/* Quick Metrics Bar */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '0.8rem',
            margin: '1.2rem 0',
            padding: '0.8rem 1rem',
            backgroundColor: 'var(--color-cream-alt)',
            borderRadius: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Star size={18} fill="#B45309" color="#B45309" />
              <div>
                <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', display: 'block' }}>Rating</span>
                <strong style={{ fontSize: '0.85rem' }}>{item.rating ? parseFloat(item.rating).toFixed(1) : '4.5'} / 5.0</strong>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clock size={18} color="var(--color-gold)" />
              <div>
                <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', display: 'block' }}>Prep Time</span>
                <strong style={{ fontSize: '0.85rem' }}>{item.preparation_time || '15 mins'}</strong>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Flame size={18} color="#EA580C" />
              <div>
                <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', display: 'block' }}>Spice Level</span>
                <strong style={{ fontSize: '0.85rem', textTransform: 'capitalize' }}>{item.spice_level || 'Medium'}</strong>
              </div>
            </div>
          </div>

          {/* Quantity Controls & Add to Cart */}
          {isAvailable ? (
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginTop: '1.5rem' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                border: '2px solid var(--color-border)',
                borderRadius: '12px',
                overflow: 'hidden'
              }}>
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  style={{ padding: '8px 16px', fontSize: '1.2rem', fontWeight: 800, background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  −
                </button>
                <span style={{ padding: '0 12px', fontWeight: 800, fontSize: '1.1rem' }}>{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  style={{ padding: '8px 16px', fontSize: '1.2rem', fontWeight: 800, background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  +
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                className="btn btn-primary"
                style={{ flex: 1, padding: '0.8rem', fontSize: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
              >
                <ShoppingBag size={18} />
                <span>Add to Cart • ₹{(parseFloat(item.price) * quantity).toFixed(2)}</span>
              </button>
            </div>
          ) : (
            <div style={{
              backgroundColor: '#FEE2E2',
              color: '#991B1B',
              padding: '1rem',
              borderRadius: '12px',
              textAlign: 'center',
              fontWeight: 700,
              marginTop: '1rem'
            }}>
              Currently Out of Stock
            </div>
          )}

          {/* You May Also Like Section */}
          {item.relatedItems && item.relatedItems.length > 0 && (
            <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--color-border)' }}>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--color-emerald)', marginBottom: '1rem' }}>
                You May Also Like
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '0.8rem' }}>
                {item.relatedItems.map((rel) => (
                  <div
                    key={rel.id}
                    onClick={() => onSelectRelated && onSelectRelated(rel)}
                    style={{
                      border: '1px solid var(--color-border)',
                      borderRadius: '10px',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      transition: 'transform 0.2s',
                      backgroundColor: '#FAFAFA'
                    }}
                  >
                    <img
                      src={rel.image_url}
                      alt={rel.name}
                      style={{ width: '100%', height: '80px', objectFit: 'cover' }}
                    />
                    <div style={{ padding: '6px 8px' }}>
                      <strong style={{ fontSize: '0.8rem', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {rel.name}
                      </strong>
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-gold)', fontWeight: 700 }}>
                        ₹{parseFloat(rel.price).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default FoodDetailsModal;
