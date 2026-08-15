import React, { useState, useEffect } from 'react';
import { Plus, Tag, Trash2, Edit2, Check, X } from 'lucide-react';
import AdminSidebar from '../components/AdminSidebar';
import SkeletonLoader from '../components/SkeletonLoader';
import SEOHead from '../components/SEOHead';
import { apiCall } from '../services/api';
import { useToast } from '../context/ToastContext';

const AdminOffers = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    code: '',
    discountPercentage: 15,
    discountAmount: 0,
    minOrderAmount: 200,
    imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80',
    startDate: new Date().toISOString().slice(0, 10),
    endDate: '2026-12-31',
    isActive: true
  });

  const { addToast } = useToast();

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    try {
      setLoading(true);
      const res = await apiCall('/api/offers/admin');
      if (res.offers) setOffers(res.offers);
    } catch (e) {
      addToast('Failed to load offers', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOffer = async (e) => {
    e.preventDefault();
    try {
      const res = await apiCall('/api/offers/admin', 'POST', formData);
      if (res.success) {
        addToast('New promotional offer created!', 'success');
        setModalOpen(false);
        fetchOffers();
      }
    } catch (err) {
      addToast(err.message || 'Failed to create offer', 'error');
    }
  };

  const handleDeleteOffer = async (id) => {
    try {
      const res = await apiCall(`/api/offers/admin/${id}`, 'DELETE');
      if (res.success) {
        addToast('Offer removed.', 'info');
        fetchOffers();
      }
    } catch (e) {
      addToast('Delete failed.', 'error');
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--color-cream-alt)' }}>
      <SEOHead title="Admin Promo Offers" />
      <AdminSidebar />

      <main style={{ flexGrow: 1, padding: '2rem', overflowY: 'auto' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', color: 'var(--color-emerald)' }}>
              Offers & Promotions
            </h1>
            <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
              Manage customer discount promo codes and promotional combo banners.
            </p>
          </div>

          <button onClick={() => setModalOpen(true)} className="btn btn-primary btn-sm">
            <Plus size={18} /> Create New Offer
          </button>
        </div>

        {loading ? (
          <SkeletonLoader count={4} type="table" />
        ) : (
          <div style={{ backgroundColor: '#fff', borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-md)' }}>
            <div style={{ overflowX: 'auto' }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Title & Code</th>
                    <th>Discount</th>
                    <th>Min Order</th>
                    <th>Validity</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {offers.map((off) => (
                    <tr key={off.id}>
                      <td>
                        <div style={{ fontWeight: 700, color: 'var(--color-emerald)' }}>{off.title}</div>
                        <span style={{ fontFamily: 'monospace', color: 'var(--color-gold)', fontWeight: 800 }}>{off.code}</span>
                      </td>
                      <td>{off.discount_percentage > 0 ? `${off.discount_percentage}% OFF` : `₹${off.discount_amount} OFF`}</td>
                      <td>₹{parseFloat(off.min_order_amount).toFixed(2)}</td>
                      <td>{new Date(off.start_date).toLocaleDateString()} – {new Date(off.end_date).toLocaleDateString()}</td>
                      <td>
                        <span style={{ padding: '3px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700, backgroundColor: off.is_active ? '#DCFCE7' : '#FEE2E2', color: off.is_active ? '#15803D' : '#B91C1C' }}>
                          {off.is_active ? 'Active' : 'Expired'}
                        </span>
                      </td>
                      <td>
                        <button onClick={() => handleDeleteOffer(off.id)} style={{ color: '#EF4444', padding: '4px' }}>
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal */}
        {modalOpen && (
          <div className="modal-overlay" onClick={() => setModalOpen(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', color: 'var(--color-emerald)' }}>Create New Offer</h3>
                <button onClick={() => setModalOpen(false)}><X size={20} /></button>
              </div>

              <form onSubmit={handleCreateOffer} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 700 }}>Offer Title *</label>
                  <input type="text" required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} style={{ width: '100%', padding: '0.65rem', borderRadius: '4px', border: '1px solid #ccc' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 700 }}>Promo Code *</label>
                  <input type="text" required value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })} placeholder="e.g. SOUTH20" style={{ width: '100%', padding: '0.65rem', borderRadius: '4px', border: '1px solid #ccc' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 700 }}>Description</label>
                  <input type="text" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} style={{ width: '100%', padding: '0.65rem', borderRadius: '4px', border: '1px solid #ccc' }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: 700 }}>Discount %</label>
                    <input type="number" value={formData.discountPercentage} onChange={(e) => setFormData({ ...formData, discountPercentage: Number(e.target.value) })} style={{ width: '100%', padding: '0.65rem', borderRadius: '4px', border: '1px solid #ccc' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: 700 }}>Min Order Amount (₹)</label>
                    <input type="number" value={formData.minOrderAmount} onChange={(e) => setFormData({ ...formData, minOrderAmount: Number(e.target.value) })} style={{ width: '100%', padding: '0.65rem', borderRadius: '4px', border: '1px solid #ccc' }} />
                  </div>
                </div>
                <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }}>Save Promotional Offer</button>
              </form>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default AdminOffers;
