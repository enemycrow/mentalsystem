import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useApi } from '../hooks/useApi';
import ObjectiveList from '../components/Objectives/ObjectiveList';
import type { Objective } from '../components/Objectives/ObjectiveCard';

export default function Dashboard() {
  const { user } = useAuth();
  const { get, loading, error } = useApi<Objective[]>();
  const [objectives, setObjectives] = useState<Objective[]>([]);

  useEffect(() => {
    const fetchObjectives = async () => {
      try {
        const data = await get('/objectives');
        if (data) setObjectives(data);
      } catch {
        // error handled by useApi
      }
    };
    fetchObjectives();
  }, [get]);

  return (
    <div className="page-dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Bienvenido, {user?.name ?? 'Usuario'}</h1>
          <p className="text-muted">
            Gestiona tus objetivos y sistemas
          </p>
        </div>
        <Link to="/new-objective" className="btn btn-primary">
          + Nuevo Objetivo
        </Link>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="loading-state">
          <div className="spinner" />
          <p>Cargando tus objetivos...</p>
        </div>
      ) : (
        <ObjectiveList objectives={objectives} />
      )}
    </div>
  );
}
