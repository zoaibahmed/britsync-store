import { randomBytes, scryptSync, timingSafeEqual } from 'crypto';

/**
 * Hashes a plain text password using scrypt with a random salt.
 * Returns a string formatted as salt:hash.
 */
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

/**
 * Verifies a plain text password against a stored salt:hash string.
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  try {
    const [salt, key] = storedHash.split(':');
    if (!salt || !key) return false;
    const hash = scryptSync(password, salt, 64);
    const keyBuffer = Buffer.from(key, 'hex');
    return timingSafeEqual(hash, keyBuffer);
  } catch (e) {
    return false;
  }
}
