import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request) {
  try {
    const userId = parseInt(request.headers.get('x-user-id'), 10);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const payment = searchParams.get('payment');
    const limit = parseInt(searchParams.get('limit') || '50');

    const orders = await prisma.order.findMany({
      where: {
        userId,
        orderStatus: status || undefined,
        paymentStatus: payment || undefined,
      },
      include: {
        customer: true,
        measurements: true
      },
      orderBy: { collectionDate: 'asc' },
      take: limit
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: 'Failed to fetch orders.' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const userId = parseInt(request.headers.get('x-user-id'), 10);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const data = await request.json();
    
    const {
      customerId,
      productType,
      otherProduct,
      tailoringStyle,
      collectionDate,
      serviceFee,
      paymentStatus,
      amountPaid,
      orderStatus,
      productImage,
      measurements
    } = data;

    if (!customerId || !productType || !collectionDate) {
      return NextResponse.json({ error: 'Customer ID, Product Type, and Collection Date are required.' }, { status: 400 });
    }

    const fee = parseFloat(serviceFee) || 0;
    const paid = parseFloat(amountPaid) || 0;
    const balance = fee - paid;

    const result = await prisma.$transaction(async (tx) => {
      // Determine next orderNumber for this user
      const lastOrder = await tx.order.findFirst({
        where: { userId },
        orderBy: { orderNumber: 'desc' }
      });
      const nextOrderNumber = lastOrder ? lastOrder.orderNumber + 1 : 1;

      // 1. Create the order
      const order = await tx.order.create({
        data: {
          userId,
          orderNumber: nextOrderNumber,
          customerId: parseInt(customerId),
          productType,
          otherProduct,
          tailoringStyle: tailoringStyle || 'Custom Design',
          collectionDate: new Date(collectionDate),
          serviceFee: fee,
          paymentStatus: paymentStatus || 'Not Paid',
          amountPaid: paid,
          balance: balance,
          orderStatus: orderStatus || 'New',
          productImage,
        }
      });

      let createdMeasurements = null;

      // 2. Create measurements if provided
      if (measurements) {
        const toDecimal = (val) => val ? parseFloat(val) : null;

        createdMeasurements = await tx.measurement.create({
          data: {
            userId,
            customerId: parseInt(customerId),
            orderId: order.id,
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
            // Male Core Body
            fl: toDecimal(measurements.fl),
            sw: toDecimal(measurements.sw),
            sk: toDecimal(measurements.sk),
            bl: toDecimal(measurements.bl),
            cl: toDecimal(measurements.cl),
            // Male Round
            n: toDecimal(measurements.n),
            s: toDecimal(measurements.s),
            c: toDecimal(measurements.c),
            st: toDecimal(measurements.st),
            w: toDecimal(measurements.w),
            h: toDecimal(measurements.h),
            ah: toDecimal(measurements.ah),
            b: toDecimal(measurements.b),
            wr: toDecimal(measurements.wr),
            // Male Specific
            nw: toDecimal(measurements.nw),
            nd: toDecimal(measurements.nd),
            sd: toDecimal(measurements.sd),
            cw: toDecimal(measurements.cw),
            wd: toDecimal(measurements.wd),
            so: toDecimal(measurements.so),
            pp: toDecimal(measurements.pp),
            tw: toDecimal(measurements.tw),
            tl: toDecimal(measurements.tl),
            tt: toDecimal(measurements.tt),
            tk: toDecimal(measurements.tk),
            ta: toDecimal(measurements.ta),
          }
        });
      }

      return { order, measurements: createdMeasurements };
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Error creating tailoring order:', error);
    return NextResponse.json({ error: 'Failed to create tailoring order.' }, { status: 500 });
  }
}
