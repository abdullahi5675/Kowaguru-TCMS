import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export async function DELETE(request, { params }) {
  try {
    const authHeader = request.headers.get('cookie');
    const token = authHeader?.split('auth-token=')[1]?.split(';')[0];
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await verifyToken(token);
    
    if (!payload || payload.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const clientId = parseInt(params.id, 10);
    if (!clientId) {
      return NextResponse.json({ error: 'Invalid client ID' }, { status: 400 });
    }

    // Find the client user first to get their email
    const userToDelete = await prisma.user.findUnique({
      where: { id: clientId }
    });

    if (!userToDelete) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    // Don't allow deleting SUPER_ADMIN users
    if (userToDelete.role === 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Cannot delete Super Admin account' }, { status: 400 });
    }

    // Delete associated payment request if exists
    if (userToDelete.email) {
      await prisma.paymentRequest.deleteMany({
        where: { email: userToDelete.email }
      }).catch(() => {});
    }

    // Delete user (Prisma cascade will delete settings, customers, orders, measurements)
    await prisma.user.delete({
      where: { id: clientId }
    });

    return NextResponse.json({ success: true, message: 'Client account deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Delete client error:', error);
    return NextResponse.json({ error: 'Failed to delete client account' }, { status: 500 });
  }
}
