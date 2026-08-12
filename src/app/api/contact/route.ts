import { NextResponse } from 'next/server';
import { saveInquiry } from '@/lib/inquiryStore';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, category, inquiryType, country, subject, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Name, email, and message are required fields.' },
        { status: 400 }
      );
    }

    const selectedCategory = category || inquiryType || 'General Governance';

    // Save inquiry to persistent database store
    const saved = saveInquiry({
      name,
      email,
      phone: phone || '',
      category: selectedCategory,
      country: country || 'Global',
      subject: subject || `${selectedCategory} Inquiry from ${name}`,
      message,
    });

    return NextResponse.json({
      success: true,
      ticketId: saved.id,
      message: 'Your inquiry has been logged into Britsync Concierge database.',
      details: saved,
    });
  } catch (error) {
    console.error('Contact submit error:', error);
    return NextResponse.json(
      { error: 'Failed to submit contact inquiry.' },
      { status: 500 }
    );
  }
}
