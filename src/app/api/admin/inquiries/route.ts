import { NextResponse } from 'next/server';
import { getInquiries, updateInquiryStatus } from '@/lib/inquiryStore';

export async function GET() {
  try {
    const inquiries = getInquiries();
    const unreadCount = inquiries.filter((i) => i.status === 'UNREAD').length;

    return NextResponse.json({
      success: true,
      unreadCount,
      inquiries,
    });
  } catch (error) {
    console.error('Failed to fetch inquiries:', error);
    return NextResponse.json(
      { error: 'Failed to fetch inquiries' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json(
        { error: 'ID and status are required' },
        { status: 400 }
      );
    }

    const updated = updateInquiryStatus(id, { status });
    return NextResponse.json({
      success: true,
      inquiry: updated,
    });
  } catch (error) {
    console.error('Failed to update inquiry:', error);
    return NextResponse.json(
      { error: 'Failed to update inquiry' },
      { status: 500 }
    );
  }
}
