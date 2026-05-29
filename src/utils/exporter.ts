import JSZip from 'jszip';
import type { AppTemplate } from './templates';

export const exportProjectToZip = async (template: AppTemplate): Promise<Blob> => {
  const zip = new JSZip();

  // Create standard folder structure and populate files
  template.files.forEach((file) => {
    // Add file to ZIP (JSZip supports nested paths automatically when using '/' in filenames)
    zip.file(file.path, file.content);
  });

  // Add a customizable README to highlight details
  const hasReadme = template.files.some(f => f.name.toLowerCase() === 'readme.md');
  if (!hasReadme) {
    zip.file('README.md', `# ${template.name}
    
Projet généré automatiquement par **Auto-App Generator**.

## Structure
- \`frontend/\` : Code de l'interface utilisateur.
- \`backend/\` : Code de l'API et logique métier.
- \`database/\` : Schémas SQL et migrations.

## Lancement
1. Installez les dépendances dans chaque dossier (\`npm install\`).
2. Démarrez les serveurs de développement.
`);
  }

  // Generate and return zip blob
  return await zip.generateAsync({ type: 'blob' });
};

export const triggerDownload = (blob: Blob, filename: string) => {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
};
