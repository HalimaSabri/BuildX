import JSZip from 'jszip';
import type { Generation } from '../types.js';

export const createProjectZip = async (generation: Generation) => {
  const zip = new JSZip();

  generation.app.files.forEach((file) => {
    zip.file(file.path, file.content);
  });

  return zip.generateAsync({ type: 'nodebuffer' });
};
