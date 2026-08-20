"use client";

import { useState } from "react";
import { Trash2, Loader2 } from "lucide-react";

export default function ClientList({ initialClients }) {
  const [clients, setClients] = useState(initialClients || []);
  const [deletingId, setDeletingId] = useState(null);
  const [confirmDeleteClient, setConfirmDeleteClient] = useState(null);

  const handleDeleteClient = async (clientId) => {
    setDeletingId(clientId);
    try {
      const res = await fetch(`/api/super-admin/clients/${clientId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setClients(clients.filter((c) => c.id !== clientId));
        setConfirmDeleteClient(null);
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete client account");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred while deleting the client account");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center bg-gray-50/50">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Registered Tailors</h3>
        <span className="text-xs text-gray-500 font-semibold">{clients.length} Total Accounts</span>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Shop Name / Owner
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Registered Date
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Usage
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {clients.map((client) => (
              <tr key={client.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 bg-red-100 rounded-full flex items-center justify-center text-red-700 font-bold">
                      {client.shopName ? client.shopName.charAt(0).toUpperCase() : client.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{client.shopName || "Unnamed Shop"}</div>
                      <div className="text-sm text-gray-500">{client.name}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{client.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(client.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mr-2">
                    {client.customers?.length || 0} Customers
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {client.orders?.length || 0} Orders
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => setConfirmDeleteClient(client)}
                    disabled={deletingId === client.id}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg text-xs font-semibold border border-red-200 transition-colors disabled:opacity-50"
                  >
                    {deletingId === client.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5" />
                    )}
                    Delete Account
                  </button>
                </td>
              </tr>
            ))}

            {clients.length === 0 && (
              <tr>
                <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                  No clients registered yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Confirmation Modal */}
      {confirmDeleteClient && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100">
            <div className="flex items-center gap-3 text-red-600 mb-3">
              <div className="p-3 bg-red-100 rounded-full">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Delete Client Account?</h3>
            </div>
            <p className="text-sm text-gray-600 mb-6 leading-relaxed">
              Are you sure you want to completely delete <strong className="text-gray-900">{confirmDeleteClient.shopName || confirmDeleteClient.name}</strong> ({confirmDeleteClient.email})? 
              <br /><br />
              <span className="text-red-600 font-semibold">⚠️ Warning:</span> This will permanently erase their account, all customer measurements, orders, and business settings. This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirmDeleteClient(null)}
                className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteClient(confirmDeleteClient.id)}
                disabled={deletingId === confirmDeleteClient.id}
                className="px-5 py-2 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors shadow-sm disabled:opacity-50 inline-flex items-center gap-2"
              >
                {deletingId === confirmDeleteClient.id && <Loader2 className="w-4 h-4 animate-spin" />}
                Yes, Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
