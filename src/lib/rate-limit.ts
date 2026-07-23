const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

interface RateLimitConfig {
  windowMs: number;
  max: number;
}

/**
 * Very lightweight memory rate limiter for API routes.
 * Returns true if allowed, false if limit exceeded.
 */
export function rateLimit(ip: string, config: RateLimitConfig = { windowMs: 60000, max: 60 }): boolean {
  const now = Date.now();
  const record = rateLimitStore.get(ip);

  if (!record || now > record.resetTime) {
    rateLimitStore.set(ip, { count: 1, resetTime: now + config.windowMs });
    return true;
  }

  if (record.count >= config.max) {
    return false;
  }

  record.count++;
  return true;
}
