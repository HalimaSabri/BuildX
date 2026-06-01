import React from 'react';
import {
  BrainCircuit,
  Boxes,
  Database,
  FileArchive,
  GitBranch,
  KeyRound,
  LayoutDashboard,
  Network,
  Server,
  ShieldCheck,
} from 'lucide-react';
import type { AppTemplate } from '../utils/templates';
import type { BackendType, DatabaseType } from '../utils/projectComposer';

interface BlueprintPanelProps {
  template: AppTemplate;
  prompt: string;
  backendType: BackendType;
  dbType: DatabaseType;
}

const MODULES = [
  { label: 'Authentification', icon: KeyRound, detail: 'Inscription, connexion, deconnexion, roles et protection des sessions.' },
  { label: 'AI Engine', icon: BrainCircuit, detail: 'Analyse NLP du prompt, extraction des entites, roles et fonctionnalites.' },
  { label: 'Code Generator', icon: Boxes, detail: 'Assemblage frontend, backend, schemas SQL et fichiers de configuration.' },
  { label: 'API Generator', icon: Network, detail: 'Routes REST, contrats OpenAPI, controleurs et middleware de securite.' },
  { label: 'Dashboard Generator', icon: LayoutDashboard, detail: 'KPIs, tableaux analytiques, graphiques et indicateurs metier.' },
  { label: 'Export Module', icon: FileArchive, detail: 'Packaging ZIP complet avec documentation et manifest de generation.' },
];

const SECURITY_ITEMS = [
  'Validation des inputs utilisateur',
  'Authentification JWT ou session securisee',
  'Controle d acces par role',
  'Requetes SQL parametrees',
  'Gestion centralisee des erreurs API',
];

export const BlueprintPanel: React.FC<BlueprintPanelProps> = ({
  template,
  prompt,
  backendType,
  dbType,
}) => {
  const apiCount = template.entities.length * 4 + 2;

  return (
    <div className="blueprint-panel-wrapper">
      <section className="blueprint-hero">
        <div>
          <p className="blueprint-eyebrow">Analyse IA du besoin</p>
          <h3>{template.name}</h3>
          <p>{prompt || template.description}</p>
        </div>
        <div className="blueprint-stack">
          <span><Server size={13} /> {backendType}</span>
          <span><Database size={13} /> {dbType}</span>
          <span><Network size={13} /> {apiCount} endpoints</span>
        </div>
      </section>

      <section className="blueprint-grid">
        <div className="blueprint-block">
          <h4><Boxes size={14} /> Modules Systeme</h4>
          <div className="blueprint-module-list">
            {MODULES.map((module) => {
              const Icon = module.icon;
              return (
                <article key={module.label} className="blueprint-module">
                  <Icon size={16} />
                  <div>
                    <strong>{module.label}</strong>
                    <p>{module.detail}</p>
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        <div className="blueprint-block">
          <h4><GitBranch size={14} /> Modele Metier Detecte</h4>
          <div className="blueprint-tags">
            {template.entities.map((entity) => (
              <span key={entity}>{entity}</span>
            ))}
          </div>
          <ul className="blueprint-list">
            {template.relations.map((relation) => (
              <li key={relation}>{relation}</li>
            ))}
          </ul>
        </div>

        <div className="blueprint-block">
          <h4><ShieldCheck size={14} /> Securite</h4>
          <ul className="blueprint-checklist">
            {SECURITY_ITEMS.map((item) => (
              <li key={item}>
                <ShieldCheck size={13} />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="blueprint-block">
          <h4><LayoutDashboard size={14} /> Livrables Generes</h4>
          <div className="blueprint-deliverables">
            <span>{template.files.length} fichiers source</span>
            <span>{template.kpis.length} KPIs analytics</span>
            <span>{template.umlData.classes.length} classes UML</span>
            <span>{template.roles.length} roles utilisateur</span>
          </div>
        </div>
      </section>
    </div>
  );
};
