import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function GET(request) {
  try {
    const email = 'kowaguru.info@gmail.com';
    const password = 'Abdullahi20@';
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Find existing super admin
    const admins = await prisma.user.findMany({ where: { role: 'SUPER_ADMIN' } });
    
    if (admins.length > 0) {
      const admin = admins[0];
      await prisma.user.update({
        where: { id: admin.id },
        data: {
          email: email,
          password: hashedPassword
        }
      });
      return NextResponse.json({ message: `Updated existing SUPER_ADMIN to use email: ${email}` });
    } else {
      await prisma.user.create({
        data: {
          name: 'Super Admin',
          shopName: 'Kowaguru Tech',
          email: email,
          password: hashedPassword,
          role: 'SUPER_ADMIN',
          settings: {
            create: {
              businessName: 'Kowaguru TCMS Admin',
              businessAddress: '',
              phone: '07047495488',
              receiptFooter: '',
              measurementUnit: 'inches',
            }
          }
        }
      });
      return NextResponse.json({ message: `Created new SUPER_ADMIN with email: ${email}` });
    }
  } catch (error) {
    console.error('Setup error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
