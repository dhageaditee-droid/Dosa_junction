import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, ArrowRight, Trash2, ArrowLeft, Truck, Tag, ShieldCheck, CheckCircle2, Heart, Award, Utensils } from 'lucide-react';
import { useCart } from '../context/CartContext';
import CartItem from '../components/CartItem';
import EmptyState from '../components/EmptyState';
import SEOHead from '../components/SEOHead';

const CartPage = () => {
  const {
    cartItems,
    clearCart,
    subtotal,
    discountAmount,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    tax,
    packingFee,
    deliveryFee,
    freeDeliveryThreshold,
    grandTotal
  } = useCart();

  const [couponInput, setCouponInput] = useState('');
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const navigate = useNavigate();

  const progressToFreeDelivery = Math.min(100, (subtotal / freeDeliveryThreshold) * 100);
  const remainingForFreeDelivery = Math.max(0, freeDeliveryThreshold - subtotal);

  if (cartItems.length === 0) {
    return (
      <div style={{ backgroundColor: '#FAF8F5', padding: '3rem 0', minHeight: '80vh' }}>
        <SEOHead title="Your Cart | Dosa Junction" />
        <div className="container">
          <EmptyState
            title="Your Shopping Cart is Empty"
            description="Explore our authentic South Indian menu to add crispy dosas, fluffy idlis, and filter coffee."
            actionText="Explore Food Menu"
            actionLink="/menu"
          />
        </div>
      </div>
    );
  }

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setApplyingCoupon(true);
    await applyCoupon(couponInput.trim());
    setApplyingCoupon(false);
  };

  return (
    <div style={{ backgroundColor: '#FAF8F5', padding: '2rem 0 5rem 0', minHeight: '85vh' }}>
      <SEOHead title={`Your Cart (${cartItems.length} items) | Dosa Junction`} />

      <div className="container" style={{ maxWidth: '1140px' }}>
        
        {/* Top Header Row */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <div>
            <span style={{ fontSize: '0.85rem', color: '#D97706', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Order Review
            </span>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#064E3B', fontFamily: 'var(--font-heading)', margin: 0, lineHeight: 1.1 }}>
              Your Cart
            </h1>
          </div>

          <button
            onClick={clearCart}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              color: '#DC2626',
              backgroundColor: '#FEF2F2',
              border: '1px solid #FCA5A5',
              borderRadius: '12px',
              padding: '8px 16px',
              fontSize: '0.85rem',
              fontWeight: 800,
              cursor: 'pointer'
            }}
          >
            <Trash2 size={16} /> Clear Cart
          </button>
        </div>

        {/* Free Delivery Bar */}
        <div style={{
          backgroundColor: '#FFFBEB',
          padding: '1.1rem 1.6rem',
          borderRadius: '20px',
          marginBottom: '2rem',
          border: '1.5px solid #FCD34D',
          boxShadow: '0 4px 14px rgba(0,0,0,0.02)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.92rem', color: '#78350F', fontWeight: 800, marginBottom: '0.6rem' }}>
            <Truck size={20} color="#D97706" />
            {subtotal >= freeDeliveryThreshold ? (
              <span>🎉 Congratulations! You have unlocked <strong>FREE Delivery</strong>!</span>
            ) : (
              <span>Add <strong>₹{remainingForFreeDelivery.toFixed(2)}</strong> more to get FREE Delivery!</span>
            )}
          </div>
          <div style={{ width: '100%', height: '10px', backgroundColor: '#FDE68A', borderRadius: '6px', overflow: 'hidden' }}>
            <div style={{
              width: `${progressToFreeDelivery}%`,
              height: '100%',
              background: subtotal >= freeDeliveryThreshold ? '#16A34A' : 'linear-gradient(to right, #EA580C, #D97706)',
              borderRadius: '6px',
              transition: 'width 0.4s ease'
            }} />
          </div>
        </div>

        {/* Layout Grid: Items Left, Bill Details Right */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(330px, 1fr))',
          gap: '2rem',
          alignItems: 'start'
        }}>
          
          {/* Left Column: Cart Items & Navigation */}
          <div>
            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '24px',
              padding: '1.5rem 1.8rem',
              border: '1px solid var(--color-border)',
              boxShadow: '0 6px 20px rgba(0,0,0,0.03)',
              marginBottom: '1.5rem'
            }}>
              {cartItems.map((item) => (
                <CartItem key={item.id} item={item} />
              ))}

              <div style={{ paddingTop: '1.2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--color-border)' }}>
                <Link to="/menu" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#064E3B', fontWeight: 800, fontSize: '0.92rem', textDecoration: 'none' }}>
                  <ArrowLeft size={16} /> Continue Browsing Menu
                </Link>
              </div>
            </div>



          </div>

          {/* Right Column: Bill Details Card */}
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '24px',
            padding: '1.8rem 2rem',
            border: '1px solid var(--color-border)',
            boxShadow: '0 6px 20px rgba(0,0,0,0.04)',
            position: 'sticky',
            top: '90px'
          }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', fontWeight: 900, color: '#064E3B', marginBottom: '1.2rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.6rem' }}>
              Bill Details
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.95rem', color: 'var(--color-text)', marginBottom: '1.25rem' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Item Total</span>
                <span style={{ fontWeight: 700 }}>₹{subtotal.toFixed(2)}</span>
              </div>

              {discountAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#16A34A', fontWeight: 700 }}>
                  <span>Coupon Discount</span>
                  <span>− ₹{discountAmount.toFixed(2)}</span>
                </div>
              )}



              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Packing Charge</span>
                <span>₹{packingFee.toFixed(2)}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Delivery Charge</span>
                <span>{deliveryFee === 0 ? <strong style={{ color: '#16A34A' }}>FREE</strong> : `₹${deliveryFee.toFixed(2)}`}</span>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '1.4rem',
                fontWeight: 900,
                color: '#064E3B',
                borderTop: '2px dashed var(--color-border)',
                paddingTop: '1rem',
                marginTop: '0.5rem'
              }}>
                <span>To Pay</span>
                <span style={{ color: '#EA580C' }}>₹{grandTotal.toFixed(2)}</span>
              </div>

            </div>

            <button
              onClick={() => navigate('/checkout')}
              style={{
                width: '100%',
                padding: '1.05rem',
                fontSize: '1.1rem',
                fontWeight: 900,
                borderRadius: '16px',
                backgroundColor: '#EA580C',
                color: '#FFFFFF',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 6px 20px rgba(234, 88, 12, 0.35)',
                transition: 'var(--transition-fast)'
              }}
            >
              Proceed to Checkout <ArrowRight size={20} />
            </button>

            <div style={{ marginTop: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
              <ShieldCheck size={16} color="#16A34A" /> 100% Fresh & Authentic Quality Guaranteed
            </div>

          </div>

        </div>

        {/* Why Order From Dosa Junction? Section */}
        <div style={{ marginTop: '4rem', textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', fontWeight: 900, color: '#064E3B', marginBottom: '2rem' }}>
            Why Order From Dosa Junction?
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
            
            <div style={{ backgroundColor: '#FFFFFF', padding: '1.5rem', borderRadius: '20px', border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: '1rem', textAlign: 'left' }}>
              <div style={{ backgroundColor: '#FFF7ED', color: '#EA580C', borderRadius: '50%', width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Utensils size={24} />
              </div>
              <div>
                <strong style={{ display: 'block', fontSize: '0.95rem', color: '#064E3B' }}>Authentic Taste</strong>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>South Indian Flavors</span>
              </div>
            </div>

            <div style={{ backgroundColor: '#FFFFFF', padding: '1.5rem', borderRadius: '20px', border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: '1rem', textAlign: 'left' }}>
              <div style={{ backgroundColor: '#ECFDF5', color: '#16A34A', borderRadius: '50%', width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Award size={24} />
              </div>
              <div>
                <strong style={{ display: 'block', fontSize: '0.95rem', color: '#064E3B' }}>Fresh Ingredients</strong>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Daily Sourced</span>
              </div>
            </div>

            <div style={{ backgroundColor: '#FFFFFF', padding: '1.5rem', borderRadius: '20px', border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: '1rem', textAlign: 'left' }}>
              <div style={{ backgroundColor: '#FFF7ED', color: '#EA580C', borderRadius: '50%', width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Truck size={24} />
              </div>
              <div>
                <strong style={{ display: 'block', fontSize: '0.95rem', color: '#064E3B' }}>Fast Delivery</strong>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>At Your Doorstep</span>
              </div>
            </div>

            <div style={{ backgroundColor: '#FFFFFF', padding: '1.5rem', borderRadius: '20px', border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: '1rem', textAlign: 'left' }}>
              <div style={{ backgroundColor: '#FEF2F2', color: '#EF4444', borderRadius: '50%', width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Heart size={24} />
              </div>
              <div>
                <strong style={{ display: 'block', fontSize: '0.95rem', color: '#064E3B' }}>Happy Customers</strong>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Loved by Thousands</span>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default CartPage;
