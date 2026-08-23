import React, { useState, useEffect } from 'react';
import { ShoppingBag, Search, Filter, RefreshCw, Eye, X, Printer, CheckCircle, Ban, DollarSign, ChevronDown, ChevronUp, Package, Clock, Trash2, CheckCircle2, XCircle, FileCheck, ExternalLink, Image as ImageIcon } from 'lucide-react';
import AdminSidebar from '../components/AdminSidebar';
import StatusBadge from '../components/StatusBadge';
import SkeletonLoader from '../components/SkeletonLoader';
import SEOHead from '../components/SEOHead';
import { apiService, cleanDishName } from '../services/api';
import { useToast } from '../context/ToastContext';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
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

    const intervalId = setInterval(() => {
      fetchOrders(false);
    }, 3000); // 3-second auto-sync for live mobile orders

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

  const handleClearAllOrders = async () => {
    if (window.confirm('Are you sure you want to clear ALL dummy & past orders? This will wipe the list completely.')) {
      try {
        setLoading(true);
        await apiService.clearAllOrders();
        setOrders([]);
        if (addToast) addToast('All dummy orders cleared successfully!', 'success');
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

  const handleVerifyPayment = async (orderId, action, reason = '') => {
    try {
      setVerifying(true);
      const res = await apiService.verifyPayment(orderId, action, reason);
      if (res.success) {
        if (addToast) addToast(res.message, 'success');
        fetchOrders();
        if (selectedOrder && (selectedOrder.id === orderId || selectedOrder.order_number === orderId)) {
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

  const renderPaymentBadge = (status) => {
    let bg = '#FEF3C7';
    let color = '#B45309';
    let label = status || 'Payment Verification Pending';

    if (status === 'Payment Verified' || status === 'PAID') {
      bg = '#DCFCE7';
      color = '#15803D';
      label = 'Payment Verified';
    } else if (status === 'Payment Rejected' || status === 'FAILED') {
      bg = '#FEE2E2';
      color = '#B91C1C';
      label = 'Payment Rejected';
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

  return (
    <div className="admin-page-layout" style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--color-cream-alt)' }}>
      <SEOHead title="Admin Order & UPI Verification Management | Dosa Junction" />
      <AdminSidebar />

      <main className="admin-main-content" style={{ flexGrow: 1, padding: '2rem', overflowY: 'auto' }}>
        
        {/* Header Bar */}
        <div className="admin-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', color: 'var(--color-emerald)', margin: 0 }}>
              Admin Order & Payment Management
            </h1>
            <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
              Compare expected amounts, customer UTR numbers, payment screenshots, approve or reject UPI payments, and manage kitchen status.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <button onClick={() => fetchOrders(true)} className="btn btn-outline btn-sm" style={{ backgroundColor: '#FFFFFF', flexShrink: 0 }}>
              <RefreshCw size={16} /> Refresh Orders
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
              <Trash2 size={16} /> Clear All Orders
            </button>
          </div>
        </div>

        {/* Filter Controls */}
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
          
          <div style={{ flexGrow: 1, maxWidth: '320px' }}>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by order #, customer, mobile, UTR..."
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

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ padding: '0.5rem 0.8rem', borderRadius: '10px', border: '1px solid var(--color-border)', fontSize: '0.85rem', fontWeight: 600 }}
            >
              <option value="all">All Order Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Preparing">Preparing</option>
              <option value="Ready">Ready</option>
              <option value="Out for Delivery">Out for Delivery</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>

            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              style={{ padding: '0.5rem 0.8rem', borderRadius: '10px', border: '1px solid var(--color-border)', fontSize: '0.85rem', fontWeight: 600 }}
            >
              <option value="all">All Order Types</option>
              <option value="Home Delivery">Home Delivery</option>
              <option value="Takeaway">Takeaway</option>
              <option value="Dine In">Dine In</option>
            </select>

            {/* Payment Status Filter */}
            <select
              value={paymentStatusFilter}
              onChange={(e) => setPaymentStatusFilter(e.target.value)}
              style={{ padding: '0.5rem 0.8rem', borderRadius: '10px', border: '1px solid var(--color-border)', fontSize: '0.85rem', fontWeight: 600 }}
            >
              <option value="all">All Payment Statuses</option>
              <option value="Payment Verification Pending">Payment Verification Pending</option>
              <option value="Payment Verified">Payment Verified</option>
              <option value="Payment Rejected">Payment Rejected</option>
              <option value="PENDING">PENDING</option>
              <option value="PAID">PAID</option>
            </select>

          </div>

        </div>

        {/* Data Table */}
        {loading ? (
          <SkeletonLoader count={6} type="table" />
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
                    <th>Payment Status</th>
                    <th>Order Status</th>
                    <th>Change Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((ord, index) => {
                    const isExpanded = expandedOrders[ord.id];
                    const itemsList = ord.items || [];
                    const itemCount = itemsList.length;

                    const rawTimestamp = ord.created_at || (ord.id && !isNaN(Number(ord.id)) ? new Date(Number(ord.id)).toISOString() : null);
                    const validTimestamp = rawTimestamp && !isNaN(new Date(rawTimestamp).getTime()) ? rawTimestamp : null;
                    const orderDateObj = validTimestamp ? new Date(validTimestamp) : new Date();
                    const orderTimeStr = orderDateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
                    const orderDateStr = orderDateObj.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });

                    return (
                      <tr key={ord.id}>
                        <td style={{ whiteSpace: 'nowrap' }}>
                          <div style={{ fontWeight: 800, color: 'var(--color-emerald)', fontSize: '1.05rem' }}>
                            {ord.order_number}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '3px', marginTop: '2px' }}>
                            <Clock size={12} color="var(--color-gold)" />
                            <span>{orderTimeStr} ({orderDateStr})</span>
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
                        <td style={{ fontWeight: 800, whiteSpace: 'nowrap' }}>₹{parseFloat(ord.total_amount).toFixed(2)}</td>
                        
                        {/* UTR & Screenshot Column */}
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
                                  style={{
                                    border: 'none',
                                    background: 'none',
                                    color: '#2563EB',
                                    fontSize: '0.75rem',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '3px',
                                    marginTop: '2px',
                                    padding: 0
                                  }}
                                >
                                  <ImageIcon size={13} /> View Screenshot
                                </button>
                              )}
                            </div>
                          ) : (
                            <span style={{ color: 'var(--color-text-muted)', fontSize: '0.78rem', fontStyle: 'italic' }}>Pending Proof</span>
                          )}
                        </td>

                        <td>{renderPaymentBadge(ord.payment_status)}</td>
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
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button
                              onClick={() => setSelectedOrder(ord)}
                              title="Verify Payment & View Details"
                              style={{ padding: '5px 10px', backgroundColor: 'var(--color-cream-alt)', borderRadius: '8px', color: 'var(--color-emerald)', border: '1px solid var(--color-border)', cursor: 'pointer', fontWeight: 700, fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                            >
                              <Eye size={15} /> Verify
                            </button>

                            <button
                              onClick={() => handlePrintReceipt(ord)}
                              title="Print Receipt"
                              style={{ padding: '5px 8px', backgroundColor: '#F1F5F9', borderRadius: '8px', color: '#475569', border: '1px solid #CBD5E1', cursor: 'pointer' }}
                            >
                              <Printer size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 14. Admin Verification & Compare Modal */}
        {selectedOrder && (
          <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '680px', borderRadius: '24px', padding: '2rem' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.75rem' }}>
                <h3 style={{ fontFamily: 'monospace', fontSize: '1.3rem', color: 'var(--color-emerald)', margin: 0 }}>
                  Payment Verification #{selectedOrder.order_number}
                </h3>
                <button onClick={() => setSelectedOrder(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                  <X size={22} color="#64748B" />
                </button>
              </div>

              {/* 14. Admin Comparison Box */}
              <div style={{
                backgroundColor: 'var(--color-cream-alt, #FAFAFA)',
                borderRadius: '16px',
                padding: '1.2rem',
                border: '1.5px solid var(--color-border)',
                marginBottom: '1.5rem'
              }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--color-emerald)', margin: '0 0 0.8rem 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FileCheck size={18} color="var(--color-gold)" /> 14. Payment Comparison & Verification Data
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.9rem' }}>
                  <div style={{ backgroundColor: '#FFFFFF', padding: '0.8rem 1rem', borderRadius: '10px', border: '1px solid #E5E7EB' }}>
                    <span style={{ color: 'var(--color-text-muted)', display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Order ID</span>
                    <strong style={{ fontFamily: 'monospace', color: 'var(--color-emerald)', fontSize: '1.05rem' }}>{selectedOrder.order_number}</strong>
                  </div>

                  <div style={{ backgroundColor: '#FFFFFF', padding: '0.8rem 1rem', borderRadius: '10px', border: '1px solid #E5E7EB' }}>
                    <span style={{ color: 'var(--color-text-muted)', display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Expected Amount</span>
                    <strong style={{ color: 'var(--color-gold)', fontSize: '1.15rem' }}>₹{parseFloat(selectedOrder.total_amount).toFixed(2)}</strong>
                  </div>

                  <div style={{ backgroundColor: '#FFFFFF', padding: '0.8rem 1rem', borderRadius: '10px', border: '1px solid #E5E7EB' }}>
                    <span style={{ color: 'var(--color-text-muted)', display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Customer UTR Number</span>
                    <strong style={{ fontFamily: 'monospace', color: selectedOrder.utr_number ? '#065F46' : '#991B1B', fontSize: '1rem' }}>
                      {selectedOrder.utr_number || 'Not Submitted Yet'}
                    </strong>
                  </div>

                  <div style={{ backgroundColor: '#FFFFFF', padding: '0.8rem 1rem', borderRadius: '10px', border: '1px solid #E5E7EB' }}>
                    <span style={{ color: 'var(--color-text-muted)', display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Proof Date & Time</span>
                    <strong>
                      {selectedOrder.payment_proof_submitted_at
                        ? new Date(selectedOrder.payment_proof_submitted_at).toLocaleString()
                        : new Date(selectedOrder.created_at).toLocaleString()}
                    </strong>
                  </div>
                </div>

                {/* Screenshot Viewer */}
                <div style={{ marginTop: '1rem' }}>
                  <span style={{ color: 'var(--color-text-muted)', display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '6px' }}>Payment Screenshot:</span>
                  {selectedOrder.payment_screenshot ? (
                    <div style={{ textAlign: 'center', backgroundColor: '#FFFFFF', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
                      <img
                        src={selectedOrder.payment_screenshot}
                        alt="Customer Payment Screenshot"
                        onClick={() => setPreviewImage(selectedOrder.payment_screenshot)}
                        style={{ maxHeight: '180px', maxWidth: '100%', borderRadius: '8px', cursor: 'pointer', border: '1px solid #DDD' }}
                      />
                      <span style={{ display: 'block', fontSize: '0.75rem', color: '#2563EB', marginTop: '4px', cursor: 'pointer', fontWeight: 700 }} onClick={() => setPreviewImage(selectedOrder.payment_screenshot)}>
                        🔍 Click image to enlarge full size
                      </span>
                    </div>
                  ) : (
                    <div style={{ padding: '0.8rem', backgroundColor: '#FFFBEB', borderRadius: '10px', color: '#B45309', fontSize: '0.85rem', fontStyle: 'italic' }}>
                      ⚠️ Screenshot proof not submitted yet by customer.
                    </div>
                  )}
                </div>
              </div>

              {/* 16 & 17. Admin Verification Action Buttons */}
              <div style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                padding: '1.2rem',
                border: '1px solid var(--color-border)',
                marginBottom: '1.5rem'
              }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--color-emerald)', marginBottom: '0.8rem' }}>
                  Admin Verification Decision
                </h4>
                
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  {/* 16. Approve Button */}
                  <button
                    type="button"
                    disabled={verifying}
                    onClick={() => handleVerifyPayment(selectedOrder.id, 'approve')}
                    className="btn btn-primary"
                    style={{
                      backgroundColor: '#16A34A',
                      borderColor: '#16A34A',
                      color: '#FFFFFF',
                      fontWeight: 800,
                      flex: 1,
                      padding: '0.75rem',
                      borderRadius: '12px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    <CheckCircle2 size={18} /> Approve Payment (Verified & Confirm)
                  </button>

                  {/* 17. Reject Button Toggle */}
                  <button
                    type="button"
                    disabled={verifying}
                    onClick={() => setShowRejectBox(!showRejectBox)}
                    className="btn btn-outline"
                    style={{
                      borderColor: '#DC2626',
                      color: '#DC2626',
                      fontWeight: 800,
                      flex: 1,
                      padding: '0.75rem',
                      borderRadius: '12px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    <XCircle size={18} /> Reject Payment
                  </button>
                </div>

                {/* 17. Rejection Reason Input Form */}
                {showRejectBox && (
                  <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px dashed #FCA5A5' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, color: '#991B1B', marginBottom: '6px' }}>
                      Rejection Reason (Shown to Customer) *
                    </label>
                    <input
                      type="text"
                      value={rejectionReasonInput}
                      onChange={(e) => setRejectionReasonInput(e.target.value)}
                      placeholder="e.g. UTR number mismatch or incorrect payment amount"
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.85rem',
                        borderRadius: '10px',
                        border: '1px solid #FCA5A5',
                        fontSize: '0.88rem',
                        marginBottom: '0.8rem'
                      }}
                    />
                    <button
                      type="button"
                      disabled={verifying}
                      onClick={() => handleVerifyPayment(selectedOrder.id, 'reject', rejectionReasonInput)}
                      style={{
                        width: '100%',
                        padding: '0.7rem',
                        backgroundColor: '#DC2626',
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: '10px',
                        fontWeight: 800,
                        cursor: 'pointer'
                      }}
                    >
                      Confirm Rejection
                    </button>
                  </div>
                )}
              </div>

              {/* Order Info & Items */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.85rem', marginBottom: '1rem' }}>
                <div><span style={{ color: 'var(--color-text-muted)', display: 'block' }}>Customer</span> <strong>{selectedOrder.customer_name} ({selectedOrder.customer_phone})</strong></div>
                <div><span style={{ color: 'var(--color-text-muted)', display: 'block' }}>Order Type</span> <strong>{selectedOrder.order_type}</strong></div>
              </div>

              <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--color-emerald)', marginBottom: '0.4rem' }}>
                Ordered Items ({selectedOrder.items?.length || 0})
              </h4>
              <div style={{ marginBottom: '1.2rem', maxHeight: '140px', overflowY: 'auto' }}>
                {selectedOrder.items?.map((it, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', padding: '0.3rem 0', borderBottom: '1px dashed var(--color-border)' }}>
                    <span>{it.quantity}x {cleanDishName(it.item_name)}</span>
                    <span style={{ fontWeight: 800 }}>₹{parseFloat(it.subtotal).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '2px dashed var(--color-border)', paddingTop: '0.8rem' }}>
                <button onClick={() => handlePrintReceipt(selectedOrder)} className="btn btn-outline btn-sm">
                  <Printer size={16} /> Print Receipt
                </button>
                <button onClick={() => setSelectedOrder(null)} className="btn btn-primary btn-sm">
                  Close
                </button>
              </div>

            </div>
          </div>
        )}

        {/* Full Image Preview Modal */}
        {previewImage && (
          <div className="modal-overlay" onClick={() => setPreviewImage(null)} style={{ zIndex: 9999 }}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '80vw', maxHeight: '90vh', padding: '1.5rem', textAlign: 'center', backgroundColor: '#000000' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <span style={{ color: '#FFFFFF', fontWeight: 700, fontSize: '1rem' }}>Payment Screenshot Full View</span>
                <button onClick={() => setPreviewImage(null)} style={{ background: 'none', border: 'none', color: '#FFFFFF', cursor: 'pointer' }}>
                  <X size={24} />
                </button>
              </div>
              <img src={previewImage} alt="Payment Screenshot Full View" style={{ maxWidth: '100%', maxHeight: '75vh', objectFit: 'contain' }} />
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default AdminOrders;
