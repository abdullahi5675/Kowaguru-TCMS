"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function PendingApprovals({ initialRequests }) {
  const router = useRouter();
  const [requests, setRequests] = useState(initialRequests);
  const [loadingId, setLoadingId] = useState(null);
  const [error, setError] = useState("");

  const handleApprove = async (request) => {
    setLoadingId(request.id);
    setError("");

    try {
      const res = await fetch("/api/super-admin/approve-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId: request.id }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to approve request");
      }

      // Remove from list
      setRequests(requests.filter((r) => r.id !== request.id));
      router.refresh(); // Refresh the server component stats and lists
      
      if (data.message) {
         // E.g., email failed but user created
         alert(data.message);
      } else {
         alert(`Account created! Login details have been emailed to ${request.email}`);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingId(null);
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm("Are you sure you want to reject this request?")) return;
    
    setLoadingId(id);
    try {
      const res = await fetch("/api/super-admin/reject-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId: id }),
      });

      if (!res.ok) throw new Error("Failed to reject");

      setRequests(requests.filter((r) => r.id !== id));
      router.refresh(); // Refresh the server component stats and lists
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center bg-gray-50/50">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Pending Approvals</h3>
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
          {requests.length} Pending
        </span>
      </div>

      {error && (
        <div className="m-4 bg-red-50 border-l-4 border-red-400 p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Shop Info</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">State</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Receipt</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {requests.map((req) => (
              <tr key={req.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{req.shopName}</div>
                  <div className="text-sm text-gray-500">{req.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${req.state === 'Jigawa' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}>
                    {req.state}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">
                  <a href={req.receiptUrl} target="_blank" rel="noopener noreferrer" className="hover:underline font-medium">
                    View Receipt
                  </a>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(req.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                  <button 
                    onClick={() => handleReject(req.id)}
                    disabled={loadingId === req.id}
                    className="text-red-600 hover:text-red-900 disabled:opacity-50"
                  >
                    Reject
                  </button>
                  <button 
                    onClick={() => handleApprove(req)}
                    disabled={loadingId === req.id}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-lg shadow-sm text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
                  >
                    {loadingId === req.id ? 'Processing...' : 'Approve & Create'}
                  </button>
                </td>
              </tr>
            ))}
            
            {requests.length === 0 && (
              <tr>
                <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                  No pending requests.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
