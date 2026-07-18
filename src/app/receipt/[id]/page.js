import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import PrintButton from '@/components/PrintButton';

// Format date nicely
const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export default async function ReceiptPage({ params }) {
  const { id } = await params;
  const orderId = parseInt(id);

  if (isNaN(orderId)) {
    notFound();
  }

  // Fetch the order, customer, and settings (from the order's user)
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      customer: true,
      user: {
        include: {
          settings: true
        }
      }
    }
  });

  if (!order) {
    notFound();
  }

  const settings = order.user?.settings;
  const businessName = settings?.businessName || order.user?.shopName || 'Tailoring Shop';
  const phone = settings?.phone || '';
  const address = settings?.address || '';
  const receiptFooter = settings?.receiptFooter || 'Thank you for your patronage!';

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl w-full bg-white shadow-2xl rounded-2xl overflow-hidden print:shadow-none print:bg-white print:max-w-none">
        
        {/* Receipt Header */}
        <div className="bg-blue-600 px-6 py-8 text-center text-white print:bg-white print:text-black">
          {settings?.businessLogo && (
            <div className="flex justify-center mb-4">
              <div className="relative h-16 w-16 rounded-xl overflow-hidden bg-white/20 p-1 print:bg-transparent">
                <Image
                  src={settings.businessLogo}
                  alt="Business Logo"
                  fill
                  className="object-contain rounded-lg"
                />
              </div>
            </div>
          )}
          <h1 className="text-3xl font-extrabold tracking-tight">{businessName}</h1>
          {address && <p className="mt-1 text-blue-100 print:text-gray-600">{address}</p>}
          {phone && <p className="text-blue-100 print:text-gray-600">{phone}</p>}
        </div>

        {/* Receipt Body */}
        <div className="px-6 py-8 sm:p-10">
          <div className="flex justify-between items-end border-b border-gray-200 pb-6 mb-6">
            <div>
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Customer</p>
              <h2 className="text-xl font-bold text-gray-900 mt-1">{order.customer.name}</h2>
              <p className="text-gray-600">{order.customer.phone}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Order #{order.id}</p>
              <p className="text-sm text-gray-600 mt-1">{formatDate(order.createdAt)}</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-gray-50 rounded-xl p-5 border border-gray-100 print:bg-transparent print:border-none print:p-0">
              <h3 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">Order Details</h3>
              
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Product</dt>
                  <dd className="mt-1 text-sm text-gray-900 font-semibold">
                    {order.productType === 'Others' && order.otherProduct ? order.otherProduct : order.productType}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Style</dt>
                  <dd className="mt-1 text-sm text-gray-900 font-semibold">{order.tailoringStyle}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Status</dt>
                  <dd className="mt-1">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 print:bg-transparent print:border print:border-gray-300">
                      {order.orderStatus}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Collection Date</dt>
                  <dd className="mt-1 text-sm text-gray-900 font-semibold">{formatDate(order.collectionDate)}</dd>
                </div>
              </dl>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">Payment Summary</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Service Fee</span>
                  <span className="font-medium text-gray-900">₦{Number(order.serviceFee).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Amount Paid</span>
                  <span className="font-medium text-green-600">₦{Number(order.amountPaid).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                  <span className="text-base font-bold text-gray-900">Balance Due</span>
                  <span className={`text-lg font-bold ${Number(order.balance) > 0 ? 'text-red-600' : 'text-gray-900'}`}>
                    ₦{Number(order.balance).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Receipt Footer */}
        <div className="bg-gray-50 px-6 py-6 text-center border-t border-gray-200 print:bg-white">
          <p className="text-sm text-gray-500 italic">"{receiptFooter}"</p>
          <div className="mt-6 print:hidden">
            <PrintButton />
          </div>
        </div>

      </div>
    </div>
  );
}
