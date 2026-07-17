import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query') || '';

    // Search by name, phone, alternate phone, or check orders/measurements
    const customers = await prisma.customer.findMany({
      where: query ? {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { phone: { contains: query } },
          { alternatePhone: { contains: query } },
          { address: { contains: query, mode: 'insensitive' } },
        ]
      } : undefined,
      include: {
        orders: {
          orderBy: { submissionDate: 'desc' }
        },
        measurements: {
          orderBy: { createdAt: 'desc' }
        }
      },
      orderBy: { name: 'asc' }
    });

    return NextResponse.json(customers);
  } catch (error) {
    console.error('Error fetching customers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customers.' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    
    const {
      name,
      phone,
      alternatePhone,
      address,
      notes,
      order,
      measurements
    } = data;

    if (!name || !phone) {
      return NextResponse.json({ error: 'Name and Phone Number are required.' }, { status: 400 });
    }

    // Wrap in a transaction to ensure all or nothing is created
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create customer
      const customer = await tx.customer.create({
        data: {
          name,
          phone,
          alternatePhone,
          address,
          notes,
        }
      });

      let createdOrder = null;
      let createdMeasurements = null;

      // 2. Create order if details are provided
      if (order && order.productType) {
        const fee = parseFloat(order.serviceFee) || 0;
        const paid = parseFloat(order.amountPaid) || 0;
        const balance = fee - paid;

        createdOrder = await tx.order.create({
          data: {
            customerId: customer.id,
            productType: order.productType,
            otherProduct: order.otherProduct,
            tailoringStyle: order.tailoringStyle || 'Custom Design',
            collectionDate: new Date(order.collectionDate),
            serviceFee: fee,
            paymentStatus: order.paymentStatus || 'Not Paid',
            amountPaid: paid,
            balance: balance,
            orderStatus: order.orderStatus || 'New',
            productImage: order.productImage,
          }
        });

        // 3. Save measurements linked to both customer and order
        if (measurements) {
          // Helper to convert inputs to decimals
          const toDecimal = (val) => val ? parseFloat(val) : null;
          
          createdMeasurements = await tx.measurement.create({
            data: {
              customerId: customer.id,
              orderId: createdOrder.id,
              // Vertical
              abl: toDecimal(measurements.abl),
              bp: toDecimal(measurements.bp),
              ubl: toDecimal(measurements.ubl),
              wl: toDecimal(measurements.wl),
              lwl: toDecimal(measurements.lwl),
              hl: toDecimal(measurements.hl),
              skl: toDecimal(measurements.skl),
              sl: toDecimal(measurements.sl),
              gl: toDecimal(measurements.gl),
              // Horizontal
              abc: toDecimal(measurements.abc),
              bc: toDecimal(measurements.bc),
              ubc: toDecimal(measurements.ubc),
              wc: toDecimal(measurements.wc),
              lwc: toDecimal(measurements.lwc),
              hc: toDecimal(measurements.hc),
              nn: toDecimal(measurements.nn),
            }
          });
        }
      }

      return { customer, order: createdOrder, measurements: createdMeasurements };
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Error creating customer record:', error);
    return NextResponse.json({ error: 'Failed to create customer record.' }, { status: 500 });
  }
}
