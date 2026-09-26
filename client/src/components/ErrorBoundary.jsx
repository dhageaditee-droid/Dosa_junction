import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '70vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          backgroundColor: '#FAF8F5',
          textAlign: 'center'
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '24px',
            padding: '2.5rem 2rem',
            maxWidth: '500px',
            width: '100%',
            boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
            border: '1.5px solid #FEE2E2'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: '#FEF2F2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.2rem auto'
            }}>
              <AlertTriangle size={32} color="#DC2626" />
            </div>

            <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#064E3B', margin: '0 0 0.5rem 0' }}>
              Oops! Something went wrong
            </h2>

            <p style={{ fontSize: '0.9rem', color: '#6B7280', margin: '0 0 1.5rem 0', lineHeight: 1.5 }}>
              We encountered an issue loading this page. Please try refreshing or return to the home page.
            </p>

            <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'center' }}>
              <button
                onClick={this.handleReload}
                style={{
                  padding: '0.8rem 1.4rem',
                  borderRadius: '12px',
                  backgroundColor: '#EA580C',
                  color: '#FFFFFF',
                  border: 'none',
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <RefreshCw size={16} /> Reload Page
              </button>

              <a
                href="/"
                style={{
                  padding: '0.8rem 1.4rem',
                  borderRadius: '12px',
                  backgroundColor: '#FFFFFF',
                  color: '#064E3B',
                  border: '1.5px solid #064E3B',
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Home size={16} /> Go to Home
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
