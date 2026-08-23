import React, { useState, useEffect } from 'react';
import { useParams, useLocation, Link, useNavigate } from 'react-router-dom';
import { CheckCircle2, Clock, MapPin, Phone, ShoppingBag, ArrowRight, Compass } from 'lucide-react';
import SEOHead from '../components/SEOHead';
import StatusBadge from '../components/StatusBadge';
import DynamicUpiPayment from '../components/DynamicUpiPayment';
import { apiService } from '../services/api';

const OrderSuccessPage = () => {
  const { orderNumber } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [order, setOrder] = useState(location.state?.order || null);
  const [loading, setLoading] = useState(!location.state?.order);

  useEffect(() => {
    if (orderNumber) {
      fetchOrderDetails();
    }
  }, [orderNumber]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const res = await apiService.trackOrder(orderNumber);
      if (res.order) setOrder(res.order);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const isUpiOrder = order?.payment_method && (order.payment_method.toLowerCase().includes('upi') || order.payment_method.toLowerCase().includes('qr'));

  return (
    <div style={{ backgroundColor: 'var(--color-cream)', padding: '3rem 0 5rem 0', minHeight: '85vh' }}>
      <SEOHead title={`Order Placed #${orderNumber}`} />

      <div className="container" style={{ maxWidth: '750px' }}>
        
        {/* Success Header */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '24px',
          padding: '2.5rem',
          textAlign: 'center',
          boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
          border: '1px solid var(--color-border)',
          marginBottom: '2rem'
        }}>
          
          <div style={{
            width: '76px',
            height: '76px',
            borderRadius: '50%',
            backgroundColor: '#DCFCE7',
            color: '#16A34A',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem auto',
            boxShadow: '0 8px 20px rgba(22, 163, 74, 0.25)'
          }}>
            <CheckCircle2 size={46} />
          </div>

          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.2rem', color: 'var(--color-emerald)', marginBottom: '0.4rem' }}>
            Order Placed Successfully! 🎉
          </h1>
          <p style={{ fontSize: '1rem', color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
            Thank you for ordering with Dosa Junction. Your order reference is <strong>#{orderNumber}</strong>.
          </p>

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <button
              onClick={() => navigate(`/track-order?orderNumber=${orderNumber}`)}
              className="btn btn-primary"
              style={{ padding: '0.75rem 1.6rem', fontWeight: 800 }}
            >
              <Compass size={18} /> Track Order Progress
            </button>

            <Link
              to="/menu"
              className="btn btn-outline"
              style={{ padding: '0.75rem 1.6rem', fontWeight: 800, borderColor: 'var(--color-emerald)', color: 'var(--color-emerald)' }}
            >
              Continue Ordering <ArrowRight size={18} />
            </Link>
          </div>

        </div>

        {/* Dynamic UPI Payment Section */}
        {order && isUpiOrder && (
          <div style={{ marginBottom: '2rem' }}>
            <DynamicUpiPayment order={order} onPaymentSubmitted={(updated) => setOrder(updated)} />
          </div>
        )}

        {/* Order Details Grid */}
        {order && (
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '24px',
            padding: '2rem',
            boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
            border: '1px solid var(--color-border)'
          }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', color: 'var(--color-emerald)', marginBottom: '1.2rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.6rem' }}>
              Order Information Summary
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.2rem', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              <div>
                <span style={{ color: 'var(--color-text-muted)', display: 'block', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>Customer Name</span>
                <strong style={{ color: 'var(--color-emerald)' }}>{order.customer_name}</strong>
              </div>

              <div>
                <span style={{ color: 'var(--color-text-muted)', display: 'block', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>Mobile Number</span>
                <strong>{order.customer_phone}</strong>
              </div>

              <div>
                <span style={{ color: 'var(--color-text-muted)', display: 'block', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>Order Type</span>
                <strong style={{ color: 'var(--color-gold)' }}>{order.order_type}</strong>
              </div>

              <div>
                <span style={{ color: 'var(--color-text-muted)', display: 'block', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>Payment Method</span>
                <strong>{order.payment_method}</strong>
              </div>

              <div>
                <span style={{ color: 'var(--color-text-muted)', display: 'block', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>Payment Status</span>
                <span style={{
                  backgroundColor: order.payment_status === 'Payment Verified' ? '#DCFCE7' : order.payment_status === 'Payment Rejected' ? '#FEE2E2' : '#FEF3C7',
                  color: order.payment_status === 'Payment Verified' ? '#16A34A' : order.payment_status === 'Payment Rejected' ? '#DC2626' : '#B45309',
                  padding: '2px 8px',
                  borderRadius: '8px',
                  fontWeight: 800,
                  fontSize: '0.8rem',
                  display: 'inline-block'
                }}>
                  {order.payment_status || 'Payment Verification Pending'}
                </span>
              </div>

              <div>
                <span style={{ color: 'var(--color-text-muted)', display: 'block', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>Order Status</span>
                <StatusBadge status={order.status || 'Pending'} />
              </div>

              <div>
                <span style={{ color: 'var(--color-text-muted)', display: 'block', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>Est. Prep Time</span>
                <strong style={{ color: '#16A34A' }}>20 - 25 Mins</strong>
              </div>
            </div>

            {/* Ordered Items Table */}
            {order.items && order.items.length > 0 && (
              <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1.2rem', marginBottom: '1.2rem' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--color-emerald)', marginBottom: '0.8rem' }}>
                  Ordered Items ({order.items.length})
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {order.items.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                      <span>{item.quantity}x {item.item_name || item.name}</span>
                      <span style={{ fontWeight: 800 }}>₹{parseFloat(item.subtotal || item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '1.3rem',
              fontWeight: 800,
              color: 'var(--color-emerald)',
              borderTop: '2px dashed var(--color-border)',
              paddingTop: '1rem'
            }}>
              <span>Total Amount</span>
              <span style={{ color: 'var(--color-gold)' }}>₹{parseFloat(order.total_amount).toFixed(2)}</span>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};

export default OrderSuccessPage;
