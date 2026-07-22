"use client";

import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  BarChart2, 
  Settings as SettingsIcon,
  Search,
  Plus,
  Loader2,
  Phone,
  Moon,
  Sun,
  Scissors
} from 'lucide-react';
import { useRouter } from 'next/navigation';

import Logo from '@/components/Logo';
import Dashboard from '@/components/Dashboard';
import CustomerForm from '@/components/CustomerForm';
import CustomerDetails from '@/components/CustomerDetails';
import CustomerSummary from '@/components/CustomerSummary';
import Reports from '@/components/Reports';
import Settings from '@/components/Settings';
import Reminders from '@/components/Reminders';
import NewOrderForm from '@/components/NewOrderForm';

export default function Home() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  
  // App States
  const [stats, setStats] = useState({});
  const [todayOrders, setTodayOrders] = useState([]);
  const [overdueOrders, setOverdueOrders] = useState([]);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [customers, setCustomers] = useState([]);
  
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [businessSettings, setBusinessSettings] = useState(null);

  // Load initial data
  useEffect(() => {
    fetchBusinessSettings();
    fetchStats();
    
    // Load local storage theme
    const localTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', localTheme);
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/reports');
      if (res.ok) {
        const data = await res.json();
        setStats(data.summary || {});
        setTodayOrders(data.todayOrders || []);
        setOverdueOrders(data.overdueOrders || []);
      }
    } catch (err) {
      console.error("Error loading operational stats:", err);
    }
  };

  const fetchBusinessSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        setBusinessSettings(data);

        // First-run: redirect to setup if businessName is still the default
        if (!data || !data.businessName || data.businessName === 'Kowaguru TCMS') {
          // Only redirect if there's no real name set yet AND no isSetup flag
          // We check: if businessAddress is also empty, it's truly a first run
          if (!data.businessAddress && !data.phone) {
            router.push('/setup');
          }
        }
      }
    } catch (err) {
      console.error("Error loading settings:", err);
    }
  };

  const fetchCustomers = async (query = '') => {
    setLoading(true);
    try {
      const res = await fetch(`/api/customers?query=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        setCustomers(data);
      }
    } catch (err) {
      console.error("Error fetching customers:", err);
    } finally {
      setLoading(false);
    }
  };

  // Perform search
  useEffect(() => {
    if (activeTab === 'customers') {
      const delayDebounce = setTimeout(() => {
        fetchCustomers(searchQuery);
      }, 300);
      return () => clearTimeout(delayDebounce);
    }
  }, [searchQuery, activeTab]);

  // Navigate & Fetch Hooks
  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
    setSearchQuery('');
    
    if (tabName === 'dashboard') {
      fetchStats();
    } else if (tabName === 'customers') {
      fetchCustomers();
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      window.location.href = '/auth/login';
    } catch (err) {
      console.error(err);
    }
  };

  // Save new customer (full form)
  const handleSaveCustomer = async (payload) => {
    try {
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error('Failed to register customer profile.');
      }

      const data = await res.json();
      
      // If order was created, show summary page
      if (data.order) {
        const fullOrder = {
          ...data.order,
          customer: data.customer,
          measurements: data.measurements ? [data.measurements] : []
        };
        setSelectedOrder(fullOrder);
        setActiveTab('summary');
      } else {
        handleTabChange('customers');
      }
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  // Update existing customer (Edit Profile flow)
  const handleUpdateCustomer = async (payload) => {
    try {
      const res = await fetch(`/api/customers/${selectedCustomer.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error('Failed to update customer profile.');
      }

      await refreshSelectedCustomer(selectedCustomer.id);
      setActiveTab('customer-detail');
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  // Save new order for existing customer (re-order flow)
  const handleSaveNewOrder = async (customerId, payload) => {
    try {
      const res = await fetch(`/api/customers/${customerId}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to create new order.');
      }

      const data = await res.json();
      
      // Show the summary for the new order
      if (data.order) {
        setSelectedOrder(data.order);
        setActiveTab('summary');
      } else {
        // Refresh customer detail
        await refreshSelectedCustomer(customerId);
        handleTabChange('customer-detail');
      }
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  // Refresh a single customer's data after adding an order
  const refreshSelectedCustomer = async (customerId) => {
    try {
      const res = await fetch(`/api/customers?query=`);
      if (res.ok) {
        const allCustomers = await res.json();
        const updated = allCustomers.find(c => c.id === customerId);
        if (updated) setSelectedCustomer(updated);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveSettings = async (payload) => {
    const res = await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      const data = await res.json();
      setBusinessSettings(data);
    } else {
      throw new Error("Failed to save settings.");
    }
  };

  const handleDeleteCustomer = async (customerId) => {
    try {
      const res = await fetch(`/api/customers/${customerId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        fetchCustomers();
        setSelectedCustomer(null);
        setActiveTab('customers');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectCustomer = (customer) => {
    setSelectedCustomer(customer);
    setActiveTab('customer-detail');
  };

  const handleSelectOrder = (order) => {
    const fullOrder = {
      ...order,
      customer: order.customer || selectedCustomer,
      measurements: order.measurements || (selectedCustomer?.measurements ? [selectedCustomer.measurements[0]] : [])
    };
    setSelectedOrder(fullOrder);
    setActiveTab('summary');
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-zinc-900 transition-colors duration-200">
      
      {/* 1. TOP HEADER (no-print) */}
      <header className="nav-bar shadow-sm px-6 py-4 no-print flex justify-between items-center bg-white dark:bg-zinc-800">
        
        {/* Left Side: Logo and Business Name */}
        <div className="flex items-center gap-3">
          <Logo
            variant="icon"
            size={42}
            logoUrl={businessSettings?.businessLogo || null}
            businessName={(businessSettings?.businessName && businessSettings.businessName !== 'Kowaguru TCMS') ? businessSettings.businessName : (businessSettings?.registeredShopName || 'Kowaguru TCMS')}
          />
          <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100 hidden sm:block">
            {(businessSettings?.businessName && businessSettings.businessName !== 'Kowaguru TCMS') ? businessSettings.businessName : (businessSettings?.registeredShopName || 'Kowaguru TCMS')}
          </h1>
        </div>
        
        {/* Right Side: Log Out */}
        <div className="flex items-center">
          <button 
            onClick={handleLogout} 
            className="text-sm font-semibold text-red-600 hover:text-white hover:bg-red-600 dark:text-red-400 dark:hover:text-white dark:hover:bg-red-700 transition-colors border border-red-200 dark:border-red-900/50 px-4 py-1.5 rounded-lg"
          >
            Log out
          </button>
        </div>
      </header>

      {/* 2. MAIN LAYOUT */}
      <div className="flex-1 flex flex-col md:flex-row app-container w-full max-w-7xl px-4 py-6 gap-6">
        
        {/* SIDEBAR NAVIGATION (no-print) */}
        <aside className="w-full md:w-64 flex flex-col gap-2 no-print">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'customers', label: 'Customers Directory', icon: Users },
            { id: 'reminders', label: 'Reminders', icon: Calendar },
            { id: 'reports', label: 'Reports & Stats', icon: BarChart2 },
            { id: 'settings', label: 'Settings', icon: SettingsIcon },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id || 
              (tab.id === 'customers' && ['new-customer', 'edit-customer', 'customer-detail', 'new-order'].includes(activeTab)) ||
              (tab.id === 'reminders' && activeTab === 'summary');
            
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all text-left ${
                  isActive
                    ? 'bg-red-700 text-white shadow-md'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800 hover:text-gray-900'
                }`}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            );
          })}
        </aside>

        {/* 3. MAIN WORKSPACE CONTENT */}
        <main className="flex-1 min-w-0">
          
          {/* TAB 1: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <Dashboard 
              stats={stats} 
              onNavigate={handleTabChange}
              todayOrders={todayOrders}
              overdueOrders={overdueOrders}
            />
          )}

          {/* TAB 2: NEW/EDIT CUSTOMER & ORDER FORM */}
          {(activeTab === 'new-customer' || activeTab === 'edit-customer') && (
            <CustomerForm 
              customer={activeTab === 'edit-customer' ? selectedCustomer : null}
              onBack={() => {
                if (activeTab === 'edit-customer') setActiveTab('customer-detail');
                else handleTabChange('dashboard');
              }} 
              onSave={activeTab === 'edit-customer' ? handleUpdateCustomer : handleSaveCustomer}
            />
          )}

          {/* TAB 3: CUSTOMER DIRECTORY LIST */}
          {activeTab === 'customers' && (
            <div className="space-y-6">
              {/* Directory Filter bar */}
              <div className="premium-card flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center">
                <div className="relative flex-1">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                    <Search size={18} />
                  </span>
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="input-field"
                    style={{ paddingLeft: '2.5rem' }}
                    placeholder="Search by customer name, phone, address..."
                  />
                </div>
                <button 
                  onClick={() => handleTabChange('new-customer')}
                  className="btn-primary flex items-center justify-center gap-2"
                >
                  <Plus size={18} />
                  Add Customer
                </button>
              </div>

              {/* Customers grid list */}
              {loading ? (
                <div className="text-center py-12 text-gray-400 flex justify-center items-center gap-2">
                  <Loader2 className="animate-spin" size={18} />
                  Searching Directory...
                </div>
              ) : customers.length === 0 ? (
                <div className="premium-card text-center py-12 text-gray-400">
                  No registered customers found. Click "Add Customer" to register one.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {customers.map((cust) => (
                    <div 
                      key={cust.id}
                      onClick={() => handleSelectCustomer(cust)}
                      className="premium-card flex flex-col justify-between gap-4 cursor-pointer hover:border-red-200 transition-all"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-base font-extrabold text-gray-800 dark:text-gray-100">{cust.name}</h4>
                          <p className="text-xs text-gray-500 font-semibold flex items-center gap-1 mt-0.5">
                            <Phone size={12} />
                            {cust.phone}
                          </p>
                        </div>
                        <span className="text-[10px] bg-red-50 text-red-700 font-extrabold px-2 py-0.5 rounded uppercase">
                          {cust.orders?.length || 0} Orders
                        </span>
                      </div>
                      
                      {cust.orders && cust.orders.length > 0 && (
                        <div className="border-t pt-3 flex justify-between items-center text-xs text-gray-500" style={{ borderColor: 'var(--card-border)' }}>
                          <span>Last Order: {cust.orders[0].tailoringStyle}</span>
                          <span className="font-bold text-gray-700 dark:text-gray-300">
                            Due: {new Date(cust.orders[0].collectionDate).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: CUSTOMER PROFILE DETAILS */}
          {activeTab === 'customer-detail' && selectedCustomer && (
            <CustomerDetails 
              customer={selectedCustomer} 
              onBack={() => handleTabChange('customers')}
              onEdit={(cust) => {
                setSelectedCustomer(cust);
                setActiveTab('edit-customer');
              }}
              onAddOrder={(cust) => {
                // Re-order for existing customer: open dedicated new-order form
                setSelectedCustomer(cust);
                setActiveTab('new-order');
              }}
              onDelete={handleDeleteCustomer}
              onSelectOrder={handleSelectOrder}
            />
          )}

          {/* TAB 4b: NEW ORDER FOR EXISTING CUSTOMER (Re-order flow) */}
          {activeTab === 'new-order' && selectedCustomer && (
            <NewOrderForm
              customer={selectedCustomer}
              onBack={() => setActiveTab('customer-detail')}
              onSave={async (payload) => {
                await handleSaveNewOrder(selectedCustomer.id, payload);
              }}
            />
          )}

          {/* TAB 5: CUSTOMER SUMMARY (PRINT VIEW) */}
          {activeTab === 'summary' && selectedOrder && (
            <CustomerSummary 
              order={selectedOrder} 
              onBack={() => {
                if (selectedCustomer) {
                  setActiveTab('customer-detail');
                } else {
                  handleTabChange('dashboard');
                }
              }}
              onEditOrder={(order) => {
                // TODO: future edit order form
              }}
              businessSettings={businessSettings}
            />
          )}

          {/* TAB 6: REMINDER DASHBOARD */}
          {activeTab === 'reminders' && (
            <Reminders onSelectOrder={handleSelectOrder} />
          )}

          {/* TAB 7: REPORTS */}
          {activeTab === 'reports' && (
            <Reports stats={stats} />
          )}

          {/* TAB 8: SETTINGS */}
          {activeTab === 'settings' && (
            <Settings 
              initialSettings={businessSettings} 
              onSaveSettings={handleSaveSettings}
            />
          )}

        </main>
      </div>

      {/* 4. SOFTWARE FOOTER */}
      <footer className="w-full text-center py-4 text-xs font-semibold text-gray-400 no-print">
        Powered by Kowaguru TCMS © 2026
      </footer>
    </div>
  );
}
