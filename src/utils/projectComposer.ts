import type { AppTemplate, GeneratedFile } from './templates';

export type BackendType = 'NodeJS' | 'Laravel';
export type DatabaseType = 'MySQL' | 'PostgreSQL';

export interface GenerationOptions {
  prompt: string;
  backendType: BackendType;
  dbType: DatabaseType;
}

const toSlug = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const toTableName = (entity: string) =>
  entity
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '_')
    .replace(/_+/g, '_')
    .replace(/_$/g, 's');

const createManifest = (template: AppTemplate, options: GenerationOptions): GeneratedFile => ({
  name: 'generation-manifest.json',
  path: 'docs/generation-manifest.json',
  language: 'json',
  content: JSON.stringify(
    {
      generatedBy: 'Auto-App Generator',
      application: {
        id: template.id,
        name: template.name,
        description: template.description,
      },
      input: {
        prompt: options.prompt,
        backend: options.backendType,
        database: options.dbType,
      },
      detectedModel: {
        entities: template.entities,
        relations: template.relations,
        roles: template.roles,
        kpis: template.kpis.map((kpi) => kpi.label),
      },
      modules: [
        'Authentication',
        'AI Engine',
        'Code Generator',
        'UI Generator',
        'API Generator',
        'Database Builder',
        'Dashboard Generator',
        'Export Module',
      ],
      security: [
        'Input validation',
        'Role-based access control',
        'JWT/session protection',
        'Parameterized database queries',
        'Centralized API error handling',
      ],
    },
    null,
    2,
  ),
});

const createEnvExample = (template: AppTemplate, options: GenerationOptions): GeneratedFile => ({
  name: '.env.example',
  path: 'backend/.env.example',
  language: 'bash',
  content: `APP_NAME=${toSlug(template.name)}
APP_ENV=development
PORT=5000
JWT_SECRET=change-me-in-production
DB_CONNECTION=${options.dbType.toLowerCase()}
DB_HOST=127.0.0.1
DB_PORT=${options.dbType === 'PostgreSQL' ? '5432' : '3306'}
DB_DATABASE=${toSlug(template.name).replace(/-/g, '_')}
DB_USERNAME=auto_app_user
DB_PASSWORD=change-me
`,
});

const createApiContract = (template: AppTemplate, options: GenerationOptions): GeneratedFile => {
  const resourcePaths = template.entities.map((entity) => {
    const resource = toTableName(entity);
    return `  /api/${resource}:
    get:
      summary: List ${entity} records
      responses:
        "200":
          description: Successful response
    post:
      summary: Create a ${entity}
      security:
        - bearerAuth: []
      responses:
        "201":
          description: Created
  /api/${resource}/{id}:
    get:
      summary: Retrieve one ${entity}
      parameters:
        - in: path
          name: id
          required: true
          schema:
            type: integer
      responses:
        "200":
          description: Successful response`;
  }).join('\n');

  return {
    name: 'openapi.yaml',
    path: 'docs/openapi.yaml',
    language: 'yaml',
    content: `openapi: 3.0.3
info:
  title: ${template.name} API
  version: 1.0.0
  description: REST contract generated for ${options.backendType} with ${options.dbType}.
servers:
  - url: http://localhost:5000
components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
paths:
  /api/auth/register:
    post:
      summary: Register a new user
      responses:
        "201":
          description: User created
  /api/auth/login:
    post:
      summary: Authenticate a user
      responses:
        "200":
          description: Access token returned
${resourcePaths}
`,
  };
};

const createMigrationGuide = (template: AppTemplate, options: GenerationOptions): GeneratedFile => {
  const idType = options.dbType === 'PostgreSQL' ? 'SERIAL PRIMARY KEY' : 'INT AUTO_INCREMENT PRIMARY KEY';
  const timestampType = options.dbType === 'PostgreSQL' ? 'TIMESTAMPTZ DEFAULT NOW()' : 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP';
  const tables = template.entities.map((entity) => `CREATE TABLE IF NOT EXISTS ${toTableName(entity)} (
  id ${idType},
  name VARCHAR(120) NOT NULL,
  status VARCHAR(40) DEFAULT 'ACTIVE',
  created_at ${timestampType}
);`).join('\n\n');

  return {
    name: 'migration.generated.sql',
    path: 'database/migration.generated.sql',
    language: 'sql',
    content: `-- Generated ${options.dbType} migration blueprint for ${template.name}
-- This file complements the template schema with normalized entity tables.

${tables}
`,
  };
};

const createBackendBootstrap = (template: AppTemplate, options: GenerationOptions): GeneratedFile => {
  if (options.backendType === 'Laravel') {
    return {
      name: 'routes-api.php',
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
    name: 'resources.generated.js',
    path: 'backend/routes/resources.generated.js',
    language: 'javascript',
    content: `const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

const resources = ${JSON.stringify(template.entities.map(toTableName), null, 2)};

resources.forEach((resource) => {
  router.get(\`/\${resource}\`, async (_req, res) => {
    res.json({ resource, data: [], generated: true });
  });

  router.post(\`/\${resource}\`, auth.verifyToken, async (req, res) => {
    res.status(201).json({ resource, data: req.body });
  });
});

module.exports = router;
`,
  };
};

const createReadmeAddendum = (template: AppTemplate, options: GenerationOptions): GeneratedFile => ({
  name: 'ARCHITECTURE.md',
  path: 'docs/ARCHITECTURE.md',
  language: 'markdown',
  content: `# ${template.name} - Architecture Blueprint

## Stack
- Frontend: React, TypeScript, TailwindCSS-ready UI structure
- Backend: ${options.backendType}
- Database: ${options.dbType}
- Auth: register, login, logout, role-based access

## Prompt utilisateur
${options.prompt}

## Modules generes
- Frontend pages, forms, tables and analytics dashboard
- REST API routes and controllers
- Database schema and migration blueprint
- KPI dashboard and UML metadata
- Exportable full-stack source package

## Roles
${template.roles.map((role) => `- ${role}`).join('\n')}

## Entites
${template.entities.map((entity) => `- ${entity}`).join('\n')}
`,
});

export const composeGeneratedProject = (
  template: AppTemplate,
  options: GenerationOptions,
): AppTemplate => {
  const generatedFiles = [
    ...template.files,
    createManifest(template, options),
    createEnvExample(template, options),
    createApiContract(template, options),
    createMigrationGuide(template, options),
    createBackendBootstrap(template, options),
    createReadmeAddendum(template, options),
  ];

  const uniqueFiles = generatedFiles.filter((file, index, list) =>
    list.findIndex((candidate) => candidate.path === file.path) === index,
  );

  return {
    ...template,
    files: uniqueFiles,
  };
};
