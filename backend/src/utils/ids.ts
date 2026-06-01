import crypto from 'node:crypto';

export const createId = (prefix: string) => `${prefix}_${crypto.randomBytes(8).toString('hex')}`;
