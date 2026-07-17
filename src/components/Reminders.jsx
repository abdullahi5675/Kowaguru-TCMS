import React, { useState, useEffect } from 'react';
import { Calendar, Phone, AlertTriangle, CheckCircle, MessageSquare, ExternalLink } from 'lucide-react';

export default function Reminders({ onSelectOrder }) {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('today'); // today, tomorrow, overdue, future

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/orders?limit=100');
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderStatus: newStatus })
      });
      if (res.ok) {
        // Refresh orders list
        fetchOrders();
      }
    } catch (err) {
      console.error(err);
      alert("Failed to update status.");
    }
  };

  // Helper date metrics
  const todayStart = new Date();
  todayStart.setHours(0,0,0,0);
  const todayEnd = new Date();
  todayEnd.setHours(23,59,59,999);
  
  const tomorrowStart = new Date(todayStart);
  tomorrowStart.setDate(tomorrowStart.getDate() + 1);
  const tomorrowEnd = new Date(todayEnd);
  tomorrowEnd.setDate(tomorrowEnd.getDate() + 1);

  // Categorize orders
  const categorized = {
    today: [],
    tomorrow: [],
    overdue: [],
    future: []
  };

  orders.forEach(order => {
    const collDate = new Date(order.collectionDate);
    const isCollected = ['Collected', 'Cancelled'].includes(order.orderStatus);

    if (collDate >= todayStart && collDate <= todayEnd) {
      categorized.today.push(order);
    } else if (collDate >= tomorrowStart && collDate <= tomorrowEnd) {
      categorized.tomorrow.push(order);
    } else if (collDate < todayStart && !isCollected) {
      categorized.overdue.push(order);
    } else if (collDate > tomorrowEnd) {
      categorized.future.push(order);
    }
  });

  const getFilteredList = () => {
    switch (filter) {
      case 'today': return categorized.today;
      case 'tomorrow': return categorized.tomorrow;
      case 'overdue': return categorized.overdue;
      case 'future': return categorized.future;
      default: return [];
    }
  };

  const activeList = getFilteredList();

  const handleWhatsAppAlert = (order) => {
    const phone = order.customer.phone.replace(/[^0-9]/g, '');
    // Standardize to international code (assuming +234 for Nigeria if no code)
    const formattedPhone = phone.startsWith('0') ? '234' + phone.substring(1) : phone;
    
    const message = encodeURIComponent(
      `Hello ${order.customer.name},\nThis is MJ Tailoring & Training Center. We are writing to remind you that your order for the ${order.tailoringStyle} (${order.productType}) is scheduled for collection on ${new Date(order.collectionDate).toLocaleDateString()}.\n\nTotal Service Fee: ₦${parseFloat(order.serviceFee).toLocaleString()}\nOutstanding Balance: ₦${parseFloat(order.balance).toLocaleString()}\n\nThank you for choosing MJ Tailoring!`
    );
    window.open(`https://wa.me/${formattedPhone}?text=${message}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b pb-4" style={{ borderColor: 'var(--card-border)' }}>
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Calendar size={22} className="text-blue-500" />
          Collection Reminder System
        </h2>
        <p className="text-sm text-gray-500">Monitor upcoming collection deadlines and notify customers instantly.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-gray-100 dark:bg-zinc-800 rounded-xl max-w-xl">
        {[
          { key: 'today', label: `Today (${categorized.today.length})` },
          { key: 'tomorrow', label: `Tomorrow (${categorized.tomorrow.length})` },
          { key: 'overdue', label: `Overdue (${categorized.overdue.length})`, warn: categorized.overdue.length > 0 },
          { key: 'future', label: `Future (${categorized.future.length})` }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              filter === tab.key
                ? 'bg-white dark:bg-zinc-700 text-gray-800 dark:text-gray-100 shadow-sm'
                : tab.warn
                ? 'text-red-600 hover:bg-red-50'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading collection board...</div>
      ) : activeList.length === 0 ? (
        <div className="premium-card text-center py-12 text-gray-400">
          No matching collection orders found in this category.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activeList.map((order) => (
            <div 
              key={order.id} 
              className="premium-card flex flex-col justify-between gap-4 border"
              style={{ borderColor: filter === 'overdue' ? 'rgba(239, 68, 68, 0.3)' : 'var(--card-border)' }}
            >
              {/* Order Meta */}
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-extrabold text-gray-400 uppercase">Order #{order.id}</span>
                  <h4 
                    onClick={() => onSelectOrder(order)}
                    className="text-base font-extrabold hover:underline cursor-pointer text-gray-800 dark:text-gray-100"
                  >
                    {order.customer.name}
                  </h4>
                  <p className="text-xs text-gray-500 font-semibold">{order.customer.phone}</p>
                </div>
                
                <span 
                  className={`text-[10px] px-2 py-0.5 rounded font-extrabold ${
                    order.orderStatus === 'Collected' 
                      ? 'bg-green-100 text-green-800' 
                      : order.orderStatus === 'Ready for Collection'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {order.orderStatus}
                </span>
              </div>

              {/* Order Style Info */}
              <div className="p-3 bg-gray-50 dark:bg-zinc-800/50 rounded-lg text-xs space-y-1">
                <p><span className="text-gray-400 font-medium">Style:</span> <span className="font-bold">{order.tailoringStyle}</span></p>
                <p><span className="text-gray-400 font-medium">Product:</span> <span className="font-semibold text-red-700">{order.productType}</span></p>
                <p><span className="text-gray-400 font-medium">Collection:</span> <span className="font-bold text-gray-700 dark:text-gray-300">{new Date(order.collectionDate).toLocaleDateString()}</span></p>
                <p className="border-t pt-1 mt-1 flex justify-between font-bold text-[11px]">
                  <span>Outstanding Bal:</span> 
                  <span className={parseFloat(order.balance) > 0 ? "text-red-600" : "text-green-600"}>
                    ₦{parseFloat(order.balance).toLocaleString()}
                  </span>
                </p>
              </div>

              {/* Bottom action panel */}
              <div className="flex items-center gap-2 border-t pt-3" style={{ borderColor: 'var(--card-border)' }}>
                {order.orderStatus !== 'Ready for Collection' && order.orderStatus !== 'Collected' && (
                  <button
                    onClick={() => updateOrderStatus(order.id, 'Ready for Collection')}
                    className="btn-primary py-1.5 px-3 text-[10px] flex-1"
                  >
                    Mark Ready
                  </button>
                )}

                {order.orderStatus === 'Ready for Collection' && (
                  <button
                    onClick={() => updateOrderStatus(order.id, 'Collected')}
                    className="btn-primary bg-green-700 hover:bg-green-800 py-1.5 px-3 text-[10px] flex-1"
                  >
                    Mark Collected
                  </button>
                )}

                <button
                  onClick={() => handleWhatsAppAlert(order)}
                  className="btn-secondary flex items-center justify-center gap-1 py-1.5 px-3 text-[10px] flex-1 text-green-600 border-green-200 hover:bg-green-50"
                >
                  <MessageSquare size={12} />
                  WhatsApp Alert
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
