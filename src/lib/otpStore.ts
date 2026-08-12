import fs from 'fs';
import path from 'path';

export interface OtpRecord {
  email: string;
  code: string;
  expiresAt: number; // Unix timestamp
  createdAt: string;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const OTP_FILE = path.join(DATA_DIR, 'otp_codes.json');

function ensureDataFile() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(OTP_FILE)) {
    fs.writeFileSync(OTP_FILE, JSON.stringify([], null, 2), 'utf-8');
  }
}

export function generateOtp(email: string): string {
  ensureDataFile();
  const normalizedEmail = email.toLowerCase().trim();
  const code = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digit code
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes expiry

  let records: OtpRecord[] = [];
  try {
    const raw = fs.readFileSync(OTP_FILE, 'utf-8');
    records = JSON.parse(raw);
  } catch (e) {
    records = [];
  }

  // Remove existing OTPs for email
  records = records.filter((r) => r.email !== normalizedEmail);
  records.push({
    email: normalizedEmail,
    code,
    expiresAt,
    createdAt: new Date().toISOString(),
  });

  fs.writeFileSync(OTP_FILE, JSON.stringify(records, null, 2), 'utf-8');
  return code;
}

export function verifyOtp(email: string, code: string): boolean {
  ensureDataFile();
  const normalizedEmail = email.toLowerCase().trim();
  try {
    const raw = fs.readFileSync(OTP_FILE, 'utf-8');
    const records: OtpRecord[] = JSON.parse(raw);
    const found = records.find(
      (r) => r.email === normalizedEmail && r.code === code.trim() && r.expiresAt > Date.now()
    );
    if (found) {
      // Remove used OTP
      const updated = records.filter((r) => r.email !== normalizedEmail);
      fs.writeFileSync(OTP_FILE, JSON.stringify(updated, null, 2), 'utf-8');
      return true;
    }
    return false;
  } catch (e) {
    return false;
  }
}
