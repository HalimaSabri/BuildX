import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { APP_TEMPLATES } from '../utils/templates';
import type { AppTemplate } from '../utils/templates';
import { exportProjectToZip, triggerDownload } from '../utils/exporter';
import { Sparkles, Terminal, Settings, Download, Cpu, RefreshCw, Layers, Code, Play, CheckCircle2, AlertCircle } from 'lucide-react';
import { CodeViewer } from './CodeViewer';
import { UmlVisualizer } from './UmlVisualizer';
import { LivePreview } from './LivePreview';

// Helper to trigger confetti safely
const triggerConfetti = async () => {
  try {
    const confetti = (await import('canvas-confetti')).default;
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#6366f1', '#a855f7', '#10b981', '#38bdf8']
    });
  } catch (e) {
    // Silent fallback if canvas-confetti was not installed or resolved
    console.log('Confetti could not be fired, skipping.');
  }
};

export const AppGenerator: React.FC = () => {
  const { user } = useAuth();
  
  // Input settings
  const [prompt, setPrompt] = useState<string>('');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('ecommerce');
  const [dbType, setDbType] = useState<'MySQL' | 'PostgreSQL'>('MySQL');
  const [backendType, setBackendType] = useState<'NodeJS' | 'Laravel'>('NodeJS');

  // Generation status
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [generatedApp, setGeneratedApp] = useState<AppTemplate | null>(null);

  // Tabs for result panel
  const [activeTab, setActiveTab] = useState<'code' | 'uml' | 'preview'>('code');

  const steps = [
    { label: 'Analyse NLP de la description...', icon: <Sparkles size={16} /> },
    { label: 'Détection des rôles & entités métier...', icon: <Layers size={16} /> },
    { label: 'Génération du schéma SQL & Migrations...', icon: <Settings size={16} /> },
    { label: 'Création des contrôleurs & APIs REST...', icon: <Code size={16} /> },
    { label: 'Génération de l\'interface React & Tailwind...', icon: <Cpu size={16} /> },
    { label: 'Assemblage final du pack de déploiement...', icon: <Download size={16} /> }
  ];

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

    // Dynamic progression simulation
    for (let stepIdx = 0; stepIdx < steps.length; stepIdx++) {
      setCurrentStep(stepIdx);
      
      const stepDuration = 900 + Math.random() * 400; // ~1s per step
      const stepsCount = 10;
      const progressIncrement = 100 / steps.length / stepsCount;

      for (let j = 0; j < stepsCount; j++) {
        await new Promise((resolve) => setTimeout(resolve, stepDuration / stepsCount));
        setProgress((prev) => Math.min(Math.round(prev + progressIncrement), 100));
      }
    }

    setProgress(100);
    
    // Pick the closest matched app template, fallback to selected template preset
    const matchKey = Object.keys(APP_TEMPLATES).find(key => 
      prompt.toLowerCase().includes(key) || 
      prompt.toLowerCase().includes(APP_TEMPLATES[key].name.toLowerCase())
    ) || selectedTemplateId;

    const matchedTemplate = APP_TEMPLATES[matchKey] || APP_TEMPLATES.ecommerce;

    setGeneratedApp(matchedTemplate);
    setIsGenerating(false);
    triggerConfetti();
  };

  const handleDownload = async () => {
    if (!generatedApp) return;
    try {
      const blob = await exportProjectToZip(generatedApp);
      triggerDownload(blob, `${generatedApp.id}-fullstack-project.zip`);
    } catch (err) {
      alert('Erreur lors de la génération du zip. Veuillez réessayer.');
    }
  };

  const presets = [
    { id: 'ecommerce', label: 'E-commerce', desc: 'Créer une boutique de commerce électronique avec catalogue produits, gestion du panier et validation de commandes.' },
    { id: 'delivery', label: 'Logistique / Livraison', desc: 'Créer une application de livraison express avec tableau de bord livreur, suivi de colis et géolocalisation.' },
    { id: 'bi', label: 'Analytics / BI', desc: 'Créer un tableau de bord analytique Business Intelligence pour suivre des indicateurs financiers et de performance LTV.' },
    { id: 'school', label: 'Gestion Scolaire', desc: 'Créer un portail d\'administration scolaire pour la gestion des élèves, appels d\'assiduité, moyennes et enseignants.' },
    { id: 'hotel', label: 'Gestion Hôtelière', desc: 'Créer un système de gestion hôtelière complet pour réserver des suites, checker le planning et éditer des factures.' },
    { id: 'crm', label: 'CRM Commercial', desc: 'Créer une plateforme CRM de gestion des prospects leads, du pipeline des ventes Wayne Ent. et Stark Industries.' },
    { id: 'pharmacy', label: 'Pharmacie / Stock', desc: 'Créer un module d\'inventaire de pharmacie pour gérer le stock moléculaire de médicaments et dispenser des ordonnances.' },
    { id: 'booking', label: 'Réservation Planning', desc: 'Créer un portail de gestion de rendez-vous générique avec calendrier interactif et fiches clients.' }
  ];

  return (
    <div className="workspace-grid">
      {/* LEFT COLUMN: Input description & Settings */}
      <div className="prompt-panel cyber-card">
        <h3 style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', itemsCenter: 'center', gap: '0.5rem', color: 'var(--accent-primary)' }}>
          <Sparkles size={18} /> Décrire votre Application
        </h3>
        
        <textarea
          className="prompt-textarea"
          placeholder="Décrivez précisément les fonctionnalités souhaitées (Ex. 'Créer une application de livraison de repas à domicile avec gestion de chauffeurs et facturation')"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          disabled={isGenerating}
        />

        {/* Quick select presets */}
        <div>
          <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
            Modèles de Démarrage Rapide
          </p>
          <div className="presets-grid">
            {presets.map((preset) => (
              <button
                key={preset.id}
                type="button"
                className={`preset-chip ${selectedTemplateId === preset.id ? 'active' : ''}`}
                style={{
                  borderColor: selectedTemplateId === preset.id ? 'var(--accent-primary)' : 'var(--border-color)',
                  color: selectedTemplateId === preset.id ? 'var(--text-primary)' : 'var(--text-secondary)',
                  background: selectedTemplateId === preset.id ? 'var(--bg-glass-active)' : 'var(--bg-tertiary)'
                }}
                onClick={() => handlePresetFill ? handlePresetSelect(preset.id, preset.desc) : setSelectedTemplateId(preset.id)}
                disabled={isGenerating}
              >
                <span>{preset.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Configurations - Advanced controls enabled for Admin */}
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
                onChange={(e) => setDbType(e.target.value as any)}
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
                onChange={(e) => setBackendType(e.target.value as any)}
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
              <RefreshCw size={16} className="spinner" style={{ animation: 'spin 1s linear infinite' }} />
              Génération en cours... {progress}%
            </span>
          ) : (
            <span className="flex-center" style={{ gap: '0.5rem' }}>
              <Play size={16} /> Générer l'Application
            </span>
          )}
        </button>
      </div>

      {/* RIGHT COLUMN: Output display workspace */}
      <div className="cyber-card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {isGenerating ? (
          /* Generation Progress view */
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
                <div className="progress-fill" style={{ width: `${progress}%` }}></div>
              </div>
            </div>

            <div className="steps-list">
              {steps.map((step, idx) => {
                const isActive = idx === currentStep;
                const isCompleted = idx < currentStep;
                return (
                  <div
                    key={idx}
                    className={`step-item ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                    style={{
                      opacity: isCompleted || isActive ? 1 : 0.4
                    }}
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
          /* Generated App view showing results */
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div className="panel-tabs" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  className={`tab-btn ${activeTab === 'code' ? 'active' : ''}`}
                  onClick={() => setActiveTab('code')}
                >
                  Code Source
                </button>
                <button
                  className={`tab-btn ${activeTab === 'uml' ? 'active' : ''}`}
                  onClick={() => setActiveTab('uml')}
                >
                  Diagrammes UML
                </button>
                <button
                  className={`tab-btn ${activeTab === 'preview' ? 'active' : ''}`}
                  onClick={() => setActiveTab('preview')}
                >
                  Live Preview
                </button>
              </div>

              <button
                className="btn btn-primary"
                style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}
                onClick={handleDownload}
              >
                <Download size={14} /> Télécharger (.ZIP)
              </button>
            </div>

            <div style={{ flexGrow: 1, overflow: 'hidden' }}>
              {activeTab === 'code' && <CodeViewer template={generatedApp} />}
              {activeTab === 'uml' && <UmlVisualizer template={generatedApp} />}
              {activeTab === 'preview' && <LivePreview template={generatedApp} />}
            </div>
          </div>
        ) : (
          /* Landing Empty Workspace State */
          <div className="flex-center" style={{ height: '100%', flexDirection: 'column', gap: '1rem', color: 'var(--text-secondary)', textAlign: 'center', padding: '3rem' }}>
            <Cpu size={56} style={{ color: 'var(--accent-glow)', strokeWidth: 1.2 }} />
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>Espace de travail vide</h2>
              <p style={{ fontSize: '0.875rem', marginTop: '0.25rem', maxWidth: '380px' }}>
                Saisissez une description d'application sur le panneau de gauche et cliquez sur "Générer" pour démarrer l'analyse de l'IA.
              </p>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
