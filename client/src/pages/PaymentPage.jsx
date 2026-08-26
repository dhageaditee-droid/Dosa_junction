import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import { Clock, ShieldCheck, CheckCircle2, AlertTriangle, ExternalLink, Upload, FileCheck, ArrowRight, Compass, RefreshCw, Copy } from 'lucide-react';
import SEOHead from '../components/SEOHead';
import { apiService } from '../services/api';
import { useToast } from '../context/ToastContext';

const PaymentPage = () => {
  const { paymentRef } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [session, setSession] = useState(location.state?.session || null);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(!location.state?.session);
  const [utrNumber, setUtrNumber] = useState('');
  const [screenshotPreview, setScreenshotPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchSessionDetails = async () => {
    if (!paymentRef) return;
    try {
      const res = await apiService.getPaymentSession(paymentRef);
      if (res && res.session) {
        setSession(res.session);
        if (res.order) {
          setOrder(res.order);
        }
        if (res.session.utr_number && !utrNumber) {
          setUtrNumber(res.session.utr_number);
        }
        if (res.session.payment_screenshot && !screenshotPreview) {
          setScreenshotPreview(res.session.payment_screenshot);
        }
      }
    } catch (e) {
      console.error('Error fetching payment session:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessionDetails();
    // Auto-poll session status every 5 seconds to detect Admin approval/rejection
    const interval = setInterval(fetchSessionDetails, 5000);
    return () => clearInterval(interval);
  }, [paymentRef]);

  const totalAmountNum = parseFloat(session?.total_amount || 0);
  const totalAmountFormatted = totalAmountNum.toFixed(2);
  const upiId = (session?.upi_id || '11424716@indus').trim();

  // Clean UPI URIs (without am & tn parameters to avoid P2P VPA intent errors)
  const encodedName = encodeURIComponent('Dosa Junction');
  const cleanUpiUri = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodedName}`;
  const phonepeUri = `phonepe://pay?pa=${encodeURIComponent(upiId)}&pn=${encodedName}`;
  const gpayUri = `gpay://upi/pay?pa=${encodeURIComponent(upiId)}&pn=${encodedName}`;
  const paytmUri = `paytmmp://pay?pa=${encodeURIComponent(upiId)}&pn=${encodedName}`;

  const copyToClipboard = (text, typeLabel) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text);
      if (addToast) addToast(`${typeLabel} copied to clipboard!`, 'success');
    } else {
      const input = document.createElement('input');
      input.value = text;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      if (addToast) addToast(`${typeLabel} copied to clipboard!`, 'success');
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('Screenshot file size must be less than 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setScreenshotPreview(reader.result);
      setErrorMsg('');
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitProof = async (e) => {
    e.preventDefault();
    if (!screenshotPreview) {
      setErrorMsg('Please upload a screenshot of your payment completion screen.');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg('');
      const res = await apiService.submitPaymentSessionProof(paymentRef, {
        utrNumber: utrNumber ? utrNumber.trim() : '',
        paymentScreenshot: screenshotPreview
      });

      if (res && res.success) {
        setSession(res.session);
        if (addToast) addToast('Payment proof submitted! Verification is pending.', 'success');
      }
    } catch (err) {
      const msg = err.message || 'Failed to submit payment proof.';
      setErrorMsg(msg);
      if (addToast) addToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ backgroundColor: 'var(--color-cream)', padding: '5rem 0', minHeight: '80vh', textAlign: 'center' }}>
        <SEOHead title="Loading Payment Session..." />
        <div className="container">
          <RefreshCw size={36} className="spin-slow" style={{ color: 'var(--color-gold)', marginBottom: '1rem' }} />
          <h2 style={{ color: 'var(--color-emerald)' }}>Loading Payment Details...</h2>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div style={{ backgroundColor: 'var(--color-cream)', padding: '5rem 0', minHeight: '80vh', textAlign: 'center' }}>
        <SEOHead title="Payment Session Not Found" />
        <div className="container" style={{ maxWidth: '600px' }}>
          <AlertTriangle size={48} color="#DC2626" style={{ marginBottom: '1rem' }} />
          <h2 style={{ color: 'var(--color-emerald)', marginBottom: '0.5rem' }}>Payment Session Not Found</h2>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
            We could not find a payment session for reference <strong>#{paymentRef}</strong>.
          </p>
          <Link to="/menu" className="btn btn-primary">Return to Menu</Link>
        </div>
      </div>
    );
  }
  
  const isApproved = session.status === 'Approved' || !!session.order_number;
  const isPending = session.status === 'Verification Pending';
  const isRejected = session.status === 'Rejected';

  const cartItems = typeof session.cart_items === 'string' ? JSON.parse(session.cart_items) : (session.cart_items || []);

  return (
    <div style={{ backgroundColor: 'var(--color-cream)', padding: '3rem 0 5rem 0', minHeight: '85vh' }}>
      <SEOHead title={`Payment for Dosa Junction #${paymentRef}`} />

      <div className="container" style={{ maxWidth: '750px' }}>
        
        {/* Main Header Box */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '24px',
          padding: '2rem 2.5rem',
          textAlign: 'center',
          boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
          border: '1px solid var(--color-border)',
          marginBottom: '2rem'
        }}>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', color: 'var(--color-emerald)', marginBottom: '0.2rem' }}>
            Payment for Dosa Junction
          </h1>
          <div style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
            Payment Reference: <strong style={{ color: 'var(--color-emerald)', fontFamily: 'monospace' }}>{paymentRef}</strong>
          </div>

          <div style={{
            display: 'inline-block',
            backgroundColor: '#FFF8EE',
            border: '2px dashed #D4A359',
            borderRadius: '20px',
            padding: '0.8rem 2.5rem',
            margin: '0.5rem 0 1.2rem 0'
          }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', display: 'block', textTransform: 'uppercase', fontWeight: 700 }}>
              Payable Amount
            </span>
            <span style={{ fontSize: '2.4rem', fontWeight: 900, color: '#D97706', letterSpacing: '-0.5px' }}>
              ₹{totalAmountFormatted}
            </span>
          </div>

          {/* Status Badges */}
          {isApproved ? (
            <div style={{
              backgroundColor: '#DCFCE7',
              border: '2px solid #16A34A',
              borderRadius: '16px',
              padding: '1.25rem',
              marginTop: '1rem',
              textAlign: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#15803D', fontWeight: 900, fontSize: '1.3rem' }}>
                <CheckCircle2 size={28} color="#16A34A" /> Payment Verified ✓
              </div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#064E3B', margin: '0.4rem 0 0.2rem 0' }}>
                Order Placed Successfully! 🎉
              </h2>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#D97706', marginBottom: '1.2rem' }}>
                Order ID: <strong style={{ color: '#064E3B' }}>{session.order_number || order?.order_number || 'DJ-CONFIRMED'}</strong>
              </div>
              <button
                onClick={() => navigate(`/track-order?orderNumber=${session.order_number || order?.order_number}`)}
                className="btn btn-primary"
                style={{ padding: '0.8rem 2rem', fontWeight: 800, fontSize: '1rem' }}
              >
                <Compass size={18} /> Track Order Progress
              </button>
            </div>
          ) : isPending ? (
            <div style={{
              backgroundColor: '#EFF6FF',
              border: '2px solid #3B82F6',
              borderRadius: '16px',
              padding: '1.25rem',
              marginTop: '1rem',
              textAlign: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#1E40AF', fontWeight: 800, fontSize: '1.15rem' }}>
                <Clock size={24} color="#3B82F6" className="spin-slow" /> Payment Status: Verification Pending
              </div>
              <p style={{ margin: '0.6rem 0 0 0', color: '#1E3A8A', fontSize: '0.95rem', fontWeight: 700 }}>
                Payment submitted successfully.
              </p>
              <p style={{ margin: '0.2rem 0 0 0', color: '#2563EB', fontSize: '0.88rem' }}>
                Your payment is being verified by restaurant. Your order will be placed after payment verification.
              </p>
            </div>
          ) : isRejected ? (
            <div style={{
              backgroundColor: '#FEF2F2',
              border: '2px solid #EF4444',
              borderRadius: '16px',
              padding: '1.25rem',
              marginTop: '1rem',
              textAlign: 'left'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#991B1B', fontWeight: 800, fontSize: '1.15rem' }}>
                <AlertTriangle size={24} color="#EF4444" /> Payment verification failed.
              </div>
              <p style={{ margin: '0.5rem 0 0 0', color: '#B91C1C', fontSize: '0.92rem', fontWeight: 700 }}>
                Rejection Reason: {session.rejection_reason || 'Payment verification rejected by admin.'}
              </p>
              <p style={{ margin: '0.4rem 0 0 0', color: '#7F1D1D', fontSize: '0.84rem' }}>
                Please re-check your payment screenshot and 12-digit UTR number below, then click "Submit Payment Proof" to re-submit.
              </p>
            </div>
          ) : null}

        </div>

        {/* Static UPI Scanner Box (Only shown if NOT approved) */}
        {!isApproved && (
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '24px',
            padding: '2rem',
            boxShadow: '0 8px 30px rgba(0,0,0,0.06)',
            border: '1px solid var(--color-border)',
            textAlign: 'center',
            marginBottom: '2rem'
          }}>
            <span style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--color-text-muted)', fontWeight: 700, letterSpacing: '0.5px' }}>
              Dosa Junction Official Scanner
            </span>
            
            <h2 style={{
              fontSize: '1.9rem',
              fontWeight: 900,
              color: 'var(--color-emerald)',
              fontFamily: 'var(--font-heading)',
              margin: '4px 0 1.2rem 0'
            }}>
              Pay ₹{totalAmountFormatted}
            </h2>

            {/* User Static QR Image */}
            <div style={{
              display: 'inline-block',
              backgroundColor: '#FFFFFF',
              padding: '1rem',
              borderRadius: '20px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.08)',
              border: '2px dashed var(--color-gold)',
              marginBottom: '1.2rem'
            }}>
              <img
                src="/assets/dosa_junction_qr.png"
                alt="Dosa Junction Official UPI QR Code"
                style={{
                  width: '240px',
                  height: '240px',
                  borderRadius: '12px',
                  objectFit: 'contain',
                  display: 'block'
                }}
              />
            </div>

            <p style={{
              fontSize: '0.95rem',
              fontWeight: 800,
              color: 'var(--color-emerald)',
              margin: '0.5rem 0 1rem 0'
            }}>
              Scan with Google Pay, PhonePe, Paytm or any UPI app
            </p>

            {/* Quick Copy UPI ID & Amount Banner */}
            <div style={{
              backgroundColor: '#FEF3C7',
              borderRadius: '16px',
              padding: '1rem 1.25rem',
              marginBottom: '1.4rem',
              border: '1.5px solid #FCD34D',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.8rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ textAlign: 'left' }}>
                  <span style={{ fontSize: '0.76rem', color: '#B45309', fontWeight: 700, display: 'block', textTransform: 'uppercase' }}>Dosa Junction UPI ID:</span>
                  <strong style={{ fontSize: '1.1rem', color: '#78350F', fontFamily: 'monospace' }}>{upiId}</strong>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(upiId, 'UPI ID')}
                  className="btn btn-sm"
                  style={{ backgroundColor: '#D97706', color: '#FFFFFF', border: 'none', fontWeight: 800, borderRadius: '8px', padding: '0.4rem 0.8rem', fontSize: '0.82rem', cursor: 'pointer' }}
                >
                  📋 Copy UPI ID
                </button>
              </div>

              <div style={{ borderTop: '1px dashed #F59E0B', paddingTop: '0.6rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ textAlign: 'left' }}>
                  <span style={{ fontSize: '0.76rem', color: '#B45309', fontWeight: 700, display: 'block', textTransform: 'uppercase' }}>Payable Amount:</span>
                  <strong style={{ fontSize: '1.1rem', color: '#78350F' }}>₹{totalAmountFormatted}</strong>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(totalAmountFormatted, 'Amount')}
                  className="btn btn-sm"
                  style={{ backgroundColor: '#B45309', color: '#FFFFFF', border: 'none', fontWeight: 800, borderRadius: '8px', padding: '0.4rem 0.8rem', fontSize: '0.82rem', cursor: 'pointer' }}
                >
                  📋 Copy Amount
                </button>
              </div>
            </div>

            {/* Direct App Deep Links */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', width: '100%', maxWidth: '420px', margin: '0 auto 1.2rem auto' }}>
              <a
                href={cleanUpiUri}
                className="btn"
                style={{
                  backgroundColor: '#0F3825',
                  color: '#FFFFFF',
                  padding: '0.85rem 1.4rem',
                  borderRadius: '12px',
                  fontWeight: 800,
                  fontSize: '0.95rem',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 12px rgba(15, 56, 37, 0.25)'
                }}
              >
                <ExternalLink size={18} /> Open Any UPI App (GPay / PhonePe / Paytm)
              </a>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                <a
                  href={phonepeUri}
                  style={{
                    backgroundColor: '#5F259F',
                    color: '#FFFFFF',
                    padding: '0.65rem 0.5rem',
                    borderRadius: '10px',
                    fontWeight: 800,
                    fontSize: '0.82rem',
                    textDecoration: 'none',
                    textAlign: 'center'
                  }}
                >
                  💜 PhonePe
                </a>

                <a
                  href={gpayUri}
                  style={{
                    backgroundColor: '#1A73E8',
                    color: '#FFFFFF',
                    padding: '0.65rem 0.5rem',
                    borderRadius: '10px',
                    fontWeight: 800,
                    fontSize: '0.82rem',
                    textDecoration: 'none',
                    textAlign: 'center'
                  }}
                >
                  💙 Google Pay
                </a>

                <a
                  href={paytmUri}
                  style={{
                    backgroundColor: '#00BAF2',
                    color: '#FFFFFF',
                    padding: '0.65rem 0.5rem',
                    borderRadius: '10px',
                    fontWeight: 800,
                    fontSize: '0.82rem',
                    textDecoration: 'none',
                    textAlign: 'center'
                  }}
                >
                  🔷 Paytm
                </a>
              </div>
            </div>

          </div>
        )}

        {/* Payment Proof Submission Form (Required: Screenshot + UTR) */}
        {!isApproved && (
          <form onSubmit={handleSubmitProof} style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '24px',
            padding: '2rem',
            boxShadow: '0 8px 30px rgba(0,0,0,0.06)',
            border: '1px solid var(--color-border)',
            marginBottom: '2rem'
          }}>
            <h3 style={{
              fontSize: '1.25rem',
              fontWeight: 800,
              color: 'var(--color-emerald)',
              marginBottom: '0.3rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <FileCheck size={22} color="var(--color-gold)" /> Payment completed? Upload payment screenshot
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
              Please upload your payment screenshot below. Your order will be confirmed after admin verification.
            </p>

            {errorMsg && (
              <div style={{
                backgroundColor: '#FEF2F2',
                color: '#991B1B',
                padding: '0.85rem 1.1rem',
                borderRadius: '12px',
                fontSize: '0.88rem',
                fontWeight: 700,
                marginBottom: '1.2rem',
                border: '1.5px solid #FCA5A5'
              }}>
                ⚠️ {errorMsg}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.4rem' }}>
              {/* Mandatory Screenshot Upload */}
              <div>
                <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 800, color: 'var(--color-emerald)', marginBottom: '6px' }}>
                  Payment Screenshot *
                </label>

                <div style={{
                  border: '2px dashed var(--color-border)',
                  borderRadius: '14px',
                  padding: '1.4rem',
                  textAlign: 'center',
                  backgroundColor: '#FAFAFA',
                  cursor: 'pointer'
                }}>
                  {screenshotPreview ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.8rem' }}>
                      <img
                        src={screenshotPreview}
                        alt="Payment Screenshot Preview"
                        style={{ maxHeight: '220px', borderRadius: '12px', objectFit: 'contain', border: '1px solid #E5E7EB' }}
                      />
                      <label className="btn btn-outline btn-sm" style={{ cursor: 'pointer', fontSize: '0.82rem' }}>
                        <Upload size={14} /> Change Screenshot
                        <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
                      </label>
                    </div>
                  ) : (
                    <label style={{ cursor: 'pointer', display: 'block' }}>
                      <Upload size={36} color="var(--color-gold)" style={{ margin: '0 auto 8px auto' }} />
                      <span style={{ display: 'block', fontSize: '0.95rem', fontWeight: 800, color: 'var(--color-emerald)' }}>
                        Click to choose payment screenshot
                      </span>
                      <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                        JPG, PNG, WEBP (Max 5MB)
                      </span>
                      <input type="file" accept="image/*" onChange={handleImageChange} required style={{ display: 'none' }} />
                    </label>
                  )}
                </div>
              </div>

              {/* Submit Payment Proof Button */}
              <button
                type="submit"
                disabled={submitting}
                className="btn btn-primary"
                style={{
                  width: '100%',
                  padding: '0.9rem',
                  fontSize: '1.05rem',
                  fontWeight: 800,
                  borderRadius: '12px',
                  marginTop: '0.4rem'
                }}
              >
                {submitting ? 'Submitting Payment Proof...' : 'Submit Payment Proof'} <ShieldCheck size={20} />
              </button>

            </div>
          </form>
        )}

        {/* Cart & Customer Summary Box */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '24px',
          padding: '2rem',
          boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
          border: '1px solid var(--color-border)'
        }}>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', color: 'var(--color-emerald)', marginBottom: '1rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>
            Payment Session Order Summary
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', fontSize: '0.88rem', marginBottom: '1.2rem' }}>
            <div>
              <span style={{ color: 'var(--color-text-muted)', display: 'block', fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase' }}>Customer Name</span>
              <strong style={{ color: 'var(--color-emerald)' }}>{session.customer_name}</strong>
            </div>

            <div>
              <span style={{ color: 'var(--color-text-muted)', display: 'block', fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase' }}>Mobile Number</span>
              <strong>{session.customer_phone}</strong>
            </div>

            <div>
              <span style={{ color: 'var(--color-text-muted)', display: 'block', fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase' }}>Order Type</span>
              <strong style={{ color: 'var(--color-gold)' }}>{session.order_type}</strong>
            </div>

            {session.delivery_address && (
              <div>
                <span style={{ color: 'var(--color-text-muted)', display: 'block', fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase' }}>Delivery Address</span>
                <span>{session.delivery_address}</span>
              </div>
            )}
          </div>

          {/* Cart Items List */}
          {cartItems.length > 0 && (
            <div style={{ borderTop: '1px dashed var(--color-border)', paddingTop: '1rem' }}>
              <h4 style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--color-emerald)', marginBottom: '0.6rem' }}>
                Cart Items ({cartItems.length})
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.88rem' }}>
                {cartItems.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>{item.quantity}x {item.item_name || item.name}</span>
                    <span style={{ fontWeight: 800 }}>₹{parseFloat(item.subtotal || item.price * item.quantity).toFixed(2)}</span>
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

export default PaymentPage;
