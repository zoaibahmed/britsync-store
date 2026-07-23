import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { logAdminAction } from '@/lib/services/admin.service';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/users
 * Returns list of all users with their roles and profiles.
 * Enforces admin role check.
 */
export async function GET() {
  try {
    const session = await getSession();
    if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const users = await prisma.user.findMany({
      include: {
        roleLookup: true,
        makerProfile: { include: { location: { include: { translations: true } } } },
        inspectorProfile: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const mapped = users.map((u) => ({
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role,
      isEmailVerified: u.isEmailVerified,
      createdAt: u.createdAt,
      makerProfile: u.makerProfile
        ? {
            id: u.makerProfile.id,
            businessName: u.makerProfile.businessName,
            verificationStatus: u.makerProfile.verificationStatus,
            location: u.makerProfile.location?.translations?.find((t) => t.languageCode === 'en')?.name || 'Global',
          }
        : null,
      inspectorProfile: u.inspectorProfile
        ? {
            id: u.inspectorProfile.id,
            regionScope: u.inspectorProfile.regionScope,
            isActive: u.inspectorProfile.isActive,
          }
        : null,
    }));

    return NextResponse.json(mapped);
  } catch (error) {
    console.error('Failed to get admin users:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * PUT /api/admin/users
 * Allows updating a user's role or inspector's regionScope.
 */
export async function PUT(request: Request) {
  try {
    const session = await getSession();
    if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { userId, role, inspectorRegion, isEmailVerified } = await request.json();
    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      include: { inspectorProfile: true },
    });

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const beforeState = { role: targetUser.role, isEmailVerified: targetUser.isEmailVerified };

    const updated = await prisma.$transaction(async (tx) => {
      const data: any = {};
      if (role) data.role = role;
      if (typeof isEmailVerified === 'boolean') data.isEmailVerified = isEmailVerified;

      const user = await tx.user.update({
        where: { id: userId },
        data,
      });

      if (role === 'INSPECTOR' && inspectorRegion) {
        await tx.inspectorProfile.upsert({
          where: { userId },
          create: { userId, regionScope: inspectorRegion, isActive: true },
          update: { regionScope: inspectorRegion, isActive: true },
        });
      }

      return user;
    });

    await logAdminAction({
      adminUserId: session.userId,
      action: 'UPDATE_USER_ROLE',
      tableName: 'User',
      recordId: userId,
      beforeState,
      afterState: { role: updated.role, isEmailVerified: updated.isEmailVerified },
    });

    return NextResponse.json({ success: true, user: updated });
  } catch (error) {
    console.error('Failed to update user:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
