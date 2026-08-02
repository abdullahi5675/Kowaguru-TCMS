"use client";

import { useState, useRef } from "react";

export default function RequestAccessForm() {
  const [formData, setFormData] = useState({
    shopName: "",
    email: "",
    state: "N/A",
  });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (!selectedFile.type.startsWith("image/")) {
        setError("Please upload a valid image file.");
        return;
      }
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Please upload your payment receipt.");
      return;
    }
    
    setLoading(true);
    setError("");

    const data = new FormData();
    data.append("shopName", formData.shopName);
    data.append("email", formData.email);
    data.append("state", formData.state);
    data.append("file", file);

    try {
      const res = await fetch("/api/public/request-access", {
        method: "POST",
        body: data,
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Failed to submit request");
      }

      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-green-50 p-6 rounded-2xl border border-green-200 text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
          <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-green-900 mb-2">Request Submitted!</h3>
        <p className="text-sm text-green-800">
          We have received your payment receipt. Once approved, your login credentials will be automatically sent to <strong>{formData.email}</strong>.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-red-50 py-6 px-4 rounded-2xl border border-red-100 text-center mb-6">
      <h3 className="text-lg font-bold text-red-900 mb-2">Want to use Kowaguru TCMS?</h3>
      <p className="text-sm text-red-800 mb-4">
        Gain full access to the ultimate tailoring management system.
      </p>
      <div className="bg-white rounded-xl p-4 mb-4 text-left">
        <div className="flex justify-between items-center">
          <span className="font-medium text-gray-700">Account Access Fee:</span>
          <span className="font-bold text-gray-900">₦20,000</span>
        </div>
      </div>
      
      <div className="bg-red-50 p-4 rounded-xl mb-6 text-left border border-red-200">
        <h4 className="font-bold text-red-900 mb-2">Manual Payment Instructions</h4>
        <p className="text-sm text-red-800 mb-3">
          Please transfer exactly ₦20,000 to the account below, then upload the receipt.
        </p>
        <div className="bg-white p-3 rounded-lg border border-red-100 mb-3 text-sm">
          <div className="flex justify-between mb-1">
            <span className="text-gray-500">Bank:</span>
            <span className="font-bold">MONIE POINT</span>
          </div>
          <div className="flex justify-between mb-1">
            <span className="text-gray-500">Account No:</span>
            <span className="font-bold text-lg">4005792569</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Name:</span>
            <span className="font-bold">KOWAGURU TECHNOLOGY LIMITED</span>
          </div>
        </div>
        <p className="text-xs text-red-700 text-center">
          Questions? Call / WhatsApp: <strong>08023603283</strong>
        </p>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 text-sm text-left">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="text-left space-y-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        <h4 className="font-bold text-gray-900 border-b pb-2">Upload Receipt & Request Access</h4>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Shop / Business Name</label>
          <input
            type="text"
            name="shopName"
            required
            value={formData.shopName}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:ring-red-500 focus:border-red-500 sm:text-sm"
            placeholder="e.g. MJ Tailoring"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Email Address</label>
          <input
            type="email"
            name="email"
            required
            value={formData.email}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:ring-red-500 focus:border-red-500 sm:text-sm"
            placeholder="Where we will send your password"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Payment Receipt (Screenshot)</label>
          
          {!preview ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:border-red-400 hover:bg-red-50 transition-colors"
            >
              <div className="space-y-1 text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div className="flex text-sm text-gray-600 justify-center">
                  <span className="relative rounded-md font-medium text-red-600 hover:text-red-500 focus-within:outline-none">
                    Upload a file
                  </span>
                </div>
                <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
              </div>
            </div>
          ) : (
            <div className="relative mt-2">
              <img src={preview} alt="Receipt preview" className="w-full h-48 object-cover rounded-lg border border-gray-300" />
              <button
                type="button"
                onClick={() => {
                  setFile(null);
                  setPreview(null);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700 shadow-md"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          )}
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 transition-colors"
        >
          {loading ? "Uploading..." : "Submit Receipt for Approval"}
        </button>
      </form>
      
      <p className="text-xs text-gray-500 mt-4">
        For Enquiries, Call or WhatsApp:<br/>
        <a href="https://wa.me/2348023603283" className="font-bold text-red-700">08023603283</a>
      </p>
    </div>
  );
}
