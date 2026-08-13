'use client';

import React, { useState, useMemo } from 'react';
import { supabase } from '../../lib/supabase';

/**
 * Sample fallback orders if Supabase is offline or in local demo mode
 */
const SAMPLE_ORDERS = [
  {
    id: 'ord_1001',
    order_id: 'PV-89412',
    customer_name: 'Ash Ketchum',
    customer_email: 'ash@pallettown.jp',
    shipping_address: '123 Pallet Town Way, Kanto Region, 90210',
    total_amount: 145.00,
    subtotal: 135.01,
    discount_amount: 0.00,
    insurance_cost: 9.99,
    status: 'Unfulfilled',
    payment_method: 'PayPal',
    payment_status: 'COMPLETED',
    tracking_number: null,
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    items: [
      { card_name: 'Gengar Heavyweight Hoodie', selectedSize: 'XL', quantity: 1, unit_price: 65.00 },
      { card_name: 'Gengar Tactical Sling Bag', selectedSize: null, quantity: 1, unit_price: 35.00 },
      { card_name: '1st Edition Shadowless Charizard Holo', selectedSize: null, quantity: 1, unit_price: 45.00 }
    ]
  },
  {
    id: 'ord_1002',
    order_id: 'PV-89413',
    customer_name: 'Misty Waterflower',
    customer_email: 'misty@ceruleangym.io',
    shipping_address: '456 Gym Leader Lane, Cerulean City, 10001',
    total_amount: 89.99,
    subtotal: 80.00,
    discount_amount: 0.00,
    insurance_cost: 9.99,
    status: 'Processing',
    payment_method: 'PayPal',
    payment_status: 'COMPLETED',
    tracking_number: null,
    created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
    items: [
      { card_name: 'Pikachu Cyberpunk Neon Sign', selectedSize: null, quantity: 1, unit_price: 80.00 }
    ]
  },
  {
    id: 'ord_1003',
    order_id: 'PV-89414',
    customer_name: 'Brock Slate',
    customer_email: 'brock@pewtergym.org',
    shipping_address: '789 Rock Gym Blvd, Pewter City, 94102',
    total_amount: 210.00,
    subtotal: 200.01,
    discount_amount: 0.00,
    insurance_cost: 9.99,
    status: 'Shipped',
    payment_method: 'PayPal',
    payment_status: 'COMPLETED',
    tracking_number: '1Z9999999999999999',
    created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
    items: [
      { card_name: 'Umbreon VMAX Special Art Holo', selectedSize: null, quantity: 1, unit_price: 200.00 }
    ]
  }
];

/**
 * OrderManager Component (Module 2)
 * 
 * Order fulfillment pipeline with status filtering, shipping tracking input,
 * and refund processing actions.
 */
