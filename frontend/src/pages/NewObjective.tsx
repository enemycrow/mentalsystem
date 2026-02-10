import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ObjectiveForm from '../components/Objectives/ObjectiveForm';
import ReflectionWizard from '../components/Reflection/ReflectionWizard';
import SystemDesigner from '../components/System/SystemDesigner';
import type { SystemData } from '../components/System/SystemDesigner';
import SystemView from '../components/System/SystemView';
import api from '../services/api';

interface ReflectionData {
  question1: string;
  question2: string;
  question3: string;
}

const TOTAL_STEPS = 6;

export default function NewObjective() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const [reflections, setReflections] = useState<ReflectionData>({
    question1: '',
    question2: '',
    question3: '',
  });

  const [system, setSystem] = useState<SystemData>({
    purpose: '',
    elements: [],
    interactions: [],
  });

  const handleObjChange = (field: 'title' | 'description', value: string) => {
    if (field === 'title') setTitle(value);
    else setDescription(value);
  };

  const handleReflectionChange = (
    field: keyof ReflectionData,
    value: string,
  ) => {
    setReflections((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const res = await api.post<{ id: string }>('/objectives', {
        title,
        description,
        reflections,
        system,
      });
      navigate(`/objective/${res.data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar.');
      setSaving(false);
    }
  };

  const stepLabels = [
    'Objetivo',
    'Pregunta 1',
    'Pregunta 2',
    'Pregunta 3',
    'Sistema',
    'Resumen',
  ];

  return (
    <div className="page-new-objective">
      <div className="wizard-progress-bar">
        {stepLabels.map((label, i) => (
          <div
            key={i}
            className={`wizard-progress-step ${i === step ? 'active' : ''} ${i < step ? 'completed' : ''}`}
          >
            <div className="wizard-progress-dot">{i < step ? '\u2713' : i + 1}</div>
            <span className="wizard-progress-label">{label}</span>
          </div>
        ))}
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {step === 0 && (
        <ObjectiveForm
          title={title}
          description={description}
          onChange={handleObjChange}
          onNext={() => setStep(1)}
        />
      )}

      {step >= 1 && step <= 3 && (
        <ReflectionWizard
          step={step - 1}
          data={reflections}
          onChange={handleReflectionChange}
          onNext={() => setStep(step + 1)}
          onBack={() => setStep(step - 1)}
        />
      )}

      {step === 4 && (
        <SystemDesigner
          data={system}
          onChange={setSystem}
          onNext={() => setStep(5)}
          onBack={() => setStep(3)}
        />
      )}

      {step === 5 && (
        <div className="wizard-step">
          <div className="wizard-step-header">
            <span className="wizard-step-number">{TOTAL_STEPS}</span>
            <h2>Resumen</h2>
          </div>
          <p className="wizard-step-desc">
            Revisa toda la informacion antes de guardar.
          </p>

          <div className="summary-section">
            <h3>Objetivo</h3>
            <div className="summary-card">
              <h4>{title}</h4>
              <p>{description}</p>
            </div>
          </div>

          <div className="summary-section">
            <h3>Reflexiones</h3>
            <div className="summary-card">
              <div className="summary-qa">
                <p className="summary-question">
                  1. Que sistema esta haciendo que este objetivo sea dificil?
                </p>
                <p className="summary-answer">{reflections.question1}</p>
              </div>
              <div className="summary-qa">
                <p className="summary-question">
                  2. Como puedo reducir la friccion?
                </p>
                <p className="summary-answer">{reflections.question2}</p>
              </div>
              <div className="summary-qa">
                <p className="summary-question">
                  3. Como puedo disenar un sistema para que mis resultados sean
                  inevitables?
                </p>
                <p className="summary-answer">{reflections.question3}</p>
              </div>
            </div>
          </div>

          <div className="summary-section">
            <h3>Sistema</h3>
            <SystemView
              purpose={system.purpose}
              elements={system.elements}
              interactions={system.interactions}
            />
          </div>

          <div className="wizard-actions">
            <button className="btn btn-ghost" onClick={() => setStep(4)}>
              Atras
            </button>
            <button
              className="btn btn-primary btn-lg"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Guardando...' : 'Guardar Objetivo'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
