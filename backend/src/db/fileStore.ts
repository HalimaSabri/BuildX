import fs from 'node:fs/promises';
import path from 'node:path';
import { config } from '../config.js';
import type { DatabaseShape, Generation, User } from '../types.js';
import { createId } from '../utils/ids.js';
import { hashPassword } from '../utils/passwords.js';

const createSeedData = (): DatabaseShape => ({
  users: [
    {
      id: createId('usr'),
      username: 'Admin',
      email: 'admin@autoapp.ai',
      role: 'Admin',
      passwordHash: hashPassword('admin123'),
      createdAt: new Date().toISOString(),
    },
    {
      id: createId('usr'),
      username: 'Developer',
      email: 'developer@autoapp.ai',
      role: 'User',
      passwordHash: hashPassword('dev123'),
      createdAt: new Date().toISOString(),
    },
  ],
  generations: [],
});

const ensureStore = async () => {
  await fs.mkdir(path.dirname(config.dataFile), { recursive: true });

  try {
    await fs.access(config.dataFile);
  } catch {
    await fs.writeFile(config.dataFile, JSON.stringify(createSeedData(), null, 2));
  }
};

const readDb = async (): Promise<DatabaseShape> => {
  await ensureStore();
  const raw = await fs.readFile(config.dataFile, 'utf8');
  return JSON.parse(raw) as DatabaseShape;
};

const writeDb = async (db: DatabaseShape) => {
  await fs.writeFile(config.dataFile, JSON.stringify(db, null, 2));
};

export const store = {
  async findUserByEmail(email: string) {
    const db = await readDb();
    return db.users.find((user) => user.email.toLowerCase() === email.toLowerCase()) ?? null;
  },

  async findUserById(id: string) {
    const db = await readDb();
    return db.users.find((user) => user.id === id) ?? null;
  },

  async createUser(user: User) {
    const db = await readDb();
    db.users.push(user);
    await writeDb(db);
    return user;
  },

  async createGeneration(generation: Generation) {
    const db = await readDb();
    db.generations.unshift(generation);
    db.generations = db.generations.slice(0, 50);
    await writeDb(db);
    return generation;
  },

  async listGenerations(userId: string, isAdmin: boolean) {
    const db = await readDb();
    return db.generations.filter((generation) => isAdmin || generation.userId === userId);
  },

  async findGenerationById(id: string, userId: string, isAdmin: boolean) {
    const db = await readDb();
    const generation = db.generations.find((item) => item.id === id);
    if (!generation) return null;
    if (!isAdmin && generation.userId !== userId) return null;
    return generation;
  },
};
