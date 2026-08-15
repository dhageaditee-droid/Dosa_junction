import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle2, MessageCircle, Navigation } from 'lucide-react';
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
    <div style={{ backgroundColor: 'var(--color-cream)', padding: '2rem 0 5rem 0', minHeight: '85vh' }}>
      <SEOHead title="Contact Us & Location | Dosa Junction" />

      <div className="container">
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--color-gold)', fontWeight: 700, textTransform: 'uppercase' }}>
            We'd Love to Hear From You
          </span>
          <h1 style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--color-emerald)', fontFamily: 'var(--font-heading)', margin: '4px 0' }}>
            Contact Us & Restaurant Location
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', maxWidth: '600px', margin: '0 auto' }}>
            Call us directly, send a message on WhatsApp, or get instant GPS driving directions to our restaurant!
          </p>
        </div>

        {/* Quick Action Mobile Call & Direction Buttons */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px',
          justifyContent: 'center',
          marginBottom: '2rem'
        }}>
          <a
            href="tel:+917020758779"
            className="btn btn-primary"
            style={{
              flex: 1,
              minWidth: '160px',
              padding: '0.85rem 1.2rem',
              borderRadius: '16px',
              fontWeight: 800,
              fontSize: '0.95rem',
              boxShadow: '0 4px 14px rgba(217, 119, 6, 0.25)'
            }}
          >
            <Phone size={20} /> Call +91 70207 58779
          </a>

          <a
            href="https://wa.me/917020758779?text=Hello%20Dosa%20Junction,%20I%20want%20to%20place%20an%20order!"
            target="_blank"
            rel="noreferrer"
            className="btn"
            style={{
              flex: 1,
              minWidth: '160px',
              backgroundColor: '#25D366',
              color: '#FFFFFF',
              padding: '0.85rem 1.2rem',
              borderRadius: '16px',
              fontWeight: 800,
              fontSize: '0.95rem',
              boxShadow: '0 4px 14px rgba(37, 211, 102, 0.25)'
            }}
          >
            <MessageCircle size={20} /> WhatsApp Order
          </a>

          <a
            href="https://maps.google.com/?q=Sinnar+Gaurav,+Near+Panchvati+Hotel,+Sinnar"
            target="_blank"
            rel="noreferrer"
            className="btn btn-emerald"
            style={{
              flex: 1,
              minWidth: '160px',
              padding: '0.85rem 1.2rem',
              borderRadius: '16px',
              fontWeight: 800,
              fontSize: '0.95rem'
            }}
          >
            <Navigation size={20} /> Get GPS Directions
          </a>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '2rem',
          maxWidth: '1100px',
          margin: '0 auto'
        }}>
          
          {/* Left Column: Info Cards & Map */}
          <div>
            <div style={{
              backgroundColor: '#0B3C26',
              color: '#FFFFFF',
              padding: '2rem',
              borderRadius: '24px',
              marginBottom: '1.5rem',
              boxShadow: '0 8px 24px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', marginBottom: '1.25rem', color: 'var(--color-gold)' }}>
                Dosa Junction
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', fontSize: '0.95rem', color: '#E2E8F0' }}>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <MapPin size={22} color="var(--color-gold)" style={{ flexShrink: 0 }} />
                  <span>Sinnar Gaurav, Near Panchvati Hotel, Sinnar</span>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <Phone size={22} color="var(--color-gold)" style={{ flexShrink: 0 }} />
                  <a href="tel:+917020758779" style={{ color: '#E2E8F0', fontWeight: 700 }}>+91 70207 58779</a>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <Mail size={22} color="var(--color-gold)" style={{ flexShrink: 0 }} />
                  <span>info@dosajunction.com</span>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <Clock size={22} color="var(--color-gold)" style={{ flexShrink: 0 }} />
                  <span>Opening Hours: 7:00 AM – 10:30 PM Daily</span>
                </div>
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
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--color-emerald)', margin: 0 }}>
                  📍 Restaurant Google Maps Location
                </h4>
                <a
                  href="https://maps.google.com/?q=Sinnar+Gaurav,+Near+Panchvati+Hotel,+Sinnar"
                  target="_blank"
                  rel="noreferrer"
                  style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-gold)' }}
                >
                  Open Maps ➔
                </a>
              </div>
              <div style={{
                height: '240px',
                borderRadius: '16px',
                overflow: 'hidden',
                border: '1px solid var(--color-border)'
              }}>
                <iframe
                  title="Dosa Junction Sinnar Google Maps Location"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  allowFullScreen
                  src="https://maps.google.com/maps?q=Sinnar+Gaurav,+Near+Panchvati+Hotel,+Sinnar&t=&z=15&ie=UTF8&iwloc=&output=embed"
                />
              </div>
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div style={{
            backgroundColor: '#FFFFFF',
            padding: '2rem',
            borderRadius: '24px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
            border: '1px solid var(--color-border)'
          }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.6rem', color: 'var(--color-emerald)', marginBottom: '0.4rem' }}>
              Send Us a Message
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
              Have questions about bulk orders, party catering, or feedback? Send us a quick note.
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
                <h4 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>Enquiry Sent!</h4>
                <p style={{ fontSize: '0.9rem' }}>Thank you for reaching out. We will get back to you shortly.</p>
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
                  {errors.name && <span style={{ color: '#EF4444', fontSize: '0.78rem', display: 'block', marginTop: '4px' }}>{errors.name}</span>}
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
                    {errors.phone && <span style={{ color: '#EF4444', fontSize: '0.78rem', display: 'block', marginTop: '4px' }}>{errors.phone}</span>}
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
                    {errors.email && <span style={{ color: '#EF4444', fontSize: '0.78rem', display: 'block', marginTop: '4px' }}>{errors.email}</span>}
                  </div>
                </div>

                <div>
                  <label className="form-label">Subject *</label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="e.g. Catering / Order Enquiry"
                    className="form-input"
                    style={{ borderColor: errors.subject ? '#EF4444' : undefined }}
                  />
                  {errors.subject && <span style={{ color: '#EF4444', fontSize: '0.78rem', display: 'block', marginTop: '4px' }}>{errors.subject}</span>}
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
                  {errors.message && <span style={{ color: '#EF4444', fontSize: '0.78rem', display: 'block', marginTop: '4px' }}>{errors.message}</span>}
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '0.85rem', fontWeight: 800, marginTop: '0.4rem' }}
                >
                  {submitting ? 'Submitting...' : 'Submit Message'} <Send size={18} />
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
