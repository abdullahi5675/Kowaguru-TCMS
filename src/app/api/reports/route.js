import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const [
      totalCustomers,
      inProgressCount,
      readyCount,
      collectedCount,
      newCount,
      allOrders
    ] = await prisma.$transaction([
      prisma.customer.count(),
      prisma.order.count({ where: { orderStatus: 'In Progress' } }),
      prisma.order.count({ where: { orderStatus: 'Ready for Collection' } }),
      prisma.order.count({ where: { orderStatus: 'Collected' } }),
      prisma.order.count({ where: { orderStatus: 'New' } }),
      prisma.order.findMany({
        include: { customer: true }
      })
    ]);

    // Calculate aggregated metrics from all orders
    let totalRevenue = 0;
    let totalOutstanding = 0;
    let todayCollectionsCount = 0;
    let overdueCount = 0;

    const todayOrders = [];
    const overdueOrders = [];

    const now = new Date();

    allOrders.forEach(order => {
      const fee = parseFloat(order.serviceFee) || 0;
      const paid = parseFloat(order.amountPaid) || 0;
      const balance = parseFloat(order.balance) || 0;
      
      totalRevenue += paid;
      totalOutstanding += balance;

      const collDate = new Date(order.collectionDate);
      
      // Check if due today
      if (collDate >= todayStart && collDate <= todayEnd) {
        todayCollectionsCount++;
        todayOrders.push(order);
      }

      // Check if overdue (expected date is in the past, and status is not Collected or Cancelled)
      if (collDate < todayStart && !['Collected', 'Cancelled'].includes(order.orderStatus)) {
        overdueCount++;
        overdueOrders.push(order);
      }
    });

    return NextResponse.json({
      summary: {
        totalCustomers,
        ordersNew: newCount,
        ordersInProgress: inProgressCount,
        ordersReady: readyCount,
        ordersCollected: collectedCount,
        todayCollections: todayCollectionsCount,
        outstandingPayments: totalOutstanding,
        collectedRevenue: totalRevenue,
        overdueCollections: overdueCount
      },
      todayOrders,
      overdueOrders
    });
  } catch (error) {
    console.error('Error generating reports:', error);
    return NextResponse.json({ error: 'Failed to generate report summaries.' }, { status: 500 });
  }
}
