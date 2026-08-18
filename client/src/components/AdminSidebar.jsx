import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Utensils, 
  ShoppingBag, 
  Tag, 
  Ticket,
  MessageSquare, 
  Settings, 
  LogOut,
  ExternalLink,
  Menu as MenuIcon,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AdminSidebar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logoutAdmin, adminUser } = useAuth();

  const menuItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Orders Management', path: '/admin/orders', icon: ShoppingBag },
    { name: 'Menu Items', path: '/admin/menu', icon: Utensils },
    { name: 'Restaurant Settings', path: '/admin/settings', icon: Settings }
  ];

  const handleLogout = () => {
    logoutAdmin();
    navigate('/admin/login');
  };

  const renderSidebarContent = () => (
    <>
      {/* Brand Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <img
            src="/dosa-junction-logo.jpg"
            alt="Dosa Junction Logo"
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              objectFit: 'cover',
              border: '2px solid #F59E0B',
              flexShrink: 0
            }}
          />
          <div>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem', color: '#FFFFFF', margin: 0, lineHeight: 1.1 }}>
              Dosa Junction <span style={{ color: 'var(--color-gold)' }}>Admin</span>
            </h2>
            <span style={{ fontSize: '0.68rem', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>
              Management Portal
            </span>
          </div>
        </div>

        {/* Mobile Close Button inside Drawer */}
        <button
          onClick={() => setMobileOpen(false)}
          className="admin-mobile-close-btn"
          style={{
            background: 'none',
            border: 'none',
            color: '#FFFFFF',
            cursor: 'pointer',
            padding: '4px',
            display: 'none'
          }}
        >
          <X size={24} />
        </button>
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
      <nav style={{ padding: '0.8rem 0', display: 'flex', flexDirection: 'column', gap: '0.2rem', flexGrow: 1, overflowY: 'auto' }}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
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
    </>
  );

  return (
    <>
      {/* Mobile Top Header Bar for Admin */}
      <div
        className="admin-mobile-topbar"
        style={{
          display: 'none',
          height: '60px',
          backgroundColor: '#0F172A',
          color: '#FFFFFF',
          padding: '0 1rem',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          position: 'sticky',
          top: 0,
          zIndex: 1000
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <img
            src="/dosa-junction-logo.jpg"
            alt="Dosa Junction Logo"
            style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', border: '1.5px solid #F59E0B' }}
          />
          <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#FFFFFF', fontFamily: 'var(--font-heading)' }}>
            Dosa Junction <span style={{ color: 'var(--color-gold)' }}>Admin</span>
          </span>
        </div>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          style={{
            background: 'none',
            border: 'none',
            color: '#F59E0B',
            cursor: 'pointer',
            padding: '6px'
          }}
        >
          {mobileOpen ? <X size={26} /> : <MenuIcon size={26} />}
        </button>
      </div>

      {/* Desktop Static Sidebar */}
      <aside
        className="admin-desktop-sidebar"
        style={{
          width: '260px',
          backgroundColor: '#0F172A',
          color: '#FFFFFF',
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          flexShrink: 0,
          borderRight: '1px solid rgba(255,255,255,0.08)'
        }}
      >
        {renderSidebarContent()}
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.8)',
            backdropFilter: 'blur(4px)',
            zIndex: 9999,
            display: 'flex'
          }}
          onClick={() => setMobileOpen(false)}
        >
          <aside
            style={{
              width: '280px',
              maxWidth: '85%',
              backgroundColor: '#0F172A',
              color: '#FFFFFF',
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
              boxShadow: '4px 0 25px rgba(0,0,0,0.5)',
              animation: 'slideRight 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {renderSidebarContent()}
          </aside>
        </div>
      )}

      {/* Responsive Breakpoint CSS */}
      <style>{`
        @keyframes slideRight {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
        @media (max-width: 850px) {
          .admin-page-layout {
            flex-direction: column !important;
          }
          .admin-main-content {
            padding: 1rem 0.8rem !important;
            width: 100% !important;
            box-sizing: border-box !important;
            overflow-x: hidden !important;
          }
          .admin-mobile-topbar {
            display: flex !important;
          }
          .admin-desktop-sidebar {
            display: none !important;
          }
          .admin-mobile-close-btn {
            display: block !important;
          }
          .admin-header-row {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 1rem !important;
          }
          .admin-filter-box {
            flex-direction: column !important;
            align-items: stretch !important;
          }
        }
      `}</style>
    </>
  );
};

export default AdminSidebar;
