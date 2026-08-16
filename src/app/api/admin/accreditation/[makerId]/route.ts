import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export const dynamic = 'force-dynamic';

// GET /api/admin/accreditation/[makerId] — Full studio audit profile for CEO review
export async function GET(
  request: Request,
  { params }: { params: { makerId: string } }
) {
  try {
    const session = await getSession();
    if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const maker = await prisma.makerProfile.findUnique({
      where: { id: params.makerId },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            isEmailVerified: true,
            createdAt: true,
            role: true,
          }
        },
        location: { include: { translations: true } },
        accreditationLogs: {
          orderBy: { createdAt: 'desc' },
        },
        products: {
          where: { deletedAt: null },
          include: {
            translations: { where: { languageCode: 'en' } },
          }
        },
        wallet: true,
      }
    });

    if (!maker) {
      return NextResponse.json({ error: 'Maker not found' }, { status: 404 });
    }

    const countryName = maker.location?.translations?.find((t: any) => t.languageCode === 'en')?.name || 'Global';

    return NextResponse.json({
      success: true,
      maker: {
        id: maker.id,
        userId: maker.userId,
        // Identity
        businessName: maker.businessName,
        founderName: maker.founderName || maker.user?.name,
        email: maker.user?.email,
        country: countryName,
        craftCategory: maker.craftCategory,
        yearsInBusiness: maker.yearsInBusiness,
        employeeCount: maker.employeeCount,
        // Heritage
        heritageOriginStory: maker.heritageOriginStory,
        founderBiography: maker.founderBiography,
        craftTools: maker.craftTools,
        craftTechniques: maker.craftTechniques,
        craftPhilosophy: maker.craftPhilosophy,
        // Media
        coverImageUrl: maker.coverImageUrl,
        founderPhotoUrl: maker.founderPhotoUrl,
        workshopPhoto1: maker.workshopPhoto1,
        workshopPhoto2: maker.workshopPhoto2,
        workshopPhoto3: maker.workshopPhoto3,
        // Payout (admin-only)
        payoutMethod: maker.payoutMethod,
        payoutAccountDetails: maker.payoutAccountDetails, // shown only to admin
        // Status
        verificationStatus: maker.verificationStatus,
        accreditationStep: maker.accreditationStep,
        submittedAt: maker.submittedAt,
        revisionNote: maker.revisionNote,
        // Audit history
        auditLog: maker.accreditationLogs,
        // Products
        productCount: maker.products.length,
        products: maker.products.map((p: any) => ({
          id: p.id,
          name: p.translations?.[0]?.name || 'Untitled',
          status: p.status,
          desiredPrice: p.desiredPrice,
        })),
        // Wallet
        clearedBalance: maker.wallet?.clearedBalance || 0,
        escrowBalance: maker.wallet?.payoutHeldBalance || 0,
        // User metadata
        registeredAt: maker.user?.createdAt,
        isEmailVerified: maker.user?.isEmailVerified,
      }
    });
  } catch (error) {
    console.error('Admin accreditation GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch maker audit profile' }, { status: 500 });
  }
}

// POST /api/admin/accreditation/[makerId] — CEO accreditation action
export async function POST(
  request: Request,
  { params }: { params: { makerId: string } }
) {
  try {
    const session = await getSession();
    if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { action, reason, internalNote } = body;

    const validActions = ['APPROVE_GUILD', 'GRANT_ROYAL_CHARTER', 'REQUEST_REVISION', 'REJECT', 'SET_UNDER_REVIEW'];
    if (!validActions.includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const maker = await (prisma as any).makerProfile.findUnique({
      where: { id: params.makerId },
      include: { user: { select: { id: true, name: true } } }
    });

    if (!maker) {
      return NextResponse.json({ error: 'Maker not found' }, { status: 404 });
    }

    const previousStatus = maker.verificationStatus;
    let newStatus = previousStatus;
    let notificationTitle = '';
    let notificationMessage = '';

    switch (action) {
      case 'SET_UNDER_REVIEW':
        newStatus = 'UNDER_REVIEW';
        notificationTitle = '🔍 Application Under Review';
        notificationMessage = 'The BritSync Guild Secretariat has commenced review of your studio application.';
        break;

      case 'APPROVE_GUILD':
        newStatus = 'GUILD_VERIFIED';
        notificationTitle = '✅ Guild Verified — Welcome to BritSync';
        notificationMessage = `Congratulations! Your studio has been approved as a Guild Verified artisan. Your full Maker Command Center is now unlocked.`;
        break;

      case 'GRANT_ROYAL_CHARTER':
        newStatus = 'ROYAL_CHARTER';
        notificationTitle = '👑 Royal Charter Granted';
        notificationMessage = `Your studio has been awarded the Royal Charter — the highest distinction on BritSync. Your commission rate is now 12.5% and all Royal Charter privileges are active.`;
        break;

      case 'REQUEST_REVISION':
        if (!reason) {
          return NextResponse.json({ error: 'A revision reason is required' }, { status: 400 });
        }
        newStatus = 'REVISION_REQUIRED';
        notificationTitle = '📝 Revision Required';
        notificationMessage = `The Guild Secretariat requires additional information: "${reason}"`;
        break;

      case 'REJECT':
        newStatus = 'REJECTED';
        notificationTitle = '❌ Application Not Approved';
        notificationMessage = reason
          ? `Your application was not approved: ${reason}`
          : 'Your studio accreditation application was not approved at this time.';
        break;
    }

    // Update maker status
    await (prisma as any).makerProfile.update({
      where: { id: params.makerId },
      data: {
        verificationStatus: newStatus,
        revisionNote: action === 'REQUEST_REVISION' ? reason : null,
        // Reset step for revision so maker can re-edit
        accreditationStep: action === 'REQUEST_REVISION' ? 4 : maker.accreditationStep,
      }
    });

    // Log the audit action
    await (prisma as any).accreditationAuditLog.create({
      data: {
        makerProfileId: params.makerId,
        previousStatus,
        newStatus,
        changedByUserId: session.userId,
        reason: reason || null,
        internalNote: internalNote || null,
      }
    });

    // Also log in AdminAction table
    await prisma.adminAction.create({
      data: {
        adminUserId: session.userId,
        action: `ACCREDITATION_${action}`,
        tableName: 'MakerProfile',
        recordId: params.makerId,
        beforeState: JSON.stringify({ verificationStatus: previousStatus }),
        afterState: JSON.stringify({ verificationStatus: newStatus, reason }),
      }
    });

    // Notify the maker
    await prisma.notification.create({
      data: {
        recipientUserId: maker.user?.id || maker.userId,
        title: notificationTitle,
        message: notificationMessage,
      }
    });

    return NextResponse.json({
      success: true,
      action,
      previousStatus,
      newStatus,
      message: `Studio ${newStatus.replace('_', ' ').toLowerCase()} successfully`,
    });
  } catch (error) {
    console.error('Admin accreditation POST error:', error);
    return NextResponse.json({ error: 'Failed to process accreditation action' }, { status: 500 });
  }
}
