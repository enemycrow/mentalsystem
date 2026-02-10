interface SystemElement {
  name: string;
  description: string;
}

interface SystemInteraction {
  element_from: string;
  element_to: string;
  description: string;
}

export interface SystemData {
  purpose: string;
  elements: SystemElement[];
  interactions: SystemInteraction[];
}

interface SystemDesignerProps {
  data: SystemData;
  onChange: (data: SystemData) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function SystemDesigner({
  data,
  onChange,
  onNext,
  onBack,
}: SystemDesignerProps) {
  const updatePurpose = (purpose: string) => {
    onChange({ ...data, purpose });
  };

  const addElement = () => {
    onChange({
      ...data,
      elements: [...data.elements, { name: '', description: '' }],
    });
  };

  const removeElement = (index: number) => {
    const elements = data.elements.filter((_, i) => i !== index);
    const removedName = data.elements[index].name;
    const interactions = data.interactions.filter(
      (inter) =>
        inter.element_from !== removedName &&
        inter.element_to !== removedName,
    );
    onChange({ ...data, elements, interactions });
  };

  const updateElement = (
    index: number,
    field: keyof SystemElement,
    value: string,
  ) => {
    const oldName = data.elements[index].name;
    const elements = data.elements.map((el, i) =>
      i === index ? { ...el, [field]: value } : el,
    );
    let interactions = data.interactions;
    if (field === 'name' && oldName) {
      interactions = interactions.map((inter) => ({
        ...inter,
        element_from:
          inter.element_from === oldName ? value : inter.element_from,
        element_to: inter.element_to === oldName ? value : inter.element_to,
      }));
    }
    onChange({ ...data, elements, interactions });
  };

  const addInteraction = () => {
    onChange({
      ...data,
      interactions: [
        ...data.interactions,
        { element_from: '', element_to: '', description: '' },
      ],
    });
  };

  const removeInteraction = (index: number) => {
    onChange({
      ...data,
      interactions: data.interactions.filter((_, i) => i !== index),
    });
  };

  const updateInteraction = (
    index: number,
    field: keyof SystemInteraction,
    value: string,
  ) => {
    const interactions = data.interactions.map((inter, i) =>
      i === index ? { ...inter, [field]: value } : inter,
    );
    onChange({ ...data, interactions });
  };

  const namedElements = data.elements.filter((el) => el.name.trim());
  const canProceed =
    data.purpose.trim().length > 0 && data.elements.length > 0;

  return (
    <div className="wizard-step">
      <div className="wizard-step-header">
        <span className="wizard-step-number">5</span>
        <h2>Disena tu sistema</h2>
      </div>
      <p className="wizard-step-desc">
        Define los componentes de tu sistema y como interactuan entre si.
      </p>

      <div className="form-group">
        <label htmlFor="sys-purpose">Proposito del sistema</label>
        <textarea
          id="sys-purpose"
          value={data.purpose}
          onChange={(e) => updatePurpose(e.target.value)}
          placeholder="Cual es el proposito de tu sistema?"
          rows={3}
        />
      </div>

      <div className="system-section">
        <div className="system-section-header">
          <h3>Elementos</h3>
          <button className="btn btn-sm btn-outline" onClick={addElement}>
            + Agregar elemento
          </button>
        </div>

        {data.elements.length === 0 && (
          <p className="text-muted">
            Agrega los elementos que componen tu sistema.
          </p>
        )}

        {data.elements.map((el, i) => (
          <div key={i} className="system-element-card">
            <div className="system-element-card-header">
              <span className="element-number">{i + 1}</span>
              <button
                className="btn btn-icon btn-danger-ghost"
                onClick={() => removeElement(i)}
                title="Eliminar elemento"
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="form-group">
              <input
                type="text"
                value={el.name}
                onChange={(e) => updateElement(i, 'name', e.target.value)}
                placeholder="Nombre del elemento"
              />
            </div>
            <div className="form-group">
              <textarea
                value={el.description}
                onChange={(e) =>
                  updateElement(i, 'description', e.target.value)
                }
                placeholder="Descripcion..."
                rows={2}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="system-section">
        <div className="system-section-header">
          <h3>Interacciones</h3>
          <button
            className="btn btn-sm btn-outline"
            onClick={addInteraction}
            disabled={namedElements.length < 2}
          >
            + Agregar interaccion
          </button>
        </div>

        {namedElements.length < 2 && (
          <p className="text-muted">
            Necesitas al menos 2 elementos con nombre para crear interacciones.
          </p>
        )}

        {data.interactions.map((inter, i) => (
          <div key={i} className="system-interaction-card">
            <div className="system-element-card-header">
              <span className="interaction-label">Interaccion {i + 1}</span>
              <button
                className="btn btn-icon btn-danger-ghost"
                onClick={() => removeInteraction(i)}
                title="Eliminar interaccion"
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="interaction-selects">
              <select
                value={inter.element_from}
                onChange={(e) =>
                  updateInteraction(i, 'element_from', e.target.value)
                }
              >
                <option value="">De...</option>
                {namedElements.map((el, ei) => (
                  <option key={ei} value={el.name}>
                    {el.name}
                  </option>
                ))}
              </select>
              <span className="interaction-arrow">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12,5 19,12 12,19" />
                </svg>
              </span>
              <select
                value={inter.element_to}
                onChange={(e) =>
                  updateInteraction(i, 'element_to', e.target.value)
                }
              >
                <option value="">A...</option>
                {namedElements.map((el, ei) => (
                  <option key={ei} value={el.name}>
                    {el.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <textarea
                value={inter.description}
                onChange={(e) =>
                  updateInteraction(i, 'description', e.target.value)
                }
                placeholder="Describe como interactuan..."
                rows={2}
              />
            </div>
          </div>
        ))}
      </div>

      {(data.purpose || data.elements.length > 0) && (
        <div className="system-preview">
          <h4>Vista previa del sistema</h4>
          {data.purpose && (
            <p className="system-preview-purpose">
              <strong>Proposito:</strong> {data.purpose}
            </p>
          )}
          {namedElements.length > 0 && (
            <div className="system-preview-elements">
              {namedElements.map((el, i) => (
                <span key={i} className="system-preview-element">
                  {el.name}
                </span>
              ))}
            </div>
          )}
          {data.interactions.filter((i) => i.element_from && i.element_to)
            .length > 0 && (
            <div className="system-preview-interactions">
              {data.interactions
                .filter((i) => i.element_from && i.element_to)
                .map((inter, i) => (
                  <div key={i} className="system-preview-interaction">
                    <span>{inter.element_from}</span>
                    <span className="arrow">&#8594;</span>
                    <span>{inter.element_to}</span>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      <div className="wizard-actions">
        <button className="btn btn-ghost" onClick={onBack}>
          Atras
        </button>
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
