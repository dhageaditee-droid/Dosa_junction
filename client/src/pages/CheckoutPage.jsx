import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShoppingBag,
  MapPin,
  User,
  Phone,
  Mail,
  CheckCircle2,
  AlertCircle,
  Truck,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Utensils,
  ShoppingBag as BagIcon,
  Store,
  Check,
  Lock,
  Leaf,
  Heart,
  Award
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { apiService, cleanDishName } from '../services/api';
import SEOHead from '../components/SEOHead';
import OrderConfirmationModal from '../components/OrderConfirmationModal';
import { useToast } from '../context/ToastContext';

const CheckoutPage = () => {
  const {
    cartItems,
    subtotal,
    discountAmount,
    appliedCoupon,
    tax,
    packingFee,
    deliveryFee,
    freeDeliveryThreshold,
    grandTotal,
    clearCart
  } = useCart();

  const navigate = useNavigate();
  const { addToast } = useToast();

  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    orderType: 'Home Delivery',
    deliveryAddress: '',
    landmark: '',
    city: 'Sangamner',
    pincode: '422601',
    paymentMethod: 'Online UPI Payment',
    notes: ''
  });

  const [errors, setErrors] = useState({});
  const [placingOrder, setPlacingOrder] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const isSubmittingRef = useRef(false);

  const progressToFreeDelivery = Math.min(100, (subtotal / freeDeliveryThreshold) * 100);
  const remainingForFreeDelivery = Math.max(0, freeDeliveryThreshold - subtotal);

  if (cartItems.length === 0) {
    return (
      <div style={{ backgroundColor: '#FAF8F5', padding: '5rem 0', minHeight: '80vh', textAlign: 'center' }}>
        <SEOHead title="Checkout | Dosa Junction" />
        <div className="container" style={{ maxWidth: '600px' }}>
          <ShoppingBag size={48} color="#D97706" style={{ marginBottom: '1rem' }} />
          <h2 style={{ color: '#064E3B', marginBottom: '0.5rem' }}>Your Cart is Empty</h2>
          <p style={{ color: '#6B7280', marginBottom: '1.5rem' }}>
            Please add delicious South Indian items to your cart before proceeding to checkout.
          </p>
          <Link to="/menu" className="btn btn-primary">Browse Food Menu</Link>
        </div>
      </div>
    );
  }

  const validateForm = () => {
    const newErrors = {};
    if (!formData.customerName.trim()) newErrors.customerName = 'Please enter your full name.';
    if (!formData.customerPhone.trim()) {
      newErrors.customerPhone = 'Please enter your 10-digit mobile number.';
    } else if (!/^[6-9]\d{9}$/.test(formData.customerPhone.trim())) {
      newErrors.customerPhone = 'Please enter a valid 10-digit Indian mobile number.';
    }

    if (formData.orderType === 'Home Delivery') {
      if (!formData.deliveryAddress.trim()) newErrors.deliveryAddress = 'Delivery address is required for Home Delivery.';
      if (!formData.city.trim()) newErrors.city = 'City is required.';
      if (!formData.pincode.trim()) newErrors.pincode = 'PIN Code is required.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      setShowConfirmModal(true);
    } else {
      if (addToast) addToast('Please fill in all required fields.', 'error');
    }
  };

  const handleConfirmOrder = async () => {
    if (isSubmittingRef.current || placingOrder) return;

    try {
      isSubmittingRef.current = true;
      setPlacingOrder(true);
      setShowConfirmModal(false);

      const payload = {
        customerName: formData.customerName.trim(),
        customerPhone: formData.customerPhone.trim(),
        customerEmail: formData.customerEmail.trim(),
        orderType: formData.orderType,
        deliveryAddress: formData.orderType === 'Home Delivery' ? formData.deliveryAddress.trim() : null,
        landmark: formData.orderType === 'Home Delivery' ? formData.landmark.trim() : null,
        city: formData.orderType === 'Home Delivery' ? formData.city.trim() : null,
        pincode: formData.orderType === 'Home Delivery' ? formData.pincode.trim() : null,
        paymentMethod: formData.paymentMethod,
        notes: formData.notes.trim(),
        couponCode: appliedCoupon ? appliedCoupon.code : null,
        subtotal: parseFloat(subtotal.toFixed(2)),
        tax: parseFloat(tax.toFixed(2)),
        packingFee: parseFloat((formData.orderType === 'Home Delivery' || formData.orderType === 'Takeaway' ? packingFee : 0).toFixed(2)),
        deliveryFee: parseFloat((formData.orderType === 'Home Delivery' ? deliveryFee : 0).toFixed(2)),
        discountAmount: parseFloat(discountAmount.toFixed(2)),
        totalAmount: parseFloat(grandTotal.toFixed(2)),
        items: cartItems.map(i => ({
          id: i.id,
          name: i.name,
          price: parseFloat(i.price),
          quantity: parseInt(i.quantity, 10),
          subtotal: parseFloat(i.price) * parseInt(i.quantity, 10)
        }))
      };

      const res = await apiService.createPaymentSession(payload);

      if (res.success) {
        if (addToast) addToast('Order created! Please complete your UPI payment. ⚡', 'success');
        clearCart();
        navigate(`/payment/${res.paymentRef}`, { state: { session: res.session } });
      }
    } catch (err) {
      if (addToast) addToast(err.message || 'Order submission failed.', 'error');
    } finally {
      setPlacingOrder(false);
      isSubmittingRef.current = false;
    }
  };

  return (
    <div style={{ backgroundColor: '#FAF8F5', padding: '2rem 0 5rem 0', minHeight: '85vh' }}>
      <SEOHead title="Complete Your Order | Dosa Junction" />

      <div className="container" style={{ maxWidth: '1140px' }}>
        
        {/* Header Section */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem', position: 'relative' }}>
          <span style={{ fontSize: '0.88rem', color: '#EA580C', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>
            Checkout ✦
          </span>
          <h1 style={{ fontSize: '2.8rem', fontWeight: 900, color: '#064E3B', fontFamily: 'var(--font-heading)', margin: '4px 0 0 0' }}>
            Complete Your Order
          </h1>
          <div style={{ width: '80px', height: '3px', backgroundColor: '#F59E0B', margin: '8px auto 0 auto', borderRadius: '2px' }}></div>
        </div>

        <form onSubmit={handleFormSubmit}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: '2.5rem',
            alignItems: 'start'
          }}>
            
            {/* Left Column: Form Details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.8rem' }}>
              
              {/* 1. Choose Order Type */}
              <div style={{ backgroundColor: '#FFFFFF', padding: '1.8rem', borderRadius: '24px', border: '1px solid var(--color-border)', boxShadow: '0 6px 20px rgba(0,0,0,0.03)' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#064E3B', marginBottom: '1.2rem' }}>
                  1. Choose Order Type
                </h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.85rem' }}>
                  {[
                    { id: 'Home Delivery', label: 'Home Delivery', icon: Truck },
                    { id: 'Takeaway', label: 'Takeaway', icon: BagIcon },
                    { id: 'Dine In', label: 'Dine In', icon: Store }
                  ].map((type) => {
                    const IconComp = type.icon;
                    const isSelected = formData.orderType === type.id;
                    return (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, orderType: type.id });
                          setErrors({});
                        }}
                        style={{
                          padding: '1rem 0.6rem',
                          borderRadius: '16px',
                          fontSize: '0.88rem',
                          fontWeight: 800,
                          cursor: 'pointer',
                          border: isSelected ? '2px solid #EA580C' : '1.5px solid #E5E7EB',
                          backgroundColor: isSelected ? '#FFFBEB' : '#FFFFFF',
                          color: isSelected ? '#EA580C' : '#374151',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '8px',
                          boxShadow: isSelected ? '0 4px 14px rgba(234, 88, 12, 0.15)' : 'none',
                          transition: 'var(--transition-fast)'
                        }}
                      >
                        <IconComp size={24} color={isSelected ? '#EA580C' : '#6B7280'} />
                        {type.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Customer & Delivery Details */}
              <div style={{ backgroundColor: '#FFFFFF', padding: '1.8rem', borderRadius: '24px', border: '1px solid var(--color-border)', boxShadow: '0 6px 20px rgba(0,0,0,0.03)' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#064E3B', marginBottom: '1.2rem' }}>
                  2. Customer & Delivery Details
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                  
                  {/* Name & Phone Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                    <div>
                      <label className="form-label" style={{ fontWeight: 800, color: '#064E3B' }}>Full Name *</label>
                      <input
                        type="text"
                        value={formData.customerName}
                        onChange={(e) => {
                          setFormData({ ...formData, customerName: e.target.value });
                          if (errors.customerName) setErrors({ ...errors, customerName: null });
                        }}
                        placeholder="e.g. Anand Kumar"
                        className="form-input"
                        style={{ borderColor: errors.customerName ? '#EF4444' : undefined, borderRadius: '12px' }}
                      />
                      {errors.customerName && <span className="form-error" style={{ color: '#EF4444', fontWeight: 700, fontSize: '0.78rem' }}>{errors.customerName}</span>}
                    </div>

                    <div>
                      <label className="form-label" style={{ fontWeight: 800, color: '#064E3B' }}>Mobile Number *</label>
                      <input
                        type="tel"
                        maxLength={10}
                        value={formData.customerPhone}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '');
                          setFormData({ ...formData, customerPhone: val });
                          if (errors.customerPhone) setErrors({ ...errors, customerPhone: null });
                        }}
                        placeholder="e.g. 9876543210"
                        className="form-input"
                        style={{ borderColor: errors.customerPhone ? '#EF4444' : undefined, borderRadius: '12px' }}
                      />
                      {errors.customerPhone && <span className="form-error" style={{ color: '#EF4444', fontWeight: 700, fontSize: '0.78rem' }}>{errors.customerPhone}</span>}
                    </div>
                  </div>

                  {/* Delivery Address Fields - Shown ONLY if orderType is 'Home Delivery' */}
                  {formData.orderType === 'Home Delivery' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.4rem', padding: '1.2rem', backgroundColor: '#FAF8F5', borderRadius: '18px', border: errors.deliveryAddress ? '1.5px solid #EF4444' : '1px solid #E5E7EB' }}>
                      <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#064E3B', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <MapPin size={18} color="#EA580C" /> Delivery Address (Required for Home Delivery)
                      </span>

                      <div>
                        <label className="form-label" style={{ fontWeight: 800, color: '#064E3B' }}>Flat / House No / Street Address *</label>
                        <textarea
                          rows={2}
                          value={formData.deliveryAddress}
                          onChange={(e) => {
                            setFormData({ ...formData, deliveryAddress: e.target.value });
                            if (errors.deliveryAddress) setErrors({ ...errors, deliveryAddress: null });
                          }}
                          placeholder="e.g. Flat 201, Shanti Niwas, Station Road, Sangamner"
                          className="form-input"
                          style={{ borderColor: errors.deliveryAddress ? '#EF4444' : undefined, borderRadius: '12px' }}
                        />
                        {errors.deliveryAddress && (
                          <span className="form-error" style={{ color: '#EF4444', fontWeight: 700, fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>
                            ⚠️ {errors.deliveryAddress}
                          </span>
                        )}
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.85rem' }}>
                        <div>
                          <label className="form-label" style={{ fontWeight: 700 }}>Landmark (Optional)</label>
                          <input
                            type="text"
                            value={formData.landmark}
                            onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                            placeholder="Near Panchvati Hotel"
                            className="form-input"
                            style={{ borderRadius: '10px' }}
                          />
                        </div>

                        <div>
                          <label className="form-label" style={{ fontWeight: 700 }}>City *</label>
                          <input
                            type="text"
                            value={formData.city}
                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                            className="form-input"
                            style={{ borderColor: errors.city ? '#EF4444' : undefined, borderRadius: '10px' }}
                          />
                          {errors.city && <span className="form-error" style={{ color: '#EF4444', fontWeight: 700, fontSize: '0.78rem' }}>{errors.city}</span>}
                        </div>

                        <div>
                          <label className="form-label" style={{ fontWeight: 700 }}>PIN Code *</label>
                          <input
                            type="text"
                            maxLength={6}
                            value={formData.pincode}
                            onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                            className="form-input"
                            style={{ borderColor: errors.pincode ? '#EF4444' : undefined, borderRadius: '10px' }}
                          />
                          {errors.pincode && <span className="form-error" style={{ color: '#EF4444', fontWeight: 700, fontSize: '0.78rem' }}>{errors.pincode}</span>}
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              </div>

              {/* 3 Feature Pills Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                <div style={{ backgroundColor: '#FFFFFF', padding: '1rem 0.8rem', borderRadius: '16px', border: '1px solid var(--color-border)', textAlign: 'center' }}>
                  <Truck size={22} color="#EA580C" style={{ margin: '0 auto 4px auto' }} />
                  <strong style={{ display: 'block', fontSize: '0.85rem', color: '#064E3B' }}>Fast Delivery</strong>
                  <span style={{ fontSize: '0.74rem', color: '#6B7280' }}>On time, every time!</span>
                </div>

                <div style={{ backgroundColor: '#FFFFFF', padding: '1rem 0.8rem', borderRadius: '16px', border: '1px solid var(--color-border)', textAlign: 'center' }}>
                  <Leaf size={22} color="#16A34A" style={{ margin: '0 auto 4px auto' }} />
                  <strong style={{ display: 'block', fontSize: '0.85rem', color: '#064E3B' }}>Hygienic Food</strong>
                  <span style={{ fontSize: '0.74rem', color: '#6B7280' }}>100% Clean & Safe</span>
                </div>

                <div style={{ backgroundColor: '#FFFFFF', padding: '1rem 0.8rem', borderRadius: '16px', border: '1px solid var(--color-border)', textAlign: 'center' }}>
                  <Heart size={22} color="#EA580C" style={{ margin: '0 auto 4px auto' }} />
                  <strong style={{ display: 'block', fontSize: '0.85rem', color: '#064E3B' }}>Best Quality</strong>
                  <span style={{ fontSize: '0.74rem', color: '#6B7280' }}>Fresh & Authentic</span>
                </div>
              </div>

              {/* Bottom Trust Banner */}
              <div style={{
                backgroundColor: '#F0FDF4',
                border: '1.5px solid #BBF7D0',
                borderRadius: '20px',
                padding: '1.2rem 1.4rem',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <ShieldCheck size={28} color="#16A34A" style={{ flexShrink: 0 }} />
                <div>
                  <strong style={{ color: '#15803D', fontSize: '0.95rem', display: 'block' }}>Your Data is Safe With Us</strong>
                  <span style={{ fontSize: '0.82rem', color: '#166534' }}>We never share your details with anyone. Secure & trusted checkout.</span>
                </div>
              </div>

            </div>

            {/* Right Column: Sticky Order Summary Sidebar */}
            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '24px',
              padding: '1.8rem 2rem',
              border: '1px solid var(--color-border)',
              boxShadow: '0 6px 20px rgba(0,0,0,0.04)',
              position: 'sticky',
              top: '90px'
            }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.35rem', fontWeight: 900, color: '#064E3B', marginBottom: '1.2rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.6rem' }}>
                Order Summary ({cartItems.length} {cartItems.length === 1 ? 'Item' : 'Items'})
              </h3>

              {/* Items List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.2rem', maxHeight: '220px', overflowY: 'auto' }}>
                {cartItems.map((item) => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 800, color: '#064E3B' }}>{item.quantity}x</span>
                      <span style={{ fontWeight: 700, color: '#1F2937' }}>{cleanDishName(item.name)}</span>
                    </div>
                    <span style={{ fontWeight: 800, color: '#111827' }}>
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem', fontSize: '0.9rem', color: 'var(--color-text)', borderTop: '1px solid var(--color-border)', paddingTop: '1rem', marginBottom: '1.2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Item Subtotal</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>

                {discountAmount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#16A34A', fontWeight: 700 }}>
                    <span>Coupon Discount</span>
                    <span>− ₹{discountAmount.toFixed(2)}</span>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>GST (5%)</span>
                  <span>₹{tax.toFixed(2)}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Packing Charge</span>
                  <span>₹{(formData.orderType === 'Home Delivery' || formData.orderType === 'Takeaway' ? packingFee : 0).toFixed(2)}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Delivery Charge</span>
                  <span>
                    {formData.orderType !== 'Home Delivery' ? 'N/A' : (deliveryFee === 0 ? <strong style={{ color: '#16A34A' }}>FREE</strong> : `₹${deliveryFee.toFixed(2)}`)}
                  </span>
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '1.5rem',
                  fontWeight: 900,
                  color: '#064E3B',
                  borderTop: '2px dashed var(--color-border)',
                  paddingTop: '0.9rem',
                  marginTop: '0.4rem'
                }}>
                  <span>Total Amount</span>
                  <span style={{ color: '#EA580C' }}>₹{grandTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Free Delivery Bar in Sidebar */}
              <div style={{ backgroundColor: '#FFFBEB', border: '1px solid #FCD34D', borderRadius: '14px', padding: '0.85rem 1rem', marginBottom: '1.2rem' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#B45309', marginBottom: '4px' }}>
                  🎉 Add ₹{remainingForFreeDelivery.toFixed(2)} more to get FREE Delivery!
                </div>
                <div style={{ width: '100%', height: '6px', backgroundColor: '#FDE68A', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${progressToFreeDelivery}%`, height: '100%', backgroundColor: '#EA580C' }} />
                </div>
              </div>

              {/* Checklist Bullet Points */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.8rem', color: '#4B5563', marginBottom: '1.4rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Check size={14} color="#16A34A" /> No hidden charges
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Check size={14} color="#16A34A" /> Live order tracking
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Check size={14} color="#16A34A" /> Cash / Online payment
                </div>
              </div>

              {/* Main Orange Action Button */}
              <button
                type="submit"
                disabled={placingOrder}
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
                {placingOrder ? 'Creating Payment Session...' : 'Place Order Now'}
                <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.25)', borderRadius: '50%', width: '26px', height: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ArrowRight size={16} color="#FFFFFF" />
                </div>
              </button>

              <div style={{ marginTop: '0.8rem', textAlign: 'center', fontSize: '0.76rem', color: 'var(--color-text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                <Lock size={12} color="#16A34A" /> Secure & Safe Checkout
              </div>

            </div>

          </div>
        </form>

      </div>

      {/* Traditional South Indian Order Confirmation Modal */}
      <OrderConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmOrder}
        orderType={formData.orderType}
        totalAmount={grandTotal}
        paymentMethod={formData.paymentMethod}
        placingOrder={placingOrder}
      />

    </div>
  );
};

export default CheckoutPage;
