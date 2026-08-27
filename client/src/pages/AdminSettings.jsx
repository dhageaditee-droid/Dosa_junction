import React, { useState, useEffect } from 'react';
import { Settings, Save, ShieldCheck, QrCode } from 'lucide-react';
import AdminSidebar from '../components/AdminSidebar';
import SkeletonLoader from '../components/SkeletonLoader';
import SEOHead from '../components/SEOHead';
import { apiCall } from '../services/api';
import { useToast } from '../context/ToastContext';

const AdminSettings = () => {
  const [settings, setSettings] = useState({
    restaurant_name: 'Dosa Junction',
    phone: '+91 7020758779',
    email: 'info@dosajunction.com',
    address: 'Sinnar Gaurav, Near Panchvati Hotel, Sinnar',
    opening_hours: '7:00 AM - 10:30 PM (Daily)',
    tax_rate_percent: '5.0',
    packing_charge: '15.0',
    delivery_charge: '30.0',
    free_delivery_threshold: '400.0',
    is_accepting_orders: 'true',
    upi_id: 'Pos.11424716@indus'
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await apiCall('/api/settings');
      if (res.settings) {
        setSettings((prev) => ({ ...prev, ...res.settings }));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await apiCall('/api/settings/admin', 'PUT', settings);
      if (res.success) {
        addToast('Restaurant operational & UPI settings updated successfully!', 'success');
      }
    } catch (err) {
      addToast(err.message || 'Failed to update settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-page-layout" style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--color-cream-alt)' }}>
      <SEOHead title="Admin Operational Settings | Dosa Junction" />
      <AdminSidebar />

      <main className="admin-main-content" style={{ flexGrow: 1, padding: '2rem', overflowY: 'auto' }}>
        
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', color: 'var(--color-emerald)' }}>
            Restaurant Operational & UPI Settings
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
            Configure store info, tax rates, packaging fees, delivery charges, and Dosa Junction UPI ID for dynamic QR code payments.
          </p>
        </div>

        {loading ? (
          <SkeletonLoader count={4} type="card" />
        ) : (
          <form onSubmit={handleSave} style={{ maxWidth: '800px' }}>
            <div style={{
              backgroundColor: '#fff',
              borderRadius: 'var(--radius-lg)',
              padding: '2rem',
              boxShadow: 'var(--shadow-md)',
              border: '1px solid var(--color-border)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem'
            }}>
              
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', color: 'var(--color-emerald)', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <QrCode size={20} color="var(--color-gold)" /> Dynamic UPI Payment Settings
              </h3>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, color: 'var(--color-emerald)', marginBottom: '4px' }}>
                  Dosa Junction Official UPI ID *
                </label>
                <input
                  type="text"
                  value={settings.upi_id}
                  onChange={(e) => setSettings({ ...settings, upi_id: e.target.value })}
                  placeholder="e.g. dosajunction@upi or 7020758779@ybl"
                  required
                  style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1px solid #ccc', fontFamily: 'monospace', fontWeight: 700 }}
                />
                <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: '4px', display: 'block' }}>
                  This UPI ID will be embedded in dynamic payment QR codes (`upi://pay?pa=YOUR_UPI_ID...`) generated for customer orders.
                </span>
              </div>

              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', color: 'var(--color-emerald)', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem', marginTop: '1rem' }}>
                Store & Contact Info
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '4px' }}>Restaurant Name</label>
                  <input type="text" value={settings.restaurant_name} onChange={(e) => setSettings({ ...settings, restaurant_name: e.target.value })} style={{ width: '100%', padding: '0.65rem', borderRadius: '4px', border: '1px solid #ccc' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '4px' }}>Contact Phone</label>
                  <input type="text" value={settings.phone} onChange={(e) => setSettings({ ...settings, phone: e.target.value })} style={{ width: '100%', padding: '0.65rem', borderRadius: '4px', border: '1px solid #ccc' }} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '4px' }}>Address</label>
                <input type="text" value={settings.address} onChange={(e) => setSettings({ ...settings, address: e.target.value })} style={{ width: '100%', padding: '0.65rem', borderRadius: '4px', border: '1px solid #ccc' }} />
              </div>

              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', color: 'var(--color-emerald)', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem', marginTop: '1rem' }}>
                Taxes & Charges Configuration
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '4px' }}>GST Tax Rate (%)</label>
                  <input type="number" step="0.1" value={settings.tax_rate_percent} onChange={(e) => setSettings({ ...settings, tax_rate_percent: e.target.value })} style={{ width: '100%', padding: '0.65rem', borderRadius: '4px', border: '1px solid #ccc' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '4px' }}>Packing Charge (₹)</label>
                  <input type="number" step="1" value={settings.packing_charge} onChange={(e) => setSettings({ ...settings, packing_charge: e.target.value })} style={{ width: '100%', padding: '0.65rem', borderRadius: '4px', border: '1px solid #ccc' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '4px' }}>Delivery Charge (₹)</label>
                  <input type="number" step="1" value={settings.delivery_charge} onChange={(e) => setSettings({ ...settings, delivery_charge: e.target.value })} style={{ width: '100%', padding: '0.65rem', borderRadius: '4px', border: '1px solid #ccc' }} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '4px' }}>Free Delivery Threshold (₹)</label>
                <input type="number" step="10" value={settings.free_delivery_threshold} onChange={(e) => setSettings({ ...settings, free_delivery_threshold: e.target.value })} style={{ width: '100%', padding: '0.65rem', borderRadius: '4px', border: '1px solid #ccc' }} />
              </div>

              <button type="submit" disabled={saving} className="btn btn-primary" style={{ marginTop: '1rem', width: 'fit-content' }}>
                <Save size={18} /> {saving ? 'Saving...' : 'Save Settings'}
              </button>

            </div>
          </form>
        )}

      </main>
    </div>
  );
};

export default AdminSettings;
