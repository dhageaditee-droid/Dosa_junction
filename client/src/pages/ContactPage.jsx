import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle2, MessageCircle, Instagram, Facebook } from 'lucide-react';
import SEOHead from '../components/SEOHead';
import { useToast } from '../context/ToastContext';
import { apiService } from '../services/api';

const ContactPage = () => {
  const { addToast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    subject: '',
    message: ''
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Your name is required';
    if (!formData.phone.trim()) {
      errs.phone = 'Mobile number is required';
    } else if (!/^[0-9]{10}$/.test(formData.phone.trim())) {
      errs.phone = 'Enter a valid 10-digit mobile number';
    }
    if (!formData.email.trim()) {
      errs.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email.trim())) {
      errs.email = 'Invalid email address format';
    }
    if (!formData.subject.trim()) errs.subject = 'Subject is required';
    if (!formData.message.trim() || formData.message.trim().length < 5) {
      errs.message = 'Message must be at least 5 characters long';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setSubmitting(true);
      const res = await apiService.sendContactEnquiry(formData);
      if (res.success) {
        setSubmitted(true);
        if (addToast) addToast(res.message || 'Enquiry submitted successfully!', 'success');
        setFormData({ name: '', phone: '', email: '', subject: '', message: '' });
      }
    } catch (err) {
      if (addToast) addToast(err.message || 'Failed to send message. Try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ backgroundColor: 'var(--color-cream)', padding: '3rem 0 5rem 0', minHeight: '85vh' }}>
      <SEOHead title="Contact Us & Location | Dakshin Bhavan" />

      <div className="container">
        
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--color-gold)', fontWeight: 700, textTransform: 'uppercase' }}>
            We'd Love to Hear From You
          </span>
          <h1 style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--color-emerald)', fontFamily: 'var(--font-heading)', margin: '4px 0' }}>
            Contact Us
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', maxWidth: '600px', margin: '0 auto' }}>
            Have a question about catering, private dining, orders, or feedback? Reach out to Dakshin Bhavan!
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '2.5rem',
          maxWidth: '1100px',
          margin: '0 auto'
        }}>
          
          {/* Left Column: Info Cards & Map */}
          <div>
            <div style={{
              backgroundColor: '#0F172A',
              color: '#FFFFFF',
              padding: '2rem',
              borderRadius: '24px',
              marginBottom: '1.5rem',
              boxShadow: '0 8px 24px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', marginBottom: '1.25rem', color: 'var(--color-gold)' }}>
                Dakshin Bhavan
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', fontSize: '0.95rem', color: '#E2E8F0' }}>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <MapPin size={22} color="var(--color-gold)" style={{ flexShrink: 0 }} />
                  <span>108 Indiranagar 100 Feet Road, Bengaluru, Karnataka 560038</span>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <Phone size={22} color="var(--color-gold)" style={{ flexShrink: 0 }} />
                  <span>+91 98765 43210</span>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <Mail size={22} color="var(--color-gold)" style={{ flexShrink: 0 }} />
                  <span>info@dakshinbhavan.com</span>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <Clock size={22} color="var(--color-gold)" style={{ flexShrink: 0 }} />
                  <span>Opening Hours: 7:00 AM – 11:00 PM Daily</span>
                </div>
              </div>

              {/* WhatsApp & Social Media Links */}
              <div style={{ marginTop: '1.8rem', paddingTop: '1.2rem', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                <a
                  href="https://wa.me/919876543210"
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    backgroundColor: '#25D366',
                    color: '#FFFFFF',
                    padding: '8px 14px',
                    borderRadius: '20px',
                    textDecoration: 'none',
                    fontWeight: 700,
                    fontSize: '0.82rem'
                  }}
                >
                  <MessageCircle size={16} /> WhatsApp Us
                </a>

                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    backgroundColor: 'rgba(255,255,255,0.15)',
                    color: '#FFFFFF',
                    padding: '8px 14px',
                    borderRadius: '20px',
                    textDecoration: 'none',
                    fontWeight: 700,
                    fontSize: '0.82rem'
                  }}
                >
                  <Instagram size={16} /> Instagram
                </a>

                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    backgroundColor: 'rgba(255,255,255,0.15)',
                    color: '#FFFFFF',
                    padding: '8px 14px',
                    borderRadius: '20px',
                    textDecoration: 'none',
                    fontWeight: 700,
                    fontSize: '0.82rem'
                  }}
                >
                  <Facebook size={16} /> Facebook
                </a>
              </div>
            </div>

            {/* Google Maps Location Embed */}
            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '24px',
              overflow: 'hidden',
              boxShadow: '0 4px 14px rgba(0,0,0,0.04)',
              border: '1px solid var(--color-border)',
              padding: '1.25rem',
              textAlign: 'center'
            }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--color-emerald)', marginBottom: '0.8rem' }}>
                Restaurant Location Map
              </h4>
              <div style={{
                height: '220px',
                borderRadius: '16px',
                overflow: 'hidden',
                marginBottom: '1rem',
                border: '1px solid var(--color-border)'
              }}>
                <iframe
                  title="Dakshin Bhavan Google Maps Location"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  allowFullScreen
                  src="https://maps.google.com/maps?q=Indiranagar+100+Feet+Road+Bengaluru&t=&z=15&ie=UTF8&iwloc=&output=embed"
                />
              </div>
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div style={{
            backgroundColor: '#FFFFFF',
            padding: '2.25rem',
            borderRadius: '24px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
            border: '1px solid var(--color-border)'
          }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.6rem', color: 'var(--color-emerald)', marginBottom: '0.4rem' }}>
              Send Us an Enquiry
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
              Fill out the form below to reach our restaurant management directly.
            </p>

            {submitted ? (
              <div style={{
                padding: '2rem',
                backgroundColor: '#ECFDF5',
                border: '1px solid #A7F3D0',
                borderRadius: '16px',
                textAlign: 'center',
                color: '#065F46'
              }}>
                <CheckCircle2 size={48} color="#059669" style={{ margin: '0 auto 0.75rem auto' }} />
                <h4 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>Enquiry Saved!</h4>
                <p style={{ fontSize: '0.9rem' }}>Thank you for reaching out. We will call or email you shortly.</p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="btn btn-primary btn-sm"
                  style={{ marginTop: '1.25rem' }}
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                
                <div>
                  <label className="form-label">Full Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Aditee Kumar"
                    className="form-input"
                    style={{ borderColor: errors.name ? '#EF4444' : undefined }}
                  />
                  {errors.name && <span className="form-error">{errors.name}</span>}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                  <div>
                    <label className="form-label">Mobile Number *</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="10-digit mobile number"
                      className="form-input"
                      style={{ borderColor: errors.phone ? '#EF4444' : undefined }}
                    />
                    {errors.phone && <span className="form-error">{errors.phone}</span>}
                  </div>

                  <div>
                    <label className="form-label">Email Address *</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="aditee@example.com"
                      className="form-input"
                      style={{ borderColor: errors.email ? '#EF4444' : undefined }}
                    />
                    {errors.email && <span className="form-error">{errors.email}</span>}
                  </div>
                </div>

                <div>
                  <label className="form-label">Subject *</label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="e.g. Party Catering / Table Reservation"
                    className="form-input"
                    style={{ borderColor: errors.subject ? '#EF4444' : undefined }}
                  />
                  {errors.subject && <span className="form-error">{errors.subject}</span>}
                </div>

                <div>
                  <label className="form-label">Message / Enquiry *</label>
                  <textarea
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Write your message here..."
                    className="form-input"
                    style={{ borderColor: errors.message ? '#EF4444' : undefined }}
                  />
                  {errors.message && <span className="form-error">{errors.message}</span>}
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '0.85rem', fontWeight: 800, marginTop: '0.4rem' }}
                >
                  {submitting ? 'Submitting...' : 'Submit Enquiry'} <Send size={18} />
                </button>

              </form>
            )}

          </div>

        </div>

      </div>
    </div>
  );
};

export default ContactPage;
