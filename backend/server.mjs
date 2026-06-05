import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import JSZip from 'jszip';

const PORT = Number(process.env.PORT ?? 5000);
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN ?? 'http://127.0.0.1:5173';
const TOKEN_SECRET = process.env.TOKEN_SECRET ?? 'dev-token-secret-change-me';
const DATA_FILE = path.resolve(process.cwd(), process.env.DATA_FILE ?? './data/db.json');

const json = (res, status, body, headers = {}) => {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': CLIENT_ORIGIN,
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    ...headers,
  });
  res.end(JSON.stringify(body));
};

const readBody = async (req) => {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString('utf8');
  return raw ? JSON.parse(raw) : {};
};

const createId = (prefix) => `${prefix}_${crypto.randomBytes(8).toString('hex')}`;

const hashPassword = (password) => {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 120000, 32, 'sha256').toString('hex');
  return `120000:${salt}:${hash}`;
};

const verifyPassword = (password, storedHash) => {
  const [iterationsRaw, salt, originalHash] = storedHash.split(':');
  const candidate = crypto.pbkdf2Sync(password, salt, Number(iterationsRaw), 32, 'sha256');
  const original = Buffer.from(originalHash, 'hex');
  return original.length === candidate.length && crypto.timingSafeEqual(original, candidate);
};

const sign = (value) => crypto.createHmac('sha256', TOKEN_SECRET).update(value).digest('base64url');

const createToken = (user) => {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify({
    userId: user.id,
    role: user.role,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 8,
  })).toString('base64url');
  return `${header}.${body}.${sign(`${header}.${body}`)}`;
};

const verifyToken = (token) => {
  const [header, body, signature] = token.split('.');
  if (!header || !body || !signature) return null;
  const expected = sign(`${header}.${body}`);
  if (expected !== signature) return null;
  const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
  if (payload.exp < Math.floor(Date.now() / 1000)) return null;
  return payload;
};

const publicUser = (user) => ({
  id: user.id,
  username: user.username,
  email: user.email,
  role: user.role,
});

