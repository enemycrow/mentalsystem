import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { Objective } from '../components/Objectives/ObjectiveCard';
import SystemView from '../components/System/SystemView';
import SystemDesigner from '../components/System/SystemDesigner';
import type { SystemData } from '../components/System/SystemDesigner';
import api from '../services/api';

export default function ObjectiveDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [objective, setObjective] = useState<Objective | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingSystem, setEditingSystem] = useState(false);
  const [systemData, setSystemData] = useState<SystemData>({
    purpose: '',
    elements: [],
    interactions: [],
  });

  const fetchObjective = useCallback(async () => {
    try {
      const res = await api.get<Objective>(`/objectives/${id}`);
      setObjective(res.data);
      if (res.data.system) {
        setSystemData(res.data.system);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchObjective();
  }, [fetchObjective]);

  const handleStatusChange = async (status: 'active' | 'completed' | 'archived') => {
    try {
      await api.put(`/objectives/${id}`, { status });
      setObjective((prev) => (prev ? { ...prev, status } : prev));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar.');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Estas seguro de que quieres eliminar este objetivo?'))
      return;
    try {
      await api.del(`/objectives/${id}`);
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar.');
    }
  };

  const handleSaveSystem = async () => {
    try {
      await api.put(`/objectives/${id}`, { system: systemData });
      setObjective((prev) =>
        prev ? { ...prev, system: systemData } : prev,
      );
      setEditingSystem(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar sistema.');
    }
  };

  const statusLabel = (status: string) => {
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
  };

  if (loading) {
    return (
      <div className="page-detail">
        <div className="loading-state">
          <div className="spinner" />
          <p>Cargando objetivo...</p>
        </div>
      </div>
    );
  }

  if (error || !objective) {
    return (
      <div className="page-detail">
        <div className="alert alert-error">{error || 'Objetivo no encontrado.'}</div>
        <button className="btn btn-ghost" onClick={() => navigate('/dashboard')}>
          Volver al Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="page-detail">
      <button className="btn btn-ghost btn-back" onClick={() => navigate('/dashboard')}>
        &larr; Volver
      </button>

      <div className="detail-header">
        <div>
          <h1>{objective.title}</h1>
          <span className={`status-badge status-${objective.status}`}>
            {statusLabel(objective.status)}
          </span>
        </div>
        <div className="detail-actions">
          {objective.status === 'active' && (
            <button
              className="btn btn-sm btn-outline"
              onClick={() => handleStatusChange('completed')}
            >
              Marcar completado
            </button>
          )}
          {objective.status === 'completed' && (
            <button
              className="btn btn-sm btn-outline"
              onClick={() => handleStatusChange('archived')}
            >
              Archivar
            </button>
          )}
          {objective.status === 'archived' && (
            <button
              className="btn btn-sm btn-outline"
              onClick={() => handleStatusChange('active')}
            >
              Reactivar
            </button>
          )}
          <button className="btn btn-sm btn-danger" onClick={handleDelete}>
            Eliminar
          </button>
        </div>
      </div>

      <div className="detail-section">
        <h3>Descripcion</h3>
        <p>{objective.description}</p>
      </div>

      {objective.reflections && (
        <div className="detail-section">
          <h3>Reflexiones</h3>
          <div className="reflections-list">
            <div className="reflection-item">
              <p className="reflection-question">
                1. Que sistema esta haciendo que este objetivo sea dificil?
              </p>
              <p className="reflection-answer">
                {objective.reflections.question1}
              </p>
            </div>
            <div className="reflection-item">
              <p className="reflection-question">
                2. Como puedo reducir la friccion?
              </p>
              <p className="reflection-answer">
                {objective.reflections.question2}
              </p>
            </div>
            <div className="reflection-item">
              <p className="reflection-question">
                3. Como puedo disenar un sistema para que mis resultados sean
                inevitables?
              </p>
              <p className="reflection-answer">
                {objective.reflections.question3}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="detail-section">
        <div className="detail-section-header">
          <h3>Sistema</h3>
          {!editingSystem && (
            <button
              className="btn btn-sm btn-outline"
              onClick={() => setEditingSystem(true)}
            >
              Editar sistema
            </button>
          )}
        </div>

        {editingSystem ? (
          <div>
            <SystemDesigner
              data={systemData}
              onChange={setSystemData}
              onNext={handleSaveSystem}
              onBack={() => setEditingSystem(false)}
            />
          </div>
        ) : objective.system ? (
          <SystemView
            purpose={objective.system.purpose}
            elements={objective.system.elements}
            interactions={objective.system.interactions}
          />
        ) : (
          <div className="empty-state">
            <p>No hay sistema definido aun.</p>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setEditingSystem(true)}
            >
              Disenar sistema
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
