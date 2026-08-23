import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

// GET — download full backup of ALL active clients as JSON
export async function GET(request) {
  try {
    const authHeader = request.headers.get('cookie');
    const token = authHeader?.split('auth-token=')[1]?.split(';')[0];
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = await verifyToken(token);
    if (!payload || payload.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Fetch all active clients with full data
    const clients = await prisma.user.findMany({
      where: { role: 'USER', isDeleted: false },
      include: {
        customers: {
          include: {
            measurements: true,
            orders: true,
          }
        },
        orders: true,
        settings: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    // Strip passwords from backup
    const safeClients = clients.map(({ password, ...rest }) => rest);

    const backup = {
      exportedAt: new Date().toISOString(),
      totalClients: safeClients.length,
      system: 'KowaGuru TCMS',
      clients: safeClients,
    };

    const json = JSON.stringify(backup, null, 2);

    return new NextResponse(json, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="kowaguru-backup-${new Date().toISOString().split('T')[0]}.json"`,
      },
    });
  } catch (error) {
    console.error('Backup error:', error);
    return NextResponse.json({ error: 'Failed to generate backup' }, { status: 500 });
  }
}
