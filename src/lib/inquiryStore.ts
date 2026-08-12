import fs from 'fs';
import path from 'path';

export interface ContactInquiry {
  id: string;
  name: string;
  email: string;
  phone?: string;
  category: string;
  country?: string;
  subject?: string;
  message: string;
  status: 'UNREAD' | 'READ' | 'REPLIED';
  createdAt: string;
  repliedAt?: string;
  replyMessage?: string;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'contact_inquiries.json');

// Ensure directory and file exist
function ensureDataFile() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    // Initial sample inquiries for presentation
    const initialData: ContactInquiry[] = [
      {
        id: 'BR-2026-INQ-001',
        name: 'Lord Henry Sterling',
        email: 'h.sterling@mayfairconcierge.co.uk',
        phone: '+44 20 7946 0912',
        category: 'Custom Order',
        country: 'United Kingdom',
        subject: 'Custom Terracotta Iznik Urn Commission',
        message: 'We require a bespoke set of 4 hand-glazed Iznik urns for an estate in Surrey. Please assign a senior concierge.',
        status: 'UNREAD',
        createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      },
      {
        id: 'BR-2026-INQ-002',
        name: 'Elena Rostova',
        email: 'elena@rostovagallery.com',
        phone: '+1 212 555 0198',
        category: 'Artisan Verification',
        country: 'United States',
        subject: 'Verification Standard Audit Request',
        message: 'Requesting verification audit for our master leather atelier based in Florence.',
        status: 'UNREAD',
        createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
      }
    ];
    fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
  }
}

export function getInquiries(): ContactInquiry[] {
  ensureDataFile();
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (error) {
    console.error('Failed to read inquiries file:', error);
    return [];
  }
}

export function saveInquiry(inquiry: Omit<ContactInquiry, 'id' | 'status' | 'createdAt'>): ContactInquiry {
  const inquiries = getInquiries();
  const newInquiry: ContactInquiry = {
    ...inquiry,
    id: `BR-2026-INQ-${Math.floor(1000 + Math.random() * 9000)}`,
    status: 'UNREAD',
    createdAt: new Date().toISOString(),
  };
  inquiries.unshift(newInquiry);
  fs.writeFileSync(DATA_FILE, JSON.stringify(inquiries, null, 2), 'utf-8');
  return newInquiry;
}

export function updateInquiryStatus(id: string, updates: Partial<ContactInquiry>): ContactInquiry | null {
  const inquiries = getInquiries();
  const idx = inquiries.findIndex((i) => i.id === id);
  if (idx === -1) return null;

  inquiries[idx] = { ...inquiries[idx], ...updates };
  fs.writeFileSync(DATA_FILE, JSON.stringify(inquiries, null, 2), 'utf-8');
  return inquiries[idx];
}
