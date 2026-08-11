'use client';

import React, { useState, useEffect } from 'react';
import { ALL_PRODUCTS } from '../../data/products.js';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [activeTab, setActiveTab] = useState('inventory');
  const [products, setProducts] = useState(ALL_PRODUCTS);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const storedKey = sessionStorage.getItem('pvAdminKey');
    if (storedKey) {
      setIsAuthenticated(true);
      fetchOrders(storedKey);
    }
  }, []);

  const fetchOrders = async (adminKey) => {
    try {
      const res = await fetch('/api/orders', {
        headers: { 'X-Admin-Key': adminKey }
      });
      const data = await res.json();
      if (data.success) {
        setOrders(data.data || []);
      }
    } catch (e) {
      console.warn('Orders fetch warning:', e);
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (passcode.trim().length >= 12) {
      sessionStorage.setItem('pvAdminKey', passcode.trim());
      setIsAuthenticated(true);
      fetchOrders(passcode.trim());
    } else {
      setErrorMsg('❌ Invalid Secret Admin Key. Key must be at least 12 characters.');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('pvAdminKey');
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return (
      <main style={{ padding: '6rem 2rem', minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="table-card" style={{ maxWidth: '450px', width: '100%', padding: '2.5rem', textAlignment: 'center' }}>
          <div style={{ fontSize: '3rem', textAlign: 'center', marginBottom: '8px' }}>🔒</div>
          <h2 style={{ fontFamily: 'var(--font-title)', textAlign: 'center', fontSize: '1.6rem', color: 'var(--accent-red)', marginTop: 0 }}>ADMIN VAULT ACCESS</h2>
          <p style={{ fontFamily: 'var(--font-mono)', textAlign: 'center', fontSize: '0.85rem', color: '#666', marginBottom: '1.5rem' }}>Restricted Curator Access — Enter Secret Master Key</p>

          <form onSubmit={handleLogin}>
            <div className="admin-form-group">
              <label>ENTER MASTER SECRET KEY</label>
              <input
                type="password"
                className="admin-form-input"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="••••••••••••••••••••••••"
                required
              />
            </div>
            {errorMsg ? (
              <div style={{ color: 'var(--accent-red)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: 700, marginBottom: '1rem' }}>
                {errorMsg}
              </div>
            ) : null}
            <button type="submit" className="btn-pill" style={{ width: '100%', padding: '12px' }}>
              🔓 Authenticate &amp; Enter Admin Panel
            </button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="admin-wrap" style={{ padding: '3rem 2rem 6rem', maxWidth: '1280px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-title)', fontSize: '2rem', color: 'var(--accent-red)', margin: 0 }}>CURATOR ADMIN VAULT</h1>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: '#666' }}>Managing 60+ Products, Inventory &amp; Vault Customer Orders</div>
        </div>
        <button className="btn-inspect" onClick={handleLogout} style={{ padding: '8px 16px', color: 'var(--accent-red)' }}>
          🔒 Logout Admin
        </button>
      </div>

      {/* KPI STATS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        <div className="kpi-card">
          <div className="kpi-title">TOTAL CATALOG ITEMS</div>
          <div className="kpi-value" style={{ color: 'var(--accent-red)' }}>{products.length}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-title">ACTIVE CATEGORIES</div>
          <div className="kpi-value">18</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-title">LOGGED ORDERS</div>
          <div className="kpi-value" style={{ color: '#166534' }}>{orders.length}</div>
        </div>
      </div>

      {/* TABS */}
      <div className="admin-tabs" style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', borderBottom: '3px solid #000', paddingBottom: '10px' }}>
        <button className={`admin-tab-btn ${activeTab === 'inventory' ? 'active' : ''}`} onClick={() => setActiveTab('inventory')} style={{ fontFamily: 'var(--font-title)', fontSize: '1rem', padding: '10px 20px', cursor: 'pointer', border: '2px solid #000', borderRadius: '6px', background: activeTab === 'inventory' ? '#FFF056' : '#FFF' }}>
          📦 Inventory Manager
        </button>
        <button className={`admin-tab-btn ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')} style={{ fontFamily: 'var(--font-title)', fontSize: '1rem', padding: '10px 20px', cursor: 'pointer', border: '2px solid #000', borderRadius: '6px', background: activeTab === 'orders' ? '#FFF056' : '#FFF' }}>
          📜 Customer Orders ({orders.length})
        </button>
      </div>

      {activeTab === 'inventory' ? (
        <div className="table-card">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Rating</th>
                <th>Stock</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id}>
                  <td style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img src={p.image} style={{ width: '40px', height: '40px', objectFit: 'contain', background: '#111', borderRadius: '4px' }} alt={p.name} />
                    <strong style={{ fontFamily: 'var(--font-title)' }}>{p.name}</strong>
                  </td>
                  <td>{p.categoryName}</td>
                  <td style={{ fontWeight: 700 }}>${p.price.toFixed(2)}</td>
                  <td>★ {p.rating.toFixed(1)}</td>
                  <td>{p.stockCount || 10} units</td>
                  <td><span className="stock-badge in-stock">{p.availability}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="table-card">
          {orders.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', fontFamily: 'var(--font-mono)' }}>No orders placed yet.</div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Total</th>
                  <th>Payment</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(o => (
                  <tr key={o.id || o.order_id}>
                    <td style={{ fontWeight: 900, color: 'var(--accent-red)' }}>{o.order_id || o.id}</td>
                    <td>{o.customer_name || o.customerName}</td>
                    <td style={{ fontWeight: 700 }}>${Number(o.total_amount || o.totalAmount || 0).toFixed(2)}</td>
                    <td>{o.payment_method || o.paymentMethod || 'PayPal'}</td>
                    <td><span className="stock-badge in-stock">DISPATCHED</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </main>
  );
}
