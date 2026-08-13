'use client';

import React, { useState } from 'react';
import AdminProtectedRoute from './AdminProtectedRoute.jsx';
import AdminLayout from './AdminLayout.jsx';

import AnalyticsReports from './modules/AnalyticsReports.jsx';
import OrderManager from './modules/OrderManager.jsx';
import InventoryMatrix from './modules/InventoryMatrix.jsx';
import CustomerCRM from './modules/CustomerCRM.jsx';
import DiscountsPromos from './modules/DiscountsPromos.jsx';
import HypeDropGate from './modules/HypeDropGate.jsx';
import TCGMarketWatcher from './modules/TCGMarketWatcher.jsx';
import FraudRiskAnalyzer from './modules/FraudRiskAnalyzer.jsx';
import StoreSettings from './modules/StoreSettings.jsx';

/**
 * AdminDashboard Main Container Component
 * 
 * Aggregates all 9 PokeVault Enterprise modules into a single control panel.
 */
export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <AdminProtectedRoute>
      <AdminLayout activeTab={activeTab} setActiveTab={setActiveTab}>
        {activeTab === 'overview' && <AnalyticsReports />}
        {activeTab === 'orders' && <OrderManager />}
        {activeTab === 'products' && <InventoryMatrix />}
        {activeTab === 'customers' && <CustomerCRM />}
        {activeTab === 'discounts' && <DiscountsPromos />}
        {activeTab === 'hypedrop' && <HypeDropGate />}
        {activeTab === 'tcgmarket' && <TCGMarketWatcher />}
        {activeTab === 'fraudrisk' && <FraudRiskAnalyzer />}
        {activeTab === 'settings' && <StoreSettings />}
      </AdminLayout>
    </AdminProtectedRoute>
  );
}
