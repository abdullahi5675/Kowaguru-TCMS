import React, { useEffect, useState } from 'react';
import { Printer, Share2, Edit3, ArrowLeft, CheckCircle2, DollarSign } from 'lucide-react';
import Logo from './Logo';

export default function CustomerSummary({ order, onBack, onEditOrder, businessSettings = null }) {
  const [settings, setSettings] = useState({
    businessName: "Kowaguru TCMS",
    businessAddress: "Your Workshop Address",
    phone: "",
    receiptFooter: "Thank you for your patronage! We offer the best tailoring styles & training programs.",
    measurementUnit: "inches"
  });

  useEffect(() => {
    if (businessSettings) {
      setSettings(businessSettings);
    }
  }, [businessSettings]);

  if (!order) return null;

  const { customer, measurements = [] } = order;
  const latestM = measurements.length > 0 ? measurements[0] : null;

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    // Generate public receipt URL based on the current origin
    const origin = window.location.origin;
    const receiptUrl = `${origin}/receipt/${order.id}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Order Summary #${order.id} - ${customer.name}`,
          text: `Tailoring Invoice details for ${customer.name}. Product Type: ${order.productType}, Style: ${order.tailoringStyle}. Outstanding Balance: ₦${(parseFloat(order.balance) || 0).toLocaleString()}`,
          url: receiptUrl
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      // Fallback
      alert("Sharing via this button is only supported on mobile devices or when the site is securely hosted (https://). Since you are accessing via a local IP address, your browser blocks sharing. Please use the Print/Save as PDF button instead.");
    }
  };

  const measurementLabels = {
    // Vertical
    abl: 'ABL (Across Back Length)',
    bp: 'BP (Bust Point)',
    ubl: 'UBL (Under Bust Length)',
    wl: 'WL (Waist Length)',
    lwl: 'LWL (Low Waist Length)',
    hl: 'HL (Hip Length)',
    skl: 'SKL (Skirt Length)',
    sl: 'SL (Sleeve Length)',
    gl: 'GL (Gown Length)',
    // Horizontal
    abc: 'ABC (Across Back Chest)',
    bc: 'BC (Bust Circumference)',
    ubc: 'UBC (Under Bust Circumference)',
    wc: 'WC (Waist Circumference)',
    lwc: 'LWC (Low Waist Circumference)',
    hc: 'HC (Hip Circumference)',
    nn: 'N-N (Nipple to Nipple)'
  };

  return (
    <div className="space-y-6">
      {/* Action panel (no-print) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 no-print border-b pb-4" style={{ borderColor: 'var(--card-border)' }}>
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-xl font-bold">Order Invoice / Summary</h2>
            <p className="text-sm text-gray-500">Order #{order.id} for {customer?.name}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <button onClick={handlePrint} className="btn-primary flex items-center gap-2">
            <Printer size={16} />
            Print Invoice
          </button>
          
          <button onClick={handleShare} className="btn-secondary flex items-center gap-2">
            <Share2 size={16} />
            Share Receipt
          </button>

          <button onClick={() => onEditOrder(order)} className="btn-secondary flex items-center gap-2">
            <Edit3 size={16} />
            Edit Order
          </button>
        </div>
      </div>

      {/* A4 Invoice Sheet Container */}
      <div 
        className="mx-auto bg-white text-black p-8 border shadow-md font-sans print-page" 
        style={{ 
          maxWidth: '800px', 
          borderColor: '#e5e7eb',
          minHeight: '297mm',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}
      >
        <div>
          {/* HEADER */}
          <div className="flex justify-between items-start border-b pb-6 mb-6" style={{ borderColor: '#e5e7eb' }}>
            <div>
              <Logo 
                variant="horizontal" 
                size={60} 
                logoUrl={settings.businessLogo} 
                businessName={settings.businessName} 
              />
              <p className="text-xs text-gray-500 mt-2 font-medium" style={{ maxWidth: '300px' }}>
                {settings.businessAddress}
              </p>
              <p className="text-xs text-gray-600 font-bold mt-1">Phone: {settings.phone}</p>
            </div>
            
            <div className="text-right">
              <h1 className="text-xl font-extrabold text-red-700 tracking-wider">INVOICE / RECEIPT</h1>
              <p className="text-xs text-gray-500 font-bold mt-1">ORDER ID: #{order.id}</p>
              <p className="text-xs text-gray-500">Date: {new Date(order.submissionDate).toLocaleDateString()}</p>
              <p className="text-xs text-gray-500">Due Date: <span className="font-bold text-red-600">{new Date(order.collectionDate).toLocaleDateString()}</span></p>
            </div>
          </div>

          {/* CUSTOMER INFO */}
          <div className="grid grid-cols-2 gap-6 mb-6 p-4 bg-gray-50 rounded-lg" style={{ border: '1px solid #f3f4f6' }}>
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Customer Info:</h3>
              <p className="text-base font-extrabold text-gray-800">{customer?.name}</p>
              <p className="text-sm font-semibold text-gray-600">{customer?.phone}</p>
              {customer?.alternatePhone && (
                <p className="text-xs text-gray-500">Alt: {customer.alternatePhone}</p>
              )}
              {customer?.address && (
                <p className="text-xs text-gray-500 mt-1">{customer.address}</p>
              )}
            </div>
            
            <div className="text-right">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Style Selection:</h3>
              <p className="text-base font-extrabold text-gray-800">{order.tailoringStyle}</p>
              <p className="text-sm font-semibold text-red-700">Type: {order.productType === 'Others' ? order.otherProduct : order.productType}</p>
              <p className="text-xs font-bold text-blue-600 mt-1">Status: {order.orderStatus}</p>
            </div>
          </div>

          {/* MEASUREMENTS TABLE */}
          {latestM && (
            <div className="mb-6">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 border-b pb-1">Measurements Sheet ({settings.measurementUnit})</h3>
              <div className="grid grid-cols-2 gap-4">
                {/* Vertical */}
                <div>
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="bg-gray-100"><th className="p-1 font-bold">Vertical Field</th><th className="p-1 font-bold text-right">Value</th></tr>
                    </thead>
                    <tbody>
                      {Object.keys(measurementLabels).slice(0, 9).map((key) => (
                        <tr key={key} className="border-b" style={{ borderColor: '#f3f4f6' }}>
                          <td className="p-1.5 text-gray-600">{measurementLabels[key]}</td>
                          <td className="p-1.5 text-right font-bold">{latestM[key] ? `${latestM[key]}″` : '--'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {/* Horizontal */}
                <div>
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="bg-gray-100"><th className="p-1 font-bold">Horizontal Field</th><th className="p-1 font-bold text-right">Value</th></tr>
                    </thead>
                    <tbody>
                      {Object.keys(measurementLabels).slice(9).map((key) => (
                        <tr key={key} className="border-b" style={{ borderColor: '#f3f4f6' }}>
                          <td className="p-1.5 text-gray-600">{measurementLabels[key]}</td>
                          <td className="p-1.5 text-right font-bold">{latestM[key] ? `${latestM[key]}″` : '--'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* FINANCIAL SUMMARY & PRODUCT IMAGE */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Payment Details */}
            <div className="p-4 bg-gray-50 rounded-lg flex flex-col justify-between" style={{ border: '1px solid #f3f4f6' }}>
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Payment Details</h3>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Service Fee:</span>
                    <span className="font-bold">₦{(parseFloat(order.serviceFee) || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Amount Paid:</span>
                    <span className="font-bold text-green-700">₦{(parseFloat(order.amountPaid) || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between border-t pt-1.5 font-bold" style={{ borderColor: '#e5e7eb' }}>
                    <span className="text-gray-800">Remaining Balance:</span>
                    <span className="text-red-600">₦{(parseFloat(order.balance) || 0).toLocaleString()}</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-2 border-t flex items-center justify-between" style={{ borderColor: '#e5e7eb' }}>
                <span className="text-xs text-gray-500">Payment Status:</span>
                <span 
                  className={`text-xs px-2.5 py-0.5 rounded font-extrabold ${
                    order.paymentStatus === 'Paid' 
                      ? 'bg-green-100 text-green-800' 
                      : order.paymentStatus === 'Advance Payment'
                      ? 'bg-orange-100 text-orange-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {order.paymentStatus}
                </span>
              </div>
            </div>

            {/* Fabric Image Preview */}
            <div className="border rounded-lg overflow-hidden flex flex-col items-center justify-center p-2 bg-gray-50" style={{ borderColor: '#e5e7eb' }}>
              {order.productImage ? (
                <div className="w-full h-40 flex items-center justify-center overflow-hidden rounded">
                  <img 
                    src={order.productImage} 
                    alt="Customer Fabric/Style" 
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              ) : (
                <div className="text-center p-6 text-gray-400 text-xs">
                  No fabric photo captured for this order.
                </div>
              )}
              <span className="text-[10px] text-gray-400 mt-2 font-bold uppercase tracking-wider">Fabric Reference Photo</span>
            </div>
          </div>
        </div>

        {/* SIGNATURES & FOOTER */}
        <div className="mt-8">
          <div className="grid grid-cols-2 gap-12 mb-8 text-center text-xs">
            <div className="border-t pt-2" style={{ borderColor: '#d1d5db' }}>
              <p className="font-bold text-gray-600">Tailor Signature</p>
              <p className="text-[10px] text-gray-400 mt-4">Authorized Signature & Seal</p>
            </div>
            <div className="border-t pt-2" style={{ borderColor: '#d1d5db' }}>
              <p className="font-bold text-gray-600">Customer Signature</p>
              <p className="text-[10px] text-gray-400 mt-4">Acknowledge measurements & terms</p>
            </div>
          </div>

          <div className="border-t pt-4 text-center text-[10px] text-gray-400" style={{ borderColor: '#e5e7eb' }}>
            <p className="font-semibold italic">"{settings.receiptFooter}"</p>
            <p className="mt-1 font-bold">Kowaguru TCMS &copy; 2026</p>
          </div>
        </div>
      </div>
    </div>
  );
}
