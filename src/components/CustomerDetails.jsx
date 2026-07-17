import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Scissors, 
  FileText, 
  History, 
  Plus, 
  Trash2, 
  Edit3, 
  CheckCircle,
  Calendar,
  AlertTriangle,
  DollarSign
} from 'lucide-react';

export default function CustomerDetails({ customer, onBack, onEdit, onAddOrder, onDelete, onSelectOrder }) {
  const [activeSubTab, setActiveSubTab] = useState('orders');

  const measurementLabels = {
    // Vertical
    abl: 'ABL', bp: 'BP', ubl: 'UBL', wl: 'WL', lwl: 'LWL', hl: 'HL', skl: 'SKL', sl: 'SL', gl: 'GL',
    // Horizontal
    abc: 'ABC', bc: 'BC', ubc: 'UBC', wc: 'WC', lwc: 'LWC', hc: 'HC', nn: 'N-N'
  };

  const getLatestMeasurements = () => {
    if (!customer.measurements || customer.measurements.length === 0) return null;
    return customer.measurements[0];
  };

  const latestM = getLatestMeasurements();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b pb-4 gap-4" style={{ borderColor: 'var(--card-border)' }}>
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors shrink-0"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-xl font-bold">{customer.name}</h2>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => onEdit(customer)}
            className="btn-secondary flex items-center gap-1.5 py-1.5 px-3 text-xs"
          >
            <Edit3 size={14} />
            Edit Profile
          </button>
          
          <button 
            onClick={() => onAddOrder(customer)}
            className="btn-primary flex items-center gap-1.5 py-1.5 px-3 text-xs"
          >
            <Plus size={14} />
            New Order
          </button>

          <button 
            onClick={() => {
              if (window.confirm("Are you sure you want to delete this customer record? All orders and measurements will be permanently removed.")) {
                onDelete(customer.id);
              }
            }}
            className="btn-secondary border-red-200 text-red-600 hover:bg-red-50 flex items-center gap-1.5 py-1.5 px-3 text-xs"
          >
            <Trash2 size={14} />
            Delete
          </button>
        </div>
      </div>

      {/* Customer Info Card */}
      <div className="premium-card grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <span className="input-label">Customer Name</span>
          <p className="text-base font-bold text-gray-800 dark:text-gray-200">{customer.name}</p>
        </div>
        <div>
          <span className="input-label">Phone Numbers</span>
          <p className="text-sm font-semibold">{customer.phone}</p>
          {customer.alternatePhone && (
            <p className="text-xs text-gray-500 mt-0.5">Alt: {customer.alternatePhone}</p>
          )}
        </div>
        <div>
          <span className="input-label">Address</span>
          <p className="text-sm text-gray-600 dark:text-gray-400">{customer.address || 'No address provided'}</p>
        </div>
        {customer.notes && (
          <div className="md:col-span-3 border-t pt-4" style={{ borderColor: 'var(--card-border)' }}>
            <span className="input-label">Remarks/Notes</span>
            <p className="text-sm text-gray-600 dark:text-gray-400 italic">"{customer.notes}"</p>
          </div>
        )}
      </div>

      {/* Sub Tabs */}
      <div className="flex border-b" style={{ borderColor: 'var(--card-border)' }}>
        <button 
          onClick={() => setActiveSubTab('orders')}
          className={`py-2.5 px-5 font-semibold text-sm border-b-2 transition-all ${
            activeSubTab === 'orders' 
              ? 'border-red-700 text-red-700' 
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          Orders History ({customer.orders?.length || 0})
        </button>
        <button 
          onClick={() => setActiveSubTab('measurements')}
          className={`py-2.5 px-5 font-semibold text-sm border-b-2 transition-all ${
            activeSubTab === 'measurements' 
              ? 'border-red-700 text-red-700' 
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          Measurements History ({customer.measurements?.length || 0})
        </button>
      </div>

      {/* SUBTAB 1: Orders History */}
      {activeSubTab === 'orders' && (
        <div className="space-y-4">
          {!customer.orders || customer.orders.length === 0 ? (
            <div className="premium-card text-center py-8 text-gray-400">
              No orders found for this customer. Click "New Order" to record one!
            </div>
          ) : (
            customer.orders.map((order) => {
              const fee = parseFloat(order.serviceFee) || 0;
              const balance = parseFloat(order.balance) || 0;
              return (
                <div 
                  key={order.id} 
                  onClick={() => onSelectOrder(order)}
                  className="premium-card flex flex-col md:flex-row justify-between items-start md:items-center gap-4 cursor-pointer hover:border-red-200 transition-all"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold text-gray-400 uppercase">Order #{order.id}</span>
                      <span className="text-gray-300">|</span>
                      <span className="text-sm font-bold text-gray-800 dark:text-gray-200">
                        {order.tailoringStyle} ({order.productType})
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                      <span>Submitted: {new Date(order.submissionDate).toLocaleDateString()}</span>
                      <span>Expected Due: {new Date(order.collectionDate).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4">
                    {/* Status Badge */}
                    <span 
                      className={`text-xs px-2.5 py-1 rounded font-bold ${
                        order.orderStatus === 'Collected' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-950/20 dark:text-green-400' 
                          : order.orderStatus === 'Ready for Collection'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/20 dark:text-blue-400'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950/20 dark:text-yellow-400'
                      }`}
                    >
                      {order.orderStatus}
                    </span>

                    {/* Payment Badge */}
                    <div className="text-right">
                      <span 
                        className={`text-xs px-2.5 py-1 rounded font-bold block mb-1 ${
                          order.paymentStatus === 'Paid' 
                            ? 'bg-green-100 text-green-800' 
                            : order.paymentStatus === 'Advance Payment'
                            ? 'bg-orange-100 text-orange-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {order.paymentStatus}
                      </span>
                      <p className="text-xs font-extrabold">
                        {balance > 0 ? `Bal: ₦${balance.toLocaleString()}` : `Paid: ₦${fee.toLocaleString()}`}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* SUBTAB 2: Measurements History */}
      {activeSubTab === 'measurements' && (
        <div className="space-y-6">
          {!latestM ? (
            <div className="premium-card text-center py-8 text-gray-400">
              No measurements history found. Update this customer's profile to add measurements!
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Latest measurements view */}
              <div className="premium-card lg:col-span-2 space-y-4">
                <div className="flex justify-between items-center border-b pb-2" style={{ borderColor: 'var(--card-border)' }}>
                  <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Latest Measurements
                  </h3>
                  <span className="text-xs text-gray-400">Recorded: {new Date(latestM.createdAt).toLocaleDateString()}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Vertical */}
                  <div>
                    <h4 className="text-xs font-bold text-gray-400 border-b pb-1 mb-2">Vertical Measurements</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {Object.keys(measurementLabels).slice(0, 9).map((key) => (
                        <div key={key} className="flex justify-between border-b py-1" style={{ borderColor: 'var(--card-border)' }}>
                          <span className="text-gray-500 font-medium">{measurementLabels[key]}:</span>
                          <span className="font-bold">{latestM[key] ? `${latestM[key]}″` : '--'}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Horizontal */}
                  <div>
                    <h4 className="text-xs font-bold text-gray-400 border-b pb-1 mb-2">Horizontal Measurements</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {Object.keys(measurementLabels).slice(9).map((key) => (
                        <div key={key} className="flex justify-between border-b py-1" style={{ borderColor: 'var(--card-border)' }}>
                          <span className="text-gray-500 font-medium">{measurementLabels[key]}:</span>
                          <span className="font-bold">{latestM[key] ? `${latestM[key]}″` : '--'}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar logs */}
              <div className="premium-card space-y-4">
                <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider border-b pb-2" style={{ borderColor: 'var(--card-border)' }}>
                  Measurements Log
                </h3>
                <div className="space-y-3">
                  {customer.measurements.map((m, idx) => (
                    <div key={m.id} className="p-3 border rounded-lg bg-gray-50 dark:bg-zinc-800 text-xs" style={{ borderColor: 'var(--card-border)' }}>
                      <p className="font-bold mb-1">Log #{customer.measurements.length - idx}</p>
                      <p className="text-gray-500 mb-2">Saved: {new Date(m.createdAt).toLocaleString()}</p>
                      <div className="grid grid-cols-4 gap-1 text-center">
                        <div>
                          <p className="text-[10px] text-gray-400">GL</p>
                          <p className="font-bold">{m.gl || '--'}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-400">BC</p>
                          <p className="font-bold">{m.bc || '--'}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-400">WC</p>
                          <p className="font-bold">{m.wc || '--'}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-400">HC</p>
                          <p className="font-bold">{m.hc || '--'}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}
        </div>
      )}
    </div>
  );
}
