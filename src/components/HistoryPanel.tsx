import React from 'react';
import { APP_TEMPLATES } from '../utils/templates';
import type { AppTemplate } from '../utils/templates';
import { History, Clock, Cpu, Trash2, X, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export interface HistoryEntry {
  id: string;
  templateId: string;
  prompt: string;
  dbType: string;
  backendType: string;
  timestamp?: number;
  createdAt?: string;
  appName?: string;
}

interface HistoryPanelProps {
  onClose: () => void;
  onRestore: (template: AppTemplate, entry: HistoryEntry) => void;
}

const HISTORY_KEY = 'auto_app_history';

export const loadHistory = (): HistoryEntry[] => {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const saveHistoryEntry = (entry: HistoryEntry) => {
  try {
    const existing = loadHistory();
    const updated = [entry, ...existing.filter(e => e.id !== entry.id)].slice(0, 12);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  } catch {
    // ignore
  }
};

export const clearHistory = () => {
  localStorage.removeItem(HISTORY_KEY);
};

const formatTimestamp = (ts: number): string => {
  const d = new Date(ts);
  const now = Date.now();
  const diff = Math.floor((now - ts) / 1000);
  if (diff < 60) return 'À l\'instant';
  if (diff < 3600) return `Il y a ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)}h`;
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
};

const TEMPLATE_COLORS: Record<string, string> = {
  ecommerce: '#6366f1',
  delivery: '#f59e0b',
  bi: '#3b82f6',
  school: '#10b981',
  hotel: '#a855f7',
  crm: '#0ea5e9',
  pharmacy: '#06b6d4',
  booking: '#8b5cf6',
};

export const HistoryPanel: React.FC<HistoryPanelProps> = ({ onClose, onRestore }) => {
  const { user } = useAuth();
  const [entries, setEntries] = React.useState<HistoryEntry[]>([]);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);

  React.useEffect(() => {
    const fetchHistory = async () => {
      if (!user?.token) {
        setIsLoading(false);
        return;
      }
      try {
        const response = await fetch('http://127.0.0.1:5000/api/generations', {
          headers: {
            'Authorization': `Bearer ${user.token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setEntries(data.generations);
        }
      } catch (e) {
        console.error('Fetch history error:', e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, [user]);

  const handleRestore = (entry: HistoryEntry) => {
    const template = APP_TEMPLATES[entry.templateId];
    if (template) {
      onRestore(template, entry);
      onClose();
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user?.token) return;
    try {
      const response = await fetch(`http://127.0.0.1:5000/api/generations/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      if (response.ok) {
        setEntries(prev => prev.filter(en => en.id !== id));
      } else {
        alert('Erreur lors de la suppression de la génération.');
      }
    } catch (err) {
      console.error(err);
      alert('Erreur réseau lors de la suppression.');
    }
  };

  const handleClearAll = async () => {
    if (!user?.token || entries.length === 0) return;
    const confirmClear = window.confirm('Êtes-vous sûr de vouloir supprimer tout l\'historique ?');
    if (!confirmClear) return;
    
    try {
      await Promise.all(
        entries.map(entry =>
          fetch(`http://127.0.0.1:5000/api/generations/${entry.id}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${user.token}`
            }
          })
        )
      );
      setEntries([]);
    } catch (e) {
      console.error('Error clearing history:', e);
      alert('Une erreur est survenue lors de la suppression de tout l\'historique.');
    }
  };

  return (
    <div className="history-panel-overlay" onClick={onClose}>
      <div className="history-panel" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="history-panel-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <History size={18} style={{ color: 'var(--accent-primary)' }} />
            <span style={{ fontWeight: 700, fontSize: '1rem' }}>Historique des Générations</span>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            {entries.length > 0 && (
              <button
                onClick={handleClearAll}
                className="btn btn-secondary"
                style={{ padding: '0.3rem 0.6rem', fontSize: '0.72rem', color: 'var(--error)', borderColor: 'var(--error)' }}
              >
                <Trash2 size={12} /> Tout effacer
              </button>
            )}
            <button
              onClick={onClose}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex' }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="history-panel-body">
          {isLoading ? (
            <div className="history-empty">
              <span className="spinner" style={{
                width: '30px',
                height: '30px',
                border: '3px solid rgba(99, 102, 241, 0.2)',
                borderTopColor: 'var(--accent-primary)',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></span>
              <p>Chargement de l'historique...</p>
            </div>
          ) : entries.length === 0 ? (
            <div className="history-empty">
              <Cpu size={36} style={{ color: 'var(--text-muted)', strokeWidth: 1.2 }} />
              <p>Aucune génération dans l'historique.</p>
              <span>Commencez par générer une application !</span>
            </div>
          ) : (
            entries.map((entry) => {
              const template = APP_TEMPLATES[entry.templateId];
              const color = TEMPLATE_COLORS[entry.templateId] || 'var(--accent-primary)';
              const timestamp = entry.timestamp || (entry.createdAt ? new Date(entry.createdAt).getTime() : Date.now());
              return (
                <div
                  key={entry.id}
                  className="history-entry"
                  onClick={() => handleRestore(entry)}
                  title="Cliquer pour restaurer cette génération"
                >
                  <div className="history-entry-accent" style={{ background: color }} />
                  <div className="history-entry-content">
                    <div className="history-entry-header">
                      <span className="history-entry-name">
                        {entry.appName || template?.name || entry.templateId}
                      </span>
                      <span className="history-entry-time">
                        <Clock size={11} />
                        {formatTimestamp(timestamp)}
                      </span>
                    </div>
                    <p className="history-entry-prompt">{entry.prompt}</p>
                    <div className="history-entry-meta">
                      <span className="history-meta-tag">{entry.dbType}</span>
                      <span className="history-meta-tag">{entry.backendType}</span>
                    </div>
                  </div>
                  <div className="history-entry-actions">
                    <RefreshCw size={13} style={{ color: 'var(--accent-primary)' }} />
                    <button
                      onClick={(e) => handleDelete(entry.id, e)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', padding: 0 }}
                      title="Supprimer cette entrée"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
