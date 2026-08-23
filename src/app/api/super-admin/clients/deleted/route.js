import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

// GET all soft-deleted clients
export async function GET(request) {
  try {
    const authHeader = request.headers.get('cookie');
    const token = authHeader?.split('auth-token=')[1]?.split(';')[0];
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = await verifyToken(token);
    if (!payload || payload.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const deletedClients = await prisma.user.findMany({
      where: { isDeleted: true, role: 'USER' },
      include: { customers: true, orders: true },
      orderBy: { deletedAt: 'desc' },
    });

    return NextResponse.json({ clients: deletedClients }, { status: 200 });
  } catch (error) {
    console.error('Fetch deleted clients error:', error);
    return NextResponse.json({ error: 'Failed to fetch deleted clients' }, { status: 500 });
  }
}
