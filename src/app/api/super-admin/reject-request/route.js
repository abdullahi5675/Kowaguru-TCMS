import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export async function POST(request) {
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

    const { requestId } = await request.json();
    const parsedId = parseInt(requestId, 10);

    if (!parsedId) {
      return NextResponse.json({ error: 'Missing or invalid request ID' }, { status: 400 });
    }

    await prisma.paymentRequest.update({
      where: { id: parsedId },
      data: { status: 'REJECTED' }
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Reject request error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
