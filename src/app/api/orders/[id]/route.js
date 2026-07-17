import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(request, { params }) {
  try {
    const { id: rawId } = await params;
    const id = parseInt(rawId);
    const data = await request.json();

    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid Order ID.' }, { status: 400 });
    }

    const {
      productType,
      otherProduct,
      tailoringStyle,
      collectionDate,
      serviceFee,
      paymentStatus,
      amountPaid,
      orderStatus,
      productImage,
    } = data;

    // Fetch original order to handle updates safely
    const originalOrder = await prisma.order.findUnique({
      where: { id }
    });

    if (!originalOrder) {
      return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
    }

    // Prepare updated variables, calculating balance automatically
    const fee = serviceFee !== undefined ? parseFloat(serviceFee) : parseFloat(originalOrder.serviceFee);
    const paid = amountPaid !== undefined ? parseFloat(amountPaid) : parseFloat(originalOrder.amountPaid);
    const balance = fee - paid;

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        productType: productType || undefined,
        otherProduct: otherProduct !== undefined ? otherProduct : undefined,
        tailoringStyle: tailoringStyle || undefined,
        collectionDate: collectionDate ? new Date(collectionDate) : undefined,
        serviceFee: fee,
        paymentStatus: paymentStatus || undefined,
        amountPaid: paid,
        balance: balance,
        orderStatus: orderStatus || undefined,
        productImage: productImage !== undefined ? productImage : undefined,
      },
      include: {
        customer: true,
        measurements: true
      }
    });

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json({ error: 'Failed to update tailoring order.' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id: rawId } = await params;
    const id = parseInt(rawId);

    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid Order ID.' }, { status: 400 });
    }

    await prisma.order.delete({
      where: { id }
    });

    return NextResponse.json({ success: true, message: 'Order deleted successfully.' });
  } catch (error) {
    console.error('Error deleting order:', error);
    return NextResponse.json({ error: 'Failed to delete order.' }, { status: 500 });
  }
}
