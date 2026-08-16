import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export const dynamic = 'force-dynamic';

// GET /api/maker/accreditation — Return full accreditation data + step + status
export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== 'MAKER') {
      return NextResponse.json({ error: 'Maker authentication required' }, { status: 401 });
    }

    const maker = await (prisma as any).makerProfile.findUnique({
      where: { userId: session.userId },
      include: {
        user: { select: { name: true, email: true, isEmailVerified: true, createdAt: true } },
        location: { include: { translations: true } },
        accreditationLogs: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      }
    });

    if (!maker) {
      return NextResponse.json({ error: 'Maker profile not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      accreditation: {
        id: maker.id,
        verificationStatus: maker.verificationStatus,
        accreditationStep: maker.accreditationStep || 0,
        submittedAt: maker.submittedAt,
        revisionNote: maker.revisionNote,
        // Step 1
        craftCategory: maker.craftCategory,
        businessName: maker.businessName,
        founderName: maker.founderName || maker.user?.name,
        yearsInBusiness: maker.yearsInBusiness,
        employeeCount: maker.employeeCount,
        country: maker.location?.translations?.find((t: any) => t.languageCode === 'en')?.name || '',
        // Step 2
        heritageOriginStory: maker.heritageOriginStory,
        founderBiography: maker.founderBiography,
        craftTools: maker.craftTools,
        craftTechniques: maker.craftTechniques,
        craftPhilosophy: maker.craftPhilosophy,
        // Step 3
        coverImageUrl: maker.coverImageUrl,
        founderPhotoUrl: maker.founderPhotoUrl,
        workshopPhoto1: maker.workshopPhoto1,
        workshopPhoto2: maker.workshopPhoto2,
        workshopPhoto3: maker.workshopPhoto3,
        // Step 4
        payoutMethod: maker.payoutMethod,
        // Never expose full payout account details — just confirm if set
        hasPayoutDetails: !!maker.payoutAccountDetails,
        // Meta
        auditLog: maker.accreditationLogs,
        userEmail: maker.user?.email,
        registeredAt: maker.user?.createdAt,
        isEmailVerified: maker.user?.isEmailVerified,
      }
    });
  } catch (error) {
    console.error('Failed to fetch accreditation:', error);
    return NextResponse.json({ error: 'Failed to fetch accreditation data' }, { status: 500 });
  }
}

