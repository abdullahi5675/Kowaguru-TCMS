import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';

export const runtime = 'nodejs';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: true,
  auth: {
    user: process.env.SMTP_USER || 'kowaguru.info@gmail.com',
    pass: process.env.SMTP_PASS || 'manx heps arcm clcy',
  },
});

export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Please enter your email address' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();

    // 1. Find user in database
    const user = await prisma.user.findUnique({
      where: { email: cleanEmail }
    });

    if (!user) {
      return NextResponse.json({ error: 'No account found with this email address.' }, { status: 44 });
    }

    if (user.isDeleted) {
      return NextResponse.json({ error: 'Your account has been deactivated. Please contact support.' }, { status: 403 });
    }

    // 2. Generate random 8-character temporary password
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$";
    let temporaryPassword = "";
    for (let i = 0; i < 8; i++) {
      temporaryPassword += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    // 3. Hash the new password and update in database
    const hashedPassword = await bcrypt.hash(temporaryPassword, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword }
    });

    // 4. Send email with new password
    try {
      await transporter.sendMail({
        from: `"Kowaguru TCMS" <${process.env.SMTP_USER || 'kowaguru.info@gmail.com'}>`,
        to: user.email,
        subject: 'Password Reset - Kowaguru TCMS',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
            <div style="background-color: #b91c1c; padding: 24px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px;">Kowaguru TCMS</h1>
              <p style="color: #fca5a5; margin: 5px 0 0 0; font-size: 14px;">Password Reset Request</p>
            </div>
            <div style="padding: 24px; background-color: #ffffff;">
              <p style="font-size: 16px; color: #374151; margin-top: 0;">Hello <strong>${user.name || 'Tailor'}</strong>,</p>
              <p style="font-size: 15px; color: #4b5563; line-height: 1.5;">
                We received a request to reset your password for your Kowaguru TCMS account. A new temporary password has been generated for you below:
              </p>
              
              <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; border: 1px solid #fecaca; margin: 20px 0; text-align: center;">
                <p style="margin: 0 0 8px 0; font-size: 13px; color: #991b1b; font-weight: bold; uppercase; tracking-wider;">Your Temporary Password</p>
                <div style="font-family: monospace; font-size: 26px; font-weight: bold; color: #b91c1c; letter-spacing: 2px;">
                  ${temporaryPassword}
                </div>
              </div>

              <div style="background-color: #f9fafb; padding: 16px; border-radius: 8px; border: 1px solid #e5e7eb; margin-bottom: 24px;">
                <h4 style="margin: 0 0 8px 0; color: #111827; font-size: 14px;">🔒 Important Security Steps:</h4>
                <ol style="margin: 0; padding-left: 20px; color: #4b5563; font-size: 14px; line-height: 1.6;">
                  <li>Copy your temporary password above.</li>
                  <li>Log in at <a href="https://tcms.kowagurutech.ng/auth/login" style="color: #b91c1c; font-weight: bold;">tcms.kowagurutech.ng</a> using this temporary password.</li>
                  <li>Go to <strong>Settings</strong> or <strong>Profile</strong> to change it to your own custom password.</li>
                </ol>
              </div>

              <div style="text-align: center; margin-top: 28px;">
                <a href="https://tcms.kowagurutech.ng/auth/login" style="background-color: #b91c1c; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 15px;">Log In Now</a>
              </div>
            </div>
            <div style="background-color: #f3f4f6; padding: 16px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; font-size: 12px; color: #6b7280;">If you did not request this password reset, please contact support immediately at 08023603283.</p>
            </div>
          </div>
        `,
      });
    } catch (emailError) {
      console.error('Failed to send reset email:', emailError);
      return NextResponse.json({ error: 'Failed to send email. Please check your internet connection or try again.' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'A new temporary password has been sent to your email address.'
    }, { status: 200 });

  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ error: 'An error occurred. Please try again later.' }, { status: 500 });
  }
}
