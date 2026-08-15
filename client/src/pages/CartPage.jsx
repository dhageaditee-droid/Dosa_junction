import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, ArrowRight, Trash2, ArrowLeft, Truck, Tag, ShieldCheck, CheckCircle2 } from 'lucide-react';
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
      <div style={{ backgroundColor: 'var(--color-cream)', padding: '3rem 0', minHeight: '80vh' }}>
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
    <div style={{ backgroundColor: 'var(--color-cream)', padding: '2.5rem 0 5rem 0', minHeight: '85vh' }}>
      <SEOHead title={`Shopping Cart (${cartItems.length} items)`} />

      <div className="container">
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <div>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-gold)', fontWeight: 700, textTransform: 'uppercase' }}>
              Order Review
            </span>
            <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--color-emerald)', fontFamily: 'var(--font-heading)', margin: 0 }}>
              Shopping Cart
            </h1>
          </div>

          <button
            onClick={clearCart}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              color: '#EF4444',
              backgroundColor: '#FEE2E2',
              border: 'none',
              borderRadius: '10px',
              padding: '8px 14px',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            <Trash2 size={16} /> Clear Cart
          </button>
        </div>

        {/* Free Delivery Bar */}
        <div style={{
          backgroundColor: '#FFFFFF',
          padding: '1rem 1.5rem',
          borderRadius: '16px',
          marginBottom: '2rem',
          border: '1px solid var(--color-border)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.9rem', color: 'var(--color-emerald)', fontWeight: 700, marginBottom: '0.5rem' }}>
            <Truck size={20} color="var(--color-gold)" />
            {subtotal >= freeDeliveryThreshold ? (
              <span>🎉 Congratulations! You have unlocked <strong>FREE Delivery</strong>!</span>
            ) : (
              <span>Add <strong>₹{remainingForFreeDelivery.toFixed(2)}</strong> more to get FREE Delivery!</span>
            )}
          </div>
          <div style={{ width: '100%', height: '8px', backgroundColor: '#E2E8F0', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{
              width: `${progressToFreeDelivery}%`,
              height: '100%',
              backgroundColor: subtotal >= freeDeliveryThreshold ? '#16A34A' : 'var(--color-gold)',
              transition: 'width 0.4s ease'
            }} />
          </div>
        </div>

        {/* Layout Grid: Items Left, Bill Summary Right */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '2rem',
          alignItems: 'start'
        }}>
          
          {/* Left Column: Cart Items & Coupon */}
          <div>
            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '20px',
              padding: '1.5rem 1.8rem',
              border: '1px solid var(--color-border)',
              boxShadow: '0 4px 14px rgba(0,0,0,0.04)',
              marginBottom: '1.5rem'
            }}>
              {cartItems.map((item) => (
                <CartItem key={item.id} item={item} />
              ))}

              <div style={{ paddingTop: '1.2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Link to="/menu" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-emerald)', fontWeight: 700, fontSize: '0.9rem', textDecoration: 'none' }}>
                  <ArrowLeft size={16} /> Continue Browsing Menu
                </Link>
              </div>
            </div>

            {/* Coupon Application Box */}
            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              padding: '1.2rem 1.5rem',
              border: '1px solid var(--color-border)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.8rem' }}>
                <Tag size={18} color="var(--color-gold)" />
                <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--color-emerald)', margin: 0 }}>
                  Apply Coupon Code
                </h4>
              </div>

              {appliedCoupon ? (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: '#ECFDF5',
                  border: '1px solid #A7F3D0',
                  padding: '10px 14px',
                  borderRadius: '12px',
                  color: '#065F46'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CheckCircle2 size={18} color="#059669" />
                    <div>
                      <strong style={{ display: 'block', fontSize: '0.9rem' }}>{appliedCoupon.code}</strong>
                      <span style={{ fontSize: '0.75rem' }}>Discount: ₹{discountAmount.toFixed(2)}</span>
                    </div>
                  </div>
                  <button
                    onClick={removeCoupon}
                    style={{ background: 'none', border: 'none', color: '#EF4444', fontWeight: 700, cursor: 'pointer', fontSize: '0.8rem' }}
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    placeholder="Enter code (e.g. SOUTH10)"
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      borderRadius: '10px',
                      border: '1px solid var(--color-border)',
                      outline: 'none',
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      textTransform: 'uppercase'
                    }}
                  />
                  <button
                    type="submit"
                    disabled={applyingCoupon}
                    className="btn btn-primary btn-sm"
                    style={{ padding: '0.5rem 1rem', borderRadius: '10px', fontWeight: 800 }}
                  >
                    {applyingCoupon ? 'Applying...' : 'Apply'}
                  </button>
                </form>
              )}
            </div>

          </div>

          {/* Right Column: Bill Details */}
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '20px',
            padding: '1.8rem',
            border: '1px solid var(--color-border)',
            boxShadow: '0 4px 16px rgba(0,0,0,0.05)'
          }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', color: 'var(--color-emerald)', marginBottom: '1.2rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.6rem' }}>
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
                <span style={{ color: 'var(--color-text-muted)' }}>Tax (GST 5%)</span>
                <span>₹{tax.toFixed(2)}</span>
              </div>

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
                fontSize: '1.35rem',
                fontWeight: 800,
                color: 'var(--color-emerald)',
                borderTop: '2px dashed var(--color-border)',
                paddingTop: '1rem',
                marginTop: '0.5rem'
              }}>
                <span>To Pay</span>
                <span style={{ color: 'var(--color-gold)' }}>₹{grandTotal.toFixed(2)}</span>
              </div>

            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.9rem', fontSize: '1rem', fontWeight: 800, borderRadius: '12px' }}
            >
              Proceed to Checkout <ArrowRight size={20} />
            </button>

            <div style={{ marginTop: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
              <ShieldCheck size={16} color="#16A34A" /> 100% Fresh & Authentic Quality Guaranteed
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default CartPage;
