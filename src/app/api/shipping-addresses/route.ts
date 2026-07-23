import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const addresses = await prisma.shippingAddress.findMany({
      where: { userId: session.userId },
      orderBy: { isDefault: 'desc' }
    });

    return NextResponse.json(addresses);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch shipping addresses' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const { fullName, addressLine1, addressLine2, city, postcode, country, isDefault } = body;

    if (!fullName || !addressLine1 || !city || !postcode || !country) {
      return NextResponse.json({ error: 'Missing required address fields' }, { status: 400 });
    }

    // If making this default, reset other defaults first
    if (isDefault) {
      await prisma.shippingAddress.updateMany({
        where: { userId: session.userId, isDefault: true },
        data: { isDefault: false }
      });
    }

    const address = await prisma.shippingAddress.create({
      data: {
        userId: session.userId,
        fullName,
        addressLine1,
        addressLine2,
        city,
        postcode,
        country,
        isDefault: isDefault || false
      }
    });

    return NextResponse.json({ success: true, address });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create shipping address' }, { status: 500 });
  }
}
