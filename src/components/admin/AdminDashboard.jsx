'use client';

import React, { useState } from 'react';
import AdminProtectedRoute from './AdminProtectedRoute';
import AdminLayout from './AdminLayout';
import AnalyticsOverview from './AnalyticsOverview';
import OrderManager from './OrderManager';
import ProductBundleManager from './ProductBundleManager';
import CustomerCRM from './CustomerCRM';
import HypeDropController from './HypeDropController';

/**
 * AdminDashboard Main Container Component
 * 
 * Aggregates all 5 admin control center modules into a single production-ready dashboard.
 */
export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <AdminProtectedRoute>
      <AdminLayout activeTab={activeTab} setActiveTab={setActiveTab}>
        {activeTab === 'overview' && <AnalyticsOverview />}
        {activeTab === 'orders' && <OrderManager />}
        {activeTab === 'products' && <ProductBundleManager />}
        {activeTab === 'customers' && <CustomerCRM />}
        {activeTab === 'hypedrop' && <HypeDropController />}
      </AdminLayout>
    </AdminProtectedRoute>
  );
}
