import { Router } from 'express';
import { z } from 'zod';
import { store } from '../db/fileStore.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { requireAuth } from '../middleware/auth.js';
import { createProjectZip } from '../services/exportService.js';
import { composeGeneratedProject } from '../services/projectComposer.js';
import { APP_TEMPLATES, inferTemplateId } from '../services/templateCatalog.js';
import { createId } from '../utils/ids.js';

const router = Router();

const generateSchema = z.object({
  prompt: z.string().min(10).max(5000),
  backendType: z.enum(['NodeJS', 'Laravel']).default('NodeJS'),
  dbType: z.enum(['MySQL', 'PostgreSQL']).default('MySQL'),
  templateId: z.string().optional(),
});

router.use(requireAuth);

router.post('/', asyncHandler(async (req, res) => {
  const input = generateSchema.parse(req.body);
  const templateId = inferTemplateId(input.prompt, input.templateId);
  const baseTemplate = APP_TEMPLATES[templateId] ?? APP_TEMPLATES.ecommerce;
  const app = composeGeneratedProject(baseTemplate, {
    prompt: input.prompt,
    backendType: input.backendType,
    dbType: input.dbType,
  });

  const generation = await store.createGeneration({
    id: createId('gen'),
    userId: req.user!.id,
    prompt: input.prompt,
    templateId: app.id,
    backendType: input.backendType,
    dbType: input.dbType,
    app,
    createdAt: new Date().toISOString(),
  });

  res.status(201).json({ generation });
}));

router.get('/', asyncHandler(async (req, res) => {
  const generations = await store.listGenerations(req.user!.id, req.user!.role === 'Admin');
  res.json({
    generations: generations.map((generation) => ({
      id: generation.id,
      prompt: generation.prompt,
      templateId: generation.templateId,
      backendType: generation.backendType,
      dbType: generation.dbType,
      createdAt: generation.createdAt,
      appName: generation.app.name,
      fileCount: generation.app.files.length,
    })),
  });
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const generation = await store.findGenerationById(req.params.id, req.user!.id, req.user!.role === 'Admin');

  if (!generation) {
    res.status(404).json({ error: 'Generation not found' });
    return;
  }

  res.json({ generation });
}));

router.get('/:id/download', asyncHandler(async (req, res) => {
  const generation = await store.findGenerationById(req.params.id, req.user!.id, req.user!.role === 'Admin');

  if (!generation) {
    res.status(404).json({ error: 'Generation not found' });
    return;
  }

  const zip = await createProjectZip(generation);
  res.setHeader('Content-Type', 'application/zip');
  res.setHeader('Content-Disposition', `attachment; filename="${generation.app.id}-fullstack-project.zip"`);
  res.send(zip);
}));

router.delete('/:id', asyncHandler(async (req, res) => {
  const success = await store.deleteGeneration(req.params.id, req.user!.id, req.user!.role === 'Admin');

  if (!success) {
    res.status(404).json({ error: 'Generation not found' });
    return;
  }

  res.status(204).end();
}));

export { router as generationRoutes };
