import React, { useState, useEffect } from 'react';
import { Camera, Save, ArrowLeft, Loader2 } from 'lucide-react';

export default function CustomerForm({ customer = null, onBack, onSave }) {
  const isEdit = !!customer;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 1. Customer Personal Information State
  const [personalInfo, setPersonalInfo] = useState({
    name: '',
    phone: '',
    alternatePhone: '',
    address: '',
    notes: '',
  });

  // 2. Order Information State
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

  // 3. Measurements State
  const [measurements, setMeasurements] = useState({
    // Vertical
    abl: '', bp: '', ubl: '', wl: '', lwl: '', hl: '', skl: '', sl: '', gl: '',
    // Horizontal
    abc: '', bc: '', ubc: '', wc: '', lwc: '', hc: '', nn: ''
  });

  // Photo state
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Pre-fill form if editing
  useEffect(() => {
    if (customer) {
      setPersonalInfo({
        name: customer.name || '',
        phone: customer.phone || '',
        alternatePhone: customer.alternatePhone || '',
        address: customer.address || '',
        notes: customer.notes || '',
      });

      // Get latest measurements if available
      if (customer.measurements && customer.measurements.length > 0) {
        const latestM = customer.measurements[0];
        const mData = {};
        Object.keys(measurements).forEach(key => {
          mData[key] = latestM[key] !== null && latestM[key] !== undefined ? latestM[key].toString() : '';
        });
        setMeasurements(mData);
      }
    }
  }, [customer]);

  // Handle balance auto-calculation
  useEffect(() => {
    const fee = parseFloat(orderInfo.serviceFee) || 0;
    let paid = 0;
    
    if (orderInfo.paymentStatus === 'Paid') {
      paid = fee;
    } else if (orderInfo.paymentStatus === 'Advance Payment') {
      paid = parseFloat(orderInfo.amountPaid) || 0;
    } else {
      paid = 0;
    }

    setOrderInfo(prev => ({
      ...prev,
      amountPaid: orderInfo.paymentStatus === 'Paid' ? fee.toString() : (orderInfo.paymentStatus === 'Not Paid' ? '0' : prev.amountPaid),
      balance: Math.max(0, fee - paid)
    }));
  }, [orderInfo.serviceFee, orderInfo.paymentStatus, orderInfo.amountPaid]);

  // Handle Input Changes
  const handlePersonalChange = (e) => {
    const { name, value } = e.target;
    setPersonalInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleOrderChange = (e) => {
    const { name, value } = e.target;
    setOrderInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleMeasurementChange = (e) => {
    const { name, value } = e.target;
    // Allow digits and decimals only
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setMeasurements(prev => ({ ...prev, [name]: value }));
    }
  };

  // Handle image select
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Form Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!personalInfo.name || !personalInfo.phone) {
      setError('Customer name and phone number are required.');
      setLoading(false);
      return;
    }

    try {
      let uploadedImageUrl = orderInfo.productImage;

      // Handle file upload if a new file is chosen
      if (imageFile) {
        const formData = new FormData();
        formData.append('file', imageFile);

        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!uploadRes.ok) {
          throw new Error('Failed to upload fabric image.');
        }

        const uploadData = await uploadRes.json();
        uploadedImageUrl = uploadData.url;
      }

      // Prepare payload
      const payload = {
        ...personalInfo,
        order: isEdit ? null : {
          ...orderInfo,
          productImage: uploadedImageUrl,
        },
        measurements: measurements
      };

      await onSave(payload);
    } catch (err) {
      console.error(err);
      setError(err.message || 'An error occurred while saving.');
    } finally {
      setLoading(false);
    }
  };

  // Label Descriptions for Measurements
  const measurementLabels = {
    // Vertical
    abl: { name: 'ABL', desc: 'Across Back Length' },
    bp: { name: 'BP', desc: 'Bust Point' },
    ubl: { name: 'UBL', desc: 'Under Bust Length' },
    wl: { name: 'WL', desc: 'Waist Length' },
    lwl: { name: 'LWL', desc: 'Low Waist Length' },
    hl: { name: 'HL', desc: 'Hip Length' },
    skl: { name: 'SKL', desc: 'Skirt Length' },
    sl: { name: 'SL', desc: 'Sleeve Length' },
    gl: { name: 'GL', desc: 'Gown Length' },
    // Horizontal
    abc: { name: 'ABC', desc: 'Across Back Chest' },
    bc: { name: 'BC', desc: 'Bust Circumference' },
    ubc: { name: 'UBC', desc: 'Under Bust Circumference' },
    wc: { name: 'WC', desc: 'Waist Circumference' },
    lwc: { name: 'LWC', desc: 'Low Waist Circumference' },
    hc: { name: 'HC', desc: 'Hip Circumference' },
    nn: { name: 'N-N', desc: 'Nipple to Nipple' },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: 'var(--card-border)' }}>
        <div className="flex items-center gap-3">
          <button 
            type="button" 
            onClick={onBack}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-xl font-bold">
            {isEdit ? `Edit Profile: ${customer.name}` : 'Register New Customer & Order'}
          </h2>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-800 text-sm font-semibold">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* SECTION 1: Personal Information */}
        <div className="premium-card space-y-4">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">
            Personal Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="input-label" htmlFor="name">Customer Name *</label>
              <input 
                id="name"
                type="text" 
                name="name" 
                value={personalInfo.name} 
                onChange={handlePersonalChange} 
                className="input-field" 
                placeholder="Enter customer name"
                required
              />
            </div>
            <div>
              <label className="input-label" htmlFor="phone">Phone Number *</label>
              <input 
                id="phone"
                type="tel" 
                name="phone" 
                value={personalInfo.phone} 
                onChange={handlePersonalChange} 
                className="input-field" 
                placeholder="Enter 11-digit phone number"
                required
              />
            </div>
            <div>
              <label className="input-label" htmlFor="alternatePhone">Alternate Phone Number (Optional)</label>
              <input 
                id="alternatePhone"
                type="tel" 
                name="alternatePhone" 
                value={personalInfo.alternatePhone} 
                onChange={handlePersonalChange} 
                className="input-field" 
                placeholder="Alternate phone number"
              />
            </div>
            <div>
              <label className="input-label" htmlFor="address">Address (Optional)</label>
              <input 
                id="address"
                type="text" 
                name="address" 
                value={personalInfo.address} 
                onChange={handlePersonalChange} 
                className="input-field" 
                placeholder="Home or delivery address"
              />
            </div>
          </div>
          <div>
            <label className="input-label" htmlFor="notes">Notes/Remarks (Optional)</label>
            <textarea 
              id="notes"
              name="notes" 
              value={personalInfo.notes} 
              onChange={handlePersonalChange} 
              className="input-field h-20 resize-none" 
              placeholder="E.g., Prefers loose fitting sleeves, styles requests, etc."
            />
          </div>
        </div>

        {/* SECTION 2: Body Measurements */}
        <div className="premium-card space-y-4">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">
            Customer Measurements (Inches)
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Vertical column */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-gray-400 border-b pb-1">Vertical Measurements</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {Object.keys(measurementLabels).slice(0, 9).map((key) => (
                  <div key={key}>
                    <label className="input-label" htmlFor={key} title={measurementLabels[key].desc}>
                      {measurementLabels[key].name} <span className="text-[10px] text-gray-400 font-normal">({measurementLabels[key].desc})</span>
                    </label>
                    <input 
                      id={key}
                      type="text" 
                      name={key} 
                      value={measurements[key]} 
                      onChange={handleMeasurementChange} 
                      className="input-field text-center font-semibold"
                      placeholder="--"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Horizontal column */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-gray-400 border-b pb-1">Horizontal Measurements</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {Object.keys(measurementLabels).slice(9).map((key) => (
                  <div key={key}>
                    <label className="input-label" htmlFor={key} title={measurementLabels[key].desc}>
                      {measurementLabels[key].name} <span className="text-[10px] text-gray-400 font-normal">({measurementLabels[key].desc})</span>
                    </label>
                    <input 
                      id={key}
                      type="text" 
                      name={key} 
                      value={measurements[key]} 
                      onChange={handleMeasurementChange} 
                      className="input-field text-center font-semibold"
                      placeholder="--"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3: Order Details (Only shown when creating new customer) */}
        {!isEdit && (
          <div className="premium-card space-y-4">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">
              Initial Tailoring Order Details
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="input-label" htmlFor="productType">Product Type</label>
                <select 
                  id="productType"
                  name="productType" 
                  value={orderInfo.productType} 
                  onChange={handleOrderChange}
                  className="input-field font-semibold"
                >
                  <option value="Atamfa">Atamfa</option>
                  <option value="Textile">Textile</option>
                  <option value="Shadda">Shadda</option>
                  <option value="Material">Material</option>
                  <option value="Others">Others</option>
                </select>
              </div>

              {orderInfo.productType === 'Others' && (
                <div>
                  <label className="input-label" htmlFor="otherProduct">Specify Product Type *</label>
                  <input 
                    id="otherProduct"
                    type="text" 
                    name="otherProduct" 
                    value={orderInfo.otherProduct} 
                    onChange={handleOrderChange} 
                    className="input-field" 
                    placeholder="Enter fabric/product type"
                    required={orderInfo.productType === 'Others'}
                  />
                </div>
              )}

              <div>
                <label className="input-label" htmlFor="tailoringStyle">Tailoring Style</label>
                <input 
                  id="tailoringStyle"
                  type="text" 
                  name="tailoringStyle" 
                  value={orderInfo.tailoringStyle} 
                  onChange={handleOrderChange} 
                  className="input-field" 
                  placeholder="Gown, Skirt, Wrapper, Kaftan..."
                  list="styles-list"
                />
                <datalist id="styles-list">
                  <option value="Gown" />
                  <option value="Skirt" />
                  <option value="Wrapper" />
                  <option value="Kaftan" />
                  <option value="Native Dress" />
                  <option value="Custom Design" />
                </datalist>
              </div>

              <div>
                <label className="input-label" htmlFor="collectionDate">Expected Collection Date *</label>
                <input 
                  id="collectionDate"
                  type="date" 
                  name="collectionDate" 
                  value={orderInfo.collectionDate} 
                  onChange={handleOrderChange} 
                  className="input-field font-semibold"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="input-label" htmlFor="serviceFee">Service Fee (₦) *</label>
                <input 
                  id="serviceFee"
                  type="number" 
                  name="serviceFee" 
                  value={orderInfo.serviceFee} 
                  onChange={handleOrderChange} 
                  className="input-field font-bold" 
                  placeholder="0.00"
                  required
                />
              </div>

              <div>
                <label className="input-label" htmlFor="paymentStatus">Payment Status</label>
                <select 
                  id="paymentStatus"
                  name="paymentStatus" 
                  value={orderInfo.paymentStatus} 
                  onChange={handleOrderChange}
                  className="input-field font-semibold"
                >
                  <option value="Not Paid">Not Paid</option>
                  <option value="Advance Payment">Advance Payment</option>
                  <option value="Paid">Paid</option>
                </select>
              </div>

              {orderInfo.paymentStatus === 'Advance Payment' && (
                <div>
                  <label className="input-label" htmlFor="amountPaid">Amount Paid (₦) *</label>
                  <input 
                    id="amountPaid"
                    type="number" 
                    name="amountPaid" 
                    value={orderInfo.amountPaid} 
                    onChange={handleOrderChange} 
                    className="input-field font-bold" 
                    placeholder="0.00"
                    required={orderInfo.paymentStatus === 'Advance Payment'}
                  />
                </div>
              )}

              <div>
                <label className="input-label">Remaining Balance (₦)</label>
                <div className="input-field bg-gray-100 dark:bg-zinc-800 font-extrabold text-red-600 dark:text-red-400 flex items-center">
                  ₦{orderInfo.balance.toLocaleString()}
                </div>
              </div>

              <div>
                <label className="input-label" htmlFor="orderStatus">Order Status</label>
                <select 
                  id="orderStatus"
                  name="orderStatus" 
                  value={orderInfo.orderStatus} 
                  onChange={handleOrderChange}
                  className="input-field font-semibold text-blue-600 dark:text-blue-400"
                >
                  <option value="New">New</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Ready for Collection">Ready for Collection</option>
                  <option value="Collected">Collected</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Fabric Image upload */}
            <div className="space-y-2">
              <label className="input-label">Fabric / Product Image</label>
              <div className="flex items-center gap-4">
                <label className="btn-secondary flex items-center gap-2 cursor-pointer border-dashed border-2 py-3 px-6 h-auto">
                  <Camera size={18} />
                  <span>Choose Photo or Take Picture</span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
                {imagePreview && (
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden border">
                    <img 
                      src={imagePreview} 
                      alt="Fabric Preview" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-4">
          <button 
            type="submit" 
            disabled={loading}
            className="btn-primary flex-1 flex items-center justify-center gap-2 h-12"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                Saving Data...
              </>
            ) : (
              <>
                <Save size={18} />
                Save Customer Record
              </>
            )}
          </button>
          <button 
            type="button" 
            onClick={onBack}
            className="btn-secondary flex-1 h-12"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
