import React from 'react';
import { 
  Users, 
  Scissors, 
  CheckCircle, 
  AlertTriangle, 
  DollarSign, 
  TrendingUp, 
  Plus, 
  Search, 
  Calendar, 
  BarChart2, 
  Settings as SettingsIcon 
} from 'lucide-react';

export default function Dashboard({ stats, onNavigate, todayOrders = [], overdueOrders = [] }) {
  const cards = [
    {
      title: "Total Customers",
      value: stats.totalCustomers || 0,
      icon: Users,
      color: "var(--primary)",
      bg: "rgba(168, 0, 18, 0.08)"
    },
    {
      title: "Orders In Progress",
      value: stats.ordersInProgress || 0,
      icon: Scissors,
      color: "var(--accent-warning)",
      bg: "rgba(217, 119, 6, 0.08)"
    },
    {
      title: "Ready for Collection",
      value: stats.ordersReady || 0,
      icon: CheckCircle,
      color: "var(--accent-success)",
      bg: "rgba(5, 150, 105, 0.08)"
    },
    {
      title: "Today's Due",
      value: stats.todayCollections || 0,
      icon: Calendar,
      color: "#3b82f6",
      bg: "rgba(59, 130, 246, 0.08)"
    },
    {
      title: "Outstanding Payments",
      value: `₦${(stats.outstandingPayments || 0).toLocaleString()}`,
      icon: DollarSign,
      color: "var(--accent-danger)",
      bg: "rgba(220, 38, 38, 0.08)"
    },
    {
      title: "Collected Revenue",
      value: `₦${(stats.collectedRevenue || 0).toLocaleString()}`,
      icon: TrendingUp,
      color: "var(--accent-success)",
      bg: "rgba(5, 150, 105, 0.08)"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {cards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} className="premium-card flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {card.title}
                </span>
                <div 
                  className="p-2 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: card.bg, color: card.color }}
                >
                  <Icon size={18} />
                </div>
              </div>
              <span 
                className="text-2xl font-bold tracking-tight"
                style={{ color: 'var(--text-primary)' }}
              >
                {card.value}
              </span>
            </div>
          );
        })}
      </div>

      {/* Quick Action Dashboard */}
      <div className="premium-card">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button 
            onClick={() => onNavigate('new-customer')}
            className="btn-primary flex items-center justify-center gap-2 h-12"
          >
            <Plus size={16} />
            New Customer
          </button>
          
          <button 
            onClick={() => onNavigate('customers')}
            className="btn-secondary flex items-center justify-center gap-2 h-12"
          >
            <Search size={16} />
            Search Customer
          </button>

          <button 
            onClick={() => onNavigate('reminders')}
            className="btn-secondary flex items-center justify-center gap-2 h-12"
            style={{ borderColor: 'rgba(59, 130, 246, 0.4)' }}
          >
            <Calendar size={16} className="text-blue-500" />
            Reminders
          </button>

          <button 
            onClick={() => onNavigate('reports')}
            className="btn-secondary flex items-center justify-center gap-2 h-12"
          >
            <BarChart2 size={16} />
            Reports
          </button>
        </div>
      </div>

      {/* Critical Reminders / Warnings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Today's Collections Alert */}
        <div className="premium-card">
          <div className="flex items-center justify-between border-b pb-3 mb-4" style={{ borderColor: 'var(--card-border)' }}>
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
              <Calendar className="text-blue-500" size={18} />
              Today's Collections ({todayOrders.length})
            </h3>
            <button 
              onClick={() => onNavigate('reminders')}
              className="text-xs font-semibold text-red-700 hover:underline"
            >
              View All
            </button>
          </div>
          
          {todayOrders.length === 0 ? (
            <p className="text-sm text-gray-400 py-4 text-center">No orders scheduled for collection today.</p>
          ) : (
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {todayOrders.map((order) => (
                <div 
                  key={order.id} 
                  className="p-3 rounded-lg border flex justify-between items-center bg-gray-50 dark:bg-zinc-800" 
                  style={{ borderColor: 'var(--card-border)' }}
                >
                  <div>
                    <h4 className="text-sm font-bold text-gray-800 dark:text-gray-100">{order.customer?.name}</h4>
                    <p className="text-xs text-gray-500">{order.tailoringStyle} - {order.productType}</p>
                  </div>
                  <div className="text-right">
                    <span 
                      className={`text-xs px-2 py-0.5 rounded font-semibold inline-block mb-1 ${
                        order.paymentStatus === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {order.paymentStatus}
                    </span>
                    <p className="text-xs text-gray-500 font-bold">₦{(parseFloat(order.serviceFee) || 0).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Overdue Orders Alert */}
        <div className="premium-card" style={{ borderColor: overdueOrders.length > 0 ? 'rgba(239, 68, 68, 0.4)' : 'var(--card-border)' }}>
          <div className="flex items-center justify-between border-b pb-3 mb-4" style={{ borderColor: 'var(--card-border)' }}>
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
              <AlertTriangle className="text-red-500" size={18} />
              Overdue Collections ({overdueOrders.length})
            </h3>
            <button 
              onClick={() => onNavigate('reminders')}
              className="text-xs font-semibold text-red-700 hover:underline"
            >
              Manage
            </button>
          </div>
          
          {overdueOrders.length === 0 ? (
            <p className="text-sm text-gray-400 py-4 text-center">Excellent! No overdue collections.</p>
          ) : (
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {overdueOrders.map((order) => (
                <div 
                  key={order.id} 
                  className="p-3 rounded-lg border border-red-100 bg-red-50/50 dark:bg-red-950/20 dark:border-red-900/30 flex justify-between items-center" 
                >
                  <div>
                    <h4 className="text-sm font-bold text-red-950 dark:text-red-200">{order.customer?.name}</h4>
                    <p className="text-xs text-gray-500">
                      Due: {new Date(order.collectionDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 px-2 py-0.5 rounded font-semibold inline-block mb-1">
                      {order.orderStatus}
                    </span>
                    <p className="text-xs text-gray-500 font-bold">Bal: ₦{(parseFloat(order.balance) || 0).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
