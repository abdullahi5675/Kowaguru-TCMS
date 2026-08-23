"use client";

import { useState } from "react";
import { RotateCcw, Trash2, Loader2, Clock } from "lucide-react";

function getDaysRemaining(deletedAt) {
  if (!deletedAt) return 30;
  const deleted = new Date(deletedAt);
  const now = new Date();
  const diffMs = 30 * 24 * 60 * 60 * 1000 - (now - deleted);
  return Math.max(0, Math.ceil(diffMs / (24 * 60 * 60 * 1000)));
}

export default function DeletedClients({ initialDeletedClients }) {
  const [clients, setClients] = useState(initialDeletedClients || []);
  const [restoringId, setRestoringId] = useState(null);
  const [purgingId, setPurgingId] = useState(null);
  const [confirmPurge, setConfirmPurge] = useState(null);

  const handleRestore = async (clientId) => {
    setRestoringId(clientId);
    try {
      const res = await fetch(`/api/super-admin/clients/${clientId}/restore`, {
        method: "POST",
      });
      if (res.ok) {
        setClients(clients.filter((c) => c.id !== clientId));
        alert("✅ Account restored! The client can now log in again.");
      } else {
        const data = await res.json();
        alert(data.error || "Failed to restore account");
      }
    } catch (err) {
      alert("An error occurred while restoring the account");
    } finally {
      setRestoringId(null);
    }
  };

  const handlePermanentDelete = async (clientId) => {
    setPurgingId(clientId);
    try {
      const res = await fetch(`/api/super-admin/clients/${clientId}`, {
        method: "PATCH",
      });
      if (res.ok) {
        setClients(clients.filter((c) => c.id !== clientId));
        setConfirmPurge(null);
      } else {
        const data = await res.json();
        alert(data.error || "Failed to permanently delete account");
      }
    } catch (err) {
      alert("An error occurred");
    } finally {
      setPurgingId(null);
    }
  };

  return (
    <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-200 bg-gray-50/50">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Deleted / Blocked Accounts</h3>
        <p className="text-xs text-gray-500 mt-1">
          Accounts are kept for <strong>30 days</strong> before permanent deletion. You can restore any account anytime.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Shop / Owner</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deactivated On</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time Remaining</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {clients.map((client) => {
              const daysLeft = getDaysRemaining(client.deletedAt);
              const isExpiringSoon = daysLeft <= 5;
              return (
                <tr key={client.id} className="hover:bg-red-50/30">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 font-bold">
                        {(client.shopName || client.name || "?").charAt(0).toUpperCase()}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-700">{client.shopName || "Unnamed Shop"}</div>
                        <div className="text-sm text-gray-400">{client.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{client.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {client.deletedAt ? new Date(client.deletedAt).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                      isExpiringSoon
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-800"
                    }`}>
                      <Clock className="w-3 h-3" />
                      {daysLeft} day{daysLeft !== 1 ? "s" : ""} left
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      {/* Restore Button */}
                      <button
                        onClick={() => handleRestore(client.id)}
                        disabled={restoringId === client.id}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg text-xs font-semibold border border-green-200 transition-colors disabled:opacity-50"
                      >
                        {restoringId === client.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <RotateCcw className="w-3.5 h-3.5" />
                        )}
                        Restore
                      </button>
                      {/* Permanent Delete Button */}
                      <button
                        onClick={() => setConfirmPurge(client)}
                        disabled={purgingId === client.id}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg text-xs font-semibold border border-red-200 transition-colors disabled:opacity-50"
                      >
                        {purgingId === client.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                        Delete Forever
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}

            {clients.length === 0 && (
              <tr>
                <td colSpan="5" className="px-6 py-12 text-center text-gray-400">
                  <div className="flex flex-col items-center gap-2">
                    <RotateCcw className="w-8 h-8 text-gray-300" />
                    <p className="font-medium">No deleted accounts</p>
                    <p className="text-xs">Deactivated accounts will appear here for 30 days.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Permanent Delete Confirmation Modal */}
      {confirmPurge && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-red-100">
            <div className="flex items-center gap-3 text-red-600 mb-3">
              <div className="p-3 bg-red-100 rounded-full">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Permanently Delete?</h3>
            </div>
            <p className="text-sm text-gray-600 mb-2 leading-relaxed">
              This will <strong className="text-red-600">permanently erase</strong> all data for{" "}
              <strong>{confirmPurge.shopName || confirmPurge.name}</strong> ({confirmPurge.email}).
            </p>
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-5 text-xs text-red-800">
              ⚠️ <strong>This cannot be undone.</strong> All customers, measurements, orders, and settings will be gone forever.
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirmPurge(null)}
                className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handlePermanentDelete(confirmPurge.id)}
                disabled={purgingId === confirmPurge.id}
                className="px-5 py-2 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors shadow-sm disabled:opacity-50 inline-flex items-center gap-2"
              >
                {purgingId === confirmPurge.id && <Loader2 className="w-4 h-4 animate-spin" />}
                Delete Forever
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
