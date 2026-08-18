import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, ArrowRight, ShieldCheck, MapPin, CreditCard, User, Phone, Mail, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import OrderConfirmationModal from '../components/OrderConfirmationModal';
import SEOHead from '../components/SEOHead';
import { apiService } from '../services/api';

const CheckoutPage = () => {
  const { cartItems, clearCart, subtotal, discountAmount, appliedCoupon, tax, packingFee, deliveryFee, grandTotal } = useCart();
  const { customerUser, isCustomerAuthenticated } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const isSubmittingRef = useRef(false);

  const [formData, setFormData] = useState({
    customerName: customerUser?.name || '',
    customerPhone: customerUser?.phone || '',
    customerEmail: customerUser?.email || '',
    deliveryAddress: customerUser?.address || '',
    landmark: '',
    city: customerUser?.city || 'Sangamner',
    pincode: customerUser?.pincode || '422601',
    orderType: 'Home Delivery', // 'Home Delivery', 'Takeaway', 'Dine In'
    paymentMethod: 'Cash on Delivery', // 'Cash on Delivery', 'Pay at Restaurant'
    notes: ''
  });

  const [errors, setErrors] = useState({});
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);

  useEffect(() => {
    if (customerUser) {
      setFormData(prev => ({
        ...prev,
        customerName: prev.customerName || customerUser.name || '',
        customerPhone: prev.customerPhone || customerUser.phone || '',
        customerEmail: prev.customerEmail || customerUser.email || '',
        deliveryAddress: prev.deliveryAddress || customerUser.address || '',
        city: prev.city || customerUser.city || 'Sangamner',
        pincode: prev.pincode || customerUser.pincode || '422601'
      }));
    }
  }, [customerUser]);

  if (cartItems.length === 0) {
    navigate('/cart');
    return null;
  }

  const validate = () => {
    const errs = {};
    if (!formData.customerName.trim()) {
      errs.customerName = 'Customer name is required';
    }
    
    if (!formData.customerPhone.trim()) {
      errs.customerPhone = 'Mobile number is required';
    } else if (!/^[0-9]{10}$/.test(formData.customerPhone.trim())) {
      errs.customerPhone = 'Please enter a valid 10-digit mobile number';
    }



    // Require address fields ONLY if orderType is 'Home Delivery'
    if (formData.orderType === 'Home Delivery') {
      if (!formData.deliveryAddress.trim()) {
        errs.deliveryAddress = 'Please enter your street address / house number';
      }
      if (!formData.city.trim()) {
        errs.city = 'City name is required';
      }
      if (!formData.pincode.trim() || !/^[0-9]{6}$/.test(formData.pincode.trim())) {
        errs.pincode = 'Valid 6-digit PIN code is required';
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      setShowConfirmModal(true);
    } else {
      if (addToast) addToast('Please fill in the required address & contact fields highlighted in red.', 'error');
      window.scrollTo({ top: 100, behavior: 'smooth' });
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
        customerEmail: formData.customerEmail.trim() || null,
        deliveryAddress: formData.orderType === 'Home Delivery' ? formData.deliveryAddress.trim() : null,
        landmark: formData.orderType === 'Home Delivery' ? formData.landmark.trim() : null,
        city: formData.orderType === 'Home Delivery' ? formData.city.trim() : null,
        pincode: formData.orderType === 'Home Delivery' ? formData.pincode.trim() : null,
        orderType: formData.orderType,
        paymentMethod: formData.paymentMethod,
        couponCode: appliedCoupon ? appliedCoupon.code : null,
        notes: formData.notes.trim(),
        subtotal: parseFloat(subtotal.toFixed(2)),
        tax: parseFloat(tax.toFixed(2)),
        packingFee: parseFloat(packingFee.toFixed(2)),
        deliveryFee: parseFloat(deliveryFee.toFixed(2)),
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

      const res = await apiService.createOrder(payload);

      if (res.success) {
        if (addToast) addToast('Order placed successfully! 🎉', 'success');
        clearCart();
        navigate(`/order-success/${res.orderNumber}`, { state: { order: res.order } });
      }
    } catch (err) {
      if (addToast) addToast(err.message || 'Order submission failed.', 'error');
    } finally {
      setPlacingOrder(false);
      isSubmittingRef.current = false;
    }
  };

  return (
    <div style={{ backgroundColor: 'var(--color-cream)', padding: '2.5rem 0 5rem 0', minHeight: '85vh' }}>
      <SEOHead title="Checkout & Place Order | Dosa Junction" />

      <div className="container">
        
        <div style={{ marginBottom: '2rem' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--color-gold)', fontWeight: 700, textTransform: 'uppercase' }}>
            Finalizing Order
          </span>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--color-emerald)', fontFamily: 'var(--font-heading)', margin: 0 }}>
            Checkout
          </h1>
        </div>

        <form onSubmit={handleFormSubmit}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '2rem',
            alignItems: 'start'
          }}>
            
            {/* Left Column: Form Controls */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              {/* 1. Order Type Selection */}
              <div style={{ backgroundColor: '#FFFFFF', padding: '1.5rem', borderRadius: '20px', border: '1px solid var(--color-border)', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--color-emerald)', marginBottom: '1rem' }}>
                  1. Choose Order Type
                </h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                  {['Home Delivery', 'Takeaway', 'Dine In'].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => {
                        setFormData({ ...formData, orderType: type });
                        setErrors({});
                      }}
                      style={{
                        padding: '0.85rem 0.5rem',
                        borderRadius: '12px',
                        fontSize: '0.85rem',
                        fontWeight: 800,
                        backgroundColor: formData.orderType === type ? 'var(--color-emerald)' : '#FFFFFF',
                        color: formData.orderType === type ? '#FFFFFF' : 'var(--color-emerald)',
                        border: formData.orderType === type ? '2px solid var(--color-emerald)' : '1px solid var(--color-border)',
                        textAlign: 'center',
                        cursor: 'pointer',
                        transition: 'var(--transition-fast)'
                      }}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Customer & Address Information */}
              <div style={{ backgroundColor: '#FFFFFF', padding: '1.8rem', borderRadius: '20px', border: '1px solid var(--color-border)', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--color-emerald)', marginBottom: '1.2rem' }}>
                  2. Customer & Delivery Details
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  
                  {/* Customer Name */}
                  <div>
                    <label className="form-label">Full Name *</label>
                    <input
                      type="text"
                      value={formData.customerName}
                      onChange={(e) => {
                        setFormData({ ...formData, customerName: e.target.value });
                        if (errors.customerName) setErrors({ ...errors, customerName: null });
                      }}
                      placeholder="e.g. Anand Kumar"
                      className="form-input"
                      style={{ borderColor: errors.customerName ? '#EF4444' : undefined }}
                    />
                    {errors.customerName && <span className="form-error" style={{ color: '#EF4444', fontWeight: 700, fontSize: '0.78rem' }}>{errors.customerName}</span>}
                  </div>

                  {/* Mobile Number */}
                  <div>
                    <label className="form-label">Mobile Number (10 Digits) *</label>
                    <input
                      type="tel"
                      value={formData.customerPhone}
                      onChange={(e) => {
                        setFormData({ ...formData, customerPhone: e.target.value });
                        if (errors.customerPhone) setErrors({ ...errors, customerPhone: null });
                      }}
                      placeholder="e.g. 9876543210"
                      className="form-input"
                      style={{ borderColor: errors.customerPhone ? '#EF4444' : undefined }}
                    />
                    {errors.customerPhone && <span className="form-error" style={{ color: '#EF4444', fontWeight: 700, fontSize: '0.78rem' }}>{errors.customerPhone}</span>}
                  </div>

                  {/* Delivery Address Fields - Shown ONLY if orderType is 'Home Delivery' */}
                  {formData.orderType === 'Home Delivery' ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.4rem', padding: '1rem', backgroundColor: 'var(--color-cream-alt)', borderRadius: '12px', border: errors.deliveryAddress ? '1.5px solid #EF4444' : '1px solid var(--color-border)' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--color-emerald)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <MapPin size={16} color="var(--color-gold)" /> Delivery Address (Required for Home Delivery)
                      </span>

                      <div>
                        <label className="form-label">Flat / House No / Street Address *</label>
                        <textarea
                          rows={2}
                          value={formData.deliveryAddress}
                          onChange={(e) => {
                            setFormData({ ...formData, deliveryAddress: e.target.value });
                            if (errors.deliveryAddress) setErrors({ ...errors, deliveryAddress: null });
                          }}
                          placeholder="e.g. Flat 201, Shanti Niwas, Station Road, Sangamner"
                          className="form-input"
                          style={{ borderColor: errors.deliveryAddress ? '#EF4444' : undefined }}
                        />
                        {errors.deliveryAddress && (
                          <span className="form-error" style={{ color: '#EF4444', fontWeight: 700, fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>
                            ⚠️ {errors.deliveryAddress}
                          </span>
                        )}
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
                        <div>
                          <label className="form-label">Landmark (Optional)</label>
                          <input
                            type="text"
                            value={formData.landmark}
                            onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                            placeholder="Near Panchvati Hotel"
                            className="form-input"
                          />
                        </div>

                        <div>
                          <label className="form-label">City *</label>
                          <input
                            type="text"
                            value={formData.city}
                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                            className="form-input"
                            style={{ borderColor: errors.city ? '#EF4444' : undefined }}
                          />
                          {errors.city && <span className="form-error" style={{ color: '#EF4444', fontWeight: 700, fontSize: '0.78rem' }}>{errors.city}</span>}
                        </div>

                        <div>
                          <label className="form-label">PIN Code *</label>
                          <input
                            type="text"
                            value={formData.pincode}
                            onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                            placeholder="422601"
                            className="form-input"
                            style={{ borderColor: errors.pincode ? '#EF4444' : undefined }}
                          />
                          {errors.pincode && <span className="form-error" style={{ color: '#EF4444', fontWeight: 700, fontSize: '0.78rem' }}>{errors.pincode}</span>}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div style={{ padding: '0.8rem 1rem', backgroundColor: '#ECFDF5', borderRadius: '12px', color: '#065F46', fontSize: '0.85rem', fontWeight: 600 }}>
                      ✓ Delivery address is not required for {formData.orderType} orders. Please collect/dine at Dosa Junction restaurant counter.
                    </div>
                  )}

                  {/* Cooking Instructions */}
                  <div>
                    <label className="form-label">Cooking Instructions (Optional)</label>
                    <input
                      type="text"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="e.g. Extra crispy dosa, separate chutney, mild sambar"
                      className="form-input"
                    />
                  </div>

                </div>
              </div>

              {/* 3. Payment Method Selection */}
              <div style={{ backgroundColor: '#FFFFFF', padding: '1.8rem', borderRadius: '20px', border: '1px solid var(--color-border)', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--color-emerald)', marginBottom: '0.6rem' }}>
                  3. Payment Method
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
                  Choose your preferred payment method. Payment status will initially be marked as <strong>PENDING</strong> and confirmed by restaurant.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                  {[
                    { key: 'Cash on Delivery', label: 'Cash on Delivery (COD)', desc: 'Pay cash or UPI directly to delivery partner upon arrival' },
                    { key: 'Pay at Restaurant', label: 'Pay at Restaurant', desc: 'Pay at billing counter during Takeaway pick up or Dine In' }
                  ].map((method) => (
                    <label
                      key={method.key}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '0.8rem',
                        padding: '1rem',
                        borderRadius: '14px',
                        border: formData.paymentMethod === method.key ? '2px solid var(--color-gold)' : '1px solid var(--color-border)',
                        backgroundColor: formData.paymentMethod === method.key ? '#FEF3C7' : '#FFFFFF',
                        cursor: 'pointer',
                        transition: 'var(--transition-fast)'
                      }}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        checked={formData.paymentMethod === method.key}
                        onChange={() => setFormData({ ...formData, paymentMethod: method.key })}
                        style={{ accentColor: 'var(--color-gold)', marginTop: '3px' }}
                      />
                      <div>
                        <strong style={{ display: 'block', fontSize: '0.95rem', color: 'var(--color-emerald)' }}>
                          {method.label}
                        </strong>
                        <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                          {method.desc}
                        </span>
                      </div>
                    </label>
                  ))}
                </div>

                <div style={{ marginTop: '1rem', fontSize: '0.75rem', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
                  💡 Online payment gateway (Razorpay / PhonePe / Cards) integration is planned for Phase 2.
                </div>
              </div>

            </div>

            {/* Right Column: Order Summary & Place Order */}
            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '20px',
              padding: '1.8rem',
              border: '1px solid var(--color-border)',
              boxShadow: '0 4px 16px rgba(0,0,0,0.05)',
              position: 'sticky',
              top: '90px'
            }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', color: 'var(--color-emerald)', marginBottom: '1.2rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.6rem' }}>
                Order Summary ({cartItems.length} items)
              </h3>

              {/* Items List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.2rem', maxHeight: '220px', overflowY: 'auto' }}>
                {cartItems.map((item) => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                    <span style={{ color: 'var(--color-emerald)', fontWeight: 600 }}>
                      {item.quantity}x {item.name}
                    </span>
                    <span style={{ fontWeight: 800 }}>
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Charges Calculation */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.9rem', color: 'var(--color-text)', borderTop: '1px solid var(--color-border)', paddingTop: '1rem', marginBottom: '1.5rem' }}>
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
                  fontSize: '1.35rem',
                  fontWeight: 800,
                  color: 'var(--color-emerald)',
                  borderTop: '2px dashed var(--color-border)',
                  paddingTop: '0.8rem',
                  marginTop: '0.4rem'
                }}>
                  <span>Total Amount</span>
                  <span style={{ color: 'var(--color-gold)' }}>₹{grandTotal.toFixed(2)}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={placingOrder}
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.9rem', fontSize: '1rem', fontWeight: 800, borderRadius: '12px' }}
              >
                {placingOrder ? 'Processing...' : 'Place Order Now'} <CheckCircle2 size={20} />
              </button>

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
