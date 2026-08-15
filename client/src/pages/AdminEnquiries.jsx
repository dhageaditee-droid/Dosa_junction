import React, { useState, useEffect } from 'react';
import { MessageSquare, CheckCircle, Clock } from 'lucide-react';
import AdminSidebar from '../components/AdminSidebar';
import SkeletonLoader from '../components/SkeletonLoader';
import SEOHead from '../components/SEOHead';
import { apiCall } from '../services/api';
import { useToast } from '../context/ToastContext';

const AdminEnquiries = () => {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    fetchEnquiries();
  }, []);

  const fetchEnquiries = async () => {
    try {
      setLoading(true);
      const res = await apiCall('/api/contact/admin');
      if (res.enquiries) setEnquiries(res.enquiries);
    } catch (e) {
      addToast('Failed to load enquiries', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = async (id, currentStatus) => {
    const nextStatus = currentStatus === 'Pending' ? 'Resolved' : 'Pending';
    try {
      const res = await apiCall(`/api/contact/admin/${id}/status`, 'PATCH', { status: nextStatus });
      if (res.success) {
        addToast(`Enquiry marked as ${nextStatus}`, 'success');
        fetchEnquiries();
      }
    } catch (err) {
      addToast('Status update failed', 'error');
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--color-cream-alt)' }}>
      <SEOHead title="Admin Contact Enquiries" />
      <AdminSidebar />

      <main style={{ flexGrow: 1, padding: '2rem', overflowY: 'auto' }}>
        
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', color: 'var(--color-emerald)' }}>
            Contact Enquiries
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
            Inquiries submitted by customers from the contact form stored in PostgreSQL.
          </p>
        </div>

        {loading ? (
          <SkeletonLoader count={4} type="table" />
        ) : (
          <div style={{ backgroundColor: '#fff', borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-md)' }}>
            <div style={{ overflowX: 'auto' }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Contact</th>
                    <th>Subject</th>
                    <th>Message</th>
                    <th>Received</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {enquiries.map((enq) => (
                    <tr key={enq.id}>
                      <td style={{ fontWeight: 700, color: 'var(--color-emerald)' }}>{enq.name}</td>
                      <td>
                        <div>{enq.phone}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{enq.email}</div>
                      </td>
                      <td style={{ fontWeight: 600 }}>{enq.subject}</td>
                      <td style={{ maxWidth: '280px', fontSize: '0.85rem' }}>{enq.message}</td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{new Date(enq.created_at).toLocaleDateString()}</td>
                      <td>
                        <span style={{ padding: '3px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700, backgroundColor: enq.status === 'Resolved' ? '#DCFCE7' : '#FEF3C7', color: enq.status === 'Resolved' ? '#15803D' : '#B45309' }}>
                          {enq.status}
                        </span>
                      </td>
                      <td>
                        <button
                          onClick={() => handleStatusToggle(enq.id, enq.status)}
                          className="btn btn-outline btn-sm"
                          style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                        >
                          Mark {enq.status === 'Pending' ? 'Resolved' : 'Pending'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default AdminEnquiries;
