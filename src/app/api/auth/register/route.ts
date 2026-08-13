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
    
    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    });

    if (existingUser) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
    }

    // Create User and Profile in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email: normalizedEmail,
          passwordHash: hashPassword(password),
          name,
          role: role || 'BUYER',
          isEmailVerified: true
        }
      });

      let makerProfile = null;
      let inspectorProfile = null;

      if (role === 'MAKER') {
        // Find or create a country location to assign
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

        makerProfile = await tx.makerProfile.create({
          data: {
            userId: newUser.id,
            businessName: businessName || `${name}'s Atelier`,
            locationId: countryLoc.id,
            verificationStatus: 'GENERAL',
            yearsInBusiness: Number(yearsInBusiness) || 1,
            employeeCount: Number(employeeCount) || 1,
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
      name: result.user.name,
      role: result.user.role,
    });

    return response;

  } catch (error: any) {
    console.error('Registration error:', error?.message || error);
    return NextResponse.json({ error: error?.message || 'Failed to create user account' }, { status: 500 });
  }
}
