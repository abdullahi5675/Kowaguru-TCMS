import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
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

    const { name, shopName, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const client = await prisma.user.create({
      data: {
        name,
        shopName,
        email,
        password: hashedPassword,
        role: 'USER',
        settings: {
          create: {
            businessName: shopName || 'My Tailoring Shop',
            businessAddress: '',
            phone: '',
            receiptFooter: 'Thank you for your patronage!',
            measurementUnit: 'inches',
          }
        }
      },
      include: {
        customers: true,
        orders: true,
      }
    });

    // Remove password from response
    const { password: _, ...clientWithoutPassword } = client;

    return NextResponse.json({ client: clientWithoutPassword }, { status: 201 });
  } catch (error) {
    console.error('Create client error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
