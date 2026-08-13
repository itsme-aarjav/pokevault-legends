'use client';

import React from 'react';

const SAMPLE_RISK_ORDERS = [
  {
    id: 'ord_901',
    customer: 'Brock Slate',
    email: 'brock@tempmail-generator.org',
    amount: 4850.00,
    riskScore: 88,
    riskLevel: 'High Risk',
    flags: ['High order magnitude ($4,850)', 'Disposable email domain', 'Shipping / Billing Mismatch']
  },
  {
    id: 'ord_902',
    customer: 'Ash Ketchum',
    email: 'ash@pallettown.jp',
    amount: 145.00,
    riskScore: 12,
    riskLevel: 'Low Risk',
    flags: ['Verified PayPal buyer', 'Matching IP & Shipping region']
  },
  {
    id: 'ord_903',
    customer: 'James Rocket',
    email: 'james@teamrocket-corp.com',
    amount: 1450.00,
    riskScore: 62,
    riskLevel: 'Medium Risk',
    flags: ['First time buyer', 'High ticket item (Holy Grail Slab)']
  }
];

export default function FraudRiskAnalyzer() {
  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🛡️</span>
            <h2 className="text-2xl font-black uppercase text-white tracking-wide">
              PokeVault Native Fraud & Risk Shield
            </h2>
          </div>
          <p className="text-zinc-400 text-xs mt-1">
            Automated order risk scoring (Low / Medium / High) based on email domain reputation, address verification, and order magnitude.
          </p>
        </div>

        <span className="text-xs font-mono bg-zinc-900 border border-zinc-800 text-emerald-400 font-bold px-3 py-1.5 rounded-lg">
          Active Shield: 0 Chargebacks
        </span>
      </div>

      {/* RISK TABLE */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-zinc-950 text-zinc-400 uppercase font-mono border-b border-zinc-800">
              <tr>
                <th className="p-4">Order ID &amp; Customer</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Risk Score</th>
                <th className="p-4">Risk Flags Detected</th>
                <th className="p-4 text-right">Shield Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/80">
              {SAMPLE_RISK_ORDERS.map(item => (
                <tr key={item.id} className="hover:bg-zinc-800/40 transition-colors">
                  <td className="p-4">
                    <p className="font-bold text-white text-sm">{item.customer}</p>
                    <p className="text-zinc-400 font-mono text-[11px]">{item.email}</p>
                  </td>

                  <td className="p-4 font-mono font-bold text-amber-400">
                    ${item.amount.toFixed(2)}
                  </td>

                  <td className="p-4 font-mono font-black">
                    <span className={`px-2.5 py-1 rounded text-xs border ${
                      item.riskScore > 70 ? 'bg-red-500/20 text-red-400 border-red-500/40' :
                      item.riskScore > 40 ? 'bg-amber-400/20 text-amber-400 border-amber-400/40' :
                      'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                    }`}>
                      {item.riskScore} / 100 ({item.riskLevel})
                    </span>
                  </td>

                  <td className="p-4">
                    <div className="flex flex-wrap gap-1">
                      {item.flags.map((flag, idx) => (
                        <span key={idx} className="bg-zinc-950 text-zinc-300 font-mono text-[10px] px-2 py-0.5 rounded border border-zinc-800">
                          • {flag}
                        </span>
                      ))}
                    </div>
                  </td>

                  <td className="p-4 text-right">
                    {item.riskScore > 70 ? (
                      <button className="bg-red-500 hover:bg-red-600 text-white font-black text-xs px-3 py-1.5 rounded shadow">
                        Hold &amp; Request ID
                      </button>
                    ) : (
                      <button className="bg-zinc-800 text-zinc-300 font-bold text-xs px-3 py-1.5 rounded border border-zinc-700">
                        Approve Order
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
