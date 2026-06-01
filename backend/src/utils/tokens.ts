import crypto from 'node:crypto';
import { config } from '../config.js';
import type { UserRole } from '../types.js';

interface TokenPayload {
  userId: string;
  role: UserRole;
  exp: number;
}

const toBase64Url = (value: Buffer | string) =>
  Buffer.from(value).toString('base64url');

const sign = (payload: string) =>
  crypto.createHmac('sha256', config.tokenSecret).update(payload).digest('base64url');

export const createToken = (userId: string, role: UserRole) => {
  const header = toBase64Url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = toBase64Url(JSON.stringify({
    userId,
    role,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 8,
  } satisfies TokenPayload));
  const signature = sign(`${header}.${body}`);

  return `${header}.${body}.${signature}`;
};

export const verifyToken = (token: string): TokenPayload | null => {
  const [header, body, signature] = token.split('.');
  if (!header || !body || !signature) return null;

  const expected = sign(`${header}.${body}`);
  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);

  if (actualBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(actualBuffer, expectedBuffer)) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as TokenPayload;
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
};
