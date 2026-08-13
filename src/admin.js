import React, { Component } from 'react';
import { createRoot } from 'react-dom/client';
import { StoreProvider } from './context/StoreContext.jsx';
import AdminDashboard from './components/admin/AdminDashboard.jsx';

const ReactObj = (typeof window !== 'undefined' && window.React) ? window.React : React;
const ComponentClass = ReactObj.Component || Component;

/**
 * React Error Boundary to prevent silent blank black screens
 */
class AdminErrorBoundary extends ComponentClass {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[PokeVault Admin Error Boundary]:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          backgroundColor: '#09090b',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          fontFamily: 'monospace'
        }}>
          <div style={{
            backgroundColor: '#18181b',
            border: '2px solid #ef4444',
            padding: '2rem',
            borderRadius: '12px',
            maxWidth: '550px',
            width: '100%',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}>
            <h1 style={{ color: '#ef4444', fontSize: '1.5rem', fontWeight: 900, marginTop: 0, textTransform: 'uppercase' }}>
              ⚠️ Admin Panel Runtime Error
            </h1>
            <p style={{ color: '#a1a1aa', fontSize: '0.85rem', marginBottom: '1rem' }}>
              An unexpected rendering exception occurred in the Admin Control Center:
            </p>
            <div style={{
              backgroundColor: '#09090b',
              border: '1px solid #27272a',
              color: '#f87171',
              padding: '1rem',
              borderRadius: '6px',
              fontSize: '0.75rem',
              wordBreak: 'break-word',
              marginBottom: '1.5rem'
            }}>
              {this.state.error?.toString() || 'Unknown Error'}
            </div>
            <button
              onClick={() => window.location.reload()}
              style={{
                backgroundColor: '#fbbf24',
                color: '#000000',
                fontWeight: 900,
                border: 'none',
                padding: '12px 20px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '0.85rem',
                textTransform: 'uppercase'
              }}
            >
              🔄 Reload Admin Panel
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

/**
 * POKÉVAULT LEGENDS — Admin Entry Point
 * Wraps AdminDashboard inside StoreProvider and AdminErrorBoundary.
 */
function AppRoot() {
  return (
    <AdminErrorBoundary>
      <StoreProvider>
        <AdminDashboard />
      </StoreProvider>
    </AdminErrorBoundary>
  );
}

const mountContainer = document.getElementById('adminRoot') || document.body;
if (mountContainer) {
  const rootFn = (typeof window !== 'undefined' && window.ReactDOM?.createRoot) ? window.ReactDOM.createRoot : createRoot;
  const root = rootFn(mountContainer);
  root.render(ReactObj.createElement(AppRoot));
}
