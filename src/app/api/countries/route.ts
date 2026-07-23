import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export async function GET() {
  try {
    const countries = await prisma.country.findMany({
      orderBy: { name: 'asc' }
    });
    return NextResponse.json(countries);
  } catch (error) {
    console.error('Failed to fetch countries:', error);
    return NextResponse.json({ error: 'Failed to fetch countries' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.role)) {
      return NextResponse.json({ error: 'Admin credentials required' }, { status: 403 });
    }

    const { name, code } = await request.json();
    if (!name || !code) {
      return NextResponse.json({ error: 'Name and country code are required' }, { status: 400 });
    }

    const country = await prisma.country.create({
      data: { name, code }
    });

    return NextResponse.json({ success: true, country });
  } catch (error) {
    console.error('Failed to create country:', error);
    return NextResponse.json({ error: 'Failed to create country' }, { status: 500 });
  }
}
