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
  QrCode,
  Lock,
  RotateCcw,
  CreditCard
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
  const upiId = 'Pos.11424716@indus';
  const cleanRef = (paymentRef || 'DJ1001').replace(/[^a-zA-Z0-9]/g, '');

  // Safely construct standard UPI Payment URI using URLSearchParams
  // pa = Pos.11424716@indus, pn = Dosa Junction, tr = UNIQUE_REFERENCE, tn = Order UNIQUE_REFERENCE, am = EXACT_FINAL_AMOUNT, cu = INR
  const upiParams = new URLSearchParams({
    pa: upiId,
    pn: 'Dosa Junction',
    tr: cleanRef,
    tn: `Order ${cleanRef}`,
    am: totalAmountFormatted,
    cu: 'INR'
  });

  const exactUpiUri = `upi://pay?${upiParams.toString()}`;
  const phonepeUri = `phonepe://pay?${upiParams.toString()}`;
  const gpayUri = `gpay://upi/pay?${upiParams.toString()}`;
  const paytmUri = `paytmmp://pay?${upiParams.toString()}`;

  useEffect(() => {
    if (session && exactUpiUri) {
      if (process.env.NODE_ENV !== 'production' || window.location.hostname === 'localhost') {
        console.log('[UPI Deep Link Generated]:', exactUpiUri);
      }
    }
  }, [session, exactUpiUri]);

  const handleCopyUpiId = () => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(upiId);
      if (addToast) addToast('UPI ID copied', 'success');
    } else {
      const input = document.createElement('input');
      input.value = upiId;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      if (addToast) addToast('UPI ID copied', 'success');
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
          <RefreshCw size={36} className="spin-slow" style={{ color: '#EA580C', marginBottom: '1rem' }} />
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
    <div style={{ backgroundColor: '#FAF8F5', padding: '1.8rem 0 5rem 0', minHeight: '90vh' }}>
      <SEOHead title={`Complete Your Payment — ₹${totalAmountFormatted} | Dosa Junction`} />

      <div className="container" style={{ maxWidth: '1000px', padding: '0 1rem' }}>
        
        {/* Main Desktop/Mobile Grid Layout */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '2rem',
          alignItems: 'start'
        }}>
          
          {/* LEFT: Centered Premium Payment Card (Mobile First) */}
          <div>
            
            {/* Header Branding */}
            <div style={{ textAlign: 'center', marginBottom: '1.4rem' }}>
              <span style={{ fontSize: '0.82rem', color: '#EA580C', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>
                Dosa Junction
              </span>
              <h1 style={{ fontSize: '2.2rem', fontWeight: 900, color: '#064E3B', fontFamily: 'var(--font-heading)', margin: '2px 0 0 0' }}>
                Complete Your Payment
              </h1>
              <span style={{ fontSize: '0.88rem', color: '#6B7280', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', marginTop: '4px' }}>
                <Lock size={14} color="#16A34A" /> Secure UPI Payment
              </span>
            </div>

            {/* Status Alert if Approved, Pending, or Rejected */}
            {isApproved ? (
              <div style={{
                backgroundColor: '#DCFCE7',
                border: '2px solid #16A34A',
                borderRadius: '24px',
                padding: '1.6rem',
                marginBottom: '1.5rem',
                textAlign: 'center'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#15803D', fontWeight: 900, fontSize: '1.3rem' }}>
                  <CheckCircle2 size={28} color="#16A34A" /> Payment Successful & Verified ✓
                </div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#064E3B', margin: '0.4rem 0 0.2rem 0' }}>
                  Order Placed Successfully! 🎉
                </h2>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#D97706', marginBottom: '1.2rem' }}>
                  Order ID: <strong style={{ color: '#064E3B' }}>{session.order_number || order?.order_number || 'DJ-CONFIRMED'}</strong>
                </div>
                <button
                  onClick={() => navigate(`/track-order?orderNumber=${session.order_number || order?.order_number}`)}
                  style={{
                    width: '100%',
                    padding: '0.9rem',
                    fontWeight: 900,
                    fontSize: '1rem',
                    borderRadius: '16px',
                    backgroundColor: '#EA580C',
                    color: '#FFFFFF',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 6px 20px rgba(234, 88, 12, 0.35)'
                  }}
                >
                  <Compass size={18} /> Track Order Progress
                </button>
              </div>
            ) : isPending ? (
              <div style={{
                backgroundColor: '#EFF6FF',
                border: '2px solid #3B82F6',
                borderRadius: '24px',
                padding: '1.6rem',
                marginBottom: '1.5rem',
                textAlign: 'center'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#1E40AF', fontWeight: 900, fontSize: '1.15rem' }}>
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
                borderRadius: '24px',
                padding: '1.6rem',
                marginBottom: '1.5rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#991B1B', fontWeight: 900, fontSize: '1.15rem' }}>
                  <AlertTriangle size={24} color="#EF4444" /> Payment Failed
                </div>
                <p style={{ margin: '0.5rem 0 0 0', color: '#B91C1C', fontSize: '0.92rem', fontWeight: 700 }}>
                  Your payment could not be completed.
                </p>
                <p style={{ margin: '0.2rem 0 0 0', color: '#7F1D1D', fontSize: '0.84rem' }}>
                  Reason: {session.rejection_reason || 'Verification rejected by admin.'}
                </p>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '1rem' }}>
                  <a
                    href={exactUpiUri}
                    style={{
                      padding: '0.75rem',
                      borderRadius: '12px',
                      backgroundColor: '#EF4444',
                      color: '#FFFFFF',
                      textAlign: 'center',
                      fontWeight: 800,
                      fontSize: '0.88rem',
                      textDecoration: 'none'
                    }}
                  >
                    <RotateCcw size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} /> Try Again
                  </a>
                  <Link
                    to="/contact"
                    style={{
                      padding: '0.75rem',
                      borderRadius: '12px',
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #DC2626',
                      color: '#DC2626',
                      textAlign: 'center',
                      fontWeight: 800,
                      fontSize: '0.88rem',
                      textDecoration: 'none'
                    }}
                  >
                    Contact Support
                  </Link>
                </div>
              </div>
            ) : null}

            {/* Main Payment Card */}
            {!isApproved && (
              <div style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '24px',
                padding: '2rem',
                boxShadow: '0 8px 30px rgba(0,0,0,0.06)',
                border: '1px solid #E5E7EB',
                marginBottom: '1.5rem',
                textAlign: 'center'
              }}>
                
                {/* Payee Info & Dynamic Amount Display */}
                <div style={{
                  backgroundColor: '#FFFBEB',
                  border: '2px dashed #FCD34D',
                  borderRadius: '20px',
                  padding: '1.2rem 1.6rem',
                  marginBottom: '1.5rem'
                }}>
                  <span style={{ fontSize: '0.8rem', color: '#B45309', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block' }}>
                    Amount to Pay
                  </span>
                  <div style={{ fontSize: '2.6rem', fontWeight: 900, color: '#EA580C', letterSpacing: '-0.5px', margin: '2px 0' }}>
                    ₹{totalAmountFormatted}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#78350F', fontWeight: 700 }}>
                    Payee: <strong>Dosa Junction</strong>
                  </div>
                </div>

                {/* Error Message if any */}
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

                {/* Helpful Bank Decline Notice for IndusInd POS VPAs */}
                <div style={{
                  backgroundColor: '#EFF6FF',
                  border: '1.5px solid #BFDBFE',
                  borderRadius: '16px',
                  padding: '0.9rem 1.1rem',
                  marginBottom: '1.2rem',
                  textAlign: 'left',
                  fontSize: '0.84rem',
                  lineHeight: 1.45,
                  color: '#1E40AF'
                }}>
                  <div style={{ fontWeight: 800, color: '#1D4ED8', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                    <Info size={16} color="#2563EB" /> Bank Declined Note for PhonePe / GPay:
                  </div>
                  If PhonePe shows <em>"Bank declined for security reasons"</em>, please click <strong>COPY UPI ID</strong> below to pay directly on PhonePe / GPay.
                </div>

                {/* Option 1: Large Primary "Pay Now" Button */}
                <a
                  href={exactUpiUri}
                  style={{
                    width: '100%',
                    padding: '1.15rem 1.5rem',
                    borderRadius: '18px',
                    background: 'linear-gradient(135deg, #EA580C 0%, #D97706 100%)',
                    color: '#FFFFFF',
                    border: 'none',
                    boxShadow: '0 8px 24px rgba(234, 88, 12, 0.35)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '1.2rem',
                    textDecoration: 'none',
                    boxSizing: 'border-box'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.25)',
                      borderRadius: '10px',
                      width: '38px',
                      height: '38px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Smartphone size={22} color="#FFFFFF" />
                    </div>
                    <span style={{ fontSize: '1.3rem', fontWeight: 900, letterSpacing: '-0.2px' }}>
                      Pay Now
                    </span>
                  </div>
                  
                  <div style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.25)',
                    borderRadius: '50%',
                    width: '36px',
                    height: '36px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <ArrowRight size={22} color="#FFFFFF" />
                  </div>
                </a>

                {/* App Direct Launch Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.65rem', marginBottom: '1.4rem' }}>
                  <a
                    href={phonepeUri}
                    style={{
                      backgroundColor: '#5F259F',
                      color: '#FFFFFF',
                      borderRadius: '14px',
                      padding: '0.8rem 0.4rem',
                      textDecoration: 'none',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                      boxShadow: '0 4px 12px rgba(95, 37, 159, 0.2)'
                    }}
                  >
                    <span style={{ fontSize: '0.82rem', fontWeight: 800 }}>PhonePe</span>
                  </a>

                  <a
                    href={gpayUri}
                    style={{
                      backgroundColor: '#FFFFFF',
                      border: '1.5px solid #E5E7EB',
                      color: '#374151',
                      borderRadius: '14px',
                      padding: '0.8rem 0.4rem',
                      textDecoration: 'none',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px'
                    }}
                  >
                    <span style={{ fontSize: '0.82rem', fontWeight: 800 }}>Google Pay</span>
                  </a>

                  <a
                    href={paytmUri}
                    style={{
                      backgroundColor: '#FFFFFF',
                      border: '1.5px solid #E5E7EB',
                      color: '#00BAF2',
                      borderRadius: '14px',
                      padding: '0.8rem 0.4rem',
                      textDecoration: 'none',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px'
                    }}
                  >
                    <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#00BAF2' }}>Paytm</span>
                  </a>
                </div>



                {/* Copy UPI ID Bar */}
                <div style={{
                  backgroundColor: '#F3F4F6',
                  borderRadius: '16px',
                  padding: '0.85rem 1.2rem',
                  marginBottom: '1.2rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.5rem'
                }}>
                  <div style={{ textAlign: 'left' }}>
                    <span style={{ fontSize: '0.72rem', color: '#6B7280', fontWeight: 700, display: 'block', textTransform: 'uppercase' }}>UPI ID</span>
                    <strong style={{ fontSize: '1rem', color: '#111827', fontFamily: 'monospace' }}>{upiId}</strong>
                  </div>

                  <button
                    type="button"
                    onClick={handleCopyUpiId}
                    style={{
                      backgroundColor: '#EA580C',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '10px',
                      padding: '0.45rem 1rem',
                      fontSize: '0.82rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      boxShadow: '0 2px 8px rgba(234, 88, 12, 0.25)'
                    }}
                  >
                    <Copy size={13} /> COPY
                  </button>
                </div>

                {/* Trust Footnote */}
                <div style={{ fontSize: '0.8rem', color: '#6B7280', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                  <ShieldCheck size={16} color="#16A34A" /> Your payment is securely processed through UPI.
                </div>

              </div>
            )}

            {/* Customer Proof Submission Form (Screenshot Upload) */}
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

          {/* RIGHT: Sticky Order Summary Card (Desktop & Mobile) */}
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '24px',
            padding: '1.8rem',
            boxShadow: '0 6px 20px rgba(0,0,0,0.04)',
            border: '1px solid #E5E7EB',
            position: 'sticky',
            top: '90px'
          }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', fontWeight: 900, color: '#064E3B', marginBottom: '1.2rem', borderBottom: '1px solid #E5E7EB', paddingBottom: '0.6rem' }}>
              Order Summary
            </h3>

            {/* Customer & Address Details */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem', fontSize: '0.82rem', color: '#4B5563', marginBottom: '1rem', backgroundColor: '#FAF8F5', padding: '0.8rem', borderRadius: '12px' }}>
              <div><strong>Name:</strong> {session.customer_name}</div>
              <div><strong>Phone:</strong> {session.customer_phone}</div>
              <div><strong>Type:</strong> {session.order_type}</div>
              {session.delivery_address && <div style={{ gridColumn: 'span 2' }}><strong>Address:</strong> {session.delivery_address}</div>}
            </div>

            {/* Cart Items List */}
            {cartItems.length > 0 && (
              <div style={{ marginBottom: '1.2rem' }}>
                <h4 style={{ fontSize: '0.88rem', fontWeight: 800, color: '#064E3B', marginBottom: '0.5rem' }}>
                  Items ({cartItems.length})
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.88rem' }}>
                  {cartItems.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', color: '#1F2937' }}>
                      <span>{item.quantity}x {item.item_name || item.name}</span>
                      <span style={{ fontWeight: 800 }}>₹{parseFloat(item.subtotal || item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Price Breakdown */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem', fontSize: '0.9rem', color: 'var(--color-text)', borderTop: '1px dashed #E5E7EB', paddingTop: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6B7280' }}>Subtotal</span>
                <span>₹{parseFloat(session.subtotal || 0).toFixed(2)}</span>
              </div>

              {parseFloat(session.discount_amount || 0) > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#16A34A', fontWeight: 700 }}>
                  <span>Discount</span>
                  <span>− ₹{parseFloat(session.discount_amount || 0).toFixed(2)}</span>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6B7280' }}>GST (5%)</span>
                <span>₹{parseFloat(session.tax || 0).toFixed(2)}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6B7280' }}>Packing Charge</span>
                <span>₹{parseFloat(session.packing_charge || 0).toFixed(2)}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6B7280' }}>Delivery Charge</span>
                <span>{parseFloat(session.delivery_charge || 0) === 0 ? <strong style={{ color: '#16A34A' }}>FREE</strong> : `₹${parseFloat(session.delivery_charge || 0).toFixed(2)}`}</span>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '1.45rem',
                fontWeight: 900,
                color: '#064E3B',
                borderTop: '2px dashed #E5E7EB',
                paddingTop: '0.9rem',
                marginTop: '0.4rem'
              }}>
                <span>TOTAL TO PAY</span>
                <span style={{ color: '#EA580C' }}>₹{totalAmountFormatted}</span>
              </div>
            </div>

            {/* Visual Reassurance */}
            <div style={{ marginTop: '1.4rem', padding: '0.8rem', backgroundColor: '#F0FDF4', borderRadius: '14px', border: '1px solid #BBF7D0', fontSize: '0.78rem', color: '#166534', fontWeight: 700, textAlign: 'center' }}>
              ✓ Pay securely using UPI &bull; Verified Merchant Dosa Junction
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default PaymentPage;
