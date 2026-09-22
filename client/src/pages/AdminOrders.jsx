import React, { useState, useEffect } from 'react';
import { ShoppingBag, Search, Filter, RefreshCw, Eye, X, Printer, Package, Clock, Trash2, Image as ImageIcon, MapPin, ChevronDown, ChevronUp } from 'lucide-react';
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
    }, 4000); // 4-second auto-sync for live orders

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
      if (res && res.orders) setOrders(res.orders);
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
      if (res && res.success) {
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

  return (
    <div className="admin-page-layout" style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--color-cream-alt)' }}>
      <SEOHead title="Admin Orders Management | Dosa Junction" />
      <style>{`
        .admin-table th {
          background-color: #0F172A !important;
          color: #FFFFFF !important;
        }
        .admin-table thead, .admin-table thead tr {
          background-color: #0F172A !important;
        }
      `}</style>
      <AdminSidebar />

      <main className="admin-main-content" style={{ flexGrow: 1, padding: '2rem', overflowY: 'auto' }}>
        
        {/* Header Bar */}
        <div className="admin-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', color: '#0F172A', margin: 0 }}>
              Orders Management
            </h1>
            <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
              Manage live customer orders, update kitchen preparation status, and track delivery.
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
              <Trash2 size={16} /> Clear All
            </button>
          </div>
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
              placeholder="Search by Order #, Customer, Phone, UTR..."
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
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: 700, color: '#0F172A', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={todayOnly}
                onChange={(e) => setTodayOnly(e.target.checked)}
                style={{ accentColor: 'var(--color-gold)' }}
              /> Today Only
            </label>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              style={{ padding: '0.5rem 0.8rem', borderRadius: '10px', border: '1px solid var(--color-border)', fontSize: '0.85rem', fontWeight: 600 }}
            >
              <option value="all">All Order Types</option>
              <option value="Dine In">Dine In</option>
              <option value="Takeaway">Takeaway</option>
              <option value="Home Delivery">Home Delivery</option>
            </select>

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
          </div>

        </div>

        {/* ORDERS TABLE */}
        <div>
          {loading ? (
            <SkeletonLoader count={6} type="table" />
          ) : orders.length === 0 ? (
            <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', padding: '3rem', textAlign: 'center', boxShadow: '0 4px 14px rgba(0,0,0,0.04)' }}>
              <Package size={48} color="var(--color-gold)" style={{ marginBottom: '0.8rem' }} />
              <h3 style={{ color: '#0F172A', margin: 0 }}>No Orders Found</h3>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
                Customer orders will appear here once placed.
              </p>
            </div>
          ) : (
            <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 14px rgba(0,0,0,0.04)' }}>
              <div style={{ overflowX: 'auto' }}>
                <table className="admin-table">
                  <thead style={{ backgroundColor: '#0F172A' }}>
                    <tr style={{ backgroundColor: '#0F172A' }}>
                      <th style={{ backgroundColor: '#0F172A', color: '#FFFFFF' }}>Order No.</th>
                      <th style={{ backgroundColor: '#0F172A', color: '#FFFFFF' }}>Customer</th>
                      <th style={{ backgroundColor: '#0F172A', color: '#FFFFFF' }}>Ordered Dishes</th>
                      <th style={{ backgroundColor: '#0F172A', color: '#FFFFFF' }}>Type</th>
                      <th style={{ backgroundColor: '#0F172A', color: '#FFFFFF' }}>Total</th>
                      <th style={{ backgroundColor: '#0F172A', color: '#FFFFFF' }}>Payment Mode</th>
                      <th style={{ backgroundColor: '#0F172A', color: '#FFFFFF' }}>Order Status</th>
                      <th style={{ backgroundColor: '#0F172A', color: '#FFFFFF' }}>Change Kitchen Status</th>
                      <th style={{ backgroundColor: '#0F172A', color: '#FFFFFF' }}>Customer Address</th>
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

                      return (
                        <tr key={ord.id}>
                          <td style={{ whiteSpace: 'nowrap' }}>
                            <div style={{ fontWeight: 900, color: '#0F172A', fontSize: '1.2rem' }}>
                              {index + 1}
                            </div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '3px', marginTop: '2px' }}>
                              <Clock size={12} color="var(--color-gold)" />
                              <span>{orderTimeStr}</span>
                            </div>
                          </td>

                          <td>
                            <div style={{ fontWeight: 800, color: '#0F172A' }}>{ord.customer_name}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{ord.customer_phone}</div>
                          </td>

                          {/* Ordered Dishes Column */}
                          <td>
                            <div style={{ minWidth: '220px', maxWidth: '280px' }}>
                              {itemCount === 0 ? (
                                <span style={{ color: 'var(--color-text-muted)', fontStyle: 'italic', fontSize: '0.8rem' }}>No items</span>
                              ) : itemCount === 1 ? (
                                <div style={{ display: 'flex', justifyContent: 'space-between', backgroundColor: '#F8FAFC', padding: '4px 8px', borderRadius: '6px', border: '1px solid #E2E8F0', fontSize: '0.82rem' }}>
                                  <span style={{ fontWeight: 700, color: '#0F172A' }}>
                                    {itemsList[0].quantity}x {cleanDishName(itemsList[0].item_name)}
                                  </span>
                                  <span style={{ fontWeight: 700, color: 'var(--color-gold)' }}>₹{parseFloat(itemsList[0].subtotal).toFixed(2)}</span>
                                </div>
                              ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', backgroundColor: '#F8FAFC', padding: '4px 8px', borderRadius: '6px', border: '1px solid #E2E8F0', fontSize: '0.82rem' }}>
                                    <span style={{ fontWeight: 700, color: '#0F172A' }}>
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
                                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', backgroundColor: '#F1F5F9', padding: '4px 8px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.8rem' }}>
                                          <span style={{ fontWeight: 700, color: '#0F172A' }}>
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
                            {ord.payment_method === 'Cash on Delivery' || ord.payment_status === 'Cash on Delivery' ? (
                              <span style={{ backgroundColor: '#DCFCE7', color: '#166534', padding: '4px 10px', borderRadius: '8px', fontWeight: 800, fontSize: '0.78rem', display: 'inline-block', border: '1px solid #86EFAC' }}>
                                💵 Cash on Delivery
                              </span>
                            ) : ord.payment_method === 'Pay at Counter' || ord.payment_status === 'Pay at Counter' ? (
                              <span style={{ backgroundColor: '#FEF3C7', color: '#B45309', padding: '4px 10px', borderRadius: '8px', fontWeight: 800, fontSize: '0.78rem', display: 'inline-block', border: '1px solid #FCD34D' }}>
                                🏪 Pay at Counter
                              </span>
                            ) : ord.utr_number ? (
                              <div style={{ fontSize: '0.8rem' }}>
                                <div style={{ fontFamily: 'monospace', fontWeight: 700, color: '#0F172A' }}>
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
                              <span style={{ backgroundColor: '#EFF6FF', color: '#1D4ED8', padding: '4px 10px', borderRadius: '8px', fontWeight: 800, fontSize: '0.78rem', display: 'inline-block', border: '1px solid #BFDBFE' }}>
                                Online UPI ✓
                              </span>
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
                            {(() => {
                              const fullAddr = ord.delivery_address || ord.deliveryAddress || ord.address || ord.customer_address || ord.customerAddress || '';
                              const extraDetails = [ord.landmark, ord.city, ord.pincode].filter(Boolean).join(', ');

                              if (fullAddr || extraDetails) {
                                return (
                                  <div style={{ minWidth: '170px', maxWidth: '250px', fontSize: '0.82rem', lineHeight: '1.35' }}>
                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '5px' }}>
                                      <MapPin size={14} color="var(--color-gold)" style={{ flexShrink: 0, marginTop: '2px' }} />
                                      <div>
                                        <div style={{ fontWeight: 700, color: '#0F172A', wordBreak: 'break-word' }}>
                                          {fullAddr || extraDetails}
                                        </div>
                                        {fullAddr && extraDetails && (!ord.city || !fullAddr.includes(ord.city)) && (
                                          <div style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                                            {extraDetails}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                );
                              }

                              return (
                                <span style={{ color: 'var(--color-text-muted)', fontSize: '0.78rem', fontStyle: 'italic' }}>
                                  {ord.order_type === 'Dine In' ? 'Dine In' : ord.order_type === 'Takeaway' ? 'Takeaway' : 'No Address Provided'}
                                </span>
                              );
                            })()}
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
