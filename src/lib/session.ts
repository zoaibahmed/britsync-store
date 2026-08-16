import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'britsync_secret_heritage_key_2026_secure';

export interface SessionPayload {
  userId: string;
  email: string;
  role: string;
  name: string;
}

export const STAFF_ROLES = [
  'CEO', 'SUPER_ADMIN', 'ADMIN', 'ACCREDITATION_OFFICER', 'INSPECTOR',
  'CATALOG_CURATOR', 'FINANCE_OFFICER', 'FULFILLMENT_OFFICER', 'CONCIERGE',
  'PROVENANCE_OFFICER', 'BI_OFFICER', 'PLATFORM_ADMIN', 'INTERNAL_AUDITOR'
];

export const MAKER_ROLES = ['MAKER', 'STUDIO_MANAGER'];

// Granular RBAC Permissions
export function canAccessOperationsShell(role: string): boolean {
  return STAFF_ROLES.includes(role);
}

export function canGrantRoyalCharter(role: string): boolean {
  return ['CEO', 'SUPER_ADMIN', 'ADMIN'].includes(role);
}

export function canApproveAccreditation(role: string): boolean {
  return ['CEO', 'SUPER_ADMIN', 'ADMIN', 'ACCREDITATION_OFFICER'].includes(role);
}

export function canCurateCatalog(role: string): boolean {
  return ['CEO', 'SUPER_ADMIN', 'ADMIN', 'CATALOG_CURATOR'].includes(role);
}

export function canProcessPayout(role: string): boolean {
  return ['CEO', 'SUPER_ADMIN', 'ADMIN', 'FINANCE_OFFICER'].includes(role);
}

export function canManageFulfillment(role: string): boolean {
  return ['CEO', 'SUPER_ADMIN', 'ADMIN', 'FULFILLMENT_OFFICER'].includes(role);
}

export function canManageCommissions(role: string): boolean {
  return ['CEO', 'SUPER_ADMIN', 'ADMIN', 'CONCIERGE'].includes(role);
}

// Convert string secret to CryptoKey for Web Crypto API
async function getCryptoKey(): Promise<CryptoKey> {
  const enc = new TextEncoder();
  return crypto.subtle.importKey(
    'raw',
    enc.encode(JWT_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

// Create a signed session token
export async function createSessionToken(payload: SessionPayload): Promise<string> {
  const enc = new TextEncoder();
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  
  // Set expiry to 7 days
  const exp = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7;
  const body = btoa(JSON.stringify({ ...payload, exp }));
  
  const tokenInput = `${header}.${body}`;
  const key = await getCryptoKey();
  const signatureBuffer = await crypto.subtle.sign('HMAC', key, enc.encode(tokenInput));
  
  const signatureBytes = new Uint8Array(signatureBuffer);
  let binaryStr = '';
  for (let i = 0; i < signatureBytes.length; i++) {
    binaryStr += String.fromCharCode(signatureBytes[i]);
  }
  
  const signature = btoa(binaryStr)
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
    
  return `${tokenInput}.${signature}`;
}

// Verify a signed session token
export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const [header, body, signature] = parts;
    const tokenInput = `${header}.${body}`;
    
    const key = await getCryptoKey();
    const enc = new TextEncoder();
    
    // Decode signature
    const binarySig = atob(signature.replace(/-/g, '+').replace(/_/g, '/'));
    const sigBytes = new Uint8Array(binarySig.length);
    for (let i = 0; i < binarySig.length; i++) {
      sigBytes[i] = binarySig.charCodeAt(i);
    }
    
    const isValid = await crypto.subtle.verify('HMAC', key, sigBytes, enc.encode(tokenInput));
    if (!isValid) return null;
    
    const decodedBody = JSON.parse(atob(body));
    
    // Check expiration
    if (decodedBody.exp && Date.now() / 1000 > decodedBody.exp) {
      return null; // Expired
    }
    
    return {
      userId: decodedBody.userId,
      email: decodedBody.email,
      role: decodedBody.role,
      name: decodedBody.name
    };
  } catch (e) {
    console.error('Session token verification failed:', e);
    return null;
  }
}

// Get session helper for Server Components / API Routes
export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = cookies();
  const token = cookieStore.get('britsync_session')?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

// Set session cookie on response
export async function setSessionCookie(response: NextResponse, payload: SessionPayload) {
  const token = await createSessionToken(payload);
  response.cookies.set('britsync_session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/'
  });
}

// Clear session cookie
export function clearSessionCookie(response: NextResponse) {
  response.cookies.delete('britsync_session');
}
