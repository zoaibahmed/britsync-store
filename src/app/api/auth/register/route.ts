import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { setSessionCookie } from '@/lib/session';
import { hashPassword } from '@/lib/crypto';
import nodemailer from 'nodemailer';

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sendOtpEmail(email: string, name: string, otp: string) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  await transporter.sendMail({
    from: `"BritSync Guild Secretariat" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: 'Your BritSync Studio Registration Code',
    html: `
      <div style="font-family: Georgia, serif; max-width: 520px; margin: 0 auto; background: #0a0a0a; color: #f5f0e8; padding: 40px; border: 1px solid #c9a84c;">
        <div style="text-align: center; margin-bottom: 32px;">
          <p style="color: #c9a84c; font-size: 11px; letter-spacing: 4px; text-transform: uppercase; margin: 0;">BritSync Managed Commerce</p>
          <h1 style="color: #f5f0e8; font-size: 22px; font-weight: 400; margin: 12px 0 0;">Guild Secretariat</h1>
        </div>
        <p style="color: #c8bfa8; line-height: 1.7; margin-bottom: 24px;">Dear ${name},</p>
        <p style="color: #c8bfa8; line-height: 1.7; margin-bottom: 32px;">
          Your studio registration has been received by the BritSync Guild Secretariat. 
          Please verify your identity using the following code:
        </p>
        <div style="text-align: center; background: #111; border: 1px solid #c9a84c; padding: 28px; margin: 0 auto 32px; letter-spacing: 12px;">
          <span style="font-size: 38px; font-weight: 700; color: #c9a84c; font-family: monospace;">${otp}</span>
        </div>
        <p style="color: #8a8070; font-size: 12px; line-height: 1.6;">
          This code expires in 15 minutes. Do not share it with anyone. 
          If you did not register with BritSync, please disregard this message.
        </p>
        <hr style="border: none; border-top: 1px solid #2a2520; margin: 32px 0;" />
        <p style="color: #5a5040; font-size: 11px; text-align: center;">BritSync Guild Secretariat · britsyncuk@gmail.com</p>
      </div>
    `,
  });
}

export async function POST(request: Request) {
  try {
    const {
      email,
      password,
      name,
      role,
      businessName,
      country,
      phone,
      craftType,
      yearsInBusiness,
      employeeCount,
      shortIntro
    } = await request.json();

    if (!email || !password || !name) {
      return NextResponse.json({ error: 'Name, email, and password are required' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    });

    if (existingUser) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
    }

    const otp = generateOtp();
    const otpExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    const { user: newUser, makerProfile } = await (prisma as any).$transaction(async (tx: any) => {
      const createdUser = await tx.user.create({
        data: {
          email: normalizedEmail,
          passwordHash: hashPassword(password),
          name,
          role: role || 'BUYER',
          isEmailVerified: true,
          verificationToken: null,
        }
      });

      let createdMakerProfile = null;

      if (role === 'MAKER') {
        let countryLoc = await tx.location.findFirst({
          where: { locationType: 'COUNTRY' }
        });

        if (!countryLoc) {
          countryLoc = await tx.location.create({
            data: {
              locationType: 'COUNTRY',
              path: `globe.europe.${(country || 'uk').toLowerCase().replace(/\s+/g, '')}`,
            }
          });
        }

        createdMakerProfile = await tx.makerProfile.create({
          data: {
            userId: createdUser.id,
            businessName: businessName || `${name}'s Atelier`,
            locationId: countryLoc.id,
            verificationStatus: 'GENERAL',
            yearsInBusiness: Number(yearsInBusiness) || 1,
            employeeCount: Number(employeeCount) || 1,
            accreditationStep: 0,
          }
        });

        await tx.wallet.create({
          data: {
            makerProfileId: createdMakerProfile.id,
            clearedBalance: 0.00,
            payoutHeldBalance: 0.00,
          }
        });
      }

      return { user: createdUser, makerProfile: createdMakerProfile };
    });

    const response = NextResponse.json({
      success: true,
      requiresOtp: false,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        makerProfile,
      },
      message: 'Account created and verified successfully.',
    });

    await setSessionCookie(response, {
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role,
      name: newUser.name,
    });

    return response;

  } catch (error: any) {
    console.error('Registration error:', error?.message || error);
    return NextResponse.json({ error: error?.message || 'Failed to create user account' }, { status: 500 });
  }
}
