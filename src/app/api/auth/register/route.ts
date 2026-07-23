import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { setSessionCookie } from '@/lib/session';
import { hashPassword } from '@/lib/crypto';

export async function POST(request: Request) {
  try {
    const { 
      email, 
      password, 
      name, 
      role, 
      businessName, 
      country, 
      phone 
    } = await request.json();

    if (!email || !password || !name) {
      return NextResponse.json({ error: 'Name, email, and password are required' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();
    
    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    });

    if (existingUser) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
    }

    // Create User and potential Profile in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email: normalizedEmail,
          passwordHash: hashPassword(password),
          name,
          role: role || 'BUYER'
        }
      });

      let makerProfile = null;
      let inspectorProfile = null;

      if (role === 'MAKER') {
        // Find a country location to assign
        const countryLoc = await tx.location.findFirst({
          where: { locationType: 'COUNTRY' }
        });

        makerProfile = await tx.makerProfile.create({
          data: {
            userId: newUser.id,
            businessName: businessName || `${name}'s Atelier`,
            locationId: countryLoc?.id || '',
            verificationStatus: 'GENERAL',
            yearsInBusiness: 1,
            employeeCount: 1
          }
        });

        // Initialize Wallet for Maker
        await tx.wallet.create({
          data: {
            makerProfileId: makerProfile.id,
            clearedBalance: 0.00
          }
        });
      } else if (role === 'INSPECTOR') {
        inspectorProfile = await tx.inspectorProfile.create({
          data: {
            userId: newUser.id,
            regionScope: country || 'Global region'
          }
        });
      }

      return {
        user: newUser,
        makerProfile,
        inspectorProfile
      };
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
        role: result.user.role,
        makerProfile: result.makerProfile,
        inspectorProfile: result.inspectorProfile
      }
    });

    await setSessionCookie(response, {
      userId: result.user.id,
      email: result.user.email,
      role: result.user.role,
      name: result.user.name
    });

    return response;
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }
}
