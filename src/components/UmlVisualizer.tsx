import React, { useState } from 'react';
import type { AppTemplate } from '../utils/templates';
import { GitCommit, Users, Database, Layers, Play } from 'lucide-react';

interface UmlVisualizerProps {
  template: AppTemplate;
}

type DiagramType = 'class' | 'usecase' | 'sequence';

export const UmlVisualizer: React.FC<UmlVisualizerProps> = ({ template }) => {
  const [diagramType, setDiagramType] = useState<DiagramType>('class');
  const uml = template.umlData;

  const renderClassDiagram = () => {
    if (!uml.classes || uml.classes.length === 0) {
      return (
        <g>
          <text x="250" y="200" fill="var(--text-secondary)" textAnchor="middle">
            Diagramme non disponible pour ce template.
          </text>
        </g>
      );
    }

    // Dynamic grid layout for classes
    return (
      <g>
        {/* Class boxes */}
        {uml.classes.map((cls, idx) => {
          const x = 50 + (idx % 2) * 360;
          const y = 30 + Math.floor(idx / 2) * 190;
          const width = 280;
          const height = 150;
          const headerHeight = 35;
          const attrHeight = 55;

          return (
            <g key={cls.name} className="uml-node-group">
              {/* Class Card */}
              <rect
                x={x}
                y={y}
                width={width}
                height={height}
                className="uml-class-box"
              />
              
              {/* Header */}
              <rect
                x={x}
                y={y}
                width={width}
                height={headerHeight}
                fill="rgba(99, 102, 241, 0.15)"
                stroke="var(--accent-primary)"
                strokeWidth="1"
                rx="6"
              />
              <text
                x={x + width / 2}
                y={y + 22}
                textAnchor="middle"
                className="uml-class-header"
                style={{ fill: 'var(--text-primary)', fontWeight: 700 }}
              >
                {cls.name}
              </text>

              {/* Attributes block */}
              <text x={x + 15} y={y + headerHeight + 20} className="uml-class-text">
                {cls.attributes.slice(0, 3).map((attr) => `▪ ${attr}`).join('\\n')}
                {cls.attributes.map((attr, aIdx) => (
                  <tspan x={x + 15} dy={aIdx === 0 ? 0 : 16} key={attr}>
                    {`▪ ${attr}`}
                  </tspan>
                ))}
              </text>

              {/* Divider */}
              <line
                x1={x}
                y1={y + headerHeight + attrHeight}
                x2={x + width}
                y2={y + headerHeight + attrHeight}
                stroke="var(--border-color)"
                strokeWidth="1"
              />

              {/* Methods block */}
              <text x={x + 15} y={y + headerHeight + attrHeight + 18} className="uml-class-text" style={{ fill: 'var(--accent-secondary)' }}>
                {cls.methods.map((method, mIdx) => (
                  <tspan x={x + 15} dy={mIdx === 0 ? 0 : 16} key={method}>
                    {`⚙ ${method}`}
                  </tspan>
                ))}
              </text>
            </g>
          );
        })}

        {/* Association lines */}
        {uml.links && uml.links.map((link, idx) => {
          // Hardcoded link paths corresponding to class indexing positions
          const fromIdx = uml.classes.findIndex(c => c.name === link.from);
          const toIdx = uml.classes.findIndex(c => c.name === link.to);

          if (fromIdx === -1 || toIdx === -1) return null;

          const fromX = 50 + (fromIdx % 2) * 360 + 140;
          const fromY = 30 + Math.floor(fromIdx / 2) * 190 + 75;

          const toX = 50 + (toIdx % 2) * 360 + 140;
          const toY = 30 + Math.floor(toIdx / 2) * 190 + 75;

          return (
            <g key={idx}>
              <line
                x1={fromX}
                y1={fromY}
                x2={toX}
                y2={toY}
                className="uml-link-solid"
                style={{ stroke: 'var(--accent-secondary)', opacity: 0.8 }}
              />
              {/* Arrow marker */}
              <circle cx={toX} cy={toY} r="4" fill="var(--accent-secondary)" />
              {/* Relationship label */}
              <rect
                x={(fromX + toX) / 2 - 50}
                y={(fromY + toY) / 2 - 10}
                width="100"
                height="18"
                fill="var(--bg-secondary)"
                rx="4"
                stroke="var(--border-color)"
              />
              <text
                x={(fromX + toX) / 2}
                y={(fromY + toY) / 2 + 3}
                fill="var(--text-secondary)"
                fontSize="9"
                textAnchor="middle"
                fontFamily="var(--font-sans)"
              >
                {link.label}
              </text>
            </g>
          );
        })}
      </g>
    );
  };

  const renderUseCaseDiagram = () => {
    if (!uml.useCases || uml.useCases.length === 0) {
      return (
        <g>
          <text x="250" y="200" fill="var(--text-secondary)" textAnchor="middle">
            Diagramme non disponible pour ce template.
          </text>
        </g>
      );
    }

    return (
      <g>
        {/* System Boundary Container */}
        <rect
          x="220"
          y="20"
          width="480"
          height="410"
          fill="rgba(25, 28, 40, 0.4)"
          stroke="var(--border-color)"
          strokeWidth="2"
          strokeDasharray="4 4"
          rx="8"
        />
        <text
          x="460"
          y="42"
          fill="var(--accent-primary)"
          fontWeight="bold"
          fontSize="12"
          textAnchor="middle"
          fontFamily="var(--font-sans)"
        >
          Système : Auto-Generated {template.name}
        </text>

        {/* Actors rendering */}
        {uml.useCases.map((uc, actIdx) => {
          const actX = 80;
          const actY = 120 + actIdx * 170;

          return (
            <g key={uc.actor} className="uml-actor">
              {/* Stick Figure Actor */}
              <circle cx={actX} cy={actY} r="16" fill="none" stroke="var(--accent-secondary)" strokeWidth="2.5" />
              <line x1={actX} y1={actY + 16} x2={actX} y2={actY + 50} stroke="var(--accent-secondary)" strokeWidth="2.5" />
              <line x1={actX - 20} x2={actX + 20} y1={actY + 28} y2={actY + 28} stroke="var(--accent-secondary)" strokeWidth="2.5" />
              <line x1={actX} y1={actY + 50} x2={actX - 15} y2={actY + 80} stroke="var(--accent-secondary)" strokeWidth="2.5" />
              <line x1={actX} y1={actY + 50} x2={actX + 15} y2={actY + 80} stroke="var(--accent-secondary)" strokeWidth="2.5" />
              
              {/* Actor Label */}
              <text
                x={actX}
                y={actY + 105}
                fill="var(--text-primary)"
                fontSize="12"
                fontWeight="bold"
                textAnchor="middle"
                fontFamily="var(--font-sans)"
              >
                {uc.actor}
              </text>

              {/* Use cases ellipses inside system boundary */}
              {uc.cases.map((cs, csIdx) => {
                const ucX = 460;
                const ucY = 80 + actIdx * 180 + csIdx * 50;
                const rx = 140;
                const ry = 20;

                return (
                  <g key={cs}>
                    {/* Ellipse */}
                    <ellipse
                      cx={ucX}
                      cy={ucY}
                      rx={rx}
                      ry={ry}
                      fill="var(--bg-secondary)"
                      stroke="var(--accent-primary)"
                      strokeWidth="1.5"
                      style={{ cursor: 'pointer' }}
                    />
                    <text
                      x={ucX}
                      y={ucY + 4}
                      fill="var(--text-primary)"
                      fontSize="10"
                      fontWeight="600"
                      textAnchor="middle"
                      fontFamily="var(--font-sans)"
                    >
                      {cs}
                    </text>

                    {/* Actor to Use Case Link line */}
                    <line
                      x1={actX + 25}
                      y1={actY + 30}
                      x2={ucX - rx}
                      y2={ucY}
                      stroke="rgba(243, 244, 246, 0.25)"
                      strokeWidth="1.2"
                    />
                  </g>
                );
              })}
            </g>
          );
        })}
      </g>
    );
  };

  const renderSequenceDiagram = () => {
    const lifelines = [
      { name: 'Navigateur (React)', x: 120 },
      { name: 'Serveur (Express API)', x: 380 },
      { name: 'Base de Données (SQL)', x: 640 }
    ];

    const flows = [
      { from: 0, to: 1, label: '1. Requête HTTP GET /api/data', y: 110, type: 'req' },
      { from: 1, to: 2, label: '2. Requête SQL SELECT/INSERT', y: 160, type: 'req' },
      { from: 2, to: 1, label: '3. Jeu de données (Dataset)', y: 220, type: 'res' },
      { from: 1, to: 0, label: '4. Réponse JSON 200 OK + Payload', y: 280, type: 'res' }
    ];

    return (
      <g>
        {/* Draw Lifelines */}
        {lifelines.map((line, idx) => (
          <g key={line.name}>
            {/* Box Header */}
            <rect
              x={line.x - 70}
              y="30"
              width="140"
              height="35"
              fill="var(--bg-secondary)"
              stroke="var(--accent-primary)"
              strokeWidth="1.5"
              rx="6"
            />
            <text
              x={line.x}
              y="52"
              fill="var(--text-primary)"
              fontWeight="bold"
              fontSize="10"
              textAnchor="middle"
              fontFamily="var(--font-sans)"
            >
              {line.name}
            </text>

            {/* Vertical Lifeline Line */}
            <line
              x1={line.x}
              y1="65"
              x2={line.x}
              y2="380"
              stroke="var(--border-color)"
              strokeWidth="1.5"
              strokeDasharray="4 4"
            />

            {/* Active Execution Bars */}
            <rect
              x={line.x - 6}
              y="90"
              width="12"
              height="210"
              fill="rgba(99, 102, 241, 0.2)"
              stroke="var(--accent-primary)"
              strokeWidth="1"
            />
          </g>
        ))}

        {/* Draw Request Flows */}
        {flows.map((flow, idx) => {
          const fromX = lifelines[flow.from].x;
          const toX = lifelines[flow.to].x;
          const isForward = toX > fromX;

          return (
            <g key={idx}>
              {/* Arrow Line */}
              <line
                x1={fromX + (isForward ? 6 : -6)}
                y1={flow.y}
                x2={toX + (isForward ? -10 : 10)}
                y2={flow.y}
                stroke={flow.type === 'req' ? 'var(--accent-secondary)' : 'var(--success)'}
                strokeWidth="1.8"
                strokeDasharray={flow.type === 'res' ? '4 4' : 'none'}
              />
              
              {/* Arrow Head */}
              <polygon
                points={
                  isForward
                    ? `${toX - 8},${flow.y - 4} ${toX},${flow.y} ${toX - 8},${flow.y + 4}`
                    : `${toX + 8},${flow.y - 4} ${toX},${flow.y} ${toX + 8},${flow.y + 4}`
                }
                fill={flow.type === 'req' ? 'var(--accent-secondary)' : 'var(--success)'}
              />

              {/* Message text */}
              <text
                x={(fromX + toX) / 2}
                y={flow.y - 8}
                fill="var(--text-primary)"
                fontSize="10"
                fontWeight="600"
                textAnchor="middle"
                fontFamily="var(--font-mono)"
              >
                {flow.label}
              </text>
            </g>
          );
        })}
      </g>
    );
  };

  return (
    <div className="uml-visualizer-container">
      <div className="uml-diagram-selector">
        <button
          onClick={() => setDiagramType('class')}
          className={`btn ${diagramType === 'class' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
        >
          <GitCommit size={14} /> Diagramme de Classes
        </button>
        <button
          onClick={() => setDiagramType('usecase')}
          className={`btn ${diagramType === 'usecase' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
        >
          <Users size={14} /> Cas d'Utilisation (Usecase)
        </button>
        <button
          onClick={() => setDiagramType('sequence')}
          className={`btn ${diagramType === 'sequence' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
        >
          <Layers size={14} /> Diagramme de Séquence
        </button>
      </div>

      <div className="uml-canvas-wrapper">
        <svg viewBox="0 0 760 450" className="uml-svg">
          {/* Background grid */}
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <rect width="20" height="20" fill="none" />
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255, 255, 255, 0.02)" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />

          {diagramType === 'class' && renderClassDiagram()}
          {diagramType === 'usecase' && renderUseCaseDiagram()}
          {diagramType === 'sequence' && renderSequenceDiagram()}
        </svg>
      </div>
    </div>
  );
};
