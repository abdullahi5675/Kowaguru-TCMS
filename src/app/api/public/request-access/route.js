import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import prisma from '@/lib/prisma';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
// Use the service role key to bypass RLS since this is a public unauthenticated route
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const shopName = formData.get('shopName');
    const email = formData.get('email');
    const state = formData.get('state');

    if (!file || !shopName || !email || !state) {
      return NextResponse.json({ error: 'Missing required fields or file.' }, { status: 400 });
    }

    // Check if email already requested or exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: 'An account with this email already exists.' }, { status: 400 });
    }
    
    const existingRequest = await prisma.paymentRequest.findUnique({ where: { email } });
    if (existingRequest && existingRequest.status === 'PENDING') {
      return NextResponse.json({ error: 'You already have a pending request. Please wait for approval.' }, { status: 400 });
    }

    // Upload receipt to Supabase Storage
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filename = `receipts/${uniqueSuffix}-${sanitizedFilename}`;

    const { data, error: uploadError } = await supabase.storage
      .from('uploads')
      .upload(filename, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Supabase upload error:', uploadError);
      return NextResponse.json({ error: 'Failed to upload receipt image.' }, { status: 500 });
    }

    const { data: urlData } = supabase.storage
      .from('uploads')
      .getPublicUrl(filename);
      
    const receiptUrl = urlData.publicUrl;

    // Save to database
    const paymentRequest = await prisma.paymentRequest.create({
      data: {
        shopName,
        email,
        state,
        receiptUrl,
        status: 'PENDING'
      }
    });

    return NextResponse.json({ 
      success: true, 
      request: paymentRequest
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error creating payment request:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
