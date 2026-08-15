import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Package, MapPin, LogOut, Compass, RotateCcw, Clock, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { apiService } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import SEOHead from '../components/SEOHead';

const CustomerProfilePage = () => {
  const { customerUser, isCustomerAuthenticated, logoutCustomer } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const [myOrders, setMyOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    if (!isCustomerAuthenticated) {
      // Allow viewing guest orders if email present or prompt login
    }
    fetchMyOrders();
  }, [isCustomerAuthenticated]);

  const fetchMyOrders = async () => {
    try {
      setLoadingOrders(true);
      const res = await apiService.getMyOrders();
      if (res.orders) setMyOrders(res.orders);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleOrderAgain = (order) => {
    if (order.items && order.items.length > 0) {
      order.items.forEach(it => {
        addToCart({
          id: it.menu_item_id || it.id,
          name: it.item_name,
          price: parseFloat(it.price)
        }, it.quantity);
      });
      navigate('/cart');
    }
  };

  return (
    <div style={{ backgroundColor: 'var(--color-cream)', padding: '3rem 0 5rem 0', minHeight: '85vh' }}>
      <SEOHead title="My Profile & Orders | Dosa Junction" />

      <div className="container" style={{ maxWidth: '900px' }}>
        
        {/* Profile Card Header */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '24px',
          padding: '2rem',
          boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
          border: '1px solid var(--color-border)',
          marginBottom: '2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-emerald)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
              fontWeight: 800
            }}>
              {customerUser?.name ? customerUser.name.charAt(0).toUpperCase() : 'G'}
            </div>

            <div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-emerald)', margin: 0 }}>
                {customerUser?.name || 'Guest Customer'}
              </h1>
              <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                {customerUser?.email || 'Logged in food enthusiast'} • {customerUser?.phone || ''}
              </span>
            </div>
          </div>

          {isCustomerAuthenticated && (
            <button
              onClick={() => { logoutCustomer(); navigate('/'); }}
              className="btn btn-outline btn-sm"
              style={{ color: '#EF4444', borderColor: '#EF4444' }}
            >
              <LogOut size={16} /> Logout Account
            </button>
          )}
        </div>

        {/* My Orders Section */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-emerald)', fontFamily: 'var(--font-heading)', margin: 0 }}>
              My Order History
            </h2>
            <button
              onClick={fetchMyOrders}
              style={{ background: 'none', border: 'none', color: 'var(--color-gold)', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem' }}
            >
              Refresh Orders ↻
            </button>
          </div>

          {loadingOrders ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
              Loading your orders...
            </div>
          ) : myOrders.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              {myOrders.map((ord) => (
                <div
                  key={ord.id}
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '20px',
                    padding: '1.5rem',
                    border: '1px solid var(--color-border)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
                  }}
                >
                  
                  {/* Top Bar */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.8rem' }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Order Number</span>
                      <h4 style={{ fontSize: '1.1rem', color: 'var(--color-emerald)', fontFamily: 'monospace', margin: 0 }}>
                        {ord.order_number}
                      </h4>
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                        Placed on {new Date(ord.created_at).toLocaleDateString()} at {new Date(ord.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <StatusBadge status={ord.status} />
                      <span style={{ fontSize: '0.75rem', padding: '3px 8px', borderRadius: '8px', backgroundColor: '#FEF3C7', color: '#B45309', fontWeight: 800 }}>
                        {ord.payment_status || 'PENDING'}
                      </span>
                    </div>
                  </div>

                  {/* Items List */}
                  {ord.items && ord.items.length > 0 && (
                    <div style={{ marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        {ord.items.map((it, idx) => (
                          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                            <span>{it.quantity}x {it.item_name}</span>
                            <span style={{ fontWeight: 700 }}>₹{parseFloat(it.subtotal).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Footer & Actions */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderTop: '1px dashed var(--color-border)', paddingTop: '0.8rem' }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block' }}>Total Paid/Payable ({ord.payment_method})</span>
                      <strong style={{ fontSize: '1.2rem', color: 'var(--color-gold)' }}>₹{parseFloat(ord.total_amount).toFixed(2)}</strong>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => navigate(`/track-order?orderNumber=${ord.order_number}`)}
                        className="btn btn-outline btn-sm"
                        style={{ fontSize: '0.8rem' }}
                      >
                        <Compass size={14} /> Track Order
                      </button>

                      <button
                        onClick={() => handleOrderAgain(ord)}
                        className="btn btn-primary btn-sm"
                        style={{ fontSize: '0.8rem' }}
                      >
                        <RotateCcw size={14} /> Order Again
                      </button>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          ) : (
            <div style={{ backgroundColor: '#FFFFFF', borderRadius: '20px', padding: '3rem', textAlign: 'center', border: '1px solid var(--color-border)' }}>
              <Package size={40} color="var(--color-gold)" style={{ marginBottom: '0.8rem' }} />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-emerald)', marginBottom: '0.4rem' }}>
                No Past Orders Found
              </h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
                You haven't placed any food orders yet. Explore our South Indian menu and try delicious dosas!
              </p>
              <Link to="/menu" className="btn btn-primary">
                Explore Menu
              </Link>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default CustomerProfilePage;
