import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  IndianRupee, 
  Clock, 
  CheckCircle2, 
  Utensils, 
  Users,
  TrendingUp,
  RefreshCw,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import AdminSidebar from '../components/AdminSidebar';
import DashboardCard from '../components/DashboardCard';
import StatusBadge from '../components/StatusBadge';
import SkeletonLoader from '../components/SkeletonLoader';
import SEOHead from '../components/SEOHead';
import { apiService, cleanDishName } from '../services/api';
import { useToast } from '../context/ToastContext';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrders, setExpandedOrders] = useState({});
  const { addToast } = useToast();

  useEffect(() => {
    fetchDashboardData(true);

    const intervalId = setInterval(() => {
      fetchDashboardData(false);
    }, 5000);

    return () => clearInterval(intervalId);
  }, []);

  const fetchDashboardData = async (showLoading = false) => {
    try {
      if (showLoading) setLoading(true);
      const res = await apiService.getAdminStats();
      if (res.stats) setStats(res.stats);
      if (res.recentOrders) setRecentOrders(res.recentOrders);
    } catch (e) {
      console.error(e);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const toggleOrderExpand = (orderId) => {
    setExpandedOrders(prev => ({
      ...prev,
      [orderId]: !prev[orderId]
    }));
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const res = await apiService.updateOrderStatus(orderId, newStatus);
      if (res.success) {
        if (addToast) addToast(`Order updated to "${newStatus}"`, 'success');
        fetchDashboardData();
      }
    } catch (err) {
      if (addToast) addToast(err.message || 'Failed to update order status', 'error');
    }
  };

  return (
    <div className="admin-page-layout" style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--color-cream-alt)' }}>
      <SEOHead title="Admin Dashboard | Dosa Junction" />
      
      <AdminSidebar />

      <main className="admin-main-content" style={{ flexGrow: 1, padding: '2rem', overflowY: 'auto' }}>
        
        {/* Header */}
        <div className="admin-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', color: 'var(--color-emerald)', margin: 0 }}>
              Restaurant Dashboard
            </h1>
            <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
              Real-time analytics, daily revenue metrics, and active kitchen order management.
            </p>
          </div>

          <button
            onClick={fetchDashboardData}
            className="btn btn-outline btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', backgroundColor: '#FFFFFF' }}
          >
            <RefreshCw size={16} /> Refresh Metrics
          </button>
        </div>

        {loading ? (
          <SkeletonLoader count={4} type="card" />
        ) : (
          <>
            {/* Dashboard Cards Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
              gap: '1.2rem',
              marginBottom: '2rem'
            }}>
              <DashboardCard
                title="Today's Orders"
                value={stats?.todayOrders || 0}
                icon={ShoppingBag}
                color="gold"
                subtitle="Received Today"
              />
              <DashboardCard
                title="Today's Revenue"
                value={`₹${stats?.todayRevenue?.toFixed(2) || '0.00'}`}
                icon={IndianRupee}
                color="emerald"
                subtitle="Today's Gross Sales"
              />
              <DashboardCard
                title="Pending Orders"
                value={stats?.pendingOrders || 0}
                icon={Clock}
                color="orange"
                subtitle="Requires Kitchen Action"
              />
              <DashboardCard
                title="Completed Orders"
                value={stats?.completedOrders || 0}
                icon={CheckCircle2}
                color="emerald"
                subtitle="Served Successfully"
              />
              <DashboardCard
                title="Total Customers"
                value={stats?.totalCustomers || 0}
                icon={Users}
                color="blue"
                subtitle="Registered & Guests"
              />
              <DashboardCard
                title="Total Menu Items"
                value={stats?.totalMenuItems || 0}
                icon={Utensils}
                color="gold"
                subtitle="South Indian Dishes"
              />
            </div>

            {/* Recent Kitchen Orders Table */}
            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '20px',
              padding: '1.8rem',
              boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
              border: '1px solid var(--color-border)'
            }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', color: 'var(--color-emerald)', marginBottom: '1.2rem' }}>
                Recent Kitchen Orders
              </h3>

              {recentOrders.length > 0 ? (
                <div style={{ overflowX: 'auto' }}>
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Order #</th>
                        <th>Customer</th>
                        <th>Phone</th>
                        <th>Ordered Dishes</th>
                        <th>Type</th>
                        <th>Amount</th>
                        <th>Payment</th>
                        <th>Status</th>
                        <th>Advance Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentOrders.map((ord, index) => {
                        const isExpanded = expandedOrders[ord.id];
                        const itemsList = ord.items || [];
                        const itemCount = itemsList.length;

                        // Format Order Time
                        const orderDateObj = ord.created_at ? new Date(ord.created_at) : new Date();
                        const orderTimeStr = orderDateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
                        const orderDateStr = orderDateObj.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });

                        return (
                          <tr key={ord.id}>
                            <td style={{ whiteSpace: 'nowrap' }}>
                              <div style={{ fontWeight: 800, color: 'var(--color-emerald)', fontSize: '1.05rem' }}>
                                #{index + 1}
                              </div>
                              <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '3px', marginTop: '2px' }}>
                                <Clock size={12} color="var(--color-gold)" />
                                <span>{orderTimeStr} ({orderDateStr})</span>
                              </div>
                            </td>
                            <td>{ord.customer_name}</td>
                            <td>{ord.customer_phone}</td>
                            
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
                                      <span>{isExpanded ? '▲ Hide Extra Dishes' : `▼ + ${itemCount - 1} More Dishes (Total ${itemCount})`}</span>
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
                              <span style={{ fontWeight: 700, color: 'var(--color-gold)' }}>{ord.order_type}</span>
                            </td>
                            <td style={{ fontWeight: 800 }}>₹{parseFloat(ord.total_amount).toFixed(2)}</td>
                            <td>
                              <span style={{ fontSize: '0.75rem', fontWeight: 800, padding: '2px 6px', borderRadius: '6px', backgroundColor: '#FEF3C7', color: '#B45309' }}>
                                {ord.payment_status || 'PENDING'}
                              </span>
                            </td>
                            <td><StatusBadge status={ord.status} /></td>
                            <td>
                              <select
                                value={ord.status}
                                onChange={(e) => handleStatusChange(ord.id, e.target.value)}
                                style={{
                                  padding: '0.35rem 0.6rem',
                                  borderRadius: '8px',
                                  fontSize: '0.8rem',
                                  fontWeight: 700,
                                  outline: 'none',
                                  border: '1px solid var(--color-border)',
                                  cursor: 'pointer',
                                  backgroundColor: '#FFFFFF'
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
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', padding: '2rem 0' }}>
                  No recent orders recorded in PostgreSQL database.
                </p>
              )}

            </div>
          </>
        )}

      </main>
    </div>
  );
};

export default AdminDashboard;
