import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { logAdminAction } from '@/lib/services/admin.service';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/verifications
 * Returns verification requests, assigned inspectors, and associated inspection reports.
 */
export async function GET() {
  try {
    const session = await getSession();
    if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const requests = await prisma.verificationRequest.findMany({
      include: {
        maker: { include: { user: { select: { name: true, email: true } } } },
        inspector: { include: { user: { select: { name: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const inspectors = await prisma.inspectorProfile.findMany({
      where: { isActive: true },
      include: { user: { select: { name: true } } },
    });

    const reports = await prisma.inspectionReport.findMany({
      include: {
        inspector: { include: { user: { select: { name: true } } } },
        maker: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      requests: requests.map((r) => ({
        id: r.id,
        makerProfileId: r.makerProfileId,
        makerName: r.maker?.businessName || r.maker?.user?.name || 'Artisan',
        email: r.maker?.user?.email,
        inspectorName: r.inspector?.user?.name || null,
        inspectorProfileId: r.inspectorProfileId,
        status: r.status,
        createdAt: r.createdAt,
      })),
      inspectors: inspectors.map((i) => ({
        id: i.id,
        name: i.user?.name || 'Inspector',
        regionScope: i.regionScope,
      })),
      reports: reports.map((rep) => ({
        id: rep.id,
        inspectorName: rep.inspector?.user?.name || 'Inspector',
        makerName: rep.maker?.businessName || 'Artisan',
        qualityScore: rep.qualityScore,
        notes: rep.notes,
        status: rep.status,
        createdAt: rep.createdAt,
      })),
    });
  } catch (error) {
    console.error('Failed to get verifications:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * PUT /api/admin/verifications
 * Update verification request (assign inspector or approve/reject status).
 */
export async function PUT(request: Request) {
  try {
    const session = await getSession();
    if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { requestId, inspectorId, status, tier } = await request.json();
    if (!requestId) {
      return NextResponse.json({ error: 'requestId is required' }, { status: 400 });
    }

    const reqRecord = await prisma.verificationRequest.findUnique({
      where: { id: requestId },
      include: { maker: true },
    });

    if (!reqRecord) {
      return NextResponse.json({ error: 'Verification request not found' }, { status: 404 });
    }

    const beforeState = { status: reqRecord.status, inspectorProfileId: reqRecord.inspectorProfileId };

    const updated = await prisma.$transaction(async (tx) => {
      const data: any = {};
      if (inspectorId) {
        data.inspectorProfileId = inspectorId;
        data.status = 'INSPECTOR_ASSIGNED';
      }
      if (status) {
        data.status = status;
      }

      const updatedReq = await tx.verificationRequest.update({
        where: { id: requestId },
        data,
      });

      // If status is APPROVED, upgrade maker's verification status
      if (status === 'APPROVED' && tier) {
        await tx.makerProfile.update({
          where: { id: reqRecord.makerProfileId },
          data: { verificationStatus: tier }, // e.g. ELITE or GI
        });

        // Update all their products to have the upgraded verification status too
        await tx.product.updateMany({
          where: { makerProfileId: reqRecord.makerProfileId },
          data: { verificationStatus: tier },
        });

        // Add a signature on their passport if exists
        const products = await tx.product.findMany({
          where: { makerProfileId: reqRecord.makerProfileId },
          include: { passport: true },
        });

        for (const p of products) {
          if (p.passport) {
            await tx.passportSignature.create({
              data: {
                productPassportId: p.passport.id,
                signerUserId: session.userId,
                signatureRole: 'ADMIN',
                signatureHash: `SHA256:${Buffer.from(p.passport.id + Date.now().toString()).toString('hex').slice(0, 40)}`,
              },
            });
            await tx.passportEvent.create({
              data: {
                productPassportId: p.passport.id,
                eventType: 'INSPECTED',
                description: `Verified Elite status approved by Platform Admin.`,
              },
            });
          }
        }
      }

      return updatedReq;
    });

    await logAdminAction({
      adminUserId: session.userId,
      action: inspectorId ? 'ASSIGN_INSPECTOR' : 'MODERATE_VERIFICATION',
      tableName: 'VerificationRequest',
      recordId: requestId,
      beforeState,
      afterState: { status: updated.status, inspectorProfileId: updated.inspectorProfileId },
    });

    // Notify the Maker
    const title = inspectorId ? '🔍 Inspector Assigned' : status === 'APPROVED' ? '🌟 Verification Request Approved!' : '⚠️ Verification Request Update';
    const message = inspectorId
      ? 'An inspector has been assigned to audit your workshop. They will contact you shortly.'
      : status === 'APPROVED'
      ? `Congratulations! Your workshop has been approved for the ${tier} tier.`
      : `Your verification status was updated to ${status}.`;

    await prisma.notification.create({
      data: {
        recipientUserId: reqRecord.maker.userId,
        title,
        message,
      },
    });

    return NextResponse.json({ success: true, request: updated });
  } catch (error) {
    console.error('Failed to update verification:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
