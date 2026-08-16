import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { setSessionCookie } from '@/lib/session';
import { verifyOtp as verifyOtpStore } from '@/lib/otpStore';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, otp, code } = body;
    const otpValue = (otp || code || '').toString().trim();

    if (!email || !otpValue) {
      return NextResponse.json({ error: 'Email and verification code are required' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: { makerProfile: true }
    });

    let isCodeValid = false;

    // 1. Check DB verificationToken if user exists
    if (user && user.verificationToken) {
      const [storedOtp, expiryStr] = user.verificationToken.split(':');
      const expiry = parseInt(expiryStr, 10);
      if (Date.now() <= expiry && storedOtp === otpValue) {
        isCodeValid = true;
      }
    }

    // 2. Check otpStore file fallback
    if (!isCodeValid) {
      isCodeValid = verifyOtpStore(normalizedEmail, otpValue);
    }

    if (!isCodeValid) {
      return NextResponse.json({ error: 'Invalid or expired verification code.' }, { status: 401 });
    }

    // If user already exists in DB, mark them verified and issue session cookie
    if (user) {
      if (!user.isEmailVerified) {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            isEmailVerified: true,
            verificationToken: null,
          }
        });
      }

      const response = NextResponse.json({
        success: true,
        message: 'Email verified successfully',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          makerProfile: user.makerProfile,
        }
      });

      await setSessionCookie(response, {
        userId: user.id,
        email: user.email,
        role: user.role,
        name: user.name
      });

      return response;
    }

    // If user record doesn't exist yet (pre-registration verification), return success
    return NextResponse.json({
      success: true,
      message: 'Verification code confirmed successfully',
    });

  } catch (error) {
    console.error('OTP verification error:', error);
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  }
}
