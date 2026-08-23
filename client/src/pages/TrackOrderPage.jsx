import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, PackageCheck, AlertCircle, CheckCircle, Clock, Truck, ChefHat, CheckCircle2 } from 'lucide-react';
import SEOHead from '../components/SEOHead';
import StatusBadge from '../components/StatusBadge';
import DynamicUpiPayment from '../components/DynamicUpiPayment';
import { apiService } from '../services/api';
import { useToast } from '../context/ToastContext';

const TrackOrderPage = () => {
  const [searchParams] = useSearchParams();
  const initialOrderNumber = searchParams.get('orderNumber') || '';

  const [orderNumberInput, setOrderNumberInput] = useState(initialOrderNumber);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const { addToast } = useToast();

  const handleCancelOrder = async () => {
    if (!order) return;
    const confirmCancel = window.confirm('नक्की ही ऑर्डर रद्द करायची आहे का?\n(Are you sure you want to cancel this order?)');
    if (!confirmCancel) return;

    try {
      setCancelling(true);
      const targetId = order.order_number || order.id;
      await apiService.updateOrderStatus(targetId, 'Cancelled');
      setOrder(prev => prev ? ({ ...prev, status: 'Cancelled' }) : null);
      addToast('ऑर्डर यशस्वीरीत्या रद्द केली गेली आहे (Order cancelled successfully)', 'info');
    } catch (err) {
      addToast('ऑर्डर रद्द करताना अडचण आली', 'error');
    } finally {
      setCancelling(false);
    }
  };

  useEffect(() => {
    let currentTarget = initialOrderNumber || orderNumberInput;

    if (!currentTarget) {
      try {
        const saved = JSON.parse(localStorage.getItem('dakshin_all_orders') || '[]');
        if (saved && saved.length > 0 && saved[0].order_number) {
          currentTarget = saved[0].order_number;
        }
      } catch (e) {}
    }

    if (!currentTarget) return;

    fetchOrder(currentTarget, true);

    const interval = setInterval(() => {
      fetchOrder(currentTarget, false);
    }, 3000);

    return () => clearInterval(interval);
  }, [initialOrderNumber, orderNumberInput]);

  const fetchOrder = async (ordNum, showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const res = await apiService.trackOrder(ordNum.trim());
      if (res && res.order) {
        setOrder(res.order);
      }
    } catch (err) {
      if (showLoading) {
        setOrder(null);
        if (addToast) addToast(err.message || 'Order number not found. Check your order reference.', 'error');
      }
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const handleTrackSubmit = (e) => {
    e.preventDefault();
    if (!orderNumberInput.trim()) return;
    fetchOrder(orderNumberInput);
  };

  // Dynamic tracking flow based on order type
  const isDelivery = order?.order_type === 'Home Delivery';
  const trackingSteps = isDelivery 
    ? ['Pending', 'Confirmed', 'Preparing', 'Ready', 'Out for Delivery', 'Completed']
    : ['Pending', 'Confirmed', 'Preparing', 'Ready', 'Completed'];

  const getStepStatusIndex = (currentStatus) => {
    if (currentStatus === 'Cancelled') return -1;
    const idx = trackingSteps.indexOf(currentStatus);
    return idx >= 0 ? idx : 0;
  };

  const activeStepIdx = order ? getStepStatusIndex(order.status) : 0;

  return (
    <div style={{ backgroundColor: 'var(--color-cream)', padding: '3rem 0 5rem 0', minHeight: '85vh' }}>
      <SEOHead title="Track Order Status | Dosa Junction" />

      <div className="container" style={{ maxWidth: '750px' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--color-gold)', fontWeight: 700, textTransform: 'uppercase' }}>
            Real-Time Kitchen Tracking
          </span>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--color-emerald)', fontFamily: 'var(--font-heading)', margin: '4px 0' }}>
            Track Your Order
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', margin: 0 }}>
            Live preparation progress & kitchen status updates.
          </p>
        </div>

        {/* Order Details & Visual Stepper */}
        {order && (
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '24px',
            padding: '2rem',
            boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
            border: '1px solid var(--color-border)'
          }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                  Order Number
                </span>
                <h3 style={{ fontSize: '1.3rem', color: 'var(--color-emerald)', fontFamily: 'monospace', margin: 0 }}>
                  {order.order_number}
                </h3>
              </div>
              <StatusBadge status={order.status} />
            </div>

            {/* Visual Tracking Stepper */}
            {order.status !== 'Cancelled' ? (
              <div style={{ margin: '2rem 0', padding: '0 1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
                  
                  {/* Background Track Line */}
                  <div style={{ position: 'absolute', top: '16px', left: '20px', right: '20px', height: '4px', backgroundColor: '#E2E8F0', zIndex: 1 }} />
                  
                  {/* Progress Filled Track Line */}
                  <div style={{
                    position: 'absolute',
                    top: '16px',
                    left: '20px',
                    width: `${Math.max(0, (activeStepIdx / (trackingSteps.length - 1)) * 100)}%`,
                    height: '4px',
                    backgroundColor: 'var(--color-gold)',
                    zIndex: 2,
                    transition: 'width 0.4s ease'
                  }} />

                  {trackingSteps.map((st, i) => {
                    const isCompleted = i < activeStepIdx;
                    const isCurrent = i === activeStepIdx;
                    return (
                      <div key={st} style={{ position: 'relative', zIndex: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          backgroundColor: isCurrent ? 'var(--color-gold)' : isCompleted ? '#16A34A' : '#FFFFFF',
                          color: isCurrent || isCompleted ? '#FFFFFF' : '#94A3B8',
                          border: isCurrent || isCompleted ? '3px solid #FFFFFF' : '3px solid #E2E8F0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                          fontSize: '0.85rem',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                        }}>
                          {isCompleted ? '✓' : i + 1}
                        </div>

                        <span style={{
                          fontSize: '0.72rem',
                          fontWeight: isCurrent || isCompleted ? 800 : 500,
                          color: isCurrent ? 'var(--color-gold)' : isCompleted ? '#16A34A' : '#64748B',
                          marginTop: '8px',
                          textAlign: 'center',
                          maxWidth: '75px'
                        }}>
                          {st}
                        </span>
                      </div>
                    );
                  })}

                </div>
              </div>
            ) : (
              <div style={{ backgroundColor: '#FEE2E2', color: '#991B1B', padding: '1rem', borderRadius: '12px', textAlign: 'center', fontWeight: 700, margin: '1.5rem 0' }}>
                This order was cancelled. Please contact restaurant support for assistance.
              </div>
            )}

            {/* Dynamic UPI Payment Module for UPI Orders */}
            {order && (order.payment_method?.toLowerCase().includes('upi') || order.payment_method?.toLowerCase().includes('qr')) && (
              <div style={{ marginBottom: '1.8rem' }}>
                <DynamicUpiPayment order={order} onPaymentSubmitted={(updated) => setOrder(updated)} />
              </div>
            )}

            {/* Information Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', fontSize: '0.9rem', marginBottom: '1.5rem', backgroundColor: 'var(--color-cream-alt)', padding: '1.2rem', borderRadius: '16px' }}>
              <div>
                <span style={{ color: 'var(--color-text-muted)', display: 'block', fontSize: '0.75rem' }}>Customer</span>
                <strong>{order.customer_name} ({order.customer_phone})</strong>
              </div>
              <div>
                <span style={{ color: 'var(--color-text-muted)', display: 'block', fontSize: '0.75rem' }}>Order Type</span>
                <strong>{order.order_type}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--color-text-muted)', display: 'block', fontSize: '0.75rem' }}>Payment Method</span>
                <strong>{order.payment_method} ({order.payment_status})</strong>
              </div>
              <div>
                <span style={{ color: 'var(--color-text-muted)', display: 'block', fontSize: '0.75rem' }}>Placed On</span>
                <strong>{new Date(order.created_at).toLocaleString()}</strong>
              </div>
            </div>

            {/* Items */}
            {order.items && order.items.length > 0 && (
              <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1rem' }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--color-emerald)', marginBottom: '0.6rem' }}>
                  Ordered Items
                </h4>
                {order.items.map((it, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', padding: '0.3rem 0' }}>
                    <span>{it.quantity}x {it.item_name}</span>
                    <span style={{ fontWeight: 700 }}>₹{parseFloat(it.subtotal).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-emerald)', borderTop: '2px dashed var(--color-border)', paddingTop: '1rem', marginTop: '1rem' }}>
              <span>Total Amount</span>
              <span style={{ color: 'var(--color-gold)' }}>₹{parseFloat(order.total_amount).toFixed(2)}</span>
            </div>

            {/* Cancel Order Option for Customer */}
            {['Pending', 'Confirmed', 'Preparing'].includes(order.status) && (
              <div style={{ marginTop: '1.5rem', textAlign: 'center', borderTop: '1px solid var(--color-border)', paddingTop: '1.2rem' }}>
                <button
                  onClick={handleCancelOrder}
                  disabled={cancelling}
                  style={{
                    padding: '0.65rem 1.4rem',
                    borderRadius: '30px',
                    backgroundColor: '#FEE2E2',
                    color: '#DC2626',
                    border: '1.5px solid #FCA5A5',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 2px 6px rgba(220,38,38,0.1)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <span>❌</span>
                  <span>{cancelling ? 'रद्द करत आहे...' : 'Cancel Order (ऑर्डर रद्द करा)'}</span>
                </button>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
};

export default TrackOrderPage;
