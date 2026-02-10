interface SystemElement {
  name: string;
  description: string;
}

interface SystemInteraction {
  element_from: string;
  element_to: string;
  description: string;
}

interface SystemViewProps {
  purpose: string;
  elements: SystemElement[];
  interactions: SystemInteraction[];
}

export default function SystemView({
  purpose,
  elements,
  interactions,
}: SystemViewProps) {
  return (
    <div className="system-view">
      <div className="system-view-section">
        <h4>Proposito</h4>
        <p className="system-view-purpose">{purpose}</p>
      </div>

      <div className="system-view-section">
        <h4>Elementos ({elements.length})</h4>
        <div className="system-view-elements">
          {elements.map((el, i) => (
            <div key={i} className="system-view-element">
              <div className="system-view-element-name">{el.name}</div>
              {el.description && (
                <div className="system-view-element-desc">{el.description}</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {interactions.length > 0 && (
        <div className="system-view-section">
          <h4>Interacciones ({interactions.length})</h4>
          <div className="system-view-interactions">
            {interactions.map((inter, i) => (
              <div key={i} className="system-view-interaction">
                <div className="system-view-interaction-flow">
                  <span className="system-view-interaction-node">
                    {inter.element_from}
                  </span>
                  <span className="system-view-interaction-arrow">&#8594;</span>
                  <span className="system-view-interaction-node">
                    {inter.element_to}
                  </span>
                </div>
                {inter.description && (
                  <p className="system-view-interaction-desc">
                    {inter.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
