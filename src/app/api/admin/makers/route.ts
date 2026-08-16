import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const makers = await (prisma as any).makerProfile.findMany({
      include: {
        user: { select: { name: true, email: true, isEmailVerified: true, createdAt: true } },
        location: { include: { translations: true } },
        products: { where: { deletedAt: null }, select: { id: true } },
        wallet: { select: { clearedBalance: true, payoutHeldBalance: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const mappedMakers = makers.map((m: any) => ({
      id: m.id,
      userId: m.userId,
      businessName: m.businessName,
      founderName: m.founderName || m.user?.name || 'Master Artisan',
      email: m.user?.email || 'N/A',
      verificationStatus: m.verificationStatus,
      craftCategory: m.craftCategory || null,
      yearsInBusiness: m.yearsInBusiness,
      employeeCount: m.employeeCount,
      country: m.location?.translations?.find((t: any) => t.languageCode === 'en')?.name || 'Global',
      createdAt: m.createdAt?.toISOString() || null,
      submittedAt: m.submittedAt?.toISOString() || null,
      accreditationStep: m.accreditationStep || 0,
      productCount: m.products?.length || 0,
      clearedBalance: m.wallet?.clearedBalance || 0,
      escrowBalance: m.wallet?.payoutHeldBalance || 0,
      isEmailVerified: m.user?.isEmailVerified || false,
    }));

    return NextResponse.json({
      success: true,
      makers: mappedMakers,
    });
  } catch (error) {
    console.error('Fetch Admin Makers Error:', error);
    return NextResponse.json({ error: 'Failed to fetch maker registrations' }, { status: 500 });
  }
}
