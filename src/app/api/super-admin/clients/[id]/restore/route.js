import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

// RESTORE — reactivates a soft-deleted account
export async function POST(request, { params }) {
  try {
    const authHeader = request.headers.get('cookie');
    const token = authHeader?.split('auth-token=')[1]?.split(';')[0];
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = await verifyToken(token);
    if (!payload || payload.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const resolvedParams = await params;
    const clientId = parseInt(resolvedParams?.id, 10);
    if (!clientId || isNaN(clientId)) {
      return NextResponse.json({ error: 'Invalid client ID' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: clientId } });
    if (!user) return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    if (!user.isDeleted) return NextResponse.json({ error: 'Account is already active' }, { status: 400 });

    // Restore — clear the soft delete flags
    await prisma.user.update({
      where: { id: clientId },
      data: {
        isDeleted: false,
        deletedAt: null,
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Account restored successfully. Client can now log in again.'
    }, { status: 200 });

  } catch (error) {
    console.error('Restore error:', error);
    return NextResponse.json({ error: 'Failed to restore client account' }, { status: 500 });
  }
}
