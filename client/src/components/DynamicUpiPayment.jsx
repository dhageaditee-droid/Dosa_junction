import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { QrCode, Upload, CheckCircle2, Clock, AlertTriangle, ExternalLink, ShieldCheck, FileCheck } from 'lucide-react';
import { apiService } from '../services/api';
import { useToast } from '../context/ToastContext';

const DynamicUpiPayment = ({ order, onPaymentSubmitted }) => {
  const { addToast } = useToast();

  const [utrNumber, setUtrNumber] = useState(order?.utr_number || '');
  const [screenshotPreview, setScreenshotPreview] = useState(order?.payment_screenshot || null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!order) return null;

  const orderTotal = parseFloat(order.total_amount || 0).toFixed(2);
  const orderNumber = order.order_number;
  const upiId = order.upi_id || '11424716@indus';

  // Construct official dynamic UPI payment URI
  // upi://pay?pa=YOUR_UPI_ID&pn=Dosa%20Junction&am=ORDER_AMOUNT&cu=INR&tn=ORDER_ID
  const cleanNum = (orderNumber || 'DJ1001').replace(/[^a-zA-Z0-9]/g, '');
  const upiUri = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent('Dosa Junction')}&am=${orderTotal}&cu=INR&tn=${cleanNum}`;

  const isPendingVerification = order.payment_status === 'Payment Verification Pending' || order.payment_status === 'PENDING_VERIFICATION';
  const isVerified = order.payment_status === 'Payment Verified' || order.payment_status === 'PAID';
  const isRejected = order.payment_status === 'Payment Rejected';

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
    if (!utrNumber.trim()) {
      setErrorMsg('Please enter your 12-digit UPI Transaction ID / UTR.');
      return;
    }

    if (!screenshotPreview) {
      setErrorMsg('Please upload a screenshot of your payment completion screen.');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg('');
      const res = await apiService.submitPaymentProof(orderNumber, {
        utrNumber: utrNumber.trim(),
        paymentScreenshot: screenshotPreview
      });

      if (res.success) {
        if (addToast) addToast('Payment proof submitted! Verification pending.', 'success');
        if (onPaymentSubmitted) onPaymentSubmitted(res.order);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to submit payment proof.');
      if (addToast) addToast(err.message || 'Payment proof submission failed.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{
      backgroundColor: '#FFFFFF',
      borderRadius: '24px',
      padding: '2rem',
      boxShadow: '0 8px 30px rgba(0,0,0,0.06)',
      border: '1px solid var(--color-border)',
      maxWidth: '650px',
      margin: '0 auto'
    }}>
      {/* Payment Status Banner */}
      {isVerified ? (
        <div style={{
          backgroundColor: '#ECFDF5',
          border: '1.5px solid #10B981',
          borderRadius: '16px',
          padding: '1.25rem',
          marginBottom: '1.5rem',
          textAlign: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#065F46', fontWeight: 800, fontSize: '1.1rem' }}>
            <CheckCircle2 size={24} color="#10B981" /> Payment Status: Payment Verified
          </div>
          <p style={{ margin: '0.4rem 0 0 0', color: '#047857', fontSize: '0.88rem' }}>
            Your order <strong>#{orderNumber}</strong> has been confirmed by the restaurant and sent to the kitchen!
          </p>
        </div>
      ) : isRejected ? (
        <div style={{
          backgroundColor: '#FEF2F2',
          border: '1.5px solid #EF4444',
          borderRadius: '16px',
          padding: '1.25rem',
          marginBottom: '1.5rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#991B1B', fontWeight: 800, fontSize: '1.1rem' }}>
            <AlertTriangle size={24} color="#EF4444" /> Payment Status: Payment Rejected
          </div>
          <p style={{ margin: '0.5rem 0 0 0', color: '#B91C1C', fontSize: '0.9rem', fontWeight: 600 }}>
            Reason: {order.rejection_reason || 'Verification failed. Please re-check UTR & screenshot.'}
          </p>
          <p style={{ margin: '0.4rem 0 0 0', color: '#7F1D1D', fontSize: '0.82rem' }}>
            Please re-check your payment screenshot and UTR number below, then click "Submit Payment Proof" to re-submit.
          </p>
        </div>
      ) : (
        <div style={{
          backgroundColor: '#FFFBEB',
          border: '1.5px solid #F59E0B',
          borderRadius: '16px',
          padding: '1.25rem',
          marginBottom: '1.5rem',
          textAlign: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#92400E', fontWeight: 800, fontSize: '1.05rem' }}>
            <Clock size={22} color="#F59E0B" /> Payment Status: Payment Verification Pending
          </div>
          <p style={{ margin: '0.4rem 0 0 0', color: '#B45309', fontSize: '0.85rem' }}>
            Please complete payment using the dynamic QR code below and submit your UTR & screenshot.
          </p>
        </div>
      )}

      {/* Dynamic QR Code Box */}
      {!isVerified && (
        <div style={{
          backgroundColor: 'var(--color-cream-alt, #FFFBEB)',
          borderRadius: '20px',
          padding: '1.8rem',
          textAlign: 'center',
          border: '2px dashed var(--color-gold, #D97706)',
          marginBottom: '2rem'
        }}>
          {/* 6. Display clearly above QR: "Pay ₹{orderTotal}" */}
          <div style={{ marginBottom: '1.2rem' }}>
            <span style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--color-text-muted)', fontWeight: 700, letterSpacing: '0.5px' }}>
              Dynamic Order UPI QR Code
            </span>
            <h2 style={{
              fontSize: '2rem',
              fontWeight: 900,
              color: 'var(--color-emerald, #064E3B)',
              fontFamily: 'var(--font-heading)',
              margin: '4px 0 0 0'
            }}>
              Pay ₹{orderTotal}
            </h2>
            <div style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
              Order ID: <strong style={{ color: 'var(--color-emerald)' }}>{orderNumber}</strong>
            </div>
          </div>

          {/* Dosa Junction Official Scanner */}
          <div style={{
            display: 'inline-block',
            backgroundColor: '#FFFFFF',
            padding: '1rem',
            borderRadius: '16px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
            marginBottom: '1rem'
          }}>
            <img
              src="/assets/dosa_junction_qr.png"
              alt="Dosa Junction Official UPI QR Code"
              style={{
                width: '230px',
                height: '230px',
                borderRadius: '12px',
                objectFit: 'contain',
                display: 'block'
              }}
            />
          </div>

          {/* 7. Display below QR: "Scan using Google Pay, PhonePe, Paytm or any UPI app." */}
          <p style={{
            fontSize: '0.9rem',
            fontWeight: 700,
            color: 'var(--color-emerald, #064E3B)',
            margin: '0.5rem 0 1rem 0'
          }}>
            Scan using Google Pay, PhonePe, Paytm or any UPI app.
          </p>

          {/* 8. Mobile-only "Pay with UPI App" button */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.6rem' }}>
            <a
              href={upiUri}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: 'var(--color-emerald, #064E3B)',
                color: '#FFFFFF',
                padding: '0.8rem 1.6rem',
                borderRadius: '12px',
                fontWeight: 800,
                fontSize: '0.95rem',
                textDecoration: 'none',
                boxShadow: '0 4px 14px rgba(6, 78, 59, 0.3)'
              }}
            >
              <ExternalLink size={18} /> Pay with UPI App
            </a>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
              (Tap above on mobile to auto-open GPay, PhonePe, or Paytm)
            </span>
          </div>

          <div style={{
            marginTop: '1.2rem',
            paddingTop: '0.8rem',
            borderTop: '1px dashed #E5E7EB',
            fontSize: '0.78rem',
            color: '#6B7280',
            display: 'flex',
            justifyContent: 'center',
            gap: '1rem',
            flexWrap: 'wrap'
          }}>
            <span>UPI ID: <strong>{upiId}</strong></span>
            <span>Currency: <strong>INR</strong></span>
          </div>
        </div>
      )}

      {/* 12. Payment Proof Upload Section */}
      {(!isVerified || isRejected || (isPendingVerification && !order.utr_number)) && (
        <form onSubmit={handleSubmitProof} style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          padding: '1.5rem',
          border: '1px solid var(--color-border)'
        }}>
          <h3 style={{
            fontSize: '1.15rem',
            fontWeight: 800,
            color: 'var(--color-emerald)',
            marginBottom: '0.4rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <FileCheck size={20} color="var(--color-gold)" /> Submit Payment Proof
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginBottom: '1.25rem' }}>
            After paying ₹{orderTotal} in your UPI app, upload your payment screenshot and enter the 12-digit UTR/Ref number below.
          </p>

          {errorMsg && (
            <div style={{
              backgroundColor: '#FEF2F2',
              color: '#991B1B',
              padding: '0.75rem 1rem',
              borderRadius: '10px',
              fontSize: '0.85rem',
              fontWeight: 700,
              marginBottom: '1rem',
              border: '1px solid #FCA5A5'
            }}>
              ⚠️ {errorMsg}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            {/* 12. Enter UPI Transaction ID / UTR */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, color: 'var(--color-emerald)', marginBottom: '6px' }}>
                UPI Transaction ID / UTR Number *
              </label>
              <input
                type="text"
                value={utrNumber}
                onChange={(e) => setUtrNumber(e.target.value)}
                placeholder="e.g. 423456789012"
                required
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: '10px',
                  border: '1px solid var(--color-border)',
                  fontSize: '0.95rem',
                  fontFamily: 'monospace',
                  letterSpacing: '1px'
                }}
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '4px', display: 'block' }}>
                Find this 12-digit UTR / Ref ID in your GPay / PhonePe / Paytm payment receipt.
              </span>
            </div>

            {/* 12. Upload Payment Screenshot */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, color: 'var(--color-emerald)', marginBottom: '6px' }}>
                Upload Payment Screenshot *
              </label>
              
              <div style={{
                border: '2px dashed var(--color-border)',
                borderRadius: '12px',
                padding: '1.2rem',
                textAlign: 'center',
                backgroundColor: 'var(--color-cream-alt, #FAFAFA)',
                cursor: 'pointer'
              }}>
                {screenshotPreview ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.8rem' }}>
                    <img
                      src={screenshotPreview}
                      alt="Payment Screenshot Preview"
                      style={{ maxHeight: '180px', borderRadius: '10px', objectFit: 'contain', border: '1px solid #DDD' }}
                    />
                    <label className="btn btn-outline btn-sm" style={{ cursor: 'pointer', fontSize: '0.8rem' }}>
                      <Upload size={14} /> Change Screenshot
                      <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
                    </label>
                  </div>
                ) : (
                  <label style={{ cursor: 'pointer', display: 'block' }}>
                    <Upload size={32} color="var(--color-gold)" style={{ margin: '0 auto 8px auto' }} />
                    <span style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-emerald)' }}>
                      Click to choose screenshot image
                    </span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                      JPG, PNG, WEBP (Max 5MB)
                    </span>
                    <input type="file" accept="image/*" onChange={handleImageChange} required style={{ display: 'none' }} />
                  </label>
                )}
              </div>
            </div>

            {/* Submit Button */}
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
              {submitting ? 'Submitting Payment Proof...' : 'Submit Payment Proof'} <ShieldCheck size={20} />
            </button>
          </div>
        </form>
      )}

      {/* Submitted Proof Summary for Pending State */}
      {isPendingVerification && order.utr_number && (
        <div style={{
          backgroundColor: '#F9FAFB',
          borderRadius: '14px',
          padding: '1rem 1.25rem',
          border: '1px solid #E5E7EB',
          fontSize: '0.85rem'
        }}>
          <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--color-emerald)', margin: '0 0 0.6rem 0' }}>
            Submitted Proof Summary
          </h4>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{ color: 'var(--color-text-muted)' }}>Customer UTR:</span>
            <strong style={{ fontFamily: 'monospace' }}>{order.utr_number}</strong>
          </div>
          {order.payment_screenshot && (
            <div style={{ marginTop: '0.6rem' }}>
              <span style={{ color: 'var(--color-text-muted)', display: 'block', marginBottom: '4px' }}>Submitted Screenshot:</span>
              <img
                src={order.payment_screenshot}
                alt="Submitted Screenshot"
                style={{ maxHeight: '100px', borderRadius: '8px', border: '1px solid #DDD' }}
              />
            </div>
          )}
        </div>
      )}

    </div>
  );
};

export default DynamicUpiPayment;
