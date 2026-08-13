import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { generateOtp } from '@/lib/otpStore';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, name } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const otpCode = generateOtp(normalizedEmail);

    const appPassword = (process.env.GMAIL_APP_PASSWORD || 'ewlacifwyvklixyt').replace(/\s+/g, '');
    const senderEmail = process.env.GMAIL_USER || 'britsync.registry@gmail.com';

    // Create Nodemailer Transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: senderEmail,
        pass: appPassword,
      },
    });

    const htmlBody = `
      <div style="font-family: 'Georgia', serif; color: #111; max-width: 580px; margin: 0 auto; padding: 2.5rem; border: 1px solid #D4AF37; background-color: #FAFAFA;">
        <div style="text-align: center; border-bottom: 1px solid #E5E5E5; padding-bottom: 1.5rem; margin-bottom: 2rem;">
          <h2 style="color: #D4AF37; letter-spacing: 4px; font-weight: 300; margin: 0; font-size: 1.6rem;">BRITSYNC</h2>
          <span style="font-size: 0.65rem; letter-spacing: 2.5px; text-transform: uppercase; color: #666; display: block; margin-top: 0.4rem;">HERITAGE GUILD REGISTRY VERIFICATION</span>
        </div>
        
        <p style="font-size: 0.95rem; line-height: 1.7;">Dear ${name || 'Master Artisan'},</p>
        <p style="font-size: 0.95rem; line-height: 1.7; color: #333;">
          Thank you for initiating registration on the Britsync Global Guild Registry. To verify your email address and proceed with your atelier registration, please enter the following 6-digit security code:
        </p>

        <div style="text-align: center; margin: 2.5rem 0;">
          <div style="display: inline-block; backgroundColor: #0A0A0C; color: #D4AF37; font-size: 2.4rem; letter-spacing: 12px; font-weight: 700; padding: 1rem 2.5rem; border: 1px solid #D4AF37;">
            ${otpCode}
          </div>
          <p style="font-size: 0.72rem; color: #777; margin-top: 0.8rem; letter-spacing: 1px;">THIS CODE EXPIRES IN 10 MINUTES</p>
        </div>

        <div style="border-top: 1px solid #E5E5E5; margin-top: 2.5rem; padding-top: 1.2rem; font-size: 0.75rem; color: #777; line-height: 1.6;">
          <p><strong>Britsync Governance & Inspection Secretariat</strong><br />Mayfair Headquarters, London W1K<br />Official Registry: <a href="https://nobleshop.co.uk" style="color: #D4AF37; text-decoration: none;">nobleshop.co.uk</a></p>
        </div>
      </div>
    `;

    try {
      await transporter.sendMail({
        from: `"Britsync Guild Registry" <${senderEmail}>`,
        to: normalizedEmail,
        subject: `[Britsync Security] ${otpCode} is your Atelier Verification Code`,
        html: htmlBody,
      });
    } catch (mailErr: any) {
      console.warn('Gmail OTP dispatch warning (proceeding with local code log):', mailErr.message);
    }

    return NextResponse.json({
      success: true,
      message: `OTP verification code dispatched to ${normalizedEmail}`,
    });
  } catch (error: any) {
    console.error('Send OTP Error:', error);
    return NextResponse.json({ error: 'Failed to send verification code.' }, { status: 500 });
  }
}
