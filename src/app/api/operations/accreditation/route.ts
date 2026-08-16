import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession, canApproveAccreditation, canGrantRoyalCharter } from '@/lib/session';

export const dynamic = 'force-dynamic';

// GET /api/operations/accreditation — List studio applications with filtering
export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session || !canApproveAccreditation(session.role)) {
      return NextResponse.json({ error: 'Accreditation staff authorization required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get('status') || 'ALL';

    const whereClause: any = {};
    if (statusFilter !== 'ALL') {
      whereClause.verificationStatus = statusFilter;
    }

    const makers = await prisma.makerProfile.findMany({
      where: whereClause,
      include: {
        user: { select: { id: true, name: true, email: true, createdAt: true } },
        location: { include: { translations: { where: { languageCode: 'en' } } } },
        accreditationLogs: { orderBy: { createdAt: 'desc' }, take: 5 },
        products: { where: { deletedAt: null }, select: { id: true } }
      },
      orderBy: { updatedAt: 'desc' }
    });

    const mapped = makers.map((m: any) => ({
      id: m.id,
      userId: m.userId,
      businessName: m.businessName,
      founderName: m.founderName || m.user?.name || 'Artisan',
      email: m.user?.email,
      craftCategory: m.craftCategory || 'Uncategorized',
      yearsInBusiness: m.yearsInBusiness,
      employeeCount: m.employeeCount,
      country: m.location?.translations?.[0]?.name || 'United Kingdom',
      verificationStatus: m.verificationStatus,
      accreditationStep: m.accreditationStep,
      submittedAt: m.submittedAt,
      revisionNote: m.revisionNote,
      productCount: m.products?.length || 0,
      recentLogs: m.accreditationLogs,
    }));

    return NextResponse.json({ success: true, makers: mapped });
  } catch (error) {
    console.error('Accreditation GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch accreditation queue' }, { status: 500 });
  }
}

// POST /api/operations/accreditation — Reviewer actions (Assign Inspector, Request Revision, Recommend Approval, Approve Guild, Grant Royal Charter, Reject)
export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || !canApproveAccreditation(session.role)) {
      return NextResponse.json({ error: 'Accreditation staff authorization required' }, { status: 403 });
    }

    const body = await request.json();
    const { makerId, action, reason, internalNote, inspectorId } = body;

    if (!makerId || !action) {
      return NextResponse.json({ error: 'makerId and action required' }, { status: 400 });
    }

    const maker = await prisma.makerProfile.findUnique({
      where: { id: makerId },
      include: { user: { select: { id: true, name: true, email: true } } }
    });

    if (!maker) {
      return NextResponse.json({ error: 'Studio profile not found' }, { status: 404 });
    }

    const previousStatus = maker.verificationStatus;
    let newStatus = previousStatus;
    let notificationTitle = '';
    let notificationMessage = '';

    if (action === 'GRANT_ROYAL_CHARTER') {
      if (!canGrantRoyalCharter(session.role)) {
        return NextResponse.json({ error: 'Only the CEO & Governance Secretariat can grant Royal Charter' }, { status: 403 });
      }
      newStatus = 'ROYAL_CHARTER';
      notificationTitle = '👑 Royal Charter Granted';
      notificationMessage = 'Your studio has been awarded the Royal Charter — the highest distinction on BritSync (12.5% commission, Gold Crest).';
    } else if (action === 'APPROVE_GUILD') {
      newStatus = 'GUILD_VERIFIED';
      notificationTitle = '✅ Guild Verified — Welcome to BritSync';
      notificationMessage = 'Congratulations! Your studio has passed Secretariat review and is Guild Verified.';
    } else if (action === 'REQUEST_REVISION') {
      if (!reason) return NextResponse.json({ error: 'Revision reason required' }, { status: 400 });
      newStatus = 'REVISION_REQUIRED';
      notificationTitle = '📝 Revision Required';
      notificationMessage = `The Secretariat requires changes: "${reason}"`;
    } else if (action === 'REJECT') {
      newStatus = 'REJECTED';
      notificationTitle = '❌ Application Not Approved';
      notificationMessage = reason ? `Application not approved: ${reason}` : 'Application was not approved.';
    } else if (action === 'SET_UNDER_REVIEW') {
      newStatus = 'UNDER_REVIEW';
      notificationTitle = '🔍 Application Under Review';
      notificationMessage = 'Your studio application is under active Secretariat review.';
    }

    // Update maker profile
    await prisma.makerProfile.update({
      where: { id: makerId },
      data: {
        verificationStatus: newStatus,
        revisionNote: action === 'REQUEST_REVISION' ? reason : null,
      }
    });

    // Create Audit Log
    await (prisma as any).accreditationAuditLog.create({
      data: {
        makerProfileId: makerId,
        previousStatus,
        newStatus,
        changedByUserId: session.userId,
        reason: reason || action,
        internalNote: internalNote || null,
      }
    });

    // Create Internal Note if present
    if (internalNote) {
      await (prisma as any).internalNote.create({
        data: {
          targetType: 'APPLICATION',
          targetId: makerId,
          authorUserId: session.userId,
          authorRole: session.role,
          noteText: internalNote,
        }
      });
    }

    // Notify Maker User
    await prisma.notification.create({
      data: {
        recipientUserId: maker.userId,
        title: notificationTitle,
        message: notificationMessage,
      }
    });

    return NextResponse.json({
      success: true,
      action,
      previousStatus,
      newStatus,
      message: `Studio status updated to ${newStatus}`,
    });
  } catch (error) {
    console.error('Accreditation POST error:', error);
    return NextResponse.json({ error: 'Failed to process accreditation action' }, { status: 500 });
  }
}
