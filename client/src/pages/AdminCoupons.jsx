import React, { useState, useEffect } from 'react';
import { Ticket, Plus, Edit, Trash2, X, RefreshCw } from 'lucide-react';
import AdminSidebar from '../components/AdminSidebar';
import SkeletonLoader from '../components/SkeletonLoader';
import SEOHead from '../components/SEOHead';
import { apiService } from '../services/api';
import { useToast } from '../context/ToastContext';

const AdminCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);

  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discountType: 'percentage', // 'percentage' or 'fixed'
    discountValue: '',
    minOrderAmount: '',
    maxDiscountAmount: '',
    startDate: new Date().toISOString().slice(0, 10),
    expiryDate: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
    isActive: true
  });

  const { addToast } = useToast();

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const res = await apiService.getAdminCoupons();
      if (res.coupons) setCoupons(res.coupons);
    } catch (e) {
      if (addToast) addToast('Failed to load coupons', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingCoupon(null);
    setFormData({
      code: '',
      description: '',
      discountType: 'percentage',
      discountValue: '',
      minOrderAmount: '200',
      maxDiscountAmount: '100',
      startDate: new Date().toISOString().slice(0, 10),
      expiryDate: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
      isActive: true
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (c) => {
    setEditingCoupon(c);
    setFormData({
      code: c.code,
      description: c.description || '',
      discountType: c.discount_type,
      discountValue: c.discount_value,
      minOrderAmount: c.min_order_amount || '0',
      maxDiscountAmount: c.max_discount_amount || '',
      startDate: c.start_date ? c.start_date.slice(0, 10) : new Date().toISOString().slice(0, 10),
      expiryDate: c.expiry_date ? c.expiry_date.slice(0, 10) : new Date().toISOString().slice(0, 10),
      isActive: c.is_active
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let res;
      if (editingCoupon) {
        res = await apiService.updateCoupon(editingCoupon.id, formData);
      } else {
        res = await apiService.createCoupon(formData);
      }

      if (res.success) {
        if (addToast) addToast(res.message, 'success');
        setShowModal(false);
        fetchCoupons();
      }
    } catch (err) {
      if (addToast) addToast(err.message || 'Operation failed', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this coupon?')) {
      try {
        const res = await apiService.deleteCoupon(id);
        if (res.success) {
          if (addToast) addToast('Coupon deleted successfully', 'info');
          fetchCoupons();
        }
      } catch (err) {
        if (addToast) addToast(err.message || 'Delete failed', 'error');
      }
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--color-cream-alt)' }}>
      <SEOHead title="Admin Coupons Management | Dakshin Bhavan" />
      <AdminSidebar />

      <main style={{ flexGrow: 1, padding: '2rem', overflowY: 'auto' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', color: 'var(--color-emerald)', margin: 0 }}>
              Coupons Management
            </h1>
            <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
              Create, modify, and monitor discount promo codes for food orders.
            </p>
          </div>

          <button onClick={handleOpenAddModal} className="btn btn-primary btn-sm">
            <Plus size={18} /> Add New Coupon
          </button>
        </div>

        {/* Coupons Grid / Table */}
        {loading ? (
          <SkeletonLoader count={4} type="card" />
        ) : (
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 14px rgba(0,0,0,0.04)' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Description</th>
                  <th>Discount</th>
                  <th>Min Order</th>
                  <th>Max Discount</th>
                  <th>Validity</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((c) => (
                  <tr key={c.id}>
                    <td style={{ fontFamily: 'monospace', fontWeight: 800, color: 'var(--color-emerald)' }}>
                      {c.code}
                    </td>
                    <td>{c.description}</td>
                    <td style={{ fontWeight: 800 }}>
                      {c.discount_type === 'percentage' ? `${parseFloat(c.discount_value)}% OFF` : `₹${parseFloat(c.discount_value)} OFF`}
                    </td>
                    <td>₹{parseFloat(c.min_order_amount || 0).toFixed(2)}</td>
                    <td>{c.max_discount_amount ? `₹${parseFloat(c.max_discount_amount).toFixed(2)}` : 'Unlimited'}</td>
                    <td style={{ fontSize: '0.8rem' }}>
                      {new Date(c.start_date).toLocaleDateString()} – {new Date(c.expiry_date).toLocaleDateString()}
                    </td>
                    <td>
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: '12px',
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        backgroundColor: c.is_active ? '#DCFCE7' : '#FEE2E2',
                        color: c.is_active ? '#15803D' : '#991B1B'
                      }}>
                        {c.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          onClick={() => handleOpenEditModal(c)}
                          style={{ padding: '6px', backgroundColor: 'var(--color-cream-alt)', border: 'none', borderRadius: '6px', cursor: 'pointer', color: 'var(--color-emerald)' }}
                        >
                          <Edit size={16} />
                        </button>

                        <button
                          onClick={() => handleDelete(c.id)}
                          style={{ padding: '6px', backgroundColor: '#FEE2E2', border: 'none', borderRadius: '6px', cursor: 'pointer', color: '#DC2626' }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Add/Edit Modal */}
        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '550px', borderRadius: '20px' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.8rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-emerald)', margin: 0 }}>
                  {editingCoupon ? 'Edit Coupon Code' : 'Add New Coupon Code'}
                </h3>
                <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                  <X size={22} color="#64748B" />
                </button>
              </div>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label className="form-label">Coupon Code (Uppercase) *</label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="e.g. SOUTH10"
                    required
                    className="form-input"
                  />
                </div>

                <div>
                  <label className="form-label">Description *</label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="e.g. Get 10% OFF on all South Indian food orders"
                    required
                    className="form-input"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label className="form-label">Discount Type *</label>
                    <select
                      value={formData.discountType}
                      onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                      className="form-input"
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed Amount (₹)</option>
                    </select>
                  </div>

                  <div>
                    <label className="form-label">Discount Value *</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.discountValue}
                      onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                      placeholder="e.g. 10 or 50"
                      required
                      className="form-input"
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label className="form-label">Min Order Amount (₹)</label>
                    <input
                      type="number"
                      value={formData.minOrderAmount}
                      onChange={(e) => setFormData({ ...formData, minOrderAmount: e.target.value })}
                      placeholder="200"
                      className="form-input"
                    />
                  </div>

                  <div>
                    <label className="form-label">Max Discount Cap (₹)</label>
                    <input
                      type="number"
                      value={formData.maxDiscountAmount}
                      onChange={(e) => setFormData({ ...formData, maxDiscountAmount: e.target.value })}
                      placeholder="100 (Optional)"
                      className="form-input"
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label className="form-label">Start Date *</label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      required
                      className="form-input"
                    />
                  </div>

                  <div>
                    <label className="form-label">Expiry Date *</label>
                    <input
                      type="date"
                      value={formData.expiryDate}
                      onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                      required
                      className="form-input"
                    />
                  </div>
                </div>

                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem', marginTop: '0.4rem' }}>
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    style={{ accentColor: 'var(--color-gold)', width: '18px', height: '18px' }}
                  />
                  <span>Active Coupon</span>
                </label>

                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '0.8rem', fontWeight: 800, marginTop: '0.5rem' }}
                >
                  {editingCoupon ? 'Update Coupon' : 'Create Coupon'}
                </button>
              </form>

            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default AdminCoupons;
