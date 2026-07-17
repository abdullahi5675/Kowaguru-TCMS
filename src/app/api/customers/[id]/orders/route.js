import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/customers/[id]/orders — Add a new order to an existing customer
export async function POST(request, { params }) {
  try {
    const { id: rawId } = await params;
    const customerId = parseInt(rawId);

    if (isNaN(customerId)) {
      return NextResponse.json({ error: 'Invalid Customer ID.' }, { status: 400 });
    }

    const data = await request.json();

    const {
      productType,
      otherProduct,
      tailoringStyle,
      collectionDate,
      serviceFee,
      paymentStatus,
      amountPaid,
      balance,
      orderStatus,
      productImage,
      measurements,
    } = data;

    // Ensure customer exists
    const customer = await prisma.customer.findUnique({ where: { id: customerId } });
    if (!customer) {
      return NextResponse.json({ error: 'Customer not found.' }, { status: 404 });
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Create the new order
      const order = await tx.order.create({
        data: {
          customerId,
          productType: productType || 'Atamfa',
          otherProduct: otherProduct || null,
          tailoringStyle: tailoringStyle || '',
          collectionDate: collectionDate ? new Date(collectionDate) : new Date(),
          serviceFee: parseFloat(serviceFee) || 0,
          paymentStatus: paymentStatus || 'Not Paid',
          amountPaid: parseFloat(amountPaid) || 0,
          balance: parseFloat(balance) || 0,
          orderStatus: orderStatus || 'New',
          productImage: productImage || null,
        }
      });

      // 2. Optionally save updated measurements
      let savedMeasurement = null;
      if (measurements) {
        const mData = {};
        const fields = ['abl', 'bp', 'ubl', 'wl', 'lwl', 'hl', 'skl', 'sl', 'gl', 'abc', 'bc', 'ubc', 'wc', 'lwc', 'hc', 'nn'];
        fields.forEach(f => {
          const val = parseFloat(measurements[f]);
          mData[f] = !isNaN(val) && measurements[f] !== '' ? val : null;
        });

        savedMeasurement = await tx.measurement.create({
          data: {
            customerId,
            orderId: order.id,
            ...mData
          }
        });
      }

      return { order, measurement: savedMeasurement };
    });

    // Return full order with customer details
    const fullOrder = await prisma.order.findUnique({
      where: { id: result.order.id },
      include: { customer: true, measurements: true }
    });

    return NextResponse.json({ order: fullOrder, measurement: result.measurement }, { status: 201 });
  } catch (error) {
    console.error('Error creating order for existing customer:', error);
    return NextResponse.json({ error: 'Failed to create new order.' }, { status: 500 });
  }
}
