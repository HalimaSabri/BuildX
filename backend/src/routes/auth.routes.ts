import { Router } from 'express';
import { z } from 'zod';
import { store } from '../db/fileStore.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { requireAuth } from '../middleware/auth.js';
import type { PublicUser, UserRole } from '../types.js';
import { createId } from '../utils/ids.js';
import { hashPassword, verifyPassword } from '../utils/passwords.js';
import { createToken } from '../utils/tokens.js';

const router = Router();

const authSchema = z.object({
  email: z.string().email(),
  password: z.string().min(4),
});

const registerSchema = authSchema.extend({
  username: z.string().min(2).max(80),
  role: z.enum(['Admin', 'User']).default('User'),
});

const toPublicUser = (user: { id: string; username: string; email: string; role: UserRole }): PublicUser => ({
  id: user.id,
  username: user.username,
  email: user.email,
  role: user.role,
});

router.post('/register', asyncHandler(async (req, res) => {
  const input = registerSchema.parse(req.body);
  const existing = await store.findUserByEmail(input.email);

  if (existing) {
    res.status(409).json({ error: 'Email already registered' });
    return;
  }

  const user = await store.createUser({
    id: createId('usr'),
    username: input.username,
    email: input.email,
    role: input.role,
    passwordHash: hashPassword(input.password),
    createdAt: new Date().toISOString(),
  });

  res.status(201).json({
    user: toPublicUser(user),
    token: createToken(user.id, user.role),
  });
}));

router.post('/login', asyncHandler(async (req, res) => {
  const input = authSchema.parse(req.body);
  const user = await store.findUserByEmail(input.email);

  if (!user || !verifyPassword(input.password, user.passwordHash)) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }

  res.json({
    user: toPublicUser(user),
    token: createToken(user.id, user.role),
  });
}));

router.get('/me', requireAuth, (req, res) => {
  res.json({ user: req.user });
});

export { router as authRoutes };
