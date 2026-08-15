import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from './ToastContext';
import { apiService } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Admin state
  const [adminToken, setAdminToken] = useState(() => localStorage.getItem('dakshin_admin_token') || null);
  const [adminUser, setAdminUser] = useState(() => {
    try {
      const saved = localStorage.getItem('dakshin_admin_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  // Customer state
  const [customerToken, setCustomerToken] = useState(() => localStorage.getItem('dakshin_customer_token') || null);
  const [customerUser, setCustomerUser] = useState(() => {
    try {
      const saved = localStorage.getItem('dakshin_customer_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const { addToast } = useToast();

  // Admin login
  const loginAdmin = async (email, password) => {
    try {
      const response = await apiService.adminLogin({ email, password });
      if (response.success) {
        setAdminToken(response.token);
        setAdminUser(response.admin);
        localStorage.setItem('dakshin_admin_token', response.token);
        localStorage.setItem('dakshin_admin_user', JSON.stringify(response.admin));
        if (addToast) addToast(`Welcome back, ${response.admin.name}!`, 'success');
        return { success: true };
      }
    } catch (err) {
      if (addToast) addToast(err.message || 'Server authentication error', 'error');
      return { success: false, message: err.message };
    }
  };

  const logoutAdmin = () => {
    setAdminToken(null);
    setAdminUser(null);
    localStorage.removeItem('dakshin_admin_token');
    localStorage.removeItem('dakshin_admin_user');
    if (addToast) addToast('Logged out of admin dashboard.', 'info');
  };

  // Customer register
  const registerCustomer = async (data) => {
    try {
      const response = await apiService.customerRegister(data);
      if (response.success) {
        setCustomerToken(response.token);
        setCustomerUser(response.customer);
        localStorage.setItem('dakshin_customer_token', response.token);
        localStorage.setItem('dakshin_customer_user', JSON.stringify(response.customer));
        if (addToast) addToast(`Welcome to Dosa Junction, ${response.customer.name}!`, 'success');
        return { success: true };
      }
    } catch (err) {
      if (addToast) addToast(err.message || 'Registration failed', 'error');
      return { success: false, message: err.message };
    }
  };

  // Customer login
  const loginCustomer = async (email, password) => {
    try {
      const response = await apiService.customerLogin({ email, password });
      if (response.success) {
        setCustomerToken(response.token);
        setCustomerUser(response.customer);
        localStorage.setItem('dakshin_customer_token', response.token);
        localStorage.setItem('dakshin_customer_user', JSON.stringify(response.customer));
        if (addToast) addToast(`Welcome back, ${response.customer.name}!`, 'success');
        return { success: true };
      }
    } catch (err) {
      if (addToast) addToast(err.message || 'Login failed', 'error');
      return { success: false, message: err.message };
    }
  };

  const logoutCustomer = () => {
    setCustomerToken(null);
    setCustomerUser(null);
    localStorage.removeItem('dakshin_customer_token');
    localStorage.removeItem('dakshin_customer_user');
    if (addToast) addToast('Logged out successfully.', 'info');
  };

  return (
    <AuthContext.Provider
      value={{
        adminToken,
        adminUser,
        isAdminAuthenticated: !!adminToken,
        loginAdmin,
        logoutAdmin,

        customerToken,
        customerUser,
        isCustomerAuthenticated: !!customerToken,
        registerCustomer,
        loginCustomer,
        logoutCustomer
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
