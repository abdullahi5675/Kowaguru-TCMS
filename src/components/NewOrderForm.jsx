import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, Loader2, Camera, RotateCcw } from 'lucide-react';

/**
 * NewOrderForm — Used when an existing customer wants a new/repeat order.
 * Shows Order Details + optional Measurement update. No personal info (already saved).
 */
export default function NewOrderForm({ customer, onBack, onSave }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [orderInfo, setOrderInfo] = useState({
    productType: 'Atamfa',
    otherProduct: '',
    tailoringStyle: '',
    serviceFee: '',
    paymentStatus: 'Not Paid',
    amountPaid: '',
    balance: 0,
    collectionDate: '',
    orderStatus: 'New',
    productImage: '',
  });

  const [measurements, setMeasurements] = useState({
    abl: '', bp: '', ubl: '', wl: '', lwl: '', hl: '', skl: '', sl: '', gl: '',
    abc: '', bc: '', ubc: '', wc: '', lwc: '', hc: '', nn: ''
  });

  const [usePrevMeasurements, setUsePrevMeasurements] = useState(true);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Pre-fill measurements from latest saved measurements
  useEffect(() => {
    if (customer?.measurements?.length > 0) {
      const latestM = customer.measurements[0];
      const mData = {};
      Object.keys(measurements).forEach(key => {
        mData[key] = latestM[key] !== null && latestM[key] !== undefined ? latestM[key].toString() : '';
      });
      setMeasurements(mData);
    }
  }, [customer]);

  // Auto-calculate balance
  useEffect(() => {
    const fee = parseFloat(orderInfo.serviceFee) || 0;
    let paid = 0;
    if (orderInfo.paymentStatus === 'Paid') {
      paid = fee;
    } else if (orderInfo.paymentStatus === 'Advance Payment') {
      paid = parseFloat(orderInfo.amountPaid) || 0;
    }
    setOrderInfo(prev => ({
      ...prev,
      amountPaid: orderInfo.paymentStatus === 'Paid' ? fee.toString() : (orderInfo.paymentStatus === 'Not Paid' ? '0' : prev.amountPaid),
      balance: Math.max(0, fee - paid)
    }));
  }, [orderInfo.serviceFee, orderInfo.paymentStatus, orderInfo.amountPaid]);

  const handleOrderChange = (e) => {
    const { name, value } = e.target;
    setOrderInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleMeasurementChange = (e) => {
    const { name, value } = e.target;
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setMeasurements(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!orderInfo.tailoringStyle || !orderInfo.collectionDate) {
      setError('Please fill in the Tailoring Style and Collection Date.');
      setLoading(false);
      return;
    }

    try {
      let uploadedImageUrl = orderInfo.productImage;

      if (imageFile) {
        const formData = new FormData();
        formData.append('file', imageFile);
        const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData });
        if (!uploadRes.ok) throw new Error('Failed to upload fabric image.');
        const uploadData = await uploadRes.json();
        uploadedImageUrl = uploadData.url;
      }

      const payload = {
        ...orderInfo,
        productImage: uploadedImageUrl,
        measurements: usePrevMeasurements ? measurements : null,
      };

      await onSave(payload);
    } catch (err) {
      console.error(err);
      setError(err.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const measurementLabels = {
    abl: { name: 'ABL', desc: 'Across Back Length' },
    bp: { name: 'BP', desc: 'Bust Point' },
    ubl: { name: 'UBL', desc: 'Under Bust Length' },
    wl: { name: 'WL', desc: 'Waist Length' },
    lwl: { name: 'LWL', desc: 'Low Waist Length' },
    hl: { name: 'HL', desc: 'Hip Length' },
    skl: { name: 'SKL', desc: 'Skirt Length' },
    sl: { name: 'SL', desc: 'Sleeve Length' },
    gl: { name: 'GL', desc: 'Gown Length' },
    abc: { name: 'ABC', desc: 'Across Back Chest' },
    bc: { name: 'BC', desc: 'Bust Circumference' },
    ubc: { name: 'UBC', desc: 'Under Bust Circumference' },
    wc: { name: 'WC', desc: 'Waist Circumference' },
    lwc: { name: 'LWC', desc: 'Low Waist Circumference' },
    hc: { name: 'HC', desc: 'Hip Circumference' },
    nn: { name: 'N-N', desc: 'Nipple to Nipple' },
  };

  const productTypes = ['Atamfa', 'Senator', 'Jalabiya', 'Gown', 'Skirt & Blouse', 'Trouser', 'Kaftan', 'Shirt', 'Others'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 border-b pb-4" style={{ borderColor: 'var(--card-border)' }}>
        <button onClick={onBack} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-xl font-bold">New Order for {customer?.name}</h2>
          <p className="text-sm text-gray-500">{customer?.phone} — Adding a new tailoring order to this customer profile</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Order Details Section */}
        <div className="premium-card space-y-4">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider border-b pb-2" style={{ borderColor: 'var(--card-border)' }}>
            ✂️ New Order Details
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="input-label">Product Type</label>
              <select name="productType" value={orderInfo.productType} onChange={handleOrderChange} className="input-field font-semibold">
                {productTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            {orderInfo.productType === 'Others' && (
              <div>
                <label className="input-label">Specify Product</label>
                <input type="text" name="otherProduct" value={orderInfo.otherProduct} onChange={handleOrderChange} className="input-field" placeholder="Product name" />
              </div>
            )}

            <div>
              <label className="input-label">Tailoring Style *</label>
              <input type="text" name="tailoringStyle" value={orderInfo.tailoringStyle} onChange={handleOrderChange} className="input-field" placeholder="e.g. Ankara Style, English Cut..." required />
            </div>

            <div>
              <label className="input-label">Collection Date *</label>
              <input type="date" name="collectionDate" value={orderInfo.collectionDate} onChange={handleOrderChange} className="input-field" required />
            </div>

            <div>
              <label className="input-label">Order Status</label>
              <select name="orderStatus" value={orderInfo.orderStatus} onChange={handleOrderChange} className="input-field font-semibold">
                {['New', 'In Progress', 'Ready for Collection', 'Collected'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* Payment */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t pt-4" style={{ borderColor: 'var(--card-border)' }}>
            <div>
              <label className="input-label">Service Fee (₦)</label>
              <input type="number" name="serviceFee" value={orderInfo.serviceFee} onChange={handleOrderChange} className="input-field font-bold" placeholder="0" min="0" />
            </div>

            <div>
              <label className="input-label">Payment Status</label>
              <select name="paymentStatus" value={orderInfo.paymentStatus} onChange={handleOrderChange} className="input-field font-semibold">
                <option value="Not Paid">Not Paid</option>
                <option value="Advance Payment">Advance Payment</option>
                <option value="Paid">Paid (Full)</option>
              </select>
            </div>

            {orderInfo.paymentStatus === 'Advance Payment' && (
              <div>
                <label className="input-label">Amount Paid (₦)</label>
                <input type="number" name="amountPaid" value={orderInfo.amountPaid} onChange={handleOrderChange} className="input-field" placeholder="0" min="0" />
              </div>
            )}

            {orderInfo.serviceFee && (
              <div className="flex items-center gap-2 p-3 rounded-lg" style={{ background: 'var(--background)' }}>
                <div>
                  <p className="text-xs text-gray-400 font-medium">Outstanding Balance</p>
                  <p className="text-lg font-extrabold text-red-600">₦{(orderInfo.balance || 0).toLocaleString()}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Style Photo Section */}
        <div className="premium-card space-y-4">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider border-b pb-2" style={{ borderColor: 'var(--card-border)' }}>
            📸 Fabric / Style Reference Photo
          </h3>

          <div className="flex flex-col items-center gap-4">
            {imagePreview ? (
              <div className="relative">
                <img src={imagePreview} alt="Style Preview" className="w-full max-w-xs rounded-xl object-cover" style={{ maxHeight: '200px' }} />
                <button type="button" onClick={() => { setImageFile(null); setImagePreview(null); }} className="absolute top-2 right-2 bg-red-600 text-white rounded-full w-7 h-7 flex items-center justify-center text-xs font-bold">✕</button>
              </div>
            ) : (
              <div className="w-full max-w-xs h-36 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 text-gray-300" style={{ borderColor: 'var(--card-border)' }}>
                <Camera size={32} />
                <p className="text-xs">No photo selected</p>
              </div>
            )}

            <label className="btn-secondary flex items-center gap-2 cursor-pointer">
              <Camera size={16} />
              {imagePreview ? 'Change Photo' : 'Upload Style Photo'}
              <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            </label>
          </div>
        </div>

        {/* Measurements Section */}
        <div className="premium-card space-y-4">
          <div className="flex items-center justify-between border-b pb-2" style={{ borderColor: 'var(--card-border)' }}>
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">
              📏 Measurements
            </h3>
            <button
              type="button"
              onClick={() => setUsePrevMeasurements(!usePrevMeasurements)}
              className="btn-secondary flex items-center gap-2 text-xs py-1.5 px-3"
            >
              <RotateCcw size={13} />
              {usePrevMeasurements ? 'Editing Measurements' : 'Use Previous Only'}
            </button>
          </div>

          {customer?.measurements?.length > 0 && usePrevMeasurements && (
            <p className="text-xs text-blue-600 font-semibold bg-blue-50 rounded-lg px-3 py-2">
              ℹ️ Pre-filled with this customer's latest measurements. Edit any fields that changed.
            </p>
          )}

          {!usePrevMeasurements && (
            <p className="text-xs text-gray-400">Measurements will not be recorded for this order — previous measurements will be kept.</p>
          )}

          {usePrevMeasurements && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Vertical */}
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase mb-3">Vertical</h4>
                <div className="grid grid-cols-2 gap-3">
                  {Object.keys(measurementLabels).slice(0, 9).map(key => (
                    <div key={key}>
                      <label className="input-label text-[10px]">{measurementLabels[key].name} <span className="font-normal text-gray-400">({measurementLabels[key].desc})</span></label>
                      <input type="text" name={key} value={measurements[key]} onChange={handleMeasurementChange} className="input-field text-center font-bold text-sm" placeholder="—" />
                    </div>
                  ))}
                </div>
              </div>
              {/* Horizontal */}
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase mb-3">Horizontal</h4>
                <div className="grid grid-cols-2 gap-3">
                  {Object.keys(measurementLabels).slice(9).map(key => (
                    <div key={key}>
                      <label className="input-label text-[10px]">{measurementLabels[key].name} <span className="font-normal text-gray-400">({measurementLabels[key].desc})</span></label>
                      <input type="text" name={key} value={measurements[key]} onChange={handleMeasurementChange} className="input-field text-center font-bold text-sm" placeholder="—" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Error message */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-semibold">
            ⚠️ {error}
          </div>
        )}

        {/* Submit */}
        <div className="flex gap-4">
          <button type="button" onClick={onBack} className="btn-secondary flex items-center gap-2 px-6">
            <ArrowLeft size={16} /> Cancel
          </button>
          <button type="submit" disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2">
            {loading ? <><Loader2 className="animate-spin" size={16} /> Saving Order...</> : <><Save size={16} /> Save New Order</>}
          </button>
        </div>
      </form>
    </div>
  );
}
