import React, { useState, useEffect, useRef } from 'react';
import { Settings as SettingsIcon, Save, Moon, Sun, Download, Upload, Loader2, CheckCircle2, Image as ImageIcon, X } from 'lucide-react';

export default function Settings({ initialSettings = null, onSaveSettings }) {
  const [loading, setLoading] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [theme, setTheme] = useState('light');
  const logoInputRef = useRef(null);

  const [settings, setSettings] = useState({
    businessName: "Kowaguru TCMS",
    businessLogo: null,
    businessAddress: "",
    phone: "",
    receiptFooter: "Thank you for your patronage!",
    measurementUnit: "inches"
  });

  useEffect(() => {
    if (initialSettings) {
      setSettings(prev => ({ ...prev, ...initialSettings }));
    }
  }, [initialSettings]);

  useEffect(() => {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    setTheme(currentTheme);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  // Upload logo image
  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLogoUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      setSettings(prev => ({ ...prev, businessLogo: data.url }));
    } catch (err) {
      alert('Failed to upload logo: ' + err.message);
    } finally {
      setLogoUploading(false);
    }
  };

  const handleRemoveLogo = () => {
    setSettings(prev => ({ ...prev, businessLogo: null }));
    if (logoInputRef.current) logoInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    try {
      await onSaveSettings(settings);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      alert("Failed to save settings.");
    } finally {
      setLoading(false);
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const handleBackupExport = async () => {
    try {
      const res = await fetch('/api/customers');
      if (!res.ok) throw new Error("Failed to fetch customer data.");
      const data = await res.json();
      const fileData = JSON.stringify(data, null, 2);
      const blob = new Blob([fileData], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.download = `kowaguru-tcms-backup-${new Date().toISOString().split('T')[0]}.json`;
      link.href = url;
      link.click();
    } catch (err) {
      console.error(err);
      alert("Failed to export database backup.");
    }
  };

  const handleBackupImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!window.confirm("WARNING: Importing backup will append records. Ensure you aren't importing duplicate databases. Proceed?")) {
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = JSON.parse(event.target.result);
        if (!Array.isArray(data)) {
          throw new Error("Invalid backup format. Expected an array of customer records.");
        }

        setLoading(true);
        let importedCount = 0;

        for (const customer of data) {
          const res = await fetch('/api/customers', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: customer.name,
              phone: customer.phone,
              alternatePhone: customer.alternatePhone,
              address: customer.address,
              notes: customer.notes,
              measurements: customer.measurements?.length > 0 ? customer.measurements[0] : null,
              order: customer.orders?.length > 0 ? customer.orders[0] : null
            })
          });
          if (res.ok) importedCount++;
        }

        alert(`Successfully imported ${importedCount} customer profiles!`);
        window.location.reload();
      } catch (err) {
        console.error(err);
        alert(`Failed to import backup: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b pb-4" style={{ borderColor: 'var(--card-border)' }}>
        <h2 className="text-xl font-bold flex items-center gap-2">
          <SettingsIcon size={22} className="text-gray-500" />
          Application Settings
        </h2>
        <p className="text-sm text-gray-500">Configure business identity, print templates, and database utilities.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Settings Form */}
        <div className="premium-card lg:col-span-2 space-y-4">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">
            Business Identity
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Logo Upload Section */}
            <div>
              <label className="input-label">Business Logo</label>
              <div className="flex items-center gap-4 mt-1">
                {/* Logo Preview */}
                <div className="w-20 h-20 rounded-lg border-2 border-dashed flex items-center justify-center overflow-hidden bg-gray-50 dark:bg-zinc-800" style={{ borderColor: 'var(--card-border)' }}>
                  {settings.businessLogo ? (
                    <img src={settings.businessLogo} alt="Business Logo" className="w-full h-full object-contain" />
                  ) : (
                    <ImageIcon size={28} className="text-gray-300" />
                  )}
                </div>

                {/* Upload controls */}
                <div className="flex flex-col gap-2">
                  <label className="btn-secondary flex items-center gap-2 cursor-pointer text-xs py-2 px-3">
                    {logoUploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                    {logoUploading ? 'Uploading...' : 'Upload Logo'}
                    <input
                      ref={logoInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                      disabled={logoUploading}
                    />
                  </label>
                  {settings.businessLogo && (
                    <button
                      type="button"
                      onClick={handleRemoveLogo}
                      className="btn-secondary flex items-center gap-2 text-xs py-2 px-3 text-red-600 border-red-200 hover:bg-red-50"
                    >
                      <X size={14} />
                      Remove Logo
                    </button>
                  )}
                  <p className="text-[10px] text-gray-400">PNG, JPG recommended. Logo appears in the app header and invoices.</p>
                </div>
              </div>
            </div>

            <div>
              <label className="input-label" htmlFor="businessName">Business / Shop Name</label>
              <input
                id="businessName"
                type="text"
                name="businessName"
                value={settings.businessName}
                onChange={handleInputChange}
                className="input-field font-bold"
                placeholder="Enter your shop or business name"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="input-label" htmlFor="phone">Contact Phone Number</label>
                <input
                  id="phone"
                  type="text"
                  name="phone"
                  value={settings.phone || ''}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="Business contact number"
                />
              </div>

              <div>
                <label className="input-label">Measurement Unit</label>
                <select
                  name="measurementUnit"
                  value={settings.measurementUnit}
                  onChange={handleInputChange}
                  className="input-field font-semibold"
                >
                  <option value="inches">Inches (″)</option>
                  <option value="cm">Centimeters (cm)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="input-label" htmlFor="businessAddress">Business Address</label>
              <input
                id="businessAddress"
                type="text"
                name="businessAddress"
                value={settings.businessAddress || ''}
                onChange={handleInputChange}
                className="input-field"
                placeholder="Physical workshop/shop address"
              />
            </div>

            <div>
              <label className="input-label" htmlFor="receiptFooter">Receipt Footer Text</label>
              <textarea
                id="receiptFooter"
                name="receiptFooter"
                value={settings.receiptFooter || ''}
                onChange={handleInputChange}
                className="input-field h-20 resize-none"
                placeholder="Footer message on invoice summary sheet"
              />
            </div>

            <div className="flex items-center gap-4 border-t pt-4" style={{ borderColor: 'var(--card-border)' }}>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary flex items-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                Save Settings
              </button>

              {success && (
                <span className="text-xs text-green-600 font-bold flex items-center gap-1">
                  <CheckCircle2 size={14} />
                  Settings saved successfully!
                </span>
              )}
            </div>
          </form>
        </div>

        {/* Display & Utilities */}
        <div className="space-y-6">

          {/* Display mode */}
          <div className="premium-card space-y-4">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">
              Visual Preferences
            </h3>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-300 font-semibold">
                {theme === 'dark' ? 'Dark Mode Active' : 'Light Mode Active'}
              </span>
              <button
                onClick={toggleTheme}
                className="p-2 rounded-xl border hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
                style={{ borderColor: 'var(--card-border)' }}
                aria-label="Toggle dark mode theme"
              >
                {theme === 'dark' ? <Sun size={20} className="text-yellow-500" /> : <Moon size={20} className="text-gray-500" />}
              </button>
            </div>
          </div>

          {/* Database Backup/Restore */}
          <div className="premium-card space-y-4">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">
              Database Utilities
            </h3>

            <div className="space-y-3">
              <button
                onClick={handleBackupExport}
                className="btn-secondary w-full flex items-center justify-center gap-2 py-2.5"
              >
                <Download size={16} />
                Backup Database (Export JSON)
              </button>

              <div className="relative">
                <label className="btn-secondary w-full flex items-center justify-center gap-2 py-2.5 cursor-pointer">
                  <Upload size={16} />
                  Restore Database (Import JSON)
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleBackupImport}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <p className="text-[10px] text-gray-400 leading-normal">
              Database backups store customer measurement metrics and historical orders. Store exported files in a safe location.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
