import React from 'react';
import { Star, Plus, Flame, Clock, Award } from 'lucide-react';
import { useCart } from '../context/CartContext';

const FoodCard = ({ item, onClickDetail }) => {
  const { addToCart, cartItems, updateQuantity } = useCart();
  const cartItem = cartItems.find((i) => i.id === item.id);
  const qty = cartItem ? cartItem.quantity : 0;

  const isVeg = item.is_veg !== false;
  const isAvailable = item.is_available !== false;
  const isBestseller = item.is_bestseller || item.bestseller;
  const prepTime = item.preparation_time || item.prepTime || '15 mins';

  return (
    <div className="food-card" style={{ cursor: onClickDetail ? 'pointer' : 'default' }}>
      <div 
        className="food-card-img-wrap" 
        onClick={() => onClickDetail && onClickDetail(item)}
      >
        <img
          src={item.image_url || 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=600&q=80'}
          alt={item.name}
          className="food-card-img"
          loading="lazy"
        />

        {/* Veg / Non-Veg Indicator Symbol */}
        <div style={{ position: 'absolute', top: '10px', left: '10px', zIndex: 2 }}>
          <div style={{
            width: '20px',
            height: '20px',
            border: `2px solid ${isVeg ? '#16A34A' : '#DC2626'}`,
            borderRadius: '4px',
            backgroundColor: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
          }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: isVeg ? '50%' : '0',
              backgroundColor: isVeg ? '#16A34A' : '#DC2626',
              clipPath: isVeg ? 'none' : 'polygon(50% 0%, 0% 100%, 100% 100%)'
            }} />
          </div>
        </div>

        {/* Bestseller Badge */}
        {isBestseller && (
          <div style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            backgroundColor: 'var(--color-saffron)',
            color: '#FFFFFF',
            fontSize: '0.68rem',
            fontWeight: 800,
            padding: '3px 8px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            boxShadow: '0 2px 8px rgba(234, 88, 12, 0.4)',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            <Award size={12} />
            <span>Bestseller</span>
          </div>
        )}

        {/* Out of Stock Overlay */}
        {!isAvailable && (
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 700,
            fontSize: '0.85rem',
            backdropFilter: 'blur(2px)'
          }}>
            Currently Unavailable
          </div>
        )}
      </div>

      <div className="food-card-body">
        
        <div 
          className="food-card-title-row"
          onClick={() => onClickDetail && onClickDetail(item)}
        >
          <h3 className="food-card-title">{item.name}</h3>
          
          {item.rating && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '3px',
              backgroundColor: '#FEF3C7',
              color: '#B45309',
              padding: '2px 6px',
              borderRadius: '6px',
              fontSize: '0.75rem',
              fontWeight: 700,
              flexShrink: 0
            }}>
              <Star size={12} fill="#B45309" color="#B45309" />
              <span>{parseFloat(item.rating).toFixed(1)}</span>
            </div>
          )}
        </div>

        <p 
          className="food-card-desc"
          onClick={() => onClickDetail && onClickDetail(item)}
        >
          {item.description}
        </p>

        {/* Meta row: Prep time & Spice level */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.8rem', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Clock size={13} color="var(--color-gold)" />
            <span>{prepTime}</span>
          </div>
          {item.spice_level && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '3px', textTransform: 'capitalize' }}>
              <Flame size={13} color="#EA580C" />
              <span>{item.spice_level}</span>
            </div>
          )}
        </div>

        <div className="food-card-footer">
          <div>
            <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>Price</span>
            <span className="food-price">₹{parseFloat(item.price).toFixed(2)}</span>
          </div>

          {isAvailable ? (
            qty > 0 ? (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: 'var(--color-emerald)',
                borderRadius: '8px',
                color: '#fff',
                overflow: 'hidden',
                boxShadow: '0 2px 8px rgba(15, 23, 42, 0.2)'
              }}>
                <button
                  onClick={(e) => { e.stopPropagation(); updateQuantity(item.id, qty - 1); }}
                  style={{ padding: '6px 12px', color: '#fff', fontWeight: 800, fontSize: '1rem', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  −
                </button>
                <span style={{ fontWeight: 800, padding: '0 4px', fontSize: '0.9rem' }}>{qty}</span>
                <button
                  onClick={(e) => { e.stopPropagation(); updateQuantity(item.id, qty + 1); }}
                  style={{ padding: '6px 12px', color: '#fff', fontWeight: 800, fontSize: '1rem', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  +
                </button>
              </div>
            ) : (
              <button
                onClick={(e) => { e.stopPropagation(); addToCart(item, 1); }}
                className="btn btn-primary btn-sm"
                style={{ padding: '0.45rem 1.2rem', fontWeight: 700 }}
              >
                ADD
              </button>
            )
          ) : (
            <button disabled className="btn btn-sm" style={{ backgroundColor: '#E5E7EB', color: '#9CA3AF', cursor: 'not-allowed' }}>
              Sold Out
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

export default FoodCard;
