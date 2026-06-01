import type { AppTemplate, BackendType, DatabaseType, GeneratedFile } from '../types.js';

interface GenerationOptions {
  prompt: string;
  backendType: BackendType;
  dbType: DatabaseType;
}

const toSlug = (value: string) =>
  value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const toTableName = (entity: string) =>
  entity
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '_')
    .replace(/_+/g, '_')
    .replace(/_$/g, 's');

const createFrontendApp = (template: AppTemplate): GeneratedFile => ({
  name: 'App.tsx',
  path: 'frontend/src/App.tsx',
  language: 'typescript',
  content: `import React from 'react';

const entities = ${JSON.stringify(template.entities, null, 2)};
const kpis = ${JSON.stringify(template.kpis, null, 2)};

export default function App() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">${template.name}</h1>
        <p className="text-slate-500">${template.description}</p>
      </header>
      <section className="grid grid-cols-4 gap-4 mb-8">
        {kpis.map((kpi) => (
          <article key={kpi.label} className="rounded border bg-white p-4">
            <p className="text-xs uppercase text-slate-500">{kpi.label}</p>
            <strong className="text-2xl">{kpi.value}</strong>
          </article>
        ))}
      </section>
      <section className="rounded border bg-white p-4">
        <h2 className="font-semibold mb-3">Entites metier</h2>
        <div className="flex flex-wrap gap-2">
          {entities.map((entity) => (
            <span key={entity} className="rounded bg-indigo-50 px-3 py-1 text-sm text-indigo-700">{entity}</span>
          ))}
        </div>
      </section>
    </main>
  );
}
`,
});

const createPackage = (name: string): GeneratedFile => ({
  name: 'package.json',
  path: 'frontend/package.json',
  language: 'json',
  content: JSON.stringify({
    name: `${toSlug(name)}-frontend`,
    private: true,
    version: '1.0.0',
    type: 'module',
    scripts: { dev: 'vite', build: 'vite build' },
    dependencies: {
      '@vitejs/plugin-react': '^4.3.4',
      vite: '^5.4.11',
      typescript: '^5.6.3',
      react: '^18.3.1',
      'react-dom': '^18.3.1',
      tailwindcss: '^3.4.17',
    },
  }, null, 2),
});

const createServer = (template: AppTemplate, options: GenerationOptions): GeneratedFile => {
  if (options.backendType === 'Laravel') {
    return {
      name: 'api.php',
      path: 'backend/routes/api.php',
      language: 'php',
      content: `<?php

use Illuminate\\Support\\Facades\\Route;

Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
${template.entities.map((entity) => `    Route::apiResource('${toTableName(entity)}', ${entity}Controller::class);`).join('\n')}
});
`,
    };
  }

  return {
    name: 'server.js',
    path: 'backend/server.js',
    language: 'javascript',
    content: `const express = require('express');
const app = express();

app.use(express.json());

app.post('/api/auth/login', (_req, res) => {
  res.json({ token: 'replace-with-real-jwt' });
});

${template.entities.map((entity) => {
  const route = toTableName(entity);
  return `app.get('/api/${route}', (_req, res) => res.json([]));
app.post('/api/${route}', (req, res) => res.status(201).json(req.body));`;
}).join('\n\n')}

app.listen(process.env.PORT || 5000, () => {
  console.log('${template.name} API running');
});
`,
  };
};

const createSchema = (template: AppTemplate, options: GenerationOptions): GeneratedFile => {
  const idType = options.dbType === 'PostgreSQL' ? 'SERIAL PRIMARY KEY' : 'INT AUTO_INCREMENT PRIMARY KEY';
  const timestamp = options.dbType === 'PostgreSQL' ? 'TIMESTAMPTZ DEFAULT NOW()' : 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP';
  const tables = template.entities.map((entity) => `CREATE TABLE IF NOT EXISTS ${toTableName(entity)} (
  id ${idType},
  name VARCHAR(140) NOT NULL,
  status VARCHAR(40) DEFAULT 'ACTIVE',
  created_at ${timestamp}
);`).join('\n\n');

  return {
    name: 'schema.sql',
    path: 'database/schema.sql',
    language: 'sql',
    content: `-- ${options.dbType} schema generated for ${template.name}

CREATE TABLE IF NOT EXISTS users (
  id ${idType},
  username VARCHAR(80) NOT NULL,
  email VARCHAR(160) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(40) DEFAULT 'User',
  created_at ${timestamp}
);

${tables}
`,
  };
};

const createOpenApi = (template: AppTemplate): GeneratedFile => ({
  name: 'openapi.yaml',
  path: 'docs/openapi.yaml',
  language: 'yaml',
  content: `openapi: 3.0.3
info:
  title: ${template.name} API
  version: 1.0.0
paths:
${template.entities.map((entity) => {
  const route = toTableName(entity);
  return `  /api/${route}:
    get:
      summary: List ${entity}
    post:
      summary: Create ${entity}`;
}).join('\n')}
`,
});

const createManifest = (template: AppTemplate, options: GenerationOptions): GeneratedFile => ({
  name: 'generation-manifest.json',
  path: 'docs/generation-manifest.json',
  language: 'json',
  content: JSON.stringify({
    generatedBy: 'Auto-App Generator Backend',
    prompt: options.prompt,
    stack: {
      frontend: 'React + TypeScript + TailwindCSS',
      backend: options.backendType,
      database: options.dbType,
    },
    application: {
      id: template.id,
      name: template.name,
      entities: template.entities,
      relations: template.relations,
      roles: template.roles,
    },
  }, null, 2),
});

const createReadme = (template: AppTemplate, options: GenerationOptions): GeneratedFile => ({
  name: 'README.md',
  path: 'README.md',
  language: 'markdown',
  content: `# ${template.name}

Generated by Auto-App Generator backend.

## Stack
- Frontend: React + TypeScript
- Backend: ${options.backendType}
- Database: ${options.dbType}

## Prompt
${options.prompt}

## Entities
${template.entities.map((entity) => `- ${entity}`).join('\n')}
`,
});

export const composeGeneratedProject = (
  baseTemplate: Omit<AppTemplate, 'files'>,
  options: GenerationOptions,
): AppTemplate => {
  const template: AppTemplate = {
    ...baseTemplate,
    files: [],
  };

  return {
    ...template,
    files: [
      createPackage(template.name),
      createFrontendApp(template),
      createServer(template, options),
      createSchema(template, options),
      createOpenApi(template),
      createManifest(template, options),
      createReadme(template, options),
    ],
  };
};
