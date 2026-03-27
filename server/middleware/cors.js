/**
 * Simple CORS middleware — allows all origins with common headers.
 * Handles OPTIONS preflight requests automatically.
 */

const ALLOWED_HEADERS = [
  'Origin',
  'X-Requested-With',
  'Content-Type',
  'Accept',
  'Authorization',
].join(', ');

const EXPOSED_HEADERS = ['Content-Length', 'X-Request-Id'].join(', ');

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export function cors(req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', ALLOWED_HEADERS);
  res.setHeader('Access-Control-Expose-Headers', EXPOSED_HEADERS);
  res.setHeader('Access-Control-Max-Age', '86400'); // 24 h preflight cache

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  next();
}
