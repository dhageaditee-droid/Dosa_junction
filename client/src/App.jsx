import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import StickyMobileCartBar from './components/StickyMobileCartBar';
import MobileBottomNav from './components/MobileBottomNav';
import CustomerAuthModal from './components/CustomerAuthModal';

import Home from './pages/Home';
import MenuPage from './pages/MenuPage';
import OffersPage from './pages/OffersPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderSuccessPage from './pages/OrderSuccessPage';
import TrackOrderPage from './pages/TrackOrderPage';
import CustomerProfilePage from './pages/CustomerProfilePage';

import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminMenu from './pages/AdminMenu';
import AdminOrders from './pages/AdminOrders';
import AdminOffers from './pages/AdminOffers';
import AdminCoupons from './pages/AdminCoupons';
import AdminEnquiries from './pages/AdminEnquiries';
import AdminSettings from './pages/AdminSettings';

import { ToastProvider } from './context/ToastContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { LanguageProvider } from './context/LanguageContext';

// Customer Layout Wrapper
const CustomerLayout = () => {
  const [showAuthModal, setShowAuthModal] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', position: 'relative' }}>
      <Navbar onOpenAuthModal={() => setShowAuthModal(true)} />
      <main style={{ flexGrow: 1 }}>
        <Outlet />
      </main>
      <StickyMobileCartBar />
      <MobileBottomNav onOpenAuthModal={() => setShowAuthModal(true)} />
      <Footer />
      
      <CustomerAuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </div>
  );
};

// Protected Admin Route Guard
const ProtectedAdminRoute = ({ children }) => {
  const { isAdminAuthenticated } = useAuth();
  if (!isAdminAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
};

const App = () => {
  return (
    <LanguageProvider>
      <ToastProvider>
        <AuthProvider>
          <CartProvider>
          <Router>
            <Routes>
              
              {/* Customer Website Routes */}
              <Route element={<CustomerLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/menu" element={<MenuPage />} />
                <Route path="/offers" element={<OffersPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/order-success/:orderNumber" element={<OrderSuccessPage />} />
                <Route path="/track" element={<TrackOrderPage />} />
                <Route path="/track-order" element={<TrackOrderPage />} />
                <Route path="/my-orders" element={<CustomerProfilePage />} />
              </Route>

              {/* Admin Portal Routes */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedAdminRoute>
                    <AdminDashboard />
                  </ProtectedAdminRoute>
                }
              />
              <Route
                path="/admin/menu"
                element={
                  <ProtectedAdminRoute>
                    <AdminMenu />
                  </ProtectedAdminRoute>
                }
              />
              <Route
                path="/admin/orders"
                element={
                  <ProtectedAdminRoute>
                    <AdminOrders />
                  </ProtectedAdminRoute>
                }
              />
              <Route
                path="/admin/offers"
                element={
                  <ProtectedAdminRoute>
                    <AdminOffers />
                  </ProtectedAdminRoute>
                }
              />
              <Route
                path="/admin/coupons"
                element={
                  <ProtectedAdminRoute>
                    <AdminCoupons />
                  </ProtectedAdminRoute>
                }
              />
              <Route
                path="/admin/enquiries"
                element={
                  <ProtectedAdminRoute>
                    <AdminEnquiries />
                  </ProtectedAdminRoute>
                }
              />
              <Route
                path="/admin/settings"
                element={
                  <ProtectedAdminRoute>
                    <AdminSettings />
                  </ProtectedAdminRoute>
                }
              />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />

            </Routes>
          </Router>
        </CartProvider>
      </AuthProvider>
    </ToastProvider>
  </LanguageProvider>
  );
};

export default App;
