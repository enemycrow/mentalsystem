import { useState } from 'react';
import ObjectiveCard, { type Objective } from './ObjectiveCard';

interface ObjectiveListProps {
  objectives: Objective[];
}

type FilterTab = 'all' | 'active' | 'completed' | 'archived';

const tabs: { key: FilterTab; label: string }[] = [
  { key: 'all', label: 'Todos' },
  { key: 'active', label: 'Activos' },
  { key: 'completed', label: 'Completados' },
  { key: 'archived', label: 'Archivados' },
];

export default function ObjectiveList({ objectives }: ObjectiveListProps) {
  const [filter, setFilter] = useState<FilterTab>('all');

  const filtered =
    filter === 'all'
      ? objectives
      : objectives.filter((o) => o.status === filter);

  return (
    <div className="objective-list">
      <div className="filter-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={`filter-tab ${filter === tab.key ? 'active' : ''}`}
            onClick={() => setFilter(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
              <rect x="9" y="3" width="6" height="4" rx="1" />
            </svg>
          </div>
          <h3>No hay objetivos</h3>
          <p>
            {filter === 'all'
              ? 'Crea tu primer objetivo para comenzar.'
              : `No tienes objetivos ${tabs.find((t) => t.key === filter)?.label.toLowerCase()}.`}
          </p>
        </div>
      ) : (
        <div className="objective-grid">
          {filtered.map((obj) => (
            <ObjectiveCard key={obj.id} objective={obj} />
          ))}
        </div>
      )}
    </div>
  );
}
