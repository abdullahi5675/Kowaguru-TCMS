import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { signToken } from '@/lib/auth';

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Missing email or password' }, { status: 400 });
    }

    // Find user safely (with fallback if schema migration is pending)
    let user;
    try {
      user = await prisma.user.findUnique({
        where: { email }
      });
    } catch (dbErr) {
      console.warn('Prisma query fallback for login:', dbErr?.message);
      user = await prisma.user.findFirst({
        where: { email },
        select: {
          id: true,
          email: true,
          password: true,
          name: true,
          shopName: true,
          role: true,
        }
      });
    }

    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Block deleted/deactivated accounts from logging in
    if (user?.isDeleted === true) {
      return NextResponse.json({ error: 'Your account has been deactivated. Please contact support to restore access.' }, { status: 403 });
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Sign JWT
    const token = await signToken({ userId: user.id, email: user.email, role: user.role });

    // Set cookie
    const response = NextResponse.json({ success: true, user: { id: user.id, name: user.name, email: user.email, role: user.role } }, { status: 200 });
    response.cookies.set({
      name: 'auth-token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
