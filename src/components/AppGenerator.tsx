import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { APP_TEMPLATES } from '../utils/templates';
import type { AppTemplate } from '../utils/templates';
import { exportProjectToZip, triggerDownload } from '../utils/exporter';
import {
  Sparkles, Settings, Download, Cpu, RefreshCw, Layers,
  Code, Play, CheckCircle2, AlertCircle, History, BarChart2,
  Search, X,
} from 'lucide-react';
import { CodeViewer } from './CodeViewer';
import { UmlVisualizer } from './UmlVisualizer';
import { LivePreview } from './LivePreview';
import { KpiPanel } from './KpiPanel';
import { BlueprintPanel } from './BlueprintPanel';
import {
  HistoryPanel, saveHistoryEntry, loadHistory,
} from './HistoryPanel';
import type { HistoryEntry } from './HistoryPanel';
import { composeGeneratedProject } from '../utils/projectComposer';
import type { BackendType, DatabaseType } from '../utils/projectComposer';

// Helper to trigger confetti safely
const triggerConfetti = async () => {
  try {
    const confetti = (await import('canvas-confetti')).default;
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#6366f1', '#a855f7', '#10b981', '#38bdf8'],
    });
  } catch {
    // Silent fallback
  }
};

// Generates a simple unique ID
const genId = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

type ActiveTab = 'blueprint' | 'code' | 'uml' | 'preview' | 'kpis';

const TEMPLATE_KEYWORDS: Record<string, string[]> = {
  ecommerce: ['ecommerce', 'e-commerce', 'boutique', 'commerce', 'panier', 'produit', 'commande'],
  delivery: ['delivery', 'livraison', 'logistique', 'livreur', 'colis', 'course', 'chauffeur'],
  bi: ['bi', 'business intelligence', 'analytics', 'analytique', 'dashboard', 'kpi', 'statistique'],
  school: ['school', 'scolaire', 'ecole', 'eleve', 'enseignant', 'classe', 'notes'],
  hotel: ['hotel', 'hoteliere', 'reservation hotel', 'chambre', 'suite', 'facture'],
  crm: ['crm', 'client', 'prospect', 'lead', 'pipeline', 'commercial', 'opportunite'],
  pharmacy: ['pharmacy', 'pharmacie', 'medicament', 'ordonnance', 'stock', 'molecule'],
  booking: ['booking', 'reservation', 'rendez-vous', 'rdv', 'planning', 'calendrier', 'creneau'],
};

const inferTemplateId = (prompt: string, fallbackId: string) => {
  const normalized = prompt.toLowerCase();
  const match = Object.entries(TEMPLATE_KEYWORDS).find(([, keywords]) =>
    keywords.some((keyword) => normalized.includes(keyword)),
  );

  return match?.[0] ?? fallbackId;
};