// POST /api/maker/accreditation — Save step data or submit application
export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'MAKER') {
      return NextResponse.json({ error: 'Maker authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const { action, step, data } = body;

    const maker = await (prisma as any).makerProfile.findUnique({
      where: { userId: session.userId }
    });

    if (!maker) {
      return NextResponse.json({ error: 'Maker profile not found' }, { status: 404 });
    }

    // Block re-submission if already pending or verified
    if (action === 'submit' && ['PENDING_AUDIT', 'UNDER_REVIEW', 'GUILD_VERIFIED', 'ROYAL_CHARTER'].includes(maker.verificationStatus)) {
      return NextResponse.json({ error: 'Application already submitted or verified' }, { status: 409 });
    }

    if (action === 'save_step') {
      // Save partial step data without changing status
      const updateData: Record<string, any> = {};

      if (step === 1) {
        if (data.craftCategory) updateData.craftCategory = data.craftCategory;
        if (data.businessName) updateData.businessName = data.businessName;
        if (data.founderName) updateData.founderName = data.founderName;
        if (data.yearsInBusiness) updateData.yearsInBusiness = parseInt(data.yearsInBusiness);
        if (data.employeeCount) updateData.employeeCount = parseInt(data.employeeCount);
        updateData.accreditationStep = Math.max(maker.accreditationStep || 0, 1);
      } else if (step === 2) {
        if (data.heritageOriginStory) updateData.heritageOriginStory = data.heritageOriginStory;
        if (data.founderBiography) updateData.founderBiography = data.founderBiography;
        if (data.craftTools) updateData.craftTools = data.craftTools;
        if (data.craftTechniques) updateData.craftTechniques = data.craftTechniques;
        if (data.craftPhilosophy) updateData.craftPhilosophy = data.craftPhilosophy;
        updateData.accreditationStep = Math.max(maker.accreditationStep || 0, 2);
      } else if (step === 3) {
        if (data.coverImageUrl) updateData.coverImageUrl = data.coverImageUrl;
        if (data.founderPhotoUrl) updateData.founderPhotoUrl = data.founderPhotoUrl;
        if (data.workshopPhoto1) updateData.workshopPhoto1 = data.workshopPhoto1;
        if (data.workshopPhoto2) updateData.workshopPhoto2 = data.workshopPhoto2;
        if (data.workshopPhoto3) updateData.workshopPhoto3 = data.workshopPhoto3;
        updateData.accreditationStep = Math.max(maker.accreditationStep || 0, 3);
      } else if (step === 4) {
        if (data.payoutMethod) updateData.payoutMethod = data.payoutMethod;
        if (data.payoutAccountDetails) updateData.payoutAccountDetails = data.payoutAccountDetails;
        updateData.accreditationStep = Math.max(maker.accreditationStep || 0, 4);
      }

      // Set status to INCOMPLETE if starting
      if (maker.verificationStatus === 'GENERAL') {
        updateData.verificationStatus = 'INCOMPLETE';
      }

      await (prisma as any).makerProfile.update({
        where: { id: maker.id },
        data: updateData,
      });

      return NextResponse.json({ success: true, message: `Step ${step} saved` });
    }

    if (action === 'update_profile') {
      const updateData: Record<string, any> = {};
      if (data.craftCategory) updateData.craftCategory = data.craftCategory;
      if (data.businessName) updateData.businessName = data.businessName;
      if (data.founderName) updateData.founderName = data.founderName;
      if (data.yearsInBusiness) updateData.yearsInBusiness = parseInt(data.yearsInBusiness);
      if (data.employeeCount) updateData.employeeCount = parseInt(data.employeeCount);
      if (data.heritageOriginStory) updateData.heritageOriginStory = data.heritageOriginStory;
      if (data.founderBiography) updateData.founderBiography = data.founderBiography;
      if (data.craftTools) updateData.craftTools = data.craftTools;
      if (data.craftTechniques) updateData.craftTechniques = data.craftTechniques;
      if (data.craftPhilosophy) updateData.craftPhilosophy = data.craftPhilosophy;
      if (data.coverImageUrl) updateData.coverImageUrl = data.coverImageUrl;
      if (data.founderPhotoUrl) updateData.founderPhotoUrl = data.founderPhotoUrl;
      if (data.workshopPhoto1) updateData.workshopPhoto1 = data.workshopPhoto1;
      if (data.workshopPhoto2) updateData.workshopPhoto2 = data.workshopPhoto2;
      if (data.workshopPhoto3) updateData.workshopPhoto3 = data.workshopPhoto3;
      if (data.payoutMethod) updateData.payoutMethod = data.payoutMethod;
      if (data.payoutAccountDetails) updateData.payoutAccountDetails = data.payoutAccountDetails;

      await (prisma as any).makerProfile.update({
        where: { id: maker.id },
        data: updateData,
      });

      return NextResponse.json({ success: true, message: 'Studio profile updated successfully' });
    }

    if (action === 'submit') {
      // Validate all 4 steps are complete
      const refreshed = await (prisma as any).makerProfile.findUnique({ where: { id: maker.id } });
      const missing: string[] = [];

      if (!refreshed.craftCategory || !refreshed.businessName) missing.push('Step 1: Guild & Studio Identity');
      if (!refreshed.heritageOriginStory || !refreshed.founderBiography) missing.push('Step 2: Heritage & Craftsmanship');
      if (!refreshed.coverImageUrl || !refreshed.founderPhotoUrl) missing.push('Step 3: Studio Media');
      if (!refreshed.payoutMethod || !refreshed.payoutAccountDetails) missing.push('Step 4: Payout Information');

      if (missing.length > 0) {
        return NextResponse.json({
          error: 'Incomplete application',
          missing,
        }, { status: 422 });
      }

      const previousStatus = refreshed.verificationStatus;

      await (prisma as any).makerProfile.update({
        where: { id: maker.id },
        data: {
          verificationStatus: 'PENDING_AUDIT',
          submittedAt: new Date(),
          revisionNote: null,
          accreditationStep: 5,
        }
      });

      // Log the status change
      await (prisma as any).accreditationAuditLog.create({
        data: {
          makerProfileId: maker.id,
          previousStatus,
          newStatus: 'PENDING_AUDIT',
          changedByUserId: session.userId,
          reason: 'Maker submitted application for Guild Audit',
        }
      });

      // Notify maker
      await prisma.notification.create({
        data: {
          recipientUserId: session.userId,
          title: '📋 Application Submitted',
          message: 'Your studio accreditation application has been submitted to the BritSync Guild Secretariat for review.',
        }
      });

      return NextResponse.json({
        success: true,
        message: 'Application submitted for Guild Audit',
        status: 'PENDING_AUDIT',
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Accreditation POST error:', error);
    return NextResponse.json({ error: 'Failed to process accreditation request' }, { status: 500 });
  }
}
