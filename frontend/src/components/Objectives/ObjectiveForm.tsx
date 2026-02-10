interface ObjectiveFormProps {
  title: string;
  description: string;
  onChange: (field: 'title' | 'description', value: string) => void;
  onNext: () => void;
}

export default function ObjectiveForm({
  title,
  description,
  onChange,
  onNext,
}: ObjectiveFormProps) {
  const canProceed = title.trim().length > 0 && description.trim().length > 0;

  return (
    <div className="wizard-step">
      <div className="wizard-step-header">
        <span className="wizard-step-number">1</span>
        <h2>Define tu objetivo</h2>
      </div>
      <p className="wizard-step-desc">
        Escribe un objetivo claro y especifico que quieras alcanzar.
      </p>

      <div className="form-group">
        <label htmlFor="obj-title">Titulo del objetivo</label>
        <input
          id="obj-title"
          type="text"
          value={title}
          onChange={(e) => onChange('title', e.target.value)}
          placeholder="Ej: Hacer ejercicio 4 veces por semana"
        />
      </div>

      <div className="form-group">
        <label htmlFor="obj-desc">Descripcion</label>
        <textarea
          id="obj-desc"
          value={description}
          onChange={(e) => onChange('description', e.target.value)}
          placeholder="Describe por que este objetivo es importante para ti y que esperas lograr..."
          rows={4}
        />
      </div>

      <div className="wizard-actions">
        <div />
        <button
          className="btn btn-primary"
          onClick={onNext}
          disabled={!canProceed}
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}
