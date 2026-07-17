import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    let settings = await prisma.settings.findUnique({
      where: { id: 1 },
    });

    if (!settings) {
      settings = await prisma.settings.create({
        data: {
          id: 1,
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
    const data = await request.json();
    
    // We only ever update the single settings row with ID 1
    const settings = await prisma.settings.upsert({
      where: { id: 1 },
      update: {
        businessName: data.businessName,
        businessLogo: data.businessLogo,
        businessAddress: data.businessAddress,
        phone: data.phone,
        receiptFooter: data.receiptFooter,
        measurementUnit: data.measurementUnit,
      },
      create: {
        id: 1,
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
