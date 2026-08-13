import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// This endpoint is called by Vercel Cron to keep the Supabase DB from sleeping
export async function GET() {
  try {
    // Lightweight query — just check if the DB is alive
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ status: 'alive', timestamp: new Date().toISOString() });
  } catch (error) {
    console.error('Keep-alive ping failed:', error);
    return NextResponse.json({ status: 'error', error: error.message }, { status: 500 });
  }
}
