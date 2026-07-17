import React, { useState } from 'react';
import { Printer, TrendingUp, DollarSign, Users, Scissors, CheckCircle, BarChart2 } from 'lucide-react';

export default function Reports({ stats = {} }) {
  const [reportPeriod, setReportPeriod] = useState('monthly');

  const handlePrintReport = () => {
    window.print();
  };

  const revenueMetrics = [
    {
      label: "Collected Revenue",
      value: `₦${(stats.collectedRevenue || 0).toLocaleString()}`,
      icon: TrendingUp,
      color: "text-green-600",
      bg: "bg-green-50"
    },
    {
      label: "Outstanding Payments",
      value: `₦${(stats.outstandingPayments || 0).toLocaleString()}`,
      icon: DollarSign,
      color: "text-red-600",
      bg: "bg-red-50"
    },
    {
      label: "Estimated Worth",
      value: `₦${((stats.collectedRevenue || 0) + (stats.outstandingPayments || 0)).toLocaleString()}`,
      icon: BarChart2,
      color: "text-blue-600",
      bg: "bg-blue-50"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="flex justify-between items-center no-print border-b pb-4" style={{ borderColor: 'var(--card-border)' }}>
        <div>
          <h2 className="text-xl font-bold">Business Reports & Analytics</h2>
          <p className="text-sm text-gray-500">Track orders, collected revenue, and outstanding client balances.</p>
        </div>
        <button onClick={handlePrintReport} className="btn-primary flex items-center gap-2">
          <Printer size={16} />
          Print PDF Report
        </button>
      </div>

      {/* Report Header for Print Mode */}
      <div className="hidden print-only text-center border-b pb-4 mb-6">
        <h1 className="text-2xl font-bold">MJ Tailoring & Training Center</h1>
        <h2 className="text-lg font-semibold text-gray-600">Tailoring Operations Report</h2>
        <p className="text-xs text-gray-400">Date Generated: {new Date().toLocaleDateString()}</p>
      </div>

      {/* Revenue Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {revenueMetrics.map((metric, idx) => {
          const Icon = metric.icon;
          return (
            <div key={idx} className="premium-card flex items-center gap-4">
              <div className={`p-3 rounded-xl ${metric.bg} ${metric.color}`}>
                <Icon size={24} />
              </div>
              <div>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
                  {metric.label}
                </span>
                <span className="text-2xl font-extrabold text-gray-800 dark:text-gray-100 block mt-1">
                  {metric.value}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Operational Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="premium-card">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 border-b pb-2" style={{ borderColor: 'var(--card-border)' }}>
            Order Volume Details
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500 font-semibold flex items-center gap-2">
                <Users size={16} className="text-gray-400" />
                Total Registered Customers
              </span>
              <span className="font-bold text-lg">{stats.totalCustomers || 0}</span>
            </div>
            
            <div className="flex justify-between items-center text-sm border-t pt-3" style={{ borderColor: 'var(--card-border)' }}>
              <span className="text-gray-500 font-semibold flex items-center gap-2">
                <Scissors size={16} className="text-yellow-500" />
                New/Pending Orders
              </span>
              <span className="font-bold text-lg">{(stats.ordersNew || 0) + (stats.ordersInProgress || 0)}</span>
            </div>

            <div className="flex justify-between items-center text-sm border-t pt-3" style={{ borderColor: 'var(--card-border)' }}>
              <span className="text-gray-500 font-semibold flex items-center gap-2">
                <CheckCircle size={16} className="text-blue-500" />
                Orders Ready for Collection
              </span>
              <span className="font-bold text-lg">{stats.ordersReady || 0}</span>
            </div>

            <div className="flex justify-between items-center text-sm border-t pt-3" style={{ borderColor: 'var(--card-border)' }}>
              <span className="text-gray-500 font-semibold flex items-center gap-2">
                <CheckCircle size={16} className="text-green-500" />
                Orders Completed & Collected
              </span>
              <span className="font-bold text-lg">{stats.ordersCollected || 0}</span>
            </div>
          </div>
        </div>

        {/* Collection & Warnings card */}
        <div className="premium-card">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 border-b pb-2" style={{ borderColor: 'var(--card-border)' }}>
            Collections Health
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500 font-semibold">Today's Expected Collections</span>
              <span className="font-bold text-lg text-blue-600">{stats.todayCollections || 0}</span>
            </div>

            <div className="flex justify-between items-center text-sm border-t pt-3" style={{ borderColor: 'var(--card-border)' }}>
              <span className="text-gray-500 font-semibold">Overdue Uncollected Orders</span>
              <span className="font-bold text-lg text-red-600">{stats.overdueCollections || 0}</span>
            </div>

            <div className="p-3 bg-yellow-50 dark:bg-yellow-950/20 text-yellow-800 dark:text-yellow-400 rounded-lg text-xs font-medium border border-yellow-100 dark:border-yellow-900/30">
              Tip: Reach out to customers with ready orders and outstanding balances to improve your monthly revenue flow.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
