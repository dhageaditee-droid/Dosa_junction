import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import {
  CheckCircle2,
  ClipboardList,
  ShieldCheck,
  Smartphone,
  ArrowRight,
  ExternalLink,
  Upload,
  FileCheck,
  Compass,
  RefreshCw,
  Copy,
  Info,
  Receipt,
  Shield,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  QrCode
} from 'lucide-react';
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
  const [screenshotPreview, setScreenshotPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
    };
    checkMobile();
  }, []);

  const fetchSessionDetails = async () => {
    if (!paymentRef) return;
    try {
      const res = await apiService.getPaymentSession(paymentRef);
      if (res && res.session) {
        setSession(res.session);
        if (res.order) {
          setOrder(res.order);
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
    const interval = setInterval(fetchSessionDetails, 5000);
    return () => clearInterval(interval);
  }, [paymentRef]);

  const totalAmountNum = parseFloat(session?.total_amount || 0);
  const totalAmountFormatted = totalAmountNum.toFixed(2);
  const rawUpiId = (session?.upi_id || '11424716@indus').trim();
  const upiId = rawUpiId.startsWith('Pos.') ? rawUpiId.replace('Pos.', '') : rawUpiId;

  // Clean Intent URIs for bank safety
  const cleanRef = (paymentRef || 'DJ1001').replace(/[^a-zA-Z0-9]/g, '');
  const encodedName = encodeURIComponent('Dosa Junction');
  const exactUpiUri = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodedName}&am=${totalAmountFormatted}&cu=INR&tn=${cleanRef}`;
  const phonepeUri = `phonepe://pay?pa=${encodeURIComponent(upiId)}&pn=${encodedName}&am=${totalAmountFormatted}&cu=INR&tn=${cleanRef}`;
  const gpayUri = `gpay://upi/pay?pa=${encodeURIComponent(upiId)}&pn=${encodedName}&am=${totalAmountFormatted}&cu=INR&tn=${cleanRef}`;
  const paytmUri = `paytmmp://pay?pa=${encodeURIComponent(upiId)}&pn=${encodedName}&am=${totalAmountFormatted}&cu=INR&tn=${cleanRef}`;

  useEffect(() => {
    if (session && exactUpiUri) {
      if (process.env.NODE_ENV !== 'production' || window.location.hostname === 'localhost') {
        console.log('[UPI Deep Link Generated]:', exactUpiUri);
      }
    }
  }, [session, exactUpiUri]);

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
      setErrorMsg('Please upload your payment screenshot.');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg('');
      const finalUtrRef = `PROOF-${Date.now()}`;
      const res = await apiService.submitPaymentSessionProof(paymentRef, {
        utrNumber: finalUtrRef,
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
      <div style={{ backgroundColor: '#FAF8F5', padding: '5rem 0', minHeight: '80vh', textAlign: 'center' }}>
        <SEOHead title="Loading Payment Session..." />
        <div className="container">
          <RefreshCw size={36} className="spin-slow" style={{ color: '#D97706', marginBottom: '1rem' }} />
          <h2 style={{ color: '#064E3B' }}>Loading Payment Details...</h2>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div style={{ backgroundColor: '#FAF8F5', padding: '5rem 0', minHeight: '80vh', textAlign: 'center' }}>
        <SEOHead title="Payment Session Not Found" />
        <div className="container" style={{ maxWidth: '600px' }}>
          <AlertTriangle size={48} color="#DC2626" style={{ marginBottom: '1rem' }} />
          <h2 style={{ color: '#064E3B', marginBottom: '0.5rem' }}>Payment Session Not Found</h2>
          <p style={{ color: '#6B7280', marginBottom: '1.5rem' }}>
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
    <div style={{ backgroundColor: '#F9FAFB', padding: '1.5rem 0 5rem 0', minHeight: '90vh' }}>
      <SEOHead title={`Pay ₹${totalAmountFormatted} for Dosa Junction #${paymentRef}`} />

      <div className="container" style={{ maxWidth: '580px', padding: '0 1rem' }}>
        
        {/* 1. Top Green Banner: Almost there! */}
        <div style={{
          backgroundColor: '#F0FDF4',
          border: '1px solid #BBF7D0',
          borderRadius: '16px',
          padding: '1rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          marginBottom: '1.25rem'
        }}>
          <div style={{
            backgroundColor: '#16A34A',
            color: '#FFFFFF',
            borderRadius: '50%',
            width: '38px',
            height: '38px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <CheckCircle2 size={24} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#15803D', margin: 0 }}>
              Almost there!
            </h3>
            <p style={{ fontSize: '0.88rem', color: '#166534', margin: '2px 0 0 0', fontWeight: 600 }}>
              Complete your payment to confirm your order.
            </p>
          </div>
        </div>

        {/* Status Alert if Approved, Pending, or Rejected */}
        {isApproved ? (
          <div style={{
            backgroundColor: '#DCFCE7',
            border: '2px solid #16A34A',
            borderRadius: '20px',
            padding: '1.5rem',
            marginBottom: '1.5rem',
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
              style={{ padding: '0.8rem 2rem', fontWeight: 800, fontSize: '1rem', width: '100%', borderRadius: '12px' }}
            >
              <Compass size={18} /> Track Order Progress
            </button>
          </div>
        ) : isPending ? (
          <div style={{
            backgroundColor: '#EFF6FF',
            border: '2px solid #3B82F6',
            borderRadius: '20px',
            padding: '1.4rem',
            marginBottom: '1.5rem',
            textAlign: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#1E40AF', fontWeight: 800, fontSize: '1.15rem' }}>
              <RefreshCw size={24} color="#3B82F6" className="spin-slow" /> Payment Verification Pending
            </div>
            <p style={{ margin: '0.6rem 0 0 0', color: '#1E3A8A', fontSize: '0.92rem', fontWeight: 700 }}>
              Payment screenshot submitted.
            </p>
            <p style={{ margin: '0.2rem 0 0 0', color: '#2563EB', fontSize: '0.86rem' }}>
              Restaurant admin is verifying your payment. Your order will be confirmed shortly.
            </p>
          </div>
        ) : isRejected ? (
          <div style={{
            backgroundColor: '#FEF2F2',
            border: '2px solid #EF4444',
            borderRadius: '20px',
            padding: '1.4rem',
            marginBottom: '1.5rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#991B1B', fontWeight: 800, fontSize: '1.1rem' }}>
              <AlertTriangle size={24} color="#EF4444" /> Payment Verification Rejected
            </div>
            <p style={{ margin: '0.5rem 0 0 0', color: '#B91C1C', fontSize: '0.9rem', fontWeight: 700 }}>
              Reason: {session.rejection_reason || 'Payment verification rejected by admin.'}
            </p>
            <p style={{ margin: '0.3rem 0 0 0', color: '#7F1D1D', fontSize: '0.84rem' }}>
              Please re-submit your payment screenshot below.
            </p>
          </div>
        ) : null}

        {/* 2. Order Summary Card */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '20px',
          padding: '1.4rem 1.6rem',
          boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
          border: '1px solid #E5E7EB',
          marginBottom: '1.25rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.05rem', fontWeight: 800, color: '#1F2937' }}>
              <ClipboardList size={20} color="#EA580C" /> Order Summary
            </div>
            <button
              type="button"
              onClick={() => setShowOrderDetails(!showOrderDetails)}
              style={{
                border: '1px solid #FDBA74',
                backgroundColor: '#FFF7ED',
                color: '#C2410C',
                padding: '4px 12px',
                borderRadius: '8px',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              {showOrderDetails ? 'Hide Details' : 'View Details'}
              {showOrderDetails ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #F3F4F6', paddingTop: '0.75rem' }}>
            <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#374151' }}>
              Total Amount to Pay
            </span>
            <span style={{ fontSize: '1.8rem', fontWeight: 900, color: '#EA580C', letterSpacing: '-0.5px' }}>
              ₹{totalAmountFormatted}
            </span>
          </div>

          {/* Expandable Order Details */}
          {showOrderDetails && (
            <div style={{ marginTop: '1rem', paddingTop: '0.8rem', borderTop: '1px dashed #E5E7EB', fontSize: '0.88rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem', marginBottom: '0.8rem', fontSize: '0.82rem', color: '#4B5563' }}>
                <div><strong>Customer:</strong> {session.customer_name} ({session.customer_phone})</div>
                <div><strong>Type:</strong> {session.order_type}</div>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {cartItems.map((it, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', color: '#1F2937' }}>
                    <span>{it.quantity}x {it.item_name || it.name}</span>
                    <span style={{ fontWeight: 700 }}>₹{parseFloat(it.subtotal || it.price * it.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 3. Primary Payment Box: Pay Securely with UPI (Shown if NOT approved) */}
        {!isApproved && (
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '24px',
            padding: '1.6rem',
            boxShadow: '0 6px 24px rgba(0,0,0,0.05)',
            border: '1px solid #E5E7EB',
            marginBottom: '1.25rem',
            textAlign: 'center'
          }}>
            
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '1.2rem', textAlign: 'left' }}>
              <ShieldCheck size={24} color="#16A34A" style={{ marginTop: '2px', flexShrink: 0 }} />
              <div>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#111827', margin: 0 }}>
                  Pay Securely with UPI
                </h2>
                <p style={{ fontSize: '0.84rem', color: '#6B7280', margin: '2px 0 0 0' }}>
                  Scan official QR code or tap button below to pay
                </p>
              </div>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div style={{
                backgroundColor: '#FEF2F2',
                color: '#991B1B',
                padding: '0.85rem 1rem',
                borderRadius: '12px',
                fontSize: '0.88rem',
                fontWeight: 700,
                marginBottom: '1rem',
                border: '1.5px solid #FCA5A5'
              }}>
                ⚠️ {errorMsg}
              </div>
            )}

            {/* Prominent Official Dosa Junction QR Code Image */}
            <div style={{
              backgroundColor: '#FAF8F5',
              border: '2px dashed #D97706',
              borderRadius: '20px',
              padding: '1.2rem',
              margin: '0.5rem 0 1.4rem 0',
              display: 'inline-block',
              width: '100%',
              boxSizing: 'border-box'
            }}>
              <span style={{ fontSize: '0.84rem', fontWeight: 800, color: '#B45309', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '0.6rem', textTransform: 'uppercase' }}>
                <QrCode size={18} /> Official Dosa Junction QR Code
              </span>
              
              <img
                src="/assets/dosa_junction_qr.png"
                alt="Dosa Junction UPI QR Code"
                style={{
                  maxHeight: '220px',
                  margin: '0 auto',
                  borderRadius: '14px',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.08)',
                  border: '2px solid #FFFFFF'
                }}
              />
              
              <span style={{ fontSize: '0.78rem', color: '#78350F', display: 'block', marginTop: '8px', fontWeight: 700 }}>
                Scan with PhonePe, Google Pay, Paytm, or BHIM to pay ₹{totalAmountFormatted} directly!
              </span>
            </div>

            {/* Main Orange Pay Button */}
            <a
              href={phonepeUri}
              style={{
                width: '100%',
                padding: '1.1rem 1.4rem',
                borderRadius: '18px',
                background: 'linear-gradient(135deg, #EA580C 0%, #D97706 100%)',
                color: '#FFFFFF',
                border: 'none',
                boxShadow: '0 8px 24px rgba(234, 88, 12, 0.35)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '1rem',
                textDecoration: 'none',
                boxSizing: 'border-box'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.25)',
                  borderRadius: '10px',
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Smartphone size={20} color="#FFFFFF" />
                </div>
                <span style={{ fontSize: '1.2rem', fontWeight: 900, letterSpacing: '-0.2px' }}>
                  Pay ₹{totalAmountFormatted} with PhonePe / UPI
                </span>
              </div>
              
              <div style={{
                backgroundColor: 'rgba(255, 255, 255, 0.25)',
                borderRadius: '50%',
                width: '34px',
                height: '34px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <ArrowRight size={20} color="#FFFFFF" />
              </div>
            </a>

            {/* Redirect Notice */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.82rem', color: '#6B7280', marginBottom: '1.4rem' }}>
              <Shield size={16} color="#7C3AED" />
              <span>You will be redirected to your UPI app to complete the payment.</span>
            </div>

            {/* 4. Or choose your UPI app */}
            <div style={{ position: 'relative', textAlign: 'center', margin: '1.2rem 0' }}>
              <div style={{ borderBottom: '1px solid #E5E7EB', position: 'absolute', top: '50%', left: 0, right: 0, zIndex: 1 }}></div>
              <span style={{ backgroundColor: '#FFFFFF', padding: '0 12px', fontSize: '0.82rem', fontWeight: 700, color: '#6B7280', position: 'relative', zIndex: 2 }}>
                Or choose your UPI app
              </span>
            </div>

            {/* 3 App Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '1.2rem' }}>
              {/* PhonePe */}
              <a
                href={phonepeUri}
                style={{
                  backgroundColor: '#5F259F',
                  color: '#FFFFFF',
                  borderRadius: '16px',
                  padding: '0.9rem 0.5rem',
                  textDecoration: 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  boxShadow: '0 4px 12px rgba(95, 37, 159, 0.2)'
                }}
              >
                <div style={{
                  backgroundColor: '#FFFFFF',
                  color: '#5F259F',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 900,
                  fontSize: '1.05rem'
                }}>
                  पे
                </div>
                <span style={{ fontSize: '0.85rem', fontWeight: 800 }}>PhonePe</span>
              </a>

              {/* Google Pay */}
              <a
                href={gpayUri}
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1.5px solid #E5E7EB',
                  color: '#374151',
                  borderRadius: '16px',
                  padding: '0.9rem 0.5rem',
                  textDecoration: 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
                }}
              >
                <div style={{
                  backgroundColor: '#4285F4',
                  color: '#FFFFFF',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 900,
                  fontSize: '1.1rem'
                }}>
                  G
                </div>
                <span style={{ fontSize: '0.85rem', fontWeight: 800 }}>Google Pay</span>
              </a>

              {/* Paytm */}
              <a
                href={paytmUri}
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1.5px solid #E5E7EB',
                  color: '#00BAF2',
                  borderRadius: '16px',
                  padding: '0.9rem 0.5rem',
                  textDecoration: 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
                }}
              >
                <div style={{
                  backgroundColor: '#00BAF2',
                  color: '#FFFFFF',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 900,
                  fontSize: '0.8rem'
                }}>
                  Paytm
                </div>
                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#00BAF2' }}>Paytm</span>
              </a>
            </div>

            {/* 5. Merchant Details Card */}
            <div style={{
              backgroundColor: '#FFFBEB',
              border: '1.5px solid #FDE68A',
              borderRadius: '18px',
              padding: '1.1rem 1.25rem',
              marginBottom: '1rem',
              textAlign: 'left'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#B45309', fontWeight: 800, fontSize: '0.92rem', marginBottom: '6px' }}>
                <Info size={18} color="#D97706" /> Merchant Details
              </div>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: '#1F2937', marginBottom: '0.8rem' }}>
                Dosa Junction
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.88rem', color: '#4B5563' }}>
                    UPI ID: <strong style={{ fontFamily: 'monospace', color: '#111827' }}>{upiId}</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(upiId, 'UPI ID')}
                    style={{
                      border: '1px solid #F59E0B',
                      backgroundColor: '#FFFFFF',
                      color: '#B45309',
                      padding: '4px 10px',
                      borderRadius: '8px',
                      fontSize: '0.78rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <Copy size={13} /> Copy UPI ID
                  </button>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.88rem', color: '#4B5563' }}>
                    Amount: <strong style={{ color: '#111827' }}>₹{totalAmountFormatted}</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(totalAmountFormatted, 'Amount')}
                    style={{
                      border: '1px solid #F59E0B',
                      backgroundColor: '#FFFFFF',
                      color: '#B45309',
                      padding: '4px 10px',
                      borderRadius: '8px',
                      fontSize: '0.78rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <Copy size={13} /> Copy Amount
                  </button>
                </div>
              </div>
            </div>

            {/* 6. Important Note Card */}
            <div style={{
              backgroundColor: '#EFF6FF',
              border: '1.5px solid #BFDBFE',
              borderRadius: '16px',
              padding: '0.9rem 1.1rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              textAlign: 'left'
            }}>
              <CheckCircle2 size={20} color="#2563EB" style={{ marginTop: '2px', flexShrink: 0 }} />
              <div>
                <strong style={{ color: '#1E40AF', fontSize: '0.9rem', display: 'block' }}>Important</strong>
                <p style={{ margin: '2px 0 0 0', color: '#1D4ED8', fontSize: '0.82rem', lineHeight: 1.4 }}>
                  If PhonePe shows "Bank declined for security reasons", please scan the QR code above or copy UPI ID <strong>11424716@indus</strong> to pay.<br />
                  After payment, upload your payment screenshot below to confirm.
                </p>
              </div>
            </div>

          </div>
        )}

        {/* 7. How it works? Card */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '20px',
          padding: '1.4rem 1.6rem',
          boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
          border: '1px solid #E5E7EB',
          marginBottom: '1.5rem'
        }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#111827', margin: '0 0 1.2rem 0' }}>
            How it works?
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', alignItems: 'center', textAlign: 'center' }}>
            
            {/* Step 1 */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
              <div style={{ backgroundColor: '#DCFCE7', color: '#15803D', borderRadius: '12px', width: '42px', height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Smartphone size={20} />
              </div>
              <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#374151' }}>1. Scan / Click Pay</span>
            </div>

            {/* Step 2 */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
              <div style={{ backgroundColor: '#DCFCE7', color: '#15803D', borderRadius: '12px', width: '42px', height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShieldCheck size={20} />
              </div>
              <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#374151' }}>2. Complete Payment</span>
            </div>

            {/* Step 3 */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
              <div style={{ backgroundColor: '#DCFCE7', color: '#15803D', borderRadius: '12px', width: '42px', height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Receipt size={20} />
              </div>
              <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#374151' }}>3. Upload Screenshot</span>
            </div>

            {/* Step 4 */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
              <div style={{ backgroundColor: '#DCFCE7', color: '#15803D', borderRadius: '12px', width: '42px', height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircle2 size={20} />
              </div>
              <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#374151' }}>4. Order Confirmed</span>
            </div>

          </div>
        </div>

        {/* 8. Customer Proof Submission Form (Required: Screenshot Only) */}
        {!isApproved && (
          <form onSubmit={handleSubmitProof} style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '24px',
            padding: '1.6rem',
            boxShadow: '0 8px 30px rgba(0,0,0,0.06)',
            border: '1px solid #E5E7EB',
            marginBottom: '2rem'
          }}>
            <h3 style={{
              fontSize: '1.15rem',
              fontWeight: 800,
              color: '#064E3B',
              marginBottom: '0.3rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <FileCheck size={22} color="#D97706" /> Payment completed? Upload payment screenshot
            </h3>
            <p style={{ fontSize: '0.84rem', color: '#6B7280', marginBottom: '1.4rem' }}>
              Please upload your payment screenshot to verify your payment.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              {/* Mandatory Screenshot Upload */}
              <div>
                <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 800, color: '#064E3B', marginBottom: '6px' }}>
                  Payment Screenshot *
                </label>

                <div style={{
                  border: '2px dashed #D1D5DB',
                  borderRadius: '14px',
                  padding: '1.2rem',
                  textAlign: 'center',
                  backgroundColor: '#FAFAFA',
                  cursor: 'pointer'
                }}>
                  {screenshotPreview ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.8rem' }}>
                      <img
                        src={screenshotPreview}
                        alt="Payment Screenshot Preview"
                        style={{ maxHeight: '200px', borderRadius: '12px', objectFit: 'contain', border: '1px solid #E5E7EB' }}
                      />
                      <label className="btn btn-outline btn-sm" style={{ cursor: 'pointer', fontSize: '0.82rem' }}>
                        <Upload size={14} /> Change Screenshot
                        <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
                      </label>
                    </div>
                  ) : (
                    <label style={{ cursor: 'pointer', display: 'block' }}>
                      <Upload size={32} color="#D97706" style={{ margin: '0 auto 6px auto' }} />
                      <span style={{ display: 'block', fontSize: '0.9rem', fontWeight: 800, color: '#064E3B' }}>
                        Click to choose payment screenshot
                      </span>
                      <span style={{ fontSize: '0.76rem', color: '#6B7280' }}>
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
                  padding: '0.85rem',
                  fontSize: '1rem',
                  fontWeight: 800,
                  borderRadius: '12px',
                  marginTop: '0.4rem'
                }}
              >
                {submitting ? 'Submitting Payment Proof...' : 'Submit Payment Proof'} <ShieldCheck size={18} />
              </button>

            </div>
          </form>
        )}

      </div>
    </div>
  );
};

export default PaymentPage;