const seedData = () => ({
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

const ensureDb = async () => {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.writeFile(DATA_FILE, JSON.stringify(seedData(), null, 2));
  }
};

const readDb = async () => {
  await ensureDb();
  return JSON.parse(await fs.readFile(DATA_FILE, 'utf8'));
};

const writeDb = (db) => fs.writeFile(DATA_FILE, JSON.stringify(db, null, 2));

const templates = {
  ecommerce: ['User', 'Product', 'Category', 'Order', 'OrderItem', 'Payment'],
  delivery: ['Customer', 'Driver', 'DeliveryOrder', 'Package', 'Location'],
  bi: ['Metric', 'Report', 'Dataset', 'Dashboard', 'Alert'],
  school: ['Student', 'Teacher', 'Classroom', 'Grade', 'Attendance'],
  hotel: ['Guest', 'Room', 'Reservation', 'Invoice', 'Service'],
  crm: ['Lead', 'Account', 'Contact', 'Opportunity', 'Interaction'],
  pharmacy: ['Medicine', 'Prescription', 'Sale', 'Supplier', 'InventoryAlert'],
  booking: ['Customer', 'Resource', 'Appointment', 'ScheduleBlock', 'Review'],
};

const keywords = {
  ecommerce: ['ecommerce', 'boutique', 'commerce', 'panier', 'produit', 'commande'],
  delivery: ['delivery', 'livraison', 'logistique', 'livreur', 'colis', 'chauffeur'],
  bi: ['bi', 'analytics', 'analytique', 'dashboard', 'kpi', 'statistique'],
  school: ['school', 'scolaire', 'ecole', 'eleve', 'enseignant', 'classe', 'notes'],
  hotel: ['hotel', 'hoteliere', 'chambre', 'suite', 'facture'],
  crm: ['crm', 'prospect', 'lead', 'pipeline', 'commercial', 'opportunite'],
  pharmacy: ['pharmacy', 'pharmacie', 'medicament', 'ordonnance', 'stock'],
  booking: ['booking', 'reservation', 'rendez-vous', 'rdv', 'planning', 'calendrier'],
};

const names = {
  ecommerce: 'E-commerce Platform',
  delivery: 'Delivery Logistics App',
  bi: 'Business Intelligence Dashboard',
  school: 'School Management System',
  hotel: 'Hotel Management System',
  crm: 'CRM Commercial',
  pharmacy: 'Pharmacy Inventory System',
  booking: 'Reservation Planning System',
};

const inferTemplate = (prompt, fallback = 'ecommerce') => {
  const normalized = prompt.toLowerCase();
  return Object.entries(keywords).find(([, values]) => values.some((value) => normalized.includes(value)))?.[0] ?? fallback;
};

const tableName = (entity) =>
  entity.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase().replace(/[^a-z0-9_]/g, '_');

const composeProject = ({ prompt, backendType, dbType, templateId }) => {
  const id = inferTemplate(prompt, templateId);
  const entities = templates[id] ?? templates.ecommerce;
  const name = names[id] ?? names.ecommerce;
  const kpis = [
    { label: 'Modules generes', value: '8', change: '+100%', positive: true },
    { label: 'Endpoints API', value: String(entities.length * 2 + 2), change: '+12', positive: true },
    { label: 'Fichiers source', value: '7', change: '+7', positive: true },
    { label: 'Temps MVP estime', value: '3 jours', change: '-70%', positive: true },
  ];
  const files = [
    {
      name: 'App.tsx',
      path: 'frontend/src/App.tsx',
      language: 'typescript',
      content: `export default function App() {\n  return <h1>${name}</h1>;\n}\n`,
    },
    {
      name: 'server.js',
      path: backendType === 'Laravel' ? 'backend/routes/api.php' : 'backend/server.js',
      language: backendType === 'Laravel' ? 'php' : 'javascript',
      content: backendType === 'Laravel'
        ? `<?php\n\nuse Illuminate\\Support\\Facades\\Route;\n\n${entities.map((entity) => `Route::apiResource('${tableName(entity)}', ${entity}Controller::class);`).join('\n')}\n`
        : `const express = require('express');\nconst app = express();\napp.use(express.json());\n${entities.map((entity) => `app.get('/api/${tableName(entity)}', (_req, res) => res.json([]));`).join('\n')}\napp.listen(5000);\n`,
    },
    {
      name: 'schema.sql',
      path: 'database/schema.sql',
      language: 'sql',
      content: `-- ${dbType} schema for ${name}\n\n${entities.map((entity) => `CREATE TABLE ${tableName(entity)} (\n  id ${dbType === 'PostgreSQL' ? 'SERIAL PRIMARY KEY' : 'INT AUTO_INCREMENT PRIMARY KEY'},\n  name VARCHAR(140) NOT NULL,\n  created_at ${dbType === 'PostgreSQL' ? 'TIMESTAMPTZ DEFAULT NOW()' : 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP'}\n);`).join('\n\n')}\n`,
    },
    {
      name: 'openapi.yaml',
      path: 'docs/openapi.yaml',
      language: 'yaml',
      content: `openapi: 3.0.3\ninfo:\n  title: ${name} API\n  version: 1.0.0\npaths:\n${entities.map((entity) => `  /api/${tableName(entity)}:\n    get:\n      summary: List ${entity}`).join('\n')}\n`,
    },
    {
      name: 'generation-manifest.json',
      path: 'docs/generation-manifest.json',
      language: 'json',
      content: JSON.stringify({ prompt, backendType, dbType, entities }, null, 2),
    },
    {
      name: 'README.md',
      path: 'README.md',
      language: 'markdown',
      content: `# ${name}\n\nGenerated by Auto-App Generator backend.\n\nBackend: ${backendType}\nDatabase: ${dbType}\n`,
    },
  ];

  return {
    id,
    name,
    icon: 'Cpu',
    description: `Generated from: ${prompt}`,
    entities,
    relations: entities.slice(1).map((entity) => `${entities[0]} relates to ${entity}`),
    roles: ['User', 'Admin'],
    kpis,
    umlData: {
      classes: entities.slice(0, 4).map((entity) => ({
        name: entity,
        attributes: ['id: int', 'name: string', 'created_at: timestamp'],
        methods: ['create()', 'update()', 'delete()'],
      })),
      links: entities.slice(1, 4).map((entity) => ({ from: entities[0], to: entity, type: 'association', label: '1..N' })),
      useCases: [
        { actor: 'User', cases: ['Generate project', 'Preview application', 'Download source'] },
        { actor: 'Admin', cases: ['Manage users', 'Audit generations', 'Configure stack'] },
      ],
    },
    files,
  };
};

const getUserFromRequest = async (req) => {
  const auth = req.headers.authorization;
  const token = auth?.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return null;
  const payload = verifyToken(token);
  if (!payload) return null;
  const db = await readDb();
  return db.users.find((user) => user.id === payload.userId) ?? null;
};

const routes = {
  async register(req, res) {
    const body = await readBody(req);
    if (!body.email || !body.password || !body.username || body.password.length < 4) {
      return json(res, 400, { error: 'Invalid register payload' });
    }
    const db = await readDb();
    if (db.users.some((user) => user.email.toLowerCase() === body.email.toLowerCase())) {
      return json(res, 409, { error: 'Email already registered' });
    }
    const user = {
      id: createId('usr'),
      username: body.username,
      email: body.email,
      role: body.role === 'Admin' ? 'Admin' : 'User',
      passwordHash: hashPassword(body.password),
      createdAt: new Date().toISOString(),
    };
    db.users.push(user);
    await writeDb(db);
    return json(res, 201, { user: publicUser(user), token: createToken(user) });
  },

  async login(req, res) {
    const body = await readBody(req);
    const db = await readDb();
    const user = db.users.find((item) => item.email.toLowerCase() === String(body.email ?? '').toLowerCase());
    if (!user || !verifyPassword(body.password ?? '', user.passwordHash)) {
      return json(res, 401, { error: 'Invalid credentials' });
    }
    return json(res, 200, { user: publicUser(user), token: createToken(user) });
  },

  async me(req, res) {
    const user = await getUserFromRequest(req);
    if (!user) return json(res, 401, { error: 'Unauthorized' });
    return json(res, 200, { user: publicUser(user) });
  },

  async generate(req, res) {
    const user = await getUserFromRequest(req);
    if (!user) return json(res, 401, { error: 'Unauthorized' });
    const body = await readBody(req);
    if (!body.prompt || body.prompt.length < 10) return json(res, 400, { error: 'Prompt is too short' });
    const app = composeProject({
      prompt: body.prompt,
      backendType: body.backendType === 'Laravel' ? 'Laravel' : 'NodeJS',
      dbType: body.dbType === 'PostgreSQL' ? 'PostgreSQL' : 'MySQL',
      templateId: body.templateId,
    });
    const generation = {
      id: createId('gen'),
      userId: user.id,
      prompt: body.prompt,
      templateId: app.id,
      backendType: body.backendType === 'Laravel' ? 'Laravel' : 'NodeJS',
      dbType: body.dbType === 'PostgreSQL' ? 'PostgreSQL' : 'MySQL',
      app,
      createdAt: new Date().toISOString(),
    };
    const db = await readDb();
    db.generations.unshift(generation);
    db.generations = db.generations.slice(0, 50);
    await writeDb(db);
    return json(res, 201, { generation });
  },

  async listGenerations(req, res) {
    const user = await getUserFromRequest(req);
    if (!user) return json(res, 401, { error: 'Unauthorized' });
    const db = await readDb();
    const generations = db.generations
      .filter((generation) => user.role === 'Admin' || generation.userId === user.id)
      .map((generation) => ({
        id: generation.id,
        prompt: generation.prompt,
        templateId: generation.templateId,
        backendType: generation.backendType,
        dbType: generation.dbType,
        createdAt: generation.createdAt,
        appName: generation.app.name,
        fileCount: generation.app.files.length,
      }));
    return json(res, 200, { generations });
  },

  async getGeneration(req, res, id) {
    const user = await getUserFromRequest(req);
    if (!user) return json(res, 401, { error: 'Unauthorized' });
    const db = await readDb();
    const generation = db.generations.find((item) => item.id === id && (user.role === 'Admin' || item.userId === user.id));
    if (!generation) return json(res, 404, { error: 'Generation not found' });
    return json(res, 200, { generation });
  },

  async download(req, res, id) {
    const user = await getUserFromRequest(req);
    if (!user) return json(res, 401, { error: 'Unauthorized' });
    const db = await readDb();
    const generation = db.generations.find((item) => item.id === id && (user.role === 'Admin' || item.userId === user.id));
    if (!generation) return json(res, 404, { error: 'Generation not found' });
    const zip = new JSZip();
    generation.app.files.forEach((file) => zip.file(file.path, file.content));
    const buffer = await zip.generateAsync({ type: 'nodebuffer' });
    res.writeHead(200, {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="${generation.app.id}-fullstack-project.zip"`,
      'Access-Control-Allow-Origin': CLIENT_ORIGIN,
    });
    res.end(buffer);
  },

  async deleteGeneration(req, res, id) {
    const user = await getUserFromRequest(req);
    if (!user) return json(res, 401, { error: 'Unauthorized' });
    const db = await readDb();
    const idx = db.generations.findIndex((item) => item.id === id && (user.role === 'Admin' || item.userId === user.id));
    if (idx === -1) return json(res, 404, { error: 'Generation not found' });
    db.generations.splice(idx, 1);
    await writeDb(db);
    return json(res, 204, {});
  },
};

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url ?? '/', `http://${req.headers.host}`);
    if (req.method === 'OPTIONS') return json(res, 204, {});
    if (req.method === 'GET' && url.pathname === '/api/health') {
      return json(res, 200, { status: 'ok', service: 'auto-app-generator-backend', timestamp: new Date().toISOString() });
    }
    if (req.method === 'POST' && url.pathname === '/api/auth/register') return routes.register(req, res);
    if (req.method === 'POST' && url.pathname === '/api/auth/login') return routes.login(req, res);
    if (req.method === 'GET' && url.pathname === '/api/auth/me') return routes.me(req, res);
    if (req.method === 'POST' && url.pathname === '/api/generations') return routes.generate(req, res);
    if (req.method === 'GET' && url.pathname === '/api/generations') return routes.listGenerations(req, res);

    const generationMatch = url.pathname.match(/^\/api\/generations\/([^/]+)$/);
    if (generationMatch) {
      if (req.method === 'GET') return routes.getGeneration(req, res, generationMatch[1]);
      if (req.method === 'DELETE') return routes.deleteGeneration(req, res, generationMatch[1]);
    }

    const downloadMatch = url.pathname.match(/^\/api\/generations\/([^/]+)\/download$/);
    if (req.method === 'GET' && downloadMatch) return routes.download(req, res, downloadMatch[1]);

    return json(res, 404, { error: 'Route not found' });
  } catch (error) {
    console.error(error);
    return json(res, 500, { error: 'Internal server error' });
  }
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`Auto-App Generator API running on http://127.0.0.1:${PORT}/api`);
});
