import React from 'react';
import { createRoot } from 'react-dom/client';
import AdminDashboard from './components/admin/AdminDashboard.jsx';

/**
 * POKÉVAULT LEGENDS — Admin Entry Point
 * Mounts the new dark-mode Admin Control Center (AdminDashboard)
 */
const container = document.getElementById('adminRoot');
if (container) {
  const root = createRoot(container);
  root.render(React.createElement(AdminDashboard));
} else {
  const newDiv = document.createElement('div');
  newDiv.id = 'adminRoot';
  document.body.appendChild(newDiv);
  const root = createRoot(newDiv);
  root.render(React.createElement(AdminDashboard));
}
