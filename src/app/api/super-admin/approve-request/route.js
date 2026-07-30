import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { verifyToken } from '@/lib/auth';
import nodemailer from 'nodemailer';

// Email transporter setup
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

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

    if (!requestId) {
      return NextResponse.json({ error: 'Missing request ID' }, { status: 400 });
    }

    const paymentRequest = await prisma.paymentRequest.findUnique({
      where: { id: requestId }
    });

    if (!paymentRequest || paymentRequest.status !== 'PENDING') {
      return NextResponse.json({ error: 'Request not found or already processed' }, { status: 404 });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email: paymentRequest.email } });
    if (existingUser) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 400 });
    }

    // Generate random 8-character password
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$";
    let generatedPassword = "";
    for (let i = 0; i < 8; i++) {
      generatedPassword += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    const hashedPassword = await bcrypt.hash(generatedPassword, 10);

    // Create the user
    const client = await prisma.user.create({
      data: {
        name: paymentRequest.shopName + " Owner", // Placeholder name
        shopName: paymentRequest.shopName,
        email: paymentRequest.email,
        password: hashedPassword,
        role: 'USER',
        settings: {
          create: {
            businessName: paymentRequest.shopName || 'My Tailoring Shop',
            businessAddress: '',
            phone: '',
            receiptFooter: 'Thank you for your patronage!',
            measurementUnit: 'inches',
          }
        }
      }
    });

    // Mark request as APPROVED
    await prisma.paymentRequest.update({
      where: { id: requestId },
      data: { status: 'APPROVED' }
    });

    // Send Welcome Email
    try {
      await transporter.sendMail({
        from: `"Kowaguru TCMS" <${process.env.SMTP_USER}>`,
        to: paymentRequest.email,
        subject: 'Welcome to Kowaguru TCMS - Your Login Details',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
            <div style="background-color: #b91c1c; padding: 20px; text-align: center;">
              <h1 style="color: white; margin: 0;">Welcome to Kowaguru TCMS!</h1>
            </div>
            <div style="padding: 20px; background-color: #f9fafb;">
              <p style="font-size: 16px; color: #374151;">Hello,</p>
              <p style="font-size: 16px; color: #374151;">Your payment for Kowaguru TCMS has been successfully verified! Your account is now active.</p>
              
              <div style="background-color: white; padding: 15px; border-radius: 6px; border: 1px solid #e5e7eb; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #111827;">Your Login Credentials:</h3>
                <p style="margin: 5px 0;"><strong>Email:</strong> ${paymentRequest.email}</p>
                <p style="margin: 5px 0;"><strong>Password:</strong> <span style="background-color: #fef3c7; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 16px;">${generatedPassword}</span></p>
              </div>

              <p style="font-size: 16px; color: #374151; font-weight: bold;">Important Next Steps:</p>
              <ol style="color: #374151;">
                <li>Log in to the system at <a href="https://kowaguru-tcms.vercel.app">kowaguru-tcms.vercel.app</a></li>
                <li>Go to <strong>Settings</strong> to update your Shop Name, Address, and Phone Number.</li>
                <li>Go to your <strong>Profile</strong> (top right menu) to change this temporary password to a secure one of your choice.</li>
              </ol>

              <div style="text-align: center; margin-top: 30px;">
                <a href="https://kowaguru-tcms.vercel.app/auth/login" style="background-color: #b91c1c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Login Now</a>
              </div>
            </div>
            <div style="background-color: #f3f4f6; padding: 15px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; font-size: 12px; color: #6b7280;">If you have any questions, reply to this email or call 07047495488.</p>
            </div>
          </div>
        `,
      });
    } catch (emailError) {
      console.error('Failed to send email, but user was created:', emailError);
      // We don't fail the API if email fails, because the user is already created,
      // but we could notify the frontend that email failed.
      return NextResponse.json({ 
        success: true, 
        message: 'Account created, but failed to send email. Password is: ' + generatedPassword 
      }, { status: 200 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Approve request error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
