'use client';

import React, { useState } from 'react';
import AdminProtectedRoute from './AdminProtectedRoute';
import AdminLayout from './AdminLayout';

import AnalyticsReports from './modules/AnalyticsReports';
import OrderManager from './modules/OrderManager';
import InventoryMatrix from './modules/InventoryMatrix';
import CustomerCRM from './modules/CustomerCRM';
import DiscountsPromos from './modules/DiscountsPromos';
import HypeDropGate from './modules/HypeDropGate';
import TCGMarketWatcher from './modules/TCGMarketWatcher';
import FraudRiskAnalyzer from './modules/FraudRiskAnalyzer';
import StoreSettings from './modules/StoreSettings';

/**
 * AdminDashboard Main Container Component
 * 
 * Aggregates all 9 Shopify-class + Beyond Shopify modules into a single control panel.
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