export default function OrderManager({ initialOrders = [], onRefresh }) {
  const [orders, setOrders] = useState(initialOrders.length > 0 ? initialOrders : SAMPLE_ORDERS);
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [carrier, setCarrier] = useState('USPS');
  const [trackingInput, setTrackingInput] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const filteredOrders = useMemo(() => {
    if (statusFilter === 'All') return orders;
    return orders.filter(o => (o.status || 'Unfulfilled').toLowerCase() === statusFilter.toLowerCase());
  }, [orders, statusFilter]);

  // Mark order as Shipped in Supabase or Local state
  const handleMarkAsShipped = async (orderId) => {
    if (!trackingInput.trim()) {
      alert('Please enter a valid tracking number.');
      return;
    }

    setIsUpdating(true);
    const trackingString = `${carrier}: ${trackingInput.trim()}`;

    if (supabase) {
      try {
        const { error } = await supabase
          .from('orders')
          .update({
            status: 'Shipped',
            tracking_number: trackingString
          })
          .eq('order_id', orderId);

        if (error) console.warn('Supabase update error:', error);
      } catch (err) {
        console.warn('Supabase update exception:', err);
      }
    }

    // Update local state
    setOrders(prev => prev.map(o => {
      if (o.order_id === orderId || o.id === orderId) {
        return { ...o, status: 'Shipped', tracking_number: trackingString };
      }
      return o;
    }));

    setIsUpdating(false);
    setSelectedOrder(null);
    setTrackingInput('');
    if (onRefresh) onRefresh();
  };

  // Issue Refund Action
  const handleIssueRefund = async (orderId) => {
    if (!confirm(`Are you sure you want to issue a full refund for Order #${orderId}? This action will update order status to Refunded.`)) {
      return;
    }

    setIsUpdating(true);

    if (supabase) {
      try {
        await supabase
          .from('orders')
          .update({ status: 'Refunded' })
          .eq('order_id', orderId);
      } catch (err) {
        console.warn('Supabase refund exception:', err);
      }
    }

    setOrders(prev => prev.map(o => {
      if (o.order_id === orderId || o.id === orderId) {
        return { ...o, status: 'Refunded' };
      }
      return o;
    }));

    setIsUpdating(false);
    setSelectedOrder(null);
    if (onRefresh) onRefresh();
  };

  const getStatusBadge = (status) => {
    const s = (status || 'Unfulfilled').toLowerCase();
    if (s === 'shipped') return <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold uppercase px-2 py-0.5 rounded">SHIPPED</span>;
    if (s === 'processing') return <span className="bg-blue-500/20 text-blue-400 border border-blue-500/30 text-[10px] font-bold uppercase px-2 py-0.5 rounded">PROCESSING</span>;
    if (s === 'refunded') return <span className="bg-red-500/20 text-red-400 border border-red-500/30 text-[10px] font-bold uppercase px-2 py-0.5 rounded">REFUNDED</span>;
    return <span className="bg-amber-400/20 text-amber-400 border border-amber-400/30 text-[10px] font-bold uppercase px-2 py-0.5 rounded">UNFULFILLED</span>;
  };

  return (
    <div className="space-y-6">
      {/* HEADER & PIPELINE FILTERS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <h2 className="text-2xl font-black uppercase text-white tracking-wide">
            📦 Order Fulfillment Pipeline
          </h2>
          <p className="text-zinc-400 text-xs mt-1">
            Manage customer orders, issue tracking numbers, and process PayPal refunds.
          </p>
        </div>

        {/* PIPELINE FILTER BUTTONS */}
        <div className="flex flex-wrap items-center gap-1.5 bg-zinc-900 border border-zinc-800 p-1 rounded-lg">
          {['All', 'Unfulfilled', 'Processing', 'Shipped', 'Refunded'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                statusFilter === st
                  ? 'bg-amber-400 text-black shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* ORDERS TABLE */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-zinc-950 text-zinc-400 uppercase font-mono border-b border-zinc-800">
              <tr>
                <th className="p-4">Order ID</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Total Paid</th>
                <th className="p-4">Status</th>
                <th className="p-4">Tracking</th>
                <th className="p-4">Date</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/80">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-zinc-500 font-mono">
                    No orders match the selected status filter.
                  </td>
                </tr>
              ) : (
                filteredOrders.map(order => (
                  <tr key={order.id || order.order_id} className="hover:bg-zinc-800/40 transition-colors">
                    <td className="p-4 font-mono font-bold text-amber-400">
                      #{order.order_id}
                    </td>
                    <td className="p-4">
                      <p className="font-bold text-white">{order.customer_name}</p>
                      <p className="text-zinc-500 text-[11px] font-mono">{order.customer_email}</p>
                    </td>
                    <td className="p-4 font-mono font-bold text-white">
                      ${parseFloat(order.total_amount || 0).toFixed(2)}
                    </td>
                    <td className="p-4">
                      {getStatusBadge(order.status)}
                    </td>
                    <td className="p-4 font-mono text-[11px] text-zinc-400">
                      {order.tracking_number || '—'}
                    </td>
                    <td className="p-4 text-zinc-500 text-[11px] font-mono">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="bg-zinc-800 hover:bg-zinc-700 text-white font-bold px-3 py-1.5 rounded text-xs transition-colors border border-zinc-700"
                      >
                        Inspect &amp; Fulfill →
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ORDER DETAILS & FULFILLMENT MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border-2 border-zinc-800 rounded-xl max-w-2xl w-full p-6 space-y-6 shadow-2xl text-white">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
              <div>
                <span className="text-xs font-mono text-amber-400 font-bold">ORDER FULFILLMENT MODAL</span>
                <h3 className="text-xl font-black uppercase text-white">Order #{selectedOrder.order_id}</h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-zinc-500 hover:text-white font-black text-lg p-1"
              >
                ✕
              </button>
            </div>

            {/* CUSTOMER & SHIPPING INFO */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-zinc-950 p-4 rounded-lg border border-zinc-800">
              <div>
                <p className="text-[10px] uppercase font-bold text-zinc-500">Customer Details</p>
                <p className="font-bold text-sm text-white mt-0.5">{selectedOrder.customer_name}</p>
                <p className="text-xs text-zinc-400 font-mono">{selectedOrder.customer_email}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-zinc-500">Shipping Address (PayPal)</p>
                <p className="text-xs text-zinc-300 font-mono mt-0.5">{selectedOrder.shipping_address}</p>
              </div>
            </div>

            {/* FULFILLMENT ACTION SECTION */}
            {selectedOrder.status !== 'Shipped' && selectedOrder.status !== 'Refunded' && (
              <div className="bg-zinc-950/80 p-4 rounded-lg border border-amber-400/30 space-y-3">
                <p className="text-xs font-extrabold uppercase text-amber-400">⚡ Mark Order as Shipped</p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <select
                    value={carrier}
                    onChange={(e) => setCarrier(e.target.value)}
                    className="bg-zinc-900 border border-zinc-700 text-xs font-bold text-white px-3 py-2 rounded focus:outline-none focus:border-amber-400"
                  >
                    <option value="USPS">USPS Priority</option>
                    <option value="FedEx">FedEx Express</option>
                    <option value="UPS">UPS Ground</option>
                    <option value="DHL">DHL Express</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Enter Tracking Number..."
                    value={trackingInput}
                    onChange={(e) => setTrackingInput(e.target.value)}
                    className="flex-1 bg-zinc-900 border border-zinc-700 text-xs font-mono text-white px-3 py-2 rounded focus:outline-none focus:border-amber-400"
                  />
                  <button
                    onClick={() => handleMarkAsShipped(selectedOrder.order_id)}
                    disabled={isUpdating}
                    className="bg-amber-400 hover:bg-amber-300 text-black font-black text-xs uppercase px-4 py-2 rounded transition-colors"
                  >
                    {isUpdating ? 'Updating...' : 'Mark as Shipped'}
                  </button>
                </div>
              </div>
            )}

            {/* REFUND BUTTON */}
            <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
              <button
                onClick={() => handleIssueRefund(selectedOrder.order_id)}
                disabled={selectedOrder.status === 'Refunded'}
                className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-bold px-4 py-2 rounded transition-colors"
              >
                {selectedOrder.status === 'Refunded' ? 'Already Refunded' : '💸 Issue Full Refund'}
              </button>

              <button
                onClick={() => setSelectedOrder(null)}
                className="bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold px-5 py-2 rounded transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
