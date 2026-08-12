import { NextResponse } from 'next/server';
import { verifyOtp } from '@/lib/otpStore';

export async function POST(request: Request) {
  try {
    const { email, code } = await request.json();

    if (!email || !code) {
      return NextResponse.json({ error: 'Email and OTP code are required.' }, { status: 400 });
    }

    const isValid = verifyOtp(email, code);

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid or expired verification code. Please check your email or request a new code.' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'Email address successfully verified.',
    });
  } catch (error) {
    console.error('Verify OTP Error:', error);
    return NextResponse.json({ error: 'Failed to verify code.' }, { status: 500 });
  }
}
