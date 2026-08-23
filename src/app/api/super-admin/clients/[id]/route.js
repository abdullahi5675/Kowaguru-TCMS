import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

async function getAdminPayload(request) {
  const authHeader = request.headers.get('cookie');
  const token = authHeader?.split('auth-token=')[1]?.split(';')[0];
  if (!token) return null;
  const payload = await verifyToken(token);
  if (!payload || payload.role !== 'SUPER_ADMIN') return null;
  return payload;
}

// SOFT DELETE — marks account as deleted, blocks login, data stays in DB
export async function DELETE(request, { params }) {
  try {
    const payload = await getAdminPayload(request);
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const clientId = parseInt(resolvedParams?.id, 10);
    if (!clientId || isNaN(clientId)) {
      return NextResponse.json({ error: 'Invalid client ID' }, { status: 400 });
    }

    const userToDelete = await prisma.user.findUnique({
      where: { id: clientId }
    });

    if (!userToDelete) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    if (userToDelete.role === 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Cannot delete Super Admin account' }, { status: 400 });
    }

    if (userToDelete.isDeleted) {
      return NextResponse.json({ error: 'Account is already deactivated' }, { status: 400 });
    }

    // Soft delete — mark as deleted, block login, keep all data in DB
    await prisma.user.update({
      where: { id: clientId },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Account deactivated. Data is kept for 30 days before permanent deletion.'
    }, { status: 200 });

  } catch (error) {
    console.error('Soft delete error:', error);
    return NextResponse.json({ error: 'Failed to deactivate client account' }, { status: 500 });
  }
}

// PERMANENT DELETE — erases account and all data forever
export async function PATCH(request, { params }) {
  try {
    const payload = await getAdminPayload(request);
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const clientId = parseInt(resolvedParams?.id, 10);
    if (!clientId || isNaN(clientId)) {
      return NextResponse.json({ error: 'Invalid client ID' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: clientId } });
    if (!user) return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    if (user.role === 'SUPER_ADMIN') return NextResponse.json({ error: 'Cannot delete Super Admin' }, { status: 400 });

    // Permanently delete payment request if exists
    if (user.email) {
      await prisma.paymentRequest.deleteMany({ where: { email: user.email } }).catch(() => {});
    }

    // Permanently delete user (cascades to customers, orders, measurements)
    await prisma.user.delete({ where: { id: clientId } });

    return NextResponse.json({ success: true, message: 'Account permanently deleted.' }, { status: 200 });
  } catch (error) {
    console.error('Permanent delete error:', error);
    return NextResponse.json({ error: 'Failed to permanently delete client' }, { status: 500 });
  }
}
