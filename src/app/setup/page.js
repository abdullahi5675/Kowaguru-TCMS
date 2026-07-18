"use client";

import React, { useState } from 'react';
import { Scissors, Upload, Loader2, CheckCircle2, ArrowRight, Image as ImageIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SetupPage() {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1 = brand, 2 = details
  const [loading, setLoading] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);

  const [form, setForm] = useState({
    businessName: '',
    businessLogo: null,
    businessAddress: '',
    phone: '',
    receiptFooter: 'Thank you for your patronage!',
    measurementUnit: 'inches',
  });

  React.useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data && data.registeredShopName && !form.businessName) {
          setForm(prev => ({ ...prev, businessName: data.registeredShopName }));
        }
      })
      .catch(console.error);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

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
      setForm(prev => ({ ...prev, businessLogo: data.url }));
    } catch (err) {
      alert('Logo upload failed: ' + err.message);
    } finally {
      setLogoUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.businessName.trim()) {
      alert('Please enter your business/shop name.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, isSetup: true }),
      });

      if (!res.ok) throw new Error('Failed to save settings.');
      router.push('/');
    } catch (err) {
      alert('Setup failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'linear-gradient(135deg, #1a0005 0%, #3d0010 50%, #1a0005 100%)' }}
    >
      <div style={{ width: '100%', maxWidth: '520px' }}>

        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-700 mb-4">
            <Scissors size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Kowaguru <span style={{ color: '#ff6b6b' }}>TCMS</span>
          </h1>
          <p className="text-red-200 text-sm mt-2 font-medium">
            Tailoring Customer Management System
          </p>
        </div>

        {/* Setup Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">

          {/* Progress Header */}
          <div className="bg-red-700 px-6 py-4">
            <p className="text-red-200 text-xs font-bold uppercase tracking-wider mb-1">
              First-Time Setup — Step {step} of 2
            </p>
            <h2 className="text-white text-lg font-bold">
              {step === 1 ? '🏪 Set Up Your Shop Brand' : '📋 Business Details'}
            </h2>
            {/* Progress bar */}
            <div className="mt-3 h-1.5 bg-red-900 rounded-full">
              <div
                className="h-full bg-white rounded-full transition-all duration-500"
                style={{ width: step === 1 ? '50%' : '100%' }}
              />
            </div>
          </div>

          <form onSubmit={step === 1 ? (e) => { e.preventDefault(); setStep(2); } : handleSubmit} className="p-6 space-y-5">

            {step === 1 && (
              <>
                {/* Logo Upload */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    Shop Logo (Optional)
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center bg-gray-50 overflow-hidden flex-shrink-0">
                      {form.businessLogo ? (
                        <img src={form.businessLogo} alt="Logo" className="w-full h-full object-contain" />
                      ) : (
                        <ImageIcon size={28} className="text-gray-300" />
                      )}
                    </div>
                    <div className="flex-1">
                      <label className="block w-full text-center py-2.5 px-4 rounded-lg border-2 border-dashed border-gray-300 cursor-pointer hover:border-red-400 hover:bg-red-50 transition-colors text-sm font-semibold text-gray-600">
                        {logoUploading ? (
                          <span className="flex items-center justify-center gap-2">
                            <Loader2 size={16} className="animate-spin" /> Uploading...
                          </span>
                        ) : (
                          <span className="flex items-center justify-center gap-2">
                            <Upload size={16} /> Click to Upload Logo
                          </span>
                        )}
                        <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" disabled={logoUploading} />
                      </label>
                      <p className="text-xs text-gray-400 mt-1.5 text-center">PNG or JPG, appears in header and invoices</p>
                    </div>
                  </div>
                </div>

                {/* Business Name */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2" htmlFor="setup-name">
                    Shop / Business Name *
                  </label>
                  <input
                    id="setup-name"
                    type="text"
                    name="businessName"
                    value={form.businessName}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-800 font-semibold focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                    placeholder="e.g. MJ Tailoring & Training Center"
                  />
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2" htmlFor="setup-phone">
                    Contact Phone Number
                  </label>
                  <input
                    id="setup-phone"
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                    placeholder="+234 803 123 4567"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2" htmlFor="setup-address">
                    Business Address
                  </label>
                  <input
                    id="setup-address"
                    type="text"
                    name="businessAddress"
                    value={form.businessAddress}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                    placeholder="Shop address or location"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    Measurement Unit
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {['inches', 'cm'].map(unit => (
                      <button
                        key={unit}
                        type="button"
                        onClick={() => setForm(prev => ({ ...prev, measurementUnit: unit }))}
                        className={`py-3 rounded-xl border-2 font-bold text-sm transition-all ${
                          form.measurementUnit === unit
                            ? 'border-red-600 bg-red-50 text-red-700'
                            : 'border-gray-200 text-gray-500 hover:border-gray-300'
                        }`}
                      >
                        {unit === 'inches' ? '″ Inches' : 'cm Centimeters'}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2" htmlFor="setup-footer">
                    Invoice Footer Message
                  </label>
                  <textarea
                    id="setup-footer"
                    name="receiptFooter"
                    value={form.receiptFooter}
                    onChange={handleChange}
                    rows={2}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm resize-none"
                    placeholder="Thank you for your patronage!"
                  />
                </div>
              </>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-3 pt-2">
              {step === 2 && (
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-5 py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50 transition-colors"
                >
                  ← Back
                </button>
              )}
              <button
                type="submit"
                disabled={loading || logoUploading}
                className="flex-1 py-3 rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 text-white transition-all"
                style={{ background: loading ? '#9ca3af' : '#B91C1C' }}
              >
                {loading ? (
                  <><Loader2 size={16} className="animate-spin" /> Setting up...</>
                ) : step === 1 ? (
                  <>Next Step <ArrowRight size={16} /></>
                ) : (
                  <><CheckCircle2 size={16} /> Complete Setup & Open App</>
                )}
              </button>
            </div>
          </form>
        </div>

        <p className="text-center text-red-300 text-xs mt-6 opacity-60">
          Kowaguru TCMS © 2026 — You can always change these settings later in the app.
        </p>
      </div>
    </div>
  );
}
