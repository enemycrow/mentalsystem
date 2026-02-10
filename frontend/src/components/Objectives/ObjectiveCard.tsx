import { Link } from 'react-router-dom';

export interface Objective {
  id: string;
  title: string;
  description: string;
  status: 'active' | 'completed' | 'archived';
  created_at: string;
  reflections?: {
    question1: string;
    question2: string;
    question3: string;
  };
  system?: {
    purpose: string;
    elements: { name: string; description: string }[];
    interactions: {
      element_from: string;
      element_to: string;
      description: string;
    }[];
  };
}

interface ObjectiveCardProps {
  objective: Objective;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function statusLabel(status: string): string {
  switch (status) {
    case 'active':
      return 'Activo';
    case 'completed':
      return 'Completado';
    case 'archived':
      return 'Archivado';
    default:
      return status;
  }
}

export default function ObjectiveCard({ objective }: ObjectiveCardProps) {
  const truncated =
    objective.description.length > 120
      ? objective.description.slice(0, 120) + '...'
      : objective.description;

  return (
    <Link to={`/objective/${objective.id}`} className="objective-card">
      <div className="objective-card-header">
        <h3 className="objective-card-title">{objective.title}</h3>
        <span className={`status-badge status-${objective.status}`}>
          {statusLabel(objective.status)}
        </span>
      </div>
      <p className="objective-card-desc">{truncated}</p>
      <div className="objective-card-footer">
        <span className="objective-card-date">
          {formatDate(objective.created_at)}
        </span>
      </div>
    </Link>
  );
}
