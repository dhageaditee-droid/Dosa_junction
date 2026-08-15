import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Utensils, 
  ShoppingBag, 
  Tag, 
  Ticket,
  Users,
  MessageSquare, 
  Settings, 
  LogOut,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AdminSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logoutAdmin, adminUser } = useAuth();

  const menuItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Orders Management', path: '/admin/orders', icon: ShoppingBag },
    { name: 'Menu Items', path: '/admin/menu', icon: Utensils },
    { name: 'Promotional Offers', path: '/admin/offers', icon: Tag },
    { name: 'Coupons Management', path: '/admin/coupons', icon: Ticket },
    { name: 'Contact Enquiries', path: '/admin/enquiries', icon: MessageSquare },
    { name: 'Restaurant Settings', path: '/admin/settings', icon: Settings }
  ];

  const handleLogout = () => {
    logoutAdmin();
    navigate('/admin/login');
  };

  return (
    <aside style={{
      width: '260px',
      backgroundColor: '#0F172A',
      color: '#FFFFFF',
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      flexShrink: 0,
      borderRight: '1px solid rgba(255,255,255,0.08)'
    }}>
      
      {/* Brand Header */}
      <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', color: '#FFFFFF', margin: 0 }}>
          Dakshin Bhavan <span style={{ color: 'var(--color-gold)' }}>Admin</span>
        </h2>
        <span style={{ fontSize: '0.7rem', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>
          Management Portal
        </span>
      </div>

      {/* Admin User Badge */}
      {adminUser && (
        <div style={{ padding: '0.8rem 1.2rem', backgroundColor: 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ width: '34px', height: '34px', borderRadius: '50%', backgroundColor: 'var(--color-gold)', color: '#FFFFFF', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem' }}>
            {adminUser.name ? adminUser.name.charAt(0) : 'A'}
          </div>
          <div>
            <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#FFFFFF' }}>{adminUser.name}</div>
            <div style={{ fontSize: '0.7rem', color: '#94A3B8' }}>{adminUser.email}</div>
          </div>
        </div>
      )}

      {/* Navigation Links */}
      <nav style={{ padding: '0.8rem 0', display: 'flex', flexDirection: 'column', gap: '0.2rem', flexGrow: 1 }}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.85rem',
                padding: '0.8rem 1.4rem',
                fontSize: '0.88rem',
                fontWeight: isActive ? 800 : 500,
                color: isActive ? 'var(--color-gold)' : '#CBD5E1',
                backgroundColor: isActive ? 'rgba(217, 119, 6, 0.15)' : 'transparent',
                borderLeft: isActive ? '4px solid var(--color-gold)' : '4px solid transparent',
                textDecoration: 'none',
                transition: 'var(--transition-fast)'
              }}
            >
              <Icon size={18} color={isActive ? 'var(--color-gold)' : '#94A3B8'} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* External Site Link & Logout */}
      <div style={{ padding: '1.2rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.82rem',
            color: '#94A3B8',
            marginBottom: '1rem',
            textDecoration: 'none'
          }}
        >
          <ExternalLink size={15} /> View Live Customer Website
        </a>

        <button
          onClick={handleLogout}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.6rem',
            padding: '0.7rem',
            borderRadius: '10px',
            backgroundColor: 'rgba(239, 68, 68, 0.15)',
            color: '#FCA5A5',
            fontWeight: 700,
            fontSize: '0.82rem',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            cursor: 'pointer'
          }}
        >
          <LogOut size={15} /> Logout Admin
        </button>
      </div>

    </aside>
  );
};

export default AdminSidebar;
