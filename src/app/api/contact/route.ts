import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, inquiryType, country, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Name, email, and message are required fields.' },
        { status: 400 }
      );
    }

    const ticketId = `BR-2026-TKT-${Math.floor(100000 + Math.random() * 900000)}`;

    return NextResponse.json({
      success: true,
      ticketId,
      message: 'Your inquiry has been received by Britsync Concierge.',
      details: {
        name,
        email,
        phone: phone || 'N/A',
        inquiryType: inquiryType || 'General Governance',
        country: country || 'Not Specified',
        receivedAt: new Date().toISOString(),
      }
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to submit contact inquiry.' },
      { status: 500 }
    );
  }
}
