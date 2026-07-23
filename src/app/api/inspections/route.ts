import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    let reports;

    if (session.role === 'ADMIN') {
      reports = await prisma.inspectionReport.findMany({
        include: {
          inspector: { include: { user: true } },
          maker: true
        },
        orderBy: { createdAt: 'desc' }
      });
    } else if (session.role === 'INSPECTOR') {
      const inspector = await prisma.inspectorProfile.findUnique({
        where: { userId: session.userId }
      });
      if (!inspector) {
        return NextResponse.json({ error: 'Inspector profile not found' }, { status: 404 });
      }
      reports = await prisma.inspectionReport.findMany({
        where: { inspectorProfileId: inspector.id },
        include: { maker: true },
        orderBy: { createdAt: 'desc' }
      });
    } else {
      return NextResponse.json({ error: 'Unauthorized access to inspection logs' }, { status: 403 });
    }

    // Map fields for frontend backward-compatibility
    const mappedReports = reports.map((r: any) => ({
      ...r,
      makerId: r.makerProfileId,
      inspectorId: r.inspectorProfileId,
      gpsLocation: r.latitude && r.longitude ? `${r.latitude}, ${r.longitude}` : 'Geofenced Audit Checkpoint',
      recommendation: r.notes || 'Passed physical inspection'
    }));

    return NextResponse.json(mappedReports);
  } catch (error) {
    console.error('Failed to fetch inspections:', error);
    return NextResponse.json({ error: 'Failed to fetch inspections' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'INSPECTOR') {
      return NextResponse.json({ error: 'Inspector credentials required' }, { status: 403 });
    }

    const inspector = await prisma.inspectorProfile.findUnique({
      where: { userId: session.userId }
    });

    if (!inspector) {
      return NextResponse.json({ error: 'Inspector profile not found' }, { status: 404 });
    }

    const body = await request.json();
    const { makerId, notes, qualityScore, gpsLocation, images, videos } = body;

    if (!makerId || !qualityScore) {
      return NextResponse.json({ error: 'Maker ID and quality score are required' }, { status: 400 });
    }

    // Parse lat/lng if provided, otherwise use default
    let lat = 40.7128;
    let lng = -74.0060;
    if (gpsLocation && gpsLocation.includes(',')) {
      const parts = gpsLocation.split(',');
      lat = parseFloat(parts[0]) || lat;
      lng = parseFloat(parts[1]) || lng;
    }

    const newReport = await prisma.inspectionReport.create({
      data: {
        inspectorProfileId: inspector.id,
        makerProfileId: makerId,
        notes: notes || 'Conducted physical field audit verification.',
        qualityScore: parseInt(qualityScore) || 90,
        digitalSignature: `SIG-INSP-${inspector.id.slice(0, 8).toUpperCase()}`,
        status: 'PENDING',
        latitude: lat,
        longitude: lng,
        images: images ? JSON.stringify(images) : null,
        videos: videos ? JSON.stringify(videos) : null
      }
    });

    return NextResponse.json({
      success: true,
      report: {
        ...newReport,
        makerId: newReport.makerProfileId,
        inspectorId: newReport.inspectorProfileId,
        gpsLocation: `${newReport.latitude}, ${newReport.longitude}`
      }
    });
  } catch (error) {
    console.error('Failed to create inspection report:', error);
    return NextResponse.json({ error: 'Failed to create inspection report' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin authorization required' }, { status: 403 });
    }

    const { reportId, status } = await request.json();

    if (!reportId || !status) {
      return NextResponse.json({ error: 'Report ID and status are required' }, { status: 400 });
    }

    // Update in transaction to update verification status if approved
    const report = await prisma.$transaction(async (tx) => {
      const updatedReport = await tx.inspectionReport.update({
        where: { id: reportId },
        data: { status }
      });

      if (status === 'APPROVED') {
        const maker = await tx.makerProfile.findUnique({
          where: { id: updatedReport.makerProfileId }
        });
        if (maker) {
          // Upgrade maker verification status to ELITE
          await tx.makerProfile.update({
            where: { id: updatedReport.makerProfileId },
            data: { verificationStatus: 'ELITE' }
          });
        }
      }

      return updatedReport;
    });

    return NextResponse.json({
      success: true,
      report: {
        ...report,
        makerId: report.makerProfileId,
        inspectorId: report.inspectorProfileId
      }
    });
  } catch (error) {
    console.error('Failed to update inspection report status:', error);
    return NextResponse.json({ error: 'Failed to update inspection status' }, { status: 500 });
  }
}
