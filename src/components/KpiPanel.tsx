import React from 'react';
import type { AppTemplate } from '../utils/templates';
import { TrendingUp, TrendingDown, Database, GitBranch, Shield, Activity } from 'lucide-react';

interface KpiPanelProps {
  template: AppTemplate;
}

export const KpiPanel: React.FC<KpiPanelProps> = ({ template }) => {
  return (
    <div className="kpi-panel-wrapper">

      {/* App summary banner */}
      <div className="kpi-summary-banner">
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            {template.name}
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            {template.description}
          </p>
        </div>
        <span className="role-tag" style={{ background: 'var(--accent-primary)', whiteSpace: 'nowrap' }}>
          <Activity size={10} style={{ marginRight: '0.25rem' }} />
          {template.files.length} fichiers générés
        </span>
      </div>

      {/* KPI Metrics */}
      <div className="kpi-metrics-section">
        <h4 className="kpi-section-title">
          <TrendingUp size={14} /> Indicateurs Clés de Performance (KPIs)
        </h4>
        <div className="kpi-cards-grid">
          {template.kpis.map((kpi, idx) => (
            <div key={idx} className="kpi-card">
              <p className="kpi-card-label">{kpi.label}</p>
              <div className="kpi-card-value">{kpi.value}</div>
              <span className={`kpi-card-change ${kpi.positive ? 'positive' : 'negative'}`}>
                {kpi.positive
                  ? <TrendingUp size={11} />
                  : <TrendingDown size={11} />
                }
                {kpi.change}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Info Grid: Entities + Relations + Roles */}
      <div className="kpi-info-grid">

        {/* Entities */}
        <div className="kpi-info-block">
          <h4 className="kpi-section-title">
            <Database size={14} /> Entités Métier
          </h4>
          <div className="kpi-entity-tags">
            {template.entities.map((entity, i) => (
              <span key={i} className="kpi-entity-tag">{entity}</span>
            ))}
          </div>
        </div>

        {/* Relations */}
        <div className="kpi-info-block">
          <h4 className="kpi-section-title">
            <GitBranch size={14} /> Relations & Cardinalités
          </h4>
          <ul className="kpi-relations-list">
            {template.relations.map((rel, i) => (
              <li key={i} className="kpi-relation-item">
                <span className="kpi-relation-dot" />
                {rel}
              </li>
            ))}
          </ul>
        </div>

        {/* Roles */}
        <div className="kpi-info-block">
          <h4 className="kpi-section-title">
            <Shield size={14} /> Rôles Utilisateurs
          </h4>
          <div className="kpi-roles-list">
            {template.roles.map((role, i) => (
              <div key={i} className="kpi-role-badge">
                <Shield size={11} />
                {role}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
