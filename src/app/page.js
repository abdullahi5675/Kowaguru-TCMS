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
  Scissors,
  Menu,
  X
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // App States
  const [stats, setStats] = useState({});
  const [todayOrders, setTodayOrders] = useState([]);
  const [overdueOrders, setOverdueOrders] = useState([]);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [customers, setCustomers] = useState([]);
  
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [businessSettings, setBusinessSettings] = useState(null);
  const [isFirstRun, setIsFirstRun] = useState(false);

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

        // Check if it's the first login (empty business address or phone)
        if (!data.businessAddress || !data.phone) {
          setIsFirstRun(true);
          setActiveTab('settings');
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
    if (isFirstRun && tabName !== 'settings') {
      // Prevent navigating away from settings during first-time setup
      return;
    }
    
    setActiveTab(tabName);
    setSearchQuery('');
    setIsMobileMenuOpen(false); // Close mobile menu when navigating
    
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

  const navTabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'customers', label: 'Customers Directory', icon: Users },
    { id: 'reminders', label: 'Reminders', icon: Calendar },
    { id: 'reports', label: 'Reports & Stats', icon: BarChart2 },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-zinc-900 transition-colors duration-200">
      
      {/* 1. TOP HEADER (no-print) */}
      <header className="nav-bar shadow-sm px-4 md:px-6 py-4 no-print flex justify-between items-center bg-white dark:bg-zinc-800">
        
        {/* Left Side: Logo and Business Name */}
        <div className="flex items-center gap-3 overflow-hidden">
          <Logo
            variant="icon"
            size={42}
            logoUrl={businessSettings?.businessLogo || null}
            businessName={(businessSettings?.businessName && businessSettings.businessName !== 'Kowaguru TCMS') ? businessSettings.businessName : (businessSettings?.registeredShopName || 'Kowaguru TCMS')}
          />
          <h1 className="text-lg md:text-xl font-bold text-gray-800 dark:text-gray-100 truncate">
            {(businessSettings?.businessName && businessSettings.businessName !== 'Kowaguru TCMS') ? businessSettings.businessName : (businessSettings?.registeredShopName || 'Kowaguru TCMS')}
          </h1>
        </div>
        
        {/* Right Side: Log Out & Hamburger */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button 
            onClick={handleLogout} 
            className="hidden md:block text-sm font-semibold text-red-600 hover:text-white hover:bg-red-600 dark:text-red-400 dark:hover:text-white dark:hover:bg-red-700 transition-colors border border-red-200 dark:border-red-900/50 px-4 py-1.5 rounded-lg"
          >
            Log out
          </button>
          
          <button 
            className="md:hidden p-2 text-gray-600 dark:text-gray-300 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-zinc-700 dark:hover:bg-zinc-600 transition-colors"
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={24} />
          </button>
        </div>
      </header>

      {/* MOBILE SLIDE-OVER MENU */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[100] flex md:hidden no-print">
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-black/60 transition-opacity" 
            onClick={() => setIsMobileMenuOpen(false)}
          />
          
          {/* Slide panel */}
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white dark:bg-zinc-800 h-full shadow-2xl animate-in slide-in-from-left duration-200">
            <div className="p-4 border-b dark:border-zinc-700 flex justify-between items-center">
              <span className="font-bold text-gray-800 dark:text-gray-100 text-lg">Menu</span>
              <button 
                onClick={() => setIsMobileMenuOpen(false)} 
                className="p-2 text-gray-500 rounded-lg bg-gray-100 dark:bg-zinc-700 hover:bg-gray-200 dark:hover:bg-zinc-600"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-4 flex-1 overflow-y-auto flex flex-col gap-2">
              {navTabs.map((tab) => {
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
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-700 hover:text-gray-900'
                    }`}
                  >
                    <Icon size={18} />
                    {tab.label}
                  </button>
                );
              })}
            </div>
            
            <div className="p-4 border-t dark:border-zinc-700">
              <button 
                onClick={handleLogout} 
                className="w-full flex items-center justify-center gap-2 text-center text-sm font-bold text-red-600 hover:text-white hover:bg-red-600 border-2 border-red-200 hover:border-red-600 px-4 py-3 rounded-xl transition-colors"
              >
                Log out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. MAIN LAYOUT */}
      <div className="flex-1 flex flex-col md:flex-row app-container w-full max-w-7xl px-4 py-6 gap-6">
        
        {/* DESKTOP SIDEBAR NAVIGATION (no-print) */}
        <aside className="hidden md:flex w-64 flex-col gap-2 no-print">
          {navTabs.map((tab) => {
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
              isFirstRun={isFirstRun}
              onCompleteSetup={() => setIsFirstRun(false)}
            />
          )}

        </main>
      </div>

      {/* 4. SOFTWARE FOOTER */}
      <footer className="w-full text-center py-4 text-xs font-semibold text-gray-400 no-print">
        Powered by Kowaguru TCMS © 2026
      </footer>

      {/* Floating WhatsApp Support Button */}
      <a 
        href="https://wa.me/2348023603283" 
        target="_blank" 
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 bg-green-500 hover:bg-green-600 text-white p-3 rounded-full shadow-lg z-50 flex items-center justify-center transition-transform hover:scale-110 no-print"
        aria-label="Contact Support on WhatsApp"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
        </svg>
      </a>
    </div>
  );
}
