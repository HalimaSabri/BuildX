import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import type { UserRole } from '../context/AuthContext';
import { Mail, Lock, User as UserIcon, Shield, Cpu, Info } from 'lucide-react';

export const Auth: React.FC = () => {
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [role, setRole] = useState<UserRole>('User');
  
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        if (!email || !password) {
          setError('Veuillez remplir tous les champs.');
          setLoading(false);
          return;
        }
        const success = await login(email, password);
        if (!success) {
          setError('Identifiants invalides (le mot de passe doit faire au moins 4 caractères).');
        }
      } else {
        if (!username || !email || !password) {
          setError('Veuillez remplir tous les champs.');
          setLoading(false);
          return;
        }
        if (password.length < 4) {
          setError('Le mot de passe doit contenir au moins 4 caractères.');
          setLoading(false);
          return;
        }
        const success = await register(username, email, password, role);
        if (!success) {
          setError('Une erreur est survenue lors de l\'inscription.');
        }
      }
    } catch (err) {
      setError('Une erreur réseau est survenue. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const handlePresetFill = (isAdmin: boolean) => {
    if (isAdmin) {
      setEmail('admin@autoapp.ai');
      setPassword('admin123');
      setIsLogin(true);
    } else {
      setEmail('developer@autoapp.ai');
      setPassword('dev123');
      setIsLogin(true);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="cyber-card auth-card">
        <div className="auth-header">
          <div className="flex-center" style={{ gap: '0.5rem', marginBottom: '1rem' }}>
            <Cpu className="logo-icon" style={{ width: '40px', height: '40px' }} />
          </div>
          <h2 className="auth-title">
            {isLogin ? 'Connexion' : 'Créer un Compte'}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.5rem' }}>
            {isLogin ? 'Accédez à votre espace Auto-App Generator' : 'Rejoignez la révolution de la génération d\'applications'}
          </p>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid var(--error)',
            borderRadius: 'var(--radius-sm)',
            padding: '0.75rem 1rem',
            color: 'var(--error)',
            fontSize: '0.85rem',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <Info style={{ width: '16px', height: '16px', flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="form-group">
              <label className="form-label" htmlFor="username">
                <span className="flex-center" style={{ justifyContent: 'flex-start', gap: '0.5rem' }}>
                  <UserIcon style={{ width: '16px', height: '16px', color: 'var(--text-secondary)' }} />
                  Nom d'utilisateur
                </span>
              </label>
              <input
                id="username"
                type="text"
                className="form-input"
                placeholder="Ex. Jean Dupont"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="email">
              <span className="flex-center" style={{ justifyContent: 'flex-start', gap: '0.5rem' }}>
                <Mail style={{ width: '16px', height: '16px', color: 'var(--text-secondary)' }} />
                Adresse Email
              </span>
            </label>
            <input
              id="email"
              type="email"
              className="form-input"
              placeholder="votre@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">
              <span className="flex-center" style={{ justifyContent: 'flex-start', gap: '0.5rem' }}>
                <Lock style={{ width: '16px', height: '16px', color: 'var(--text-secondary)' }} />
                Mot de passe
              </span>
            </label>
            <input
              id="password"
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {!isLogin && (
            <div className="form-group">
              <label className="form-label" htmlFor="role">
                <span className="flex-center" style={{ justifyContent: 'flex-start', gap: '0.5rem' }}>
                  <Shield style={{ width: '16px', height: '16px', color: 'var(--text-secondary)' }} />
                  Rôle de l'Utilisateur
                </span>
              </label>
              <select
                id="role"
                className="form-select"
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
              >
                <option value="User">Utilisateur Standard (Génération simple)</option>
                <option value="Admin">Administrateur (Contrôle total & Superviseur)</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '1rem', padding: '0.85rem' }}
            disabled={loading}
          >
            {loading ? (
              <span className="flex-center" style={{ gap: '0.5rem' }}>
                <span className="spinner" style={{
                  width: '18px',
                  height: '18px',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTopColor: '#fff',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite'
                }}></span>
                {isLogin ? 'Connexion en cours...' : 'Inscription en cours...'}
              </span>
            ) : (
              isLogin ? 'Se Connecter' : 'Créer un Compte'
            )}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.85rem' }}>
          <span style={{ color: 'var(--text-secondary)' }}>
            {isLogin ? 'Nouveau sur la plateforme ? ' : 'Déjà un compte ? '}
          </span>
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError(null);
            }}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--accent-primary)',
              fontWeight: '600',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            {isLogin ? 'S\'inscrire' : 'Se connecter'}
          </button>
        </div>

        {/* Quick Demo Login Preset Buttons */}
        <div style={{
          marginTop: '2rem',
          paddingTop: '1.25rem',
          borderTop: '1px solid var(--border-color)',
          textAlign: 'center'
        }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.75rem', fontWeight: 600 }}>
            COMPTES DE DÉMONSTRATION (CLIC RAPIDE)
          </p>
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
            <button
              onClick={() => handlePresetFill(false)}
              className="btn btn-secondary"
              style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}
            >
              Démo Développeur
            </button>
            <button
              onClick={() => handlePresetFill(true)}
              className="btn btn-secondary"
              style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}
            >
              Démo Administrateur
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
