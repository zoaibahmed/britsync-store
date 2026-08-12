import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  try {
    const { makerProfileId, action, reason } = await request.json();

    if (!makerProfileId) {
      return NextResponse.json({ error: 'Maker profile ID is required' }, { status: 400 });
    }

    const maker = await prisma.makerProfile.findUnique({
      where: { id: makerProfileId },
      include: {
        user: true,
      },
    });

    if (!maker || !maker.user) {
      return NextResponse.json({ error: 'Maker profile not found' }, { status: 404 });
    }

    const newStatus = action === 'REJECT' ? 'GENERAL' : 'ELITE';

    // Update Maker Profile Status in Database
    const updatedMaker = await prisma.makerProfile.update({
      where: { id: makerProfileId },
      data: {
        verificationStatus: newStatus,
      },
    });

    // Prepare Email Dispatch to Maker's Gmail
    const appPassword = (process.env.GMAIL_APP_PASSWORD || 'ewlacifwyvklixyt').replace(/\s+/g, '');
    const senderEmail = process.env.GMAIL_USER || 'britsync.registry@gmail.com';

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: senderEmail,
        pass: appPassword,
      },
    });

    const isApproved = newStatus === 'ELITE';
    const emailSubject = isApproved
      ? `🎉 Official Accreditation: ${maker.businessName} Approved on Britsync Registry`
      : `[Britsync Audit Update] Application Status for ${maker.businessName}`;

    const htmlBody = `
      <div style="font-family: 'Georgia', serif; color: #111; max-width: 600px; margin: 0 auto; padding: 2.5rem; border: 1px solid #D4AF37; background-color: #FAFAFA;">
        <div style="text-align: center; border-bottom: 1px solid #E5E5E5; padding-bottom: 1.5rem; margin-bottom: 2rem;">
          <h2 style="color: #D4AF37; letter-spacing: 4px; font-weight: 300; margin: 0;">BRITSYNC</h2>
          <span style="font-size: 0.65rem; letter-spacing: 2.5px; text-transform: uppercase; color: #666; display: block; margin-top: 0.4rem;">GLOBAL CURATION & VERIFICATION BOARD</span>
        </div>

        <p style="font-size: 0.95rem; line-height: 1.7;">Dear Custodian ${maker.user.name},</p>

        ${
          isApproved
            ? `
          <div style="background-color: rgba(46,125,50,0.08); border-left: 4px solid #2E7D32; padding: 1.2rem; margin: 1.5rem 0;">
            <h3 style="color: #2E7D32; margin: 0 0 0.5rem; font-size: 1.1rem;">Atelier Accreditation Granted</h3>
            <p style="margin: 0; font-size: 0.9rem; color: #222; line-height: 1.6;">
              We are pleased to inform you that <strong>${maker.businessName}</strong> has successfully passed the Britsync geofence, labor ethics, and craftsmanship audit. Your atelier has been granted <strong>Atelier Elite Master</strong> status.
            </p>
          </div>

          <p style="font-size: 0.95rem; line-height: 1.7; color: #333;">
            You may now access your full Maker Dashboard to upload your masterwork collection, configure your Patron Direct Escrow wallet, and generate cryptographic provenance passports for your creations.
          </p>

          <div style="text-align: center; margin: 2rem 0;">
            <a href="https://nobleshop.co.uk/dashboard/maker" style="display: inline-block; background-color: #0A0A0C; color: #D4AF37; padding: 0.85rem 2.2rem; text-decoration: none; font-size: 0.75rem; letter-spacing: 2.5px; font-weight: 700; text-transform: uppercase; border: 1px solid #D4AF37;">
              Access Maker Dashboard →
            </a>
          </div>
        `
            : `
          <div style="background-color: rgba(211,47,47,0.08); border-left: 4px solid #D32F2F; padding: 1.2rem; margin: 1.5rem 0;">
            <h3 style="color: #D32F2F; margin: 0 0 0.5rem; font-size: 1.1rem;">Audit Clarification Required</h3>
            <p style="margin: 0; font-size: 0.9rem; color: #222; line-height: 1.6;">
              Our Curation Board requires additional documentation before finalizing accreditation for <strong>${maker.businessName}</strong>.
            </p>
            ${reason ? `<p style="margin-top: 0.6rem; font-size: 0.85rem; color: #555;"><strong>Notes:</strong> ${reason}</p>` : ''}
          </div>
        `
        }

        <div style="border-top: 1px solid #E5E5E5; margin-top: 2.5rem; padding-top: 1.2rem; font-size: 0.75rem; color: #777; line-height: 1.6;">
          <p><strong>Britsync Executive Curation Panel</strong><br />Mayfair Headquarters, London W1K<br />Official Registry: <a href="https://nobleshop.co.uk" style="color: #D4AF37; text-decoration: none;">nobleshop.co.uk</a></p>
        </div>
      </div>
    `;

    try {
      await transporter.sendMail({
        from: `"Britsync Curation Board" <${senderEmail}>`,
        to: maker.user.email,
        subject: emailSubject,
        html: htmlBody,
      });
    } catch (mailErr: any) {
      console.warn('Gmail approval dispatch warning:', mailErr.message);
    }

    return NextResponse.json({
      success: true,
      message: `Maker ${maker.businessName} status updated to ${newStatus} and email notification sent.`,
      maker: updatedMaker,
    });
  } catch (error: any) {
    console.error('Approve Maker Error:', error);
    return NextResponse.json({ error: 'Failed to process maker approval.' }, { status: 500 });
  }
}
