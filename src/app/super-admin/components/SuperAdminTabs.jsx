"use client";

import { useState } from "react";
import ClientList from "./ClientList";
import PendingApprovals from "./PendingApprovals";
import DeletedClients from "./DeletedClients";

export default function SuperAdminTabs({ initialClients, initialRequests, initialDeletedClients }) {
  const [activeTab, setActiveTab] = useState("clients");

  return (
    <div>
      <div className="mb-6 overflow-x-auto">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-6 sm:space-x-8 min-w-max" aria-label="Tabs">
            <button
              onClick={() => setActiveTab("clients")}
              className={`${
                activeTab === "clients"
                  ? "border-red-500 text-red-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-bold text-lg transition-colors`}
            >
              Active Clients
              <span className="ml-2 bg-green-100 text-green-800 py-0.5 px-2 rounded-full text-xs font-medium">
                {initialClients.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("pending")}
              className={`${
                activeTab === "pending"
                  ? "border-yellow-500 text-yellow-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-bold text-lg transition-colors flex items-center`}
            >
              Pending Approvals
              {initialRequests.length > 0 && (
                <span className="ml-2 bg-yellow-100 text-yellow-800 py-0.5 px-2.5 rounded-full text-xs font-medium">
                  {initialRequests.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("deleted")}
              className={`${
                activeTab === "deleted"
                  ? "border-gray-500 text-gray-700"
                  : "border-transparent text-gray-400 hover:text-gray-600 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-bold text-lg transition-colors flex items-center`}
            >
              🗑️ Deleted Accounts
              {initialDeletedClients.length > 0 && (
                <span className="ml-2 bg-red-100 text-red-700 py-0.5 px-2.5 rounded-full text-xs font-medium">
                  {initialDeletedClients.length}
                </span>
              )}
            </button>
          </nav>
        </div>
      </div>

      {activeTab === "clients" && <ClientList initialClients={initialClients} />}
      {activeTab === "pending" && <PendingApprovals initialRequests={initialRequests} />}
      {activeTab === "deleted" && <DeletedClients initialDeletedClients={initialDeletedClients} />}
    </div>
  );
}
