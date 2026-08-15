import React, { useState, useEffect } from 'react';
import { ShoppingBag, Search, Filter, RefreshCw, Eye, X, Printer, CheckCircle, Ban, DollarSign, ChevronDown, ChevronUp, Package } from 'lucide-react';
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

  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('all');
  const [todayOnly, setTodayOnly] = useState(false);
  const [search, setSearch] = useState('');

  const { addToast } = useToast();

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, typeFilter, paymentStatusFilter, todayOnly, search]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (typeFilter !== 'all') params.append('orderType', typeFilter);
      if (paymentStatusFilter !== 'all') params.append('paymentStatus', paymentStatusFilter);
      if (todayOnly) params.append('today', 'true');
      if (search.trim()) params.append('search', search.trim());

      const res = await apiService.getAdminOrders(params.toString());
      if (res.orders) setOrders(res.orders);
    } catch (e) {
      if (addToast) addToast('Failed to load admin orders list', 'error');
    } finally {
      setLoading(false);
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
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder(prev => ({ ...prev, status: newStatus }));
        }
      }
    } catch (err) {
      if (addToast) addToast(err.message || 'Status update failed', 'error');
    }
  };

  const handleMarkPaymentPaid = async (orderId) => {
    try {
      const res = await apiService.updatePaymentStatus(orderId, 'PAID');
      if (res.success) {
        if (addToast) addToast('Payment status marked as PAID!', 'success');
        fetchOrders();
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder(prev => ({ ...prev, payment_status: 'PAID' }));
        }
      }
    } catch (err) {
      if (addToast) addToast(err.message || 'Failed to update payment status', 'error');
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
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--color-cream-alt)' }}>
      <SEOHead title="Admin Order Management | Dosa Junction" />
      <AdminSidebar />

      <main style={{ flexGrow: 1, padding: '2rem', overflowY: 'auto' }}>
        
        {/* Header Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', color: 'var(--color-emerald)', margin: 0 }}>
              Admin Order Management
            </h1>
            <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
              Manage customer orders, expand ordered dishes dropdowns, advance status transitions, and update payment records.
            </p>
          </div>

          <button onClick={fetchOrders} className="btn btn-outline btn-sm" style={{ backgroundColor: '#FFFFFF' }}>
            <RefreshCw size={16} /> Sync Live Orders
          </button>
        </div>

        {/* Filter Controls */}
        <div style={{
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
              placeholder="Search by order #, customer, mobile..."
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
                    <th>Payment Method</th>
                    <th>Payment Status</th>
                    <th>Order Status</th>
                    <th>Change Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((ord) => {
                    const isExpanded = expandedOrders[ord.id];
                    const itemsList = ord.items || [];
                    const itemCount = itemsList.length;

                    return (
                      <tr key={ord.id}>
                        <td style={{ fontFamily: 'monospace', fontWeight: 800, color: 'var(--color-emerald)', whiteSpace: 'nowrap' }}>
                          {ord.order_number}
                        </td>
                        <td>
                          <div style={{ fontWeight: 800, color: 'var(--color-emerald)' }}>{ord.customer_name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{ord.customer_phone}</div>
                        </td>

                        {/* Interactive Dropdown for Clean English Ordered Dishes */}
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
                                {/* Always display 1st item */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', backgroundColor: '#F8FAFC', padding: '4px 8px', borderRadius: '6px', border: '1px solid #E2E8F0', fontSize: '0.82rem' }}>
                                  <span style={{ fontWeight: 700, color: 'var(--color-emerald)' }}>
                                    {itemsList[0].quantity}x {cleanDishName(itemsList[0].item_name)}
                                  </span>
                                  <span style={{ fontWeight: 700, color: 'var(--color-gold)' }}>₹{parseFloat(itemsList[0].subtotal).toFixed(2)}</span>
                                </div>

                                {/* Dropdown Toggle Button */}
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
                                  <span>{isExpanded ? '▲ Hide Extra Dishes' : `▼ + ${itemCount - 1} More Dishes (Total ${itemCount})`}</span>
                                  {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                </button>

                                {/* Collapsible Expanded Dishes List */}
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
                        <td style={{ fontSize: '0.85rem' }}>{ord.payment_method}</td>
                        <td>
                          <span style={{
                            padding: '4px 10px',
                            borderRadius: '12px',
                            fontSize: '0.75rem',
                            fontWeight: 800,
                            backgroundColor: ord.payment_status === 'PAID' ? '#DCFCE7' : '#FEF3C7',
                            color: ord.payment_status === 'PAID' ? '#15803D' : '#B45309'
                          }}>
                            {ord.payment_status || 'PENDING'}
                          </span>
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
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button
                              onClick={() => setSelectedOrder(ord)}
                              title="View Order Details"
                              style={{ padding: '4px 8px', backgroundColor: 'var(--color-cream-alt)', borderRadius: '6px', color: 'var(--color-emerald)', border: 'none', cursor: 'pointer' }}
                            >
                              <Eye size={15} />
                            </button>

                            <button
                              onClick={() => handlePrintReceipt(ord)}
                              title="Print Receipt"
                              style={{ padding: '4px 8px', backgroundColor: '#F1F5F9', borderRadius: '6px', color: '#475569', border: 'none', cursor: 'pointer' }}
                            >
                              <Printer size={15} />
                            </button>

                            {ord.payment_status !== 'PAID' && (
                              <button
                                onClick={() => handleMarkPaymentPaid(ord.id)}
                                title="Mark Payment as PAID"
                                style={{ padding: '4px 8px', backgroundColor: '#DCFCE7', color: '#15803D', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 800, fontSize: '0.75rem' }}
                              >
                                $ PAID
                              </button>
                            )}
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

        {/* View Details Modal */}
        {selectedOrder && (
          <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '650px', borderRadius: '20px' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.75rem' }}>
                <h3 style={{ fontFamily: 'monospace', fontSize: '1.3rem', color: 'var(--color-emerald)', margin: 0 }}>
                  Order Details #{selectedOrder.order_number}
                </h3>
                <button onClick={() => setSelectedOrder(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                  <X size={22} color="#64748B" />
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.9rem', marginBottom: '1.5rem', backgroundColor: 'var(--color-cream-alt)', padding: '1rem', borderRadius: '12px' }}>
                <div><span style={{ color: 'var(--color-text-muted)', display: 'block', fontSize: '0.75rem' }}>Customer</span> <strong>{selectedOrder.customer_name}</strong></div>
                <div><span style={{ color: 'var(--color-text-muted)', display: 'block', fontSize: '0.75rem' }}>Mobile</span> <strong>{selectedOrder.customer_phone}</strong></div>
                <div><span style={{ color: 'var(--color-text-muted)', display: 'block', fontSize: '0.75rem' }}>Order Type</span> <strong>{selectedOrder.order_type}</strong></div>
                <div><span style={{ color: 'var(--color-text-muted)', display: 'block', fontSize: '0.75rem' }}>Payment</span> <strong>{selectedOrder.payment_method} ({selectedOrder.payment_status || 'PENDING'})</strong></div>
                {selectedOrder.delivery_address && (
                  <div style={{ gridColumn: 'span 2' }}>
                    <span style={{ color: 'var(--color-text-muted)', display: 'block', fontSize: '0.75rem' }}>Address</span>
                    <strong>{selectedOrder.delivery_address}, {selectedOrder.city} - {selectedOrder.pincode}</strong>
                  </div>
                )}
                {selectedOrder.notes && (
                  <div style={{ gridColumn: 'span 2', backgroundColor: '#FEF3C7', padding: '8px 12px', borderRadius: '8px', fontSize: '0.85rem' }}>
                    <strong>Cooking Notes:</strong> {selectedOrder.notes}
                  </div>
                )}
              </div>

              <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--color-emerald)', marginBottom: '0.6rem' }}>
                Ordered Items ({selectedOrder.items?.length || 0})
              </h4>
              <div style={{ marginBottom: '1.5rem', maxHeight: '200px', overflowY: 'auto' }}>
                {selectedOrder.items?.map((it, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', padding: '0.4rem 0', borderBottom: '1px dashed var(--color-border)' }}>
                    <span>{it.quantity}x {cleanDishName(it.item_name)}</span>
                    <span style={{ fontWeight: 800 }}>₹{parseFloat(it.subtotal).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '2px dashed var(--color-border)', paddingTop: '1rem', marginBottom: '1.5rem' }}>
                <span style={{ fontSize: '1.1rem', fontWeight: 800 }}>Total Amount</span>
                <span style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--color-gold)' }}>₹{parseFloat(selectedOrder.total_amount).toFixed(2)}</span>
              </div>

              {/* Action Buttons in Modal */}
              <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
                {selectedOrder.payment_status !== 'PAID' && (
                  <button
                    onClick={() => handleMarkPaymentPaid(selectedOrder.id)}
                    className="btn btn-primary btn-sm"
                    style={{ backgroundColor: '#16A34A', flex: 1 }}
                  >
                    Mark Payment as PAID
                  </button>
                )}

                <button
                  onClick={() => handlePrintReceipt(selectedOrder)}
                  className="btn btn-outline btn-sm"
                >
                  <Printer size={16} /> Print Receipt
                </button>

                {selectedOrder.status !== 'Cancelled' && (
                  <button
                    onClick={() => handleStatusUpdate(selectedOrder.id, 'Cancelled')}
                    className="btn btn-outline btn-sm"
                    style={{ color: '#DC2626', borderColor: '#DC2626' }}
                  >
                    Cancel Order
                  </button>
                )}
              </div>

            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default AdminOrders;
