import React, { useState, useEffect } from 'react';
import { ShoppingBag, Search, Filter, RefreshCw, Eye, X, Printer, CheckCircle, Ban, DollarSign, ChevronDown, ChevronUp, Package, Clock, Trash2, CheckCircle2, XCircle, FileCheck, ExternalLink, Image as ImageIcon, ShieldCheck } from 'lucide-react';
import AdminSidebar from '../components/AdminSidebar';
import StatusBadge from '../components/StatusBadge';
import SkeletonLoader from '../components/SkeletonLoader';
import SEOHead from '../components/SEOHead';
import { apiService, cleanDishName } from '../services/api';
import { useToast } from '../context/ToastContext';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [paymentSessions, setPaymentSessions] = useState([]);
  const [activeTab, setActiveTab] = useState('sessions'); // 'sessions' or 'orders'

  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedSession, setSelectedSession] = useState(null);

  const [expandedOrders, setExpandedOrders] = useState({});
  const [previewImage, setPreviewImage] = useState(null);

  // Rejection modal state
  const [showRejectBox, setShowRejectBox] = useState(false);
  const [rejectionReasonInput, setRejectionReasonInput] = useState('');
  const [verifying, setVerifying] = useState(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('all');
  const [todayOnly, setTodayOnly] = useState(false);
  const [search, setSearch] = useState('');

  const { addToast } = useToast();

  useEffect(() => {
    fetchOrders(true);
    fetchPaymentSessions();

    const intervalId = setInterval(() => {
      fetchOrders(false);
      fetchPaymentSessions();
    }, 3000); // 3-second auto-sync for live payment sessions and orders

    return () => clearInterval(intervalId);
  }, [statusFilter, typeFilter, paymentStatusFilter, todayOnly, search]);

  const fetchOrders = async (showLoading = false) => {
    try {
      if (showLoading) setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (typeFilter !== 'all') params.append('orderType', typeFilter);
      if (paymentStatusFilter !== 'all') params.append('paymentStatus', paymentStatusFilter);
      if (todayOnly) params.append('today', 'true');
      if (search.trim()) params.append('search', search.trim());

      const res = await apiService.getAdminOrders(params.toString());
      if (res.orders) setOrders(res.orders);
    } catch (e) {
      if (showLoading && addToast) addToast('Failed to load admin orders list', 'error');
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const fetchPaymentSessions = async () => {
    try {
      const res = await apiService.getAdminPaymentSessions();
      if (res && res.sessions) {
        setPaymentSessions(res.sessions);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleClearAllOrders = async () => {
    if (window.confirm('Are you sure you want to clear ALL dummy & past orders? This will wipe the list completely.')) {
      try {
        setLoading(true);
        await apiService.clearAllOrders();
        setOrders([]);
        setPaymentSessions([]);
        if (addToast) addToast('All orders cleared successfully!', 'success');
      } catch (err) {
        if (addToast) addToast('Failed to clear orders', 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  const toggleOrderExpand = (orderId) => {
    setExpandedOrders(prev => ({
      ...prev,
      [orderId]: !prev[orderId]
    }));
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      const res = await apiService.updateOrderStatus(orderId, newStatus);
      if (res.success) {
        if (addToast) addToast(`Order status updated to "${newStatus}"`, 'success');
        fetchOrders();
        if (selectedOrder && (selectedOrder.id === orderId || selectedOrder.order_number === orderId)) {
          setSelectedOrder(prev => ({ ...prev, status: newStatus }));
        }
      }
    } catch (err) {
      if (addToast) addToast(err.message || 'Status update failed', 'error');
    }
  };

  const handleVerifySession = async (sessionId, action, reason = '') => {
    try {
      setVerifying(true);
      const res = await apiService.verifyPaymentSession(sessionId, { action, rejectionReason: reason });
      if (res && res.success) {
        if (addToast) addToast(res.message, 'success');
        fetchOrders(true);
        fetchPaymentSessions();
        setSelectedSession(null);
        if (res.order) {
          setSelectedOrder(res.order);
        }
        setShowRejectBox(false);
        setRejectionReasonInput('');
      }
    } catch (err) {
      if (addToast) addToast(err.message || 'Payment verification failed', 'error');
    } finally {
      setVerifying(false);
    }
  };

  const handlePrintReceipt = (ord) => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Order Receipt - ${ord.order_number}</title>
          <style>
            body { font-family: monospace; padding: 20px; color: #000; width: 300px; margin: 0 auto; }
            h2 { text-align: center; margin-bottom: 5px; }
            .line { border-bottom: 1px dashed #000; margin: 10px 0; }
            .row { display: flex; justify-content: space-between; font-size: 12px; margin: 4px 0; }
          </style>
        </head>
        <body>
          <h2>DOSA JUNCTION</h2>
          <p style="text-align:center; font-size: 11px; margin:0;">Authentic South Indian Restaurant</p>
          <div class="line"></div>
          <div class="row"><span>Order:</span><span>${ord.order_number}</span></div>
          <div class="row"><span>Customer:</span><span>${ord.customer_name}</span></div>
          <div class="row"><span>Phone:</span><span>${ord.customer_phone}</span></div>
          <div class="row"><span>Type:</span><span>${ord.order_type}</span></div>
          <div class="row"><span>Payment:</span><span>${ord.payment_method} (${ord.payment_status})</span></div>
          ${ord.utr_number ? `<div class="row"><span>UTR:</span><span>${ord.utr_number}</span></div>` : ''}
          <div class="line"></div>
          ${ord.items ? ord.items.map(i => `<div class="row"><span>${i.quantity}x ${cleanDishName(i.item_name)}</span><span>₹${parseFloat(i.subtotal).toFixed(2)}</span></div>`).join('') : ''}
          <div class="line"></div>
          <div class="row" style="font-weight:bold; font-size:14px;"><span>Total:</span><span>₹${parseFloat(ord.total_amount).toFixed(2)}</span></div>
          <div class="line"></div>
          <p style="text-align:center; font-size:10px;">Thank you for dining with us!</p>
          <script>window.onload = function() { window.print(); window.close(); }</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const renderSessionBadge = (status) => {
    let bg = '#EFF6FF';
    let color = '#1E40AF';
    let label = status || 'Created';

    if (status === 'Verification Pending') {
      bg = '#FEF3C7';
      color = '#B45309';
      label = 'Verification Pending';
    } else if (status === 'Approved') {
      bg = '#DCFCE7';
      color = '#15803D';
      label = 'Approved ✓';
    } else if (status === 'Rejected') {
      bg = '#FEE2E2';
      color = '#B91C1C';
      label = 'Rejected';
    }

    return (
      <span style={{
        padding: '4px 10px',
        borderRadius: '12px',
        fontSize: '0.75rem',
        fontWeight: 800,
        backgroundColor: bg,
        color: color,
        display: 'inline-block'
      }}>
        {label}
      </span>
    );
  };

  const pendingSessionsCount = paymentSessions.filter(s => s.status === 'Verification Pending' || s.status === 'Created').length;

  return (
    <div className="admin-page-layout" style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--color-cream-alt)' }}>
      <SEOHead title="Admin Order & Payment Verification Portal | Dosa Junction" />
      <AdminSidebar />

      <main className="admin-main-content" style={{ flexGrow: 1, padding: '2rem', overflowY: 'auto' }}>
        
        {/* Header Bar */}
        <div className="admin-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', color: 'var(--color-emerald)', margin: 0 }}>
              Admin Payment Verification & Order Management
            </h1>
            <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
              Inspect customer payment screenshots and UTR numbers. Approve payments to confirm and create official orders.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <button onClick={() => { fetchOrders(true); fetchPaymentSessions(); }} className="btn btn-outline btn-sm" style={{ backgroundColor: '#FFFFFF', flexShrink: 0 }}>
              <RefreshCw size={16} /> Refresh Data
            </button>
            <button
              onClick={handleClearAllOrders}
              className="btn btn-sm"
              style={{
                backgroundColor: '#dc2626',
                color: '#ffffff',
                border: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontWeight: 'bold',
                flexShrink: 0
              }}
            >
              <Trash2 size={16} /> Clear All
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
          <button
            onClick={() => setActiveTab('sessions')}
            style={{
              padding: '0.8rem 1.5rem',
              borderRadius: '14px',
              border: 'none',
              backgroundColor: activeTab === 'sessions' ? 'var(--color-emerald)' : '#FFFFFF',
              color: activeTab === 'sessions' ? '#FFFFFF' : 'var(--color-emerald)',
              fontWeight: 800,
              fontSize: '0.95rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
              transition: 'var(--transition-fast)'
            }}
          >
            ⚡ Pending Payment Verifications
            <span style={{
              backgroundColor: activeTab === 'sessions' ? '#FFC83B' : '#FEF3C7',
              color: activeTab === 'sessions' ? '#0F3825' : '#B45309',
              padding: '2px 8px',
              borderRadius: '10px',
              fontSize: '0.8rem',
              fontWeight: 900
            }}>
              {pendingSessionsCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            style={{
              padding: '0.8rem 1.5rem',
              borderRadius: '14px',
              border: 'none',
              backgroundColor: activeTab === 'orders' ? 'var(--color-emerald)' : '#FFFFFF',
              color: activeTab === 'orders' ? '#FFFFFF' : 'var(--color-emerald)',
              fontWeight: 800,
              fontSize: '0.95rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
              transition: 'var(--transition-fast)'
            }}
          >
            📦 Confirmed Orders ({orders.length})
          </button>
        </div>

        {/* Filters Box */}
        <div className="admin-filter-box" style={{
          backgroundColor: '#FFFFFF',
          padding: '1.25rem 1.5rem',
          borderRadius: '16px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
          marginBottom: '1.5rem',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1rem',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          
          <div style={{ flexGrow: 1, maxWidth: '340px' }}>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Payment Ref, Order #, Customer, UTR..."
              style={{
                width: '100%',
                padding: '0.6rem 1rem',
                borderRadius: '10px',
                border: '1px solid var(--color-border)',
                fontSize: '0.85rem',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-emerald)', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={todayOnly}
                onChange={(e) => setTodayOnly(e.target.checked)}
                style={{ accentColor: 'var(--color-gold)' }}
              /> Today Only
            </label>

            {activeTab === 'orders' && (
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{ padding: '0.5rem 0.8rem', borderRadius: '10px', border: '1px solid var(--color-border)', fontSize: '0.85rem', fontWeight: 600 }}
              >
                <option value="all">All Order Statuses</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Preparing">Preparing</option>
                <option value="Ready">Ready</option>
                <option value="Out for Delivery">Out for Delivery</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            )}
          </div>

        </div>

        {/* TAB 1: PENDING PAYMENT SESSIONS (PAY-DJ-XXXX) */}
        {activeTab === 'sessions' && (
          <div>
            {loading ? (
              <SkeletonLoader count={4} type="table" />
            ) : paymentSessions.length === 0 ? (
              <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', padding: '3rem', textAlign: 'center', boxShadow: '0 4px 14px rgba(0,0,0,0.04)' }}>
                <CheckCircle size={48} color="#16A34A" style={{ marginBottom: '0.8rem' }} />
                <h3 style={{ color: 'var(--color-emerald)', margin: 0 }}>No Pending Payment Sessions</h3>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
                  All customer payment proofs have been verified or no active payment sessions are waiting.
                </p>
              </div>
            ) : (
              <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 14px rgba(0,0,0,0.04)' }}>
                <div style={{ overflowX: 'auto' }}>
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Temp Payment ID</th>
                        <th>Customer Details</th>
                        <th>Cart Items</th>
                        <th>Type</th>
                        <th>Expected Amount</th>
                        <th>UTR / Screenshot</th>
                        <th>Payment Status</th>
                        <th>Submitted At</th>
                        <th>Verification Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paymentSessions.map((sess) => {
                        const cartItems = typeof sess.cart_items === 'string' ? JSON.parse(sess.cart_items) : (sess.cart_items || []);
                        const isExpanded = expandedOrders[`sess_${sess.id}`];

                        return (
                          <tr key={sess.id}>
                            <td style={{ whiteSpace: 'nowrap' }}>
                              <div style={{ fontWeight: 900, color: 'var(--color-emerald)', fontSize: '1.05rem', fontFamily: 'monospace' }}>
                                {sess.payment_ref}
                              </div>
                              {sess.order_number && (
                                <div style={{ fontSize: '0.74rem', color: '#16A34A', fontWeight: 800, marginTop: '2px' }}>
                                  Order: #{sess.order_number}
                                </div>
                              )}
                            </td>

                            <td>
                              <div style={{ fontWeight: 800, color: 'var(--color-emerald)' }}>{sess.customer_name}</div>
                              <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>{sess.customer_phone}</div>
                            </td>

                            {/* Cart Items Column */}
                            <td>
                              <div style={{ minWidth: '220px', maxWidth: '280px' }}>
                                {cartItems.length === 0 ? (
                                  <span style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>No items</span>
                                ) : cartItems.length === 1 ? (
                                  <div style={{ display: 'flex', justifyContent: 'space-between', backgroundColor: '#F8FAFC', padding: '4px 8px', borderRadius: '6px', border: '1px solid #E2E8F0', fontSize: '0.82rem' }}>
                                    <span style={{ fontWeight: 700, color: 'var(--color-emerald)' }}>
                                      {cartItems[0].quantity}x {cleanDishName(cartItems[0].item_name || cartItems[0].name)}
                                    </span>
                                    <span style={{ fontWeight: 700, color: 'var(--color-gold)' }}>₹{parseFloat(cartItems[0].subtotal || cartItems[0].price * cartItems[0].quantity).toFixed(2)}</span>
                                  </div>
                                ) : (
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', backgroundColor: '#F8FAFC', padding: '4px 8px', borderRadius: '6px', border: '1px solid #E2E8F0', fontSize: '0.82rem' }}>
                                      <span style={{ fontWeight: 700, color: 'var(--color-emerald)' }}>
                                        {cartItems[0].quantity}x {cleanDishName(cartItems[0].item_name || cartItems[0].name)}
                                      </span>
                                      <span style={{ fontWeight: 700, color: 'var(--color-gold)' }}>₹{parseFloat(cartItems[0].subtotal || cartItems[0].price * cartItems[0].quantity).toFixed(2)}</span>
                                    </div>

                                    <button
                                      type="button"
                                      onClick={() => toggleOrderExpand(`sess_${sess.id}`)}
                                      style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        padding: '4px 8px',
                                        borderRadius: '6px',
                                        border: '1px solid var(--color-gold)',
                                        backgroundColor: isExpanded ? '#FEF3C7' : '#FFFFFF',
                                        color: 'var(--color-gold)',
                                        fontWeight: 800,
                                        fontSize: '0.76rem',
                                        cursor: 'pointer'
                                      }}
                                    >
                                      <span>{isExpanded ? '▲ Hide Dishes' : `▼ + ${cartItems.length - 1} More Dishes`}</span>
                                      {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                    </button>

                                    {isExpanded && (
                                      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', marginTop: '2px' }}>
                                        {cartItems.slice(1).map((it, idx) => (
                                          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', backgroundColor: '#ECFDF5', padding: '4px 8px', borderRadius: '6px', border: '1px solid #A7F3D0', fontSize: '0.8rem' }}>
                                            <span style={{ fontWeight: 700, color: '#065F46' }}>
                                              {it.quantity}x {cleanDishName(it.item_name || it.name)}
                                            </span>
                                            <span style={{ fontWeight: 700, color: 'var(--color-gold)' }}>₹{parseFloat(it.subtotal || it.price * it.quantity).toFixed(2)}</span>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </td>

                            <td>
                              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-gold)' }}>
                                {sess.order_type}
                              </span>
                            </td>

                            <td style={{ fontWeight: 900, fontSize: '1.05rem', color: '#D97706', whiteSpace: 'nowrap' }}>
                              ₹{parseFloat(sess.total_amount).toFixed(2)}
                            </td>

                            {/* UTR & Screenshot Column */}
                            <td>
                              {sess.utr_number ? (
                                <div style={{ fontSize: '0.82rem' }}>
                                  <div style={{ fontFamily: 'monospace', fontWeight: 800, color: 'var(--color-emerald)' }}>
                                    UTR: {sess.utr_number}
                                  </div>
                                  {sess.payment_screenshot && (
                                    <button
                                      type="button"
                                      onClick={() => setPreviewImage(sess.payment_screenshot)}
                                      style={{
                                        border: 'none',
                                        background: 'none',
                                        color: '#2563EB',
                                        fontSize: '0.78rem',
                                        fontWeight: 800,
                                        cursor: 'pointer',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '3px',
                                        marginTop: '3px',
                                        padding: 0
                                      }}
                                    >
                                      <ImageIcon size={14} /> View Screenshot
                                    </button>
                                  )}
                                </div>
                              ) : (
                                <span style={{ color: 'var(--color-text-muted)', fontSize: '0.78rem', fontStyle: 'italic' }}>Pending Proof</span>
                              )}
                            </td>

                            <td>{renderSessionBadge(sess.status)}</td>

                            <td style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
                              {sess.payment_proof_submitted_at ? new Date(sess.payment_proof_submitted_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) : new Date(sess.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                            </td>

                            {/* Action Buttons: Approve (Creates Order) / Reject */}
                            <td>
                              {sess.status === 'Approved' ? (
                                <span style={{ color: '#16A34A', fontWeight: 800, fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <CheckCircle2 size={16} /> Order #{sess.order_number} Created
                                </span>
                              ) : (
                                <div style={{ display: 'flex', gap: '6px' }}>
                                  <button
                                    onClick={() => handleVerifySession(sess.id, 'approve')}
                                    disabled={verifying}
                                    style={{
                                      padding: '6px 12px',
                                      backgroundColor: '#16A34A',
                                      color: '#FFFFFF',
                                      borderRadius: '8px',
                                      border: 'none',
                                      cursor: 'pointer',
                                      fontWeight: 800,
                                      fontSize: '0.78rem',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '4px',
                                      boxShadow: '0 2px 6px rgba(22, 163, 74, 0.3)'
                                    }}
                                  >
                                    <CheckCircle size={14} /> Approve Payment
                                  </button>

                                  <button
                                    onClick={() => {
                                      const reason = window.prompt(`Enter rejection reason for session #${sess.payment_ref}:`, 'Payment proof screenshot or UTR invalid.');
                                      if (reason !== null) {
                                        handleVerifySession(sess.id, 'reject', reason);
                                      }
                                    }}
                                    disabled={verifying}
                                    style={{
                                      padding: '6px 10px',
                                      backgroundColor: '#FEE2E2',
                                      color: '#DC2626',
                                      borderRadius: '8px',
                                      border: '1px solid #FCA5A5',
                                      cursor: 'pointer',
                                      fontWeight: 800,
                                      fontSize: '0.78rem',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '4px'
                                    }}
                                  >
                                    <XCircle size={14} /> Reject
                                  </button>
                                </div>
                              )}
                            </td>

                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: CONFIRMED ORDERS (DJ-XXXX) */}
        {activeTab === 'orders' && (
          <div>
            {loading ? (
              <SkeletonLoader count={6} type="table" />
            ) : orders.length === 0 ? (
              <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', padding: '3rem', textAlign: 'center', boxShadow: '0 4px 14px rgba(0,0,0,0.04)' }}>
                <Package size={48} color="var(--color-gold)" style={{ marginBottom: '0.8rem' }} />
                <h3 style={{ color: 'var(--color-emerald)', margin: 0 }}>No Confirmed Orders Yet</h3>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
                  Approved payment sessions will appear here as confirmed orders.
                </p>
              </div>
            ) : (
              <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 14px rgba(0,0,0,0.04)' }}>
                <div style={{ overflowX: 'auto' }}>
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Order #</th>
                        <th>Customer</th>
                        <th>Ordered Dishes</th>
                        <th>Type</th>
                        <th>Total</th>
                        <th>UTR / Proof</th>
                        <th>Order Status</th>
                        <th>Change Kitchen Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((ord) => {
                        const isExpanded = expandedOrders[ord.id];
                        const itemsList = ord.items || [];
                        const itemCount = itemsList.length;

                        const rawTimestamp = ord.created_at || (ord.id && !isNaN(Number(ord.id)) ? new Date(Number(ord.id)).toISOString() : null);
                        const validTimestamp = rawTimestamp && !isNaN(new Date(rawTimestamp).getTime()) ? rawTimestamp : null;
                        const orderDateObj = validTimestamp ? new Date(validTimestamp) : new Date();
                        const orderTimeStr = orderDateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

                        return (
                          <tr key={ord.id}>
                            <td style={{ whiteSpace: 'nowrap' }}>
                              <div style={{ fontWeight: 900, color: 'var(--color-emerald)', fontSize: '1.05rem', fontFamily: 'monospace' }}>
                                {ord.order_number}
                              </div>
                              <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '3px', marginTop: '2px' }}>
                                <Clock size={12} color="var(--color-gold)" />
                                <span>{orderTimeStr}</span>
                              </div>
                            </td>

                            <td>
                              <div style={{ fontWeight: 800, color: 'var(--color-emerald)' }}>{ord.customer_name}</div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{ord.customer_phone}</div>
                            </td>

                            {/* Ordered Dishes Column */}
                            <td>
                              <div style={{ minWidth: '220px', maxWidth: '280px' }}>
                                {itemCount === 0 ? (
                                  <span style={{ color: 'var(--color-text-muted)', fontStyle: 'italic', fontSize: '0.8rem' }}>No items</span>
                                ) : itemCount === 1 ? (
                                  <div style={{ display: 'flex', justifyContent: 'space-between', backgroundColor: '#F8FAFC', padding: '4px 8px', borderRadius: '6px', border: '1px solid #E2E8F0', fontSize: '0.82rem' }}>
                                    <span style={{ fontWeight: 700, color: 'var(--color-emerald)' }}>
                                      {itemsList[0].quantity}x {cleanDishName(itemsList[0].item_name)}
                                    </span>
                                    <span style={{ fontWeight: 700, color: 'var(--color-gold)' }}>₹{parseFloat(itemsList[0].subtotal).toFixed(2)}</span>
                                  </div>
                                ) : (
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', backgroundColor: '#F8FAFC', padding: '4px 8px', borderRadius: '6px', border: '1px solid #E2E8F0', fontSize: '0.82rem' }}>
                                      <span style={{ fontWeight: 700, color: 'var(--color-emerald)' }}>
                                        {itemsList[0].quantity}x {cleanDishName(itemsList[0].item_name)}
                                      </span>
                                      <span style={{ fontWeight: 700, color: 'var(--color-gold)' }}>₹{parseFloat(itemsList[0].subtotal).toFixed(2)}</span>
                                    </div>

                                    <button
                                      type="button"
                                      onClick={() => toggleOrderExpand(ord.id)}
                                      style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        padding: '4px 8px',
                                        borderRadius: '6px',
                                        border: '1px solid var(--color-gold)',
                                        backgroundColor: isExpanded ? '#FEF3C7' : '#FFFFFF',
                                        color: 'var(--color-gold)',
                                        fontWeight: 800,
                                        fontSize: '0.78rem',
                                        cursor: 'pointer'
                                      }}
                                    >
                                      <span>{isExpanded ? '▲ Hide Extra Dishes' : `▼ + ${itemCount - 1} More Dishes`}</span>
                                      {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                    </button>

                                    {isExpanded && (
                                      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', marginTop: '2px' }}>
                                        {itemsList.slice(1).map((it, idx) => (
                                          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', backgroundColor: '#ECFDF5', padding: '4px 8px', borderRadius: '6px', border: '1px solid #A7F3D0', fontSize: '0.8rem' }}>
                                            <span style={{ fontWeight: 700, color: '#065F46' }}>
                                              {it.quantity}x {cleanDishName(it.item_name)}
                                            </span>
                                            <span style={{ fontWeight: 700, color: 'var(--color-gold)' }}>₹{parseFloat(it.subtotal).toFixed(2)}</span>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </td>

                            <td>
                              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-gold)' }}>
                                {ord.order_type}
                              </span>
                            </td>

                            <td style={{ fontWeight: 900, whiteSpace: 'nowrap' }}>₹{parseFloat(ord.total_amount).toFixed(2)}</td>

                            <td>
                              {ord.utr_number ? (
                                <div style={{ fontSize: '0.8rem' }}>
                                  <div style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--color-emerald)' }}>
                                    UTR: {ord.utr_number}
                                  </div>
                                  {ord.payment_screenshot && (
                                    <button
                                      type="button"
                                      onClick={() => setPreviewImage(ord.payment_screenshot)}
                                      style={{ border: 'none', background: 'none', color: '#2563EB', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '3px', marginTop: '2px', padding: 0 }}
                                    >
                                      <ImageIcon size={13} /> View Proof
                                    </button>
                                  )}
                                </div>
                              ) : (
                                <span style={{ color: '#16A34A', fontWeight: 700, fontSize: '0.78rem' }}>Verified ✓</span>
                              )}
                            </td>

                            <td><StatusBadge status={ord.status} /></td>

                            <td>
                              <select
                                value={ord.status}
                                onChange={(e) => handleStatusUpdate(ord.id, e.target.value)}
                                style={{
                                  padding: '0.35rem 0.6rem',
                                  borderRadius: '8px',
                                  fontSize: '0.8rem',
                                  fontWeight: 700,
                                  outline: 'none',
                                  border: '1px solid var(--color-border)',
                                  backgroundColor: '#FFFFFF',
                                  cursor: 'pointer'
                                }}
                              >
                                <option value="Pending">Pending</option>
                                <option value="Confirmed">Confirmed</option>
                                <option value="Preparing">Preparing</option>
                                <option value="Ready">Ready</option>
                                {ord.order_type === 'Home Delivery' && <option value="Out for Delivery">Out for Delivery</option>}
                                <option value="Completed">Completed</option>
                                <option value="Cancelled">Cancelled</option>
                              </select>
                            </td>

                            <td>
                              <button
                                onClick={() => handlePrintReceipt(ord)}
                                title="Print KOT / Receipt"
                                style={{ padding: '5px 10px', backgroundColor: '#FFFFFF', borderRadius: '8px', color: '#1F2937', border: '1px solid var(--color-border)', cursor: 'pointer', fontWeight: 700, fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                              >
                                <Printer size={15} /> Receipt
                              </button>
                            </td>

                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

      </main>

      {/* Full Screen Image Lightbox Preview */}
      {previewImage && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(4px)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem'
          }}
          onClick={() => setPreviewImage(null)}
        >
          <div style={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh' }} onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setPreviewImage(null)}
              style={{
                position: 'absolute',
                top: '-40px',
                right: '0',
                backgroundColor: '#FFFFFF',
                color: '#000000',
                border: 'none',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontWeight: 900
              }}
            >
              <X size={20} />
            </button>
            <img
              src={previewImage}
              alt="Payment Screenshot Full Preview"
              style={{ maxWidth: '100%', maxHeight: '85vh', borderRadius: '12px', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}
            />
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminOrders;
