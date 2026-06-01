import crypto from 'node:crypto';

const ITERATIONS = 120_000;
const KEY_LENGTH = 32;
const DIGEST = 'sha256';

export const hashPassword = (password: string) => {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, ITERATIONS, KEY_LENGTH, DIGEST).toString('hex');
  return `${ITERATIONS}:${salt}:${hash}`;
};

export const verifyPassword = (password: string, storedHash: string) => {
  const [iterationsRaw, salt, originalHash] = storedHash.split(':');
  const iterations = Number(iterationsRaw);
  if (!iterations || !salt || !originalHash) return false;

  const candidate = crypto.pbkdf2Sync(password, salt, iterations, KEY_LENGTH, DIGEST);
  const original = Buffer.from(originalHash, 'hex');

  return original.length === candidate.length && crypto.timingSafeEqual(original, candidate);
};
