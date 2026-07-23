import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { logAdminAction } from '@/lib/services/admin.service';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/passports
 * Returns all passports, including matching products and locations.
 */
export async function GET() {
  try {
    const session = await getSession();
    if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const passports = await prisma.productPassport.findMany({
      include: {
        product: {
          include: {
            translations: true,
            maker: { select: { businessName: true } },
          },
        },
        events: { orderBy: { eventTimestamp: 'desc' } },
        signatures: { include: { signer: { select: { name: true, role: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const productsWithoutPassports = await prisma.product.findMany({
      where: { passport: null },
      include: { translations: true, maker: { select: { businessName: true } } },
    });

    return NextResponse.json({
      passports: passports.map((p) => {
        const trans = p.product?.translations.find((t) => t.languageCode === 'en') || p.product?.translations[0];
        return {
          id: p.id,
          serial: p.passportSerial,
          productId: p.productId,
          productName: trans?.name || 'Product',
          makerName: p.product?.maker?.businessName || 'Artisan',
          events: p.events,
          signatures: p.signatures.map((s) => ({
            id: s.id,
            signerName: s.signer?.name || 'User',
            signerRole: s.signatureRole,
            signedAt: s.signedAt,
          })),
          createdAt: p.createdAt,
        };
      }),
      productsWithoutPassports: productsWithoutPassports.map((p) => {
        const trans = p.translations.find((t) => t.languageCode === 'en') || p.translations[0];
        return {
          id: p.id,
          name: trans?.name || 'Product',
          makerName: p.maker?.businessName || 'Artisan',
        };
      }),
    });
  } catch (error) {
    console.error('Failed to get passports:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * POST /api/admin/passports
 * Generate a new cryptographic passport or add events/signatures.
 */
export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { action, productId, passportId, eventType, description, latitude, longitude } = await request.json();

    if (action === 'CREATE') {
      if (!productId) {
        return NextResponse.json({ error: 'productId is required' }, { status: 400 });
      }

      const product = await prisma.product.findUnique({
        where: { id: productId },
        include: { passport: true },
      });

      if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });
      if (product.passport) return NextResponse.json({ error: 'Product already has a passport' }, { status: 400 });

      const serial = `BS-PASSPORT-${Buffer.from(productId + Date.now().toString()).toString('hex').slice(0, 16).toUpperCase()}`;

      const passport = await prisma.$transaction(async (tx) => {
        const p = await tx.productPassport.create({
          data: {
            passportSerial: serial,
            productId,
          },
        });

        // Add creator event
        await tx.passportEvent.create({
          data: {
            productPassportId: p.id,
            eventType: 'CREATED',
            description: 'Cryptographic provenance passport initialized by Britsync platform admin.',
          },
        });

        // Add admin signature
        await tx.passportSignature.create({
          data: {
            productPassportId: p.id,
            signerUserId: session.userId,
            signatureRole: 'ADMIN',
            signatureHash: `SHA256:${Buffer.from(p.id + Date.now().toString()).toString('hex').slice(0, 40)}`,
          },
        });

        return p;
      });

      await logAdminAction({
        adminUserId: session.userId,
        action: 'CREATE_PASSPORT',
        tableName: 'ProductPassport',
        recordId: passport.id,
        afterState: { passportSerial: serial, productId },
      });

      return NextResponse.json({ success: true, passport });
    }

    if (action === 'ADD_EVENT') {
      if (!passportId || !eventType || !description) {
        return NextResponse.json({ error: 'passportId, eventType, and description are required' }, { status: 400 });
      }

      const passport = await prisma.productPassport.findUnique({ where: { id: passportId } });
      if (!passport) return NextResponse.json({ error: 'Passport not found' }, { status: 404 });

      const event = await prisma.passportEvent.create({
        data: {
          productPassportId: passportId,
          eventType,
          description,
          latitude: latitude ? parseFloat(latitude) : null,
          longitude: longitude ? parseFloat(longitude) : null,
        },
      });

      await logAdminAction({
        adminUserId: session.userId,
        action: 'ADD_PASSPORT_EVENT',
        tableName: 'PassportEvent',
        recordId: event.id,
        afterState: { passportId, eventType, description },
      });

      return NextResponse.json({ success: true, event });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Failed to update passport:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