export const AppGenerator: React.FC = () => {
  const { user } = useAuth();

  // ── Input ─────────────────────────────────────────────────────────────────
  const [prompt, setPrompt] = useState<string>('');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('ecommerce');
  const [dbType, setDbType] = useState<DatabaseType>('MySQL');
  const [backendType, setBackendType] = useState<BackendType>('NodeJS');
  const [presetSearch, setPresetSearch] = useState<string>('');

  // ── Generation status ─────────────────────────────────────────────────────
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [generatedApp, setGeneratedApp] = useState<AppTemplate | null>(null);

  // ── UI state ──────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<ActiveTab>('blueprint');
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [historyCount] = useState<number>(() => loadHistory().length);

  // ── Generation steps ──────────────────────────────────────────────────────
  const steps = [
    { label: 'Analyse NLP de la description...', icon: <Sparkles size={16} /> },
    { label: 'Détection des rôles & entités métier...', icon: <Layers size={16} /> },
    { label: 'Génération du schéma SQL & Migrations...', icon: <Settings size={16} /> },
    { label: 'Création des contrôleurs & APIs REST...', icon: <Code size={16} /> },
    { label: 'Génération de l\'interface React & Tailwind...', icon: <Cpu size={16} /> },
    { label: 'Assemblage final du pack de déploiement...', icon: <Download size={16} /> },
  ];

  // ── Presets ───────────────────────────────────────────────────────────────
  const allPresets = [
    { id: 'ecommerce', label: 'E-commerce',          emoji: '🛒', desc: 'Créer une boutique de commerce électronique avec catalogue produits, gestion du panier et validation de commandes.' },
    { id: 'delivery',  label: 'Logistique / Livraison', emoji: '🚚', desc: 'Créer une application de livraison express avec tableau de bord livreur, suivi de colis et géolocalisation.' },
    { id: 'bi',        label: 'Analytics / BI',      emoji: '📊', desc: 'Créer un tableau de bord analytique Business Intelligence pour suivre des indicateurs financiers et de performance LTV.' },
    { id: 'school',    label: 'Gestion Scolaire',    emoji: '🎓', desc: 'Créer un portail d\'administration scolaire pour la gestion des élèves, appels d\'assiduité, moyennes et enseignants.' },
    { id: 'hotel',     label: 'Gestion Hôtelière',   emoji: '🏨', desc: 'Créer un système de gestion hôtelière complet pour réserver des suites, checker le planning et éditer des factures.' },
    { id: 'crm',       label: 'CRM Commercial',      emoji: '💼', desc: 'Créer une plateforme CRM de gestion des prospects leads, du pipeline des ventes Wayne Ent. et Stark Industries.' },
    { id: 'pharmacy',  label: 'Pharmacie / Stock',   emoji: '💊', desc: 'Créer un module d\'inventaire de pharmacie pour gérer le stock moléculaire de médicaments et dispenser des ordonnances.' },
    { id: 'booking',   label: 'Réservation Planning', emoji: '📅', desc: 'Créer un portail de gestion de rendez-vous générique avec calendrier interactif et fiches clients.' },
  ];

  const filteredPresets = presetSearch.trim()
    ? allPresets.filter(p =>
        p.label.toLowerCase().includes(presetSearch.toLowerCase()) ||
        p.desc.toLowerCase().includes(presetSearch.toLowerCase())
      )
    : allPresets;

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handlePresetSelect = (id: string, description: string) => {
    setSelectedTemplateId(id);
    setPrompt(description);
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setGeneratedApp(null);
    setProgress(0);
    setCurrentStep(0);

    for (let stepIdx = 0; stepIdx < steps.length; stepIdx++) {
      setCurrentStep(stepIdx);
      const stepDuration = 900 + Math.random() * 400;
      const stepsCount = 10;
      const progressIncrement = 100 / steps.length / stepsCount;

      for (let j = 0; j < stepsCount; j++) {
        await new Promise<void>(resolve => setTimeout(resolve, stepDuration / stepsCount));
        setProgress(prev => Math.min(Math.round(prev + progressIncrement), 100));
      }
    }

    setProgress(100);

    const matchKey =
      Object.keys(APP_TEMPLATES).find(key =>
        prompt.toLowerCase().includes(key) ||
        prompt.toLowerCase().includes(APP_TEMPLATES[key].name.toLowerCase())
      ) ?? selectedTemplateId;

    const matched = APP_TEMPLATES[matchKey] ?? APP_TEMPLATES.ecommerce;
    setGeneratedApp(matched);
    setActiveTab('code');
    setIsGenerating(false);

    // Persist to history
    const entry: HistoryEntry = {
      id: genId(),
      templateId: matched.id,
      prompt,
      dbType,
      backendType,
      timestamp: Date.now(),
    };
    saveHistoryEntry(entry);

    triggerConfetti();
  };

  const handleDownload = async () => {
    if (!generatedApp) return;
    try {
      const blob = await exportProjectToZip(generatedApp);
      triggerDownload(blob, `${generatedApp.id}-fullstack-project.zip`);
    } catch {
      alert('Erreur lors de la génération du zip. Veuillez réessayer.');
    }
  };

  const handleRestoreFromHistory = (template: AppTemplate, entry: HistoryEntry) => {
    setGeneratedApp(template);
    setPrompt(entry.prompt);
    setSelectedTemplateId(entry.templateId);
    setDbType(entry.dbType as 'MySQL' | 'PostgreSQL');
    setBackendType(entry.backendType as 'NodeJS' | 'Laravel');
    setActiveTab('code');
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <div className="workspace-grid">
        {/* ── LEFT: Input Panel ── */}
        <div className="prompt-panel cyber-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-primary)', margin: 0 }}>
              <Sparkles size={18} /> Décrire votre Application
            </h3>
            {/* History button */}
            <button
              onClick={() => setShowHistory(true)}
              className="btn btn-secondary"
              style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem', position: 'relative' }}
              title="Voir l'historique des générations"
            >
              <History size={14} />
              Historique
              {loadHistory().length > 0 && (
                <span style={{
                  position: 'absolute', top: '-6px', right: '-6px',
                  background: 'var(--accent-primary)', color: '#fff',
                  fontSize: '0.6rem', fontWeight: 700,
                  width: '16px', height: '16px', borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {loadHistory().length}
                </span>
              )}
            </button>
          </div>

          <textarea
            className="prompt-textarea"
            placeholder="Décrivez précisément les fonctionnalités souhaitées (Ex. 'Créer une application de livraison de repas à domicile avec gestion de chauffeurs et facturation')"
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            disabled={isGenerating}
          />

          {/* Preset search + grid */}
          <div>
            <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
              Modèles de Démarrage Rapide
            </p>

            {/* Search */}
            <div style={{ position: 'relative', marginBottom: '0.5rem' }}>
              <Search size={13} style={{ position: 'absolute', left: '0.6rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Filtrer les modèles..."
                value={presetSearch}
                onChange={e => setPresetSearch(e.target.value)}
                disabled={isGenerating}
                style={{
                  width: '100%', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)',
                  padding: '0.4rem 0.75rem 0.4rem 2rem', fontSize: '0.8rem',
                  outline: 'none', fontFamily: 'var(--font-sans)',
                }}
              />
              {presetSearch && (
                <button
                  onClick={() => setPresetSearch('')}
                  style={{ position: 'absolute', right: '0.5rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}
                >
                  <X size={12} />
                </button>
              )}
            </div>

            <div className="presets-grid">
              {filteredPresets.length > 0 ? filteredPresets.map(preset => (
                <button
                  key={preset.id}
                  type="button"
                  className={`preset-chip ${selectedTemplateId === preset.id ? 'active' : ''}`}
                  style={{
                    borderColor: selectedTemplateId === preset.id ? 'var(--accent-primary)' : 'var(--border-color)',
                    color: selectedTemplateId === preset.id ? 'var(--text-primary)' : 'var(--text-secondary)',
                    background: selectedTemplateId === preset.id ? 'var(--bg-glass-active)' : 'var(--bg-tertiary)',
                  }}
                  onClick={() => handlePresetSelect(preset.id, preset.desc)}
                  disabled={isGenerating}
                >
                  <span style={{ fontSize: '1rem' }}>{preset.emoji}</span>
                  <span>{preset.label}</span>
                </button>
              )) : (
                <div style={{ gridColumn: '1/-1', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', padding: '0.75rem' }}>
                  Aucun modèle correspondant.
                </div>
              )}
            </div>
          </div>

          {/* Advanced settings */}
          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', marginTop: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Paramètres Avancés
              </span>
              {user?.role === 'Admin' ? (
                <span className="role-tag" style={{ background: 'var(--success)' }}>Admin Débloqué</span>
              ) : (
                <span className="role-tag" style={{ background: 'var(--text-muted)' }}>Limité</span>
              )}
            </div>

            <div className="grid-cols-2" style={{ gap: '0.5rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: '0.7rem' }}>Base de données</label>
                <select
                  className="form-select"
                  style={{ padding: '0.5rem 0.75rem', fontSize: '0.8rem' }}
                  disabled={user?.role !== 'Admin' || isGenerating}
                  value={dbType}
                  onChange={e => setDbType(e.target.value as 'MySQL' | 'PostgreSQL')}
                >
                  <option value="MySQL">MySQL</option>
                  <option value="PostgreSQL">PostgreSQL</option>
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: '0.7rem' }}>Stack Backend</label>
                <select
                  className="form-select"
                  style={{ padding: '0.5rem 0.75rem', fontSize: '0.8rem' }}
                  disabled={user?.role !== 'Admin' || isGenerating}
                  value={backendType}
                  onChange={e => setBackendType(e.target.value as 'NodeJS' | 'Laravel')}
                >
                  <option value="NodeJS">Node.js Express</option>
                  <option value="Laravel">Laravel PHP</option>
                </select>
              </div>
            </div>

            {user?.role !== 'Admin' && (
              <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                <AlertCircle size={10} /> Passez au rôle Administrateur pour modifier la stack technique.
              </p>
            )}
          </div>

          <button
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.85rem', marginTop: '0.5rem' }}
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
          >
            {isGenerating ? (
              <span className="flex-center" style={{ gap: '0.5rem' }}>
                <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} />
                Génération en cours... {progress}%
              </span>
            ) : (
              <span className="flex-center" style={{ gap: '0.5rem' }}>
                <Play size={16} /> Générer l'Application
              </span>
            )}
          </button>
        </div>

        {/* ── RIGHT: Output Panel ── */}
        <div className="cyber-card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          {isGenerating ? (
            /* Generation progress view */
            <div className="generation-wrapper">
              <div className="pulse-circle">
                <Cpu className="pulse-icon" />
              </div>

              <div className="progress-container">
                <div className="progress-header">
                  <span style={{ fontWeight: 600 }}>Compilation intelligente</span>
                  <span style={{ fontWeight: 700, color: 'var(--accent-primary)' }}>{progress}%</span>
                </div>
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: `${progress}%` }} />
                </div>
              </div>

              <div className="steps-list">
                {steps.map((step, idx) => {
                  const isActive    = idx === currentStep;
                  const isCompleted = idx < currentStep;
                  return (
                    <div
                      key={idx}
                      className={`step-item ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                      style={{ opacity: isCompleted || isActive ? 1 : 0.4 }}
                    >
                      <div className="step-badge">
                        {isCompleted ? <CheckCircle2 size={14} style={{ color: 'var(--success)' }} /> : idx + 1}
                      </div>
                      <span style={{ fontWeight: isActive ? 600 : 400 }}>{step.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

          ) : generatedApp ? (
            /* Generated result view */
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div className="panel-tabs" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '0.25rem' }}>
                  {([
                    { id: 'code',    label: '⌨  Code Source' },
                    { id: 'uml',     label: '🔷 Diagrammes UML' },
                    { id: 'preview', label: '▶  Live Preview' },
                    { id: 'kpis',    label: '📊 KPIs & Métriques' },
                  ] as { id: ActiveTab; label: string }[]).map(tab => (
                    <button
                      key={tab.id}
                      className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                      onClick={() => setActiveTab(tab.id)}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <button
                  className="btn btn-primary"
                  style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem', flexShrink: 0 }}
                  onClick={handleDownload}
                >
                  <Download size={14} /> Télécharger (.ZIP)
                </button>
              </div>

              <div style={{ flexGrow: 1, overflow: 'hidden' }}>
                {activeTab === 'code'    && <CodeViewer    template={generatedApp} />}
                {activeTab === 'uml'     && <UmlVisualizer template={generatedApp} />}
                {activeTab === 'preview' && <LivePreview   template={generatedApp} />}
                {activeTab === 'kpis'    && <KpiPanel      template={generatedApp} />}
              </div>
            </div>

          ) : (
            /* Empty workspace state */
            <div className="flex-center" style={{ height: '100%', flexDirection: 'column', gap: '1.25rem', color: 'var(--text-secondary)', textAlign: 'center', padding: '3rem' }}>
              <div style={{ position: 'relative' }}>
                <Cpu size={64} style={{ color: 'var(--accent-glow)', strokeWidth: 1.1 }} />
                <div style={{
                  position: 'absolute', inset: '-8px',
                  borderRadius: '50%',
                  border: '2px dashed var(--border-color-glow)',
                  animation: 'spin 12s linear infinite',
                }} />
              </div>
              <div>
                <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                  Espace de travail vide
                </h2>
                <p style={{ fontSize: '0.875rem', maxWidth: '380px', lineHeight: 1.6 }}>
                  Saisissez une description d'application sur le panneau de gauche
                  et cliquez sur <strong>"Générer"</strong> pour démarrer l'analyse IA.
                </p>
              </div>
              <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.5rem' }}>
                {['Code SQL', 'API REST', 'React UI', 'ZIP Export'].map(feat => (
                  <div key={feat} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem', opacity: 0.5 }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>
                      {feat === 'Code SQL' ? '🗄' : feat === 'API REST' ? '🔌' : feat === 'React UI' ? '⚛' : '📦'}
                    </div>
                    <span style={{ fontSize: '0.7rem', fontWeight: 600 }}>{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* History Panel overlay */}
      {showHistory && (
        <HistoryPanel
          onClose={() => setShowHistory(false)}
          onRestore={handleRestoreFromHistory}
        />
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </>
  );
};
