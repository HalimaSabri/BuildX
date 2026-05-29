import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import type { UserRole } from './context/AuthContext';
import { Auth } from './components/Auth';
import { AppGenerator } from './components/AppGenerator';
import { Cpu, Sun, Moon, LogOut, Shield } from 'lucide-react';
import './App.css'; // Keep App.css for simple local styles if any, although index.css holds the system

const MainAppContent: React.FC = () => {
  const { user, isAuthenticated, logout, updateRole, isLoading } = useAuth();
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // Handle theme toggling
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.add('light');
    } else {
      root.classList.remove('light');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  if (isLoading) {
    return (
      <div className="flex-center" style={{ height: '100vh', background: 'var(--bg-primary)', color: 'var(--text-primary)', flexDirection: 'column', gap: '1rem' }}>
        <span className="spinner" style={{
          width: '40px',
          height: '40px',
          border: '3px solid rgba(99, 102, 241, 0.2)',
          borderTopColor: 'var(--accent-primary)',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></span>
        <span style={{ fontSize: '0.9rem', fontWeight: 600, letterSpacing: '0.05em' }}>CHARGEMENT DE LA PLATEFORME...</span>
        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Auth />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Premium Header */}
      <header className="cyber-header">
        <div className="logo-container" onClick={() => window.location.reload()}>
          <Cpu className="logo-icon" />
          <span>Auto-App Generator</span>
        </div>

        <div className="nav-actions">
          {/* Theme Switcher */}
          <button onClick={toggleTheme} className="theme-toggle-btn" title="Changer le thème">
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* User Badge with role modifier */}
          <div className="user-profile-badge">
            <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{user?.username}</span>
            <span className="role-tag" style={{ background: user?.role === 'Admin' ? 'var(--success)' : 'var(--accent-primary)' }}>
              {user?.role}
            </span>
          </div>

          {/* Role switcher selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', background: 'var(--bg-tertiary)', padding: '0.25rem 0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
            <Shield size={14} style={{ color: 'var(--text-secondary)' }} />
            <select
              style={{ background: 'none', border: 'none', color: 'var(--text-primary)', fontSize: '0.75rem', fontWeight: 600, outline: 'none', cursor: 'pointer' }}
              value={user?.role}
              onChange={(e) => updateRole(e.target.value as UserRole)}
            >
              <option value="User" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>Rôle: Standard</option>
              <option value="Admin" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>Rôle: Admin</option>
            </select>
          </div>

          {/* Logout */}
          <button
            onClick={logout}
            className="btn btn-secondary"
            style={{ padding: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            title="Se déconnecter"
          >
            <LogOut size={16} />
          </button>
        </div>
      </header>

      {/* Main Workspace Workspace */}
      <main className="app-container">
        <div style={{ marginBottom: '1rem' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0.5rem 0 0.25rem', background: 'linear-gradient(90deg, var(--text-primary), var(--accent-primary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Moteur de Génération Low-Code / IA
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Configurez vos besoins en langage naturel pour compiler des bases de données SQL, concevoir des APIs REST et structurer des layouts React en temps réel.
          </p>
        </div>
        <AppGenerator />
      </main>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border-color)', background: 'var(--bg-secondary)', padding: '1rem 2rem', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
        <strong>Auto-App Generator</strong> &copy; 2026 &mdash; Plateforme intelligente de génération automatique d'applications web full-stack par Intelligence Artificielle.
      </footer>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
}

export default App;
