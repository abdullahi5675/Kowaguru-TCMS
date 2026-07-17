import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request, { params }) {
  try {
    const userId = parseInt(request.headers.get('x-user-id'), 10);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid Customer ID.' }, { status: 400 });
    }

    const customer = await prisma.customer.findUnique({
      where: { id, userId },
      include: {
        orders: {
          orderBy: { submissionDate: 'desc' }
        },
        measurements: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found.' }, { status: 404 });
    }

    return NextResponse.json(customer);
  } catch (error) {
    console.error('Error fetching customer profile:', error);
    return NextResponse.json({ error: 'Failed to fetch customer profile.' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const userId = parseInt(request.headers.get('x-user-id'), 10);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const id = parseInt(params.id);
    const data = await request.json();

    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid Customer ID.' }, { status: 400 });
    }

    const customer = await prisma.customer.update({
      where: { id, userId },
      data: {
        name: data.name,
        phone: data.phone,
        alternatePhone: data.alternatePhone,
        address: data.address,
        notes: data.notes,
      }
    });

    return NextResponse.json(customer);
  } catch (error) {
    console.error('Error updating customer:', error);
    return NextResponse.json({ error: 'Failed to update customer.' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const userId = parseInt(request.headers.get('x-user-id'), 10);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid Customer ID.' }, { status: 400 });
    }

    // Cascade delete is supported at schema layer
    await prisma.customer.delete({
      where: { id, userId }
    });

    return NextResponse.json({ success: true, message: 'Customer record deleted successfully.' });
  } catch (error) {
    console.error('Error deleting customer:', error);
    return NextResponse.json({ error: 'Failed to delete customer record.' }, { status: 500 });
  }
}
