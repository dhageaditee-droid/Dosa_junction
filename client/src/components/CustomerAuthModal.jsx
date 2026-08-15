import React, { useState } from 'react';
import { X, User, Phone, Mail, Lock, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const CustomerAuthModal = ({ isOpen, onClose }) => {
  const [isLoginView, setIsLoginView] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    address: '',
    city: 'Bengaluru',
    pincode: ''
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const { loginCustomer, registerCustomer } = useAuth();

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) {
      errs.email = 'Valid email address is required';
    }
    if (!formData.password) {
      errs.password = 'Password is required';
    }

    if (!isLoginView) {
      if (!formData.name.trim()) errs.name = 'Full name is required';
      if (!formData.phone || !/^[0-9]{10}$/.test(formData.phone.trim())) {
        errs.phone = 'Valid 10-digit Indian mobile number is required';
      }
      if (formData.password.length < 6) {
        errs.password = 'Password must be at least 6 characters';
      }
      if (formData.password !== formData.confirmPassword) {
        errs.confirmPassword = 'Passwords do not match';
      }
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    let result;
    if (isLoginView) {
      result = await loginCustomer(formData.email, formData.password);
    } else {
      result = await registerCustomer({
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        password: formData.password,
        address: formData.address,
        city: formData.city,
        pincode: formData.pincode
      });
    }
    setSubmitting(false);

    if (result && result.success) {
      onClose();
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(4px)',
        zIndex: 1050,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        animation: 'fadeIn 0.2s ease-out'
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '20px',
          maxWidth: '460px',
          width: '100%',
          padding: '2rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'none',
            border: 'none',
            color: 'var(--color-text-muted)',
            cursor: 'pointer'
          }}
        >
          <X size={24} />
        </button>

        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-emerald)' }}>
            {isLoginView ? 'Welcome Back!' : 'Create Customer Account'}
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
            {isLoginView ? 'Sign in to order your favorite South Indian food' : 'Join Dosa Junction for fast food ordering & rewards'}
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          {!isLoginView && (
            <>
              <div>
                <label className="form-label">Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Aditee Kumar"
                  className="form-input"
                />
                {errors.name && <span className="form-error">{errors.name}</span>}
              </div>

              <div>
                <label className="form-label">Mobile Number *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="10-digit mobile number"
                  className="form-input"
                />
                {errors.phone && <span className="form-error">{errors.phone}</span>}
              </div>
            </>
          )}

          <div>
            <label className="form-label">Email Address *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="name@example.com"
              className="form-input"
            />
            {errors.email && <span className="form-error">{errors.email}</span>}
          </div>

          <div>
            <label className="form-label">Password *</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="form-input"
            />
            {errors.password && <span className="form-error">{errors.password}</span>}
          </div>

          {!isLoginView && (
            <div>
              <label className="form-label">Confirm Password *</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                className="form-input"
              />
              {errors.confirmPassword && <span className="form-error">{errors.confirmPassword}</span>}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem', fontWeight: 800 }}
          >
            {submitting ? 'Please wait...' : isLoginView ? 'Login' : 'Register Account'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.2rem', fontSize: '0.85rem' }}>
          {isLoginView ? (
            <span>
              Don't have an account?{' '}
              <button
                onClick={() => { setIsLoginView(false); setErrors({}); }}
                style={{ background: 'none', border: 'none', color: 'var(--color-gold)', fontWeight: 700, cursor: 'pointer' }}
              >
                Register Here
              </button>
            </span>
          ) : (
            <span>
              Already registered?{' '}
              <button
                onClick={() => { setIsLoginView(true); setErrors({}); }}
                style={{ background: 'none', border: 'none', color: 'var(--color-gold)', fontWeight: 700, cursor: 'pointer' }}
              >
                Sign In
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerAuthModal;
