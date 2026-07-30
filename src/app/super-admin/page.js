import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import ClientList from "./components/ClientList";
import PendingApprovals from "./components/PendingApprovals";
import SuperAdminTabs from "./components/SuperAdminTabs";

export const metadata = {
  title: "Super Admin | Kowaguru TCMS",
};

export default async function SuperAdminPage() {
  const cookieStore = cookies();
  const token = cookieStore.get("auth-token")?.value;

  if (!token) {
    redirect("/auth/login");
  }

  const payload = await verifyToken(token);

  if (!payload || payload.role !== "SUPER_ADMIN") {
    redirect("/"); // Non-admins get redirected to their dashboard
  }

  // Fetch all users/clients
  const clients = await prisma.user.findMany({
    where: {
      role: "USER", // Don't show admins in the client list
    },
    include: {
      customers: true, // to show some stats
      orders: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  
  // Fetch pending payment requests
  const pendingRequests = await prisma.paymentRequest.findMany({
    where: { status: 'PENDING' },
    orderBy: { createdAt: "desc" },
  });

  const totalClients = clients.length;
  // A simple revenue calculation assuming each client paid 10,000 as a placeholder for now
  const totalRevenue = totalClients * 10000;

  return (
    <div className="min-h-screen bg-gray-50 p-6 lg:p-12">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Super Admin Dashboard</h1>
            <p className="mt-2 text-sm text-gray-600">
              Manage Kowaguru TCMS clients and approve payment requests.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <div className="bg-white overflow-hidden shadow-sm rounded-xl border border-gray-200">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-red-100 rounded-md p-3">
                  <svg className="h-6 w-6 text-red-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Clients</dt>
                    <dd className="text-2xl font-semibold text-gray-900">{totalClients}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow-sm rounded-xl border border-gray-200">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                  <svg className="h-6 w-6 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Est. Revenue</dt>
                    <dd className="text-2xl font-semibold text-gray-900">₦{totalRevenue.toLocaleString()}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white overflow-hidden shadow-sm rounded-xl border border-yellow-300">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-yellow-100 rounded-md p-3">
                  <svg className="h-6 w-6 text-yellow-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Pending Approvals</dt>
                    <dd className="text-2xl font-semibold text-gray-900">{pendingRequests.length}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        <SuperAdminTabs 
          initialClients={clients} 
          initialRequests={pendingRequests} 
        />
      </div>
    </div>
  );
}
