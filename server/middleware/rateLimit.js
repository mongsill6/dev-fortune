/**
 * Simple in-memory rate limiter.
 * Allows up to MAX_REQUESTS per WINDOW_MS per IP address.
 * Returns HTTP 429 with a JSON error body when the limit is exceeded.
 */

const MAX_REQUESTS = 100;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

/** @type {Map<string, { count: number; resetAt: number }>} */
const store = new Map();

/**
 * Derive a stable client identifier from the request.
 * Respects X-Forwarded-For when present (reverse-proxy deployments).
 *
 * @param {import('express').Request} req
 * @returns {string}
 */
function getClientKey(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    return String(forwarded).split(',')[0].trim();
  }
  return req.socket?.remoteAddress ?? 'unknown';
}

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export function rateLimit(req, res, next) {
  const key = getClientKey(req);
  const now = Date.now();

  let record = store.get(key);

  if (!record || now >= record.resetAt) {
    record = { count: 1, resetAt: now + WINDOW_MS };
    store.set(key, record);
    return next();
  }

  record.count += 1;

  const remaining = Math.max(0, MAX_REQUESTS - record.count);
  const retryAfterSec = Math.ceil((record.resetAt - now) / 1000);

  res.setHeader('X-RateLimit-Limit', String(MAX_REQUESTS));
  res.setHeader('X-RateLimit-Remaining', String(remaining));
  res.setHeader('X-RateLimit-Reset', String(Math.ceil(record.resetAt / 1000)));

  if (record.count > MAX_REQUESTS) {
    res.setHeader('Retry-After', String(retryAfterSec));
    return res.status(429).json({
      error: 'Too Many Requests',
      message: `Rate limit exceeded. Try again in ${retryAfterSec} seconds.`,
      retryAfter: retryAfterSec,
    });
  }

  next();
}
