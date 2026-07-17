import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request) {
  try {
    const userId = parseInt(request.headers.get('x-user-id'), 10);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    let settings = await prisma.settings.findUnique({
      where: { userId },
    });

    if (!settings) {
      settings = await prisma.settings.create({
        data: {
          userId,
          businessName: "Kowaguru TCMS",
          receiptFooter: "Thank you for your patronage!",
          measurementUnit: "inches"
        },
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings. Ensure database is running and migrated.' },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const userId = parseInt(request.headers.get('x-user-id'), 10);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const data = await request.json();
    
    // We update or create settings specifically for this user
    const settings = await prisma.settings.upsert({
      where: { userId },
      update: {
        businessName: data.businessName,
        businessLogo: data.businessLogo,
        businessAddress: data.businessAddress,
        phone: data.phone,
        receiptFooter: data.receiptFooter,
        measurementUnit: data.measurementUnit,
      },
      create: {
        userId,
        businessName: data.businessName || "Kowaguru TCMS",
        businessLogo: data.businessLogo,
        businessAddress: data.businessAddress,
        phone: data.phone,
        receiptFooter: data.receiptFooter || "Thank you for your patronage!",
        measurementUnit: data.measurementUnit || "inches",
      },
    });

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json({ error: 'Failed to update settings.' }, { status: 500 });
  }
}
