'use client';

import React, { useState } from 'react';
import AdminProtectedRoute from './AdminProtectedRoute.jsx';
import AdminLayout from './AdminLayout.jsx';

import AnalyticsReports from './modules/AnalyticsReports.jsx';
import OrderManager from './modules/OrderManager.jsx';
import InventoryMatrix from './modules/InventoryMatrix.jsx';
import CustomerCRM from './CustomerCRM.jsx';
import DiscountsPromos from './modules/DiscountsPromos.jsx';
import HypeDropGate from './modules/HypeDropGate.jsx';
import TCGMarketWatcher from './modules/TCGMarketWatcher.jsx';
import FraudRiskAnalyzer from './modules/FraudRiskAnalyzer.jsx';
import StoreSettings from './modules/StoreSettings.jsx';

import { INITIAL_ORDERS } from '../../data/orders.js';

/**
 * AdminDashboard Main Container Component
 * 
 * Aggregates all 9 PokeVault Enterprise modules into a single unified control panel,
 * sharing a single source-of-truth reactive state for orders and store data.
 */
export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [orders, setOrders] = useState(INITIAL_ORDERS);

  return (
    <AdminProtectedRoute>
      <AdminLayout activeTab={activeTab} setActiveTab={setActiveTab}>
        {activeTab === 'overview' && <AnalyticsReports orders={orders} />}
        {activeTab === 'orders' && <OrderManager orders={orders} setOrders={setOrders} />}
        {activeTab === 'products' && <InventoryMatrix />}
        {activeTab === 'customers' && <CustomerCRM orders={orders} />}
        {activeTab === 'discounts' && <DiscountsPromos />}
        {activeTab === 'hypedrop' && <HypeDropGate />}
        {activeTab === 'tcgmarket' && <TCGMarketWatcher />}
        {activeTab === 'fraudrisk' && <FraudRiskAnalyzer orders={orders} />}
        {activeTab === 'settings' && <StoreSettings orders={orders} />}
      </AdminLayout>
    </AdminProtectedRoute>
  );
}
