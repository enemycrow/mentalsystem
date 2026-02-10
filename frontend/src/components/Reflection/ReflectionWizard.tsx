import TipBox from './TipBox';

interface ReflectionData {
  question1: string;
  question2: string;
  question3: string;
}

interface ReflectionWizardProps {
  step: number; // 0, 1, or 2
  data: ReflectionData;
  onChange: (field: keyof ReflectionData, value: string) => void;
  onNext: () => void;
  onBack: () => void;
}

const questions = [
  {
    key: 'question1' as const,
    number: 1,
    text: 'Que sistema esta haciendo que este objetivo sea dificil?',
    tipTitle: 'Que es un sistema?',
    tipContent: (
      <>
        <p>
          Un conjunto de elementos interconectados que producen su propio patron
          de comportamiento.
        </p>
        <p className="tipbox-example">
          <strong>Ejemplo:</strong> Si tu objetivo es &quot;hacer ejercicio 4
          veces por semana&quot; y no lo logras, el sistema actual podria ser:
          &quot;Mi rutina matutina no incluye tiempo para ejercicio, el gimnasio
          queda lejos, y despues del trabajo estoy agotado.&quot;
        </p>
        <p className="tipbox-tip">
          <strong>Tip:</strong> Piensa en tu rutina actual, tu entorno, y los
          habitos que rodean este objetivo.
        </p>
      </>
    ),
  },
  {
    key: 'question2' as const,
    number: 2,
    text: 'Como puedo reducir la friccion?',
    tipTitle: 'Que es friccion?',
    tipContent: (
      <>
        <p>
          Son los obstaculos (visibles e invisibles) que hacen dificil actuar.
        </p>
        <p className="tipbox-example">
          <strong>Ejemplo:</strong> &quot;Puedo dejar la ropa de ejercicio lista
          la noche anterior, encontrar un gimnasio mas cercano, o hacer
          ejercicio en casa con videos de 20 min.&quot;
        </p>
        <p className="tipbox-tip">
          <strong>Tip:</strong> Busca formas de hacer que la accion correcta sea
          la mas facil de tomar.
        </p>
      </>
    ),
  },
  {
    key: 'question3' as const,
    number: 3,
    text: 'Como puedo disenar un sistema para que mis resultados sean inevitables?',
    tipTitle: 'Disena tu sistema',
    tipContent: (
      <>
        <p>Disena un sistema donde el exito sea automatico.</p>
        <p className="tipbox-example">
          <strong>Ejemplo:</strong> &quot;Cada lunes, miercoles y viernes a las
          6:30am suena una alarma especifica. La ropa ya esta lista. Hago 25 min
          de ejercicio en casa con una app. Si fallo un dia, lo compenso el
          sabado.&quot;
        </p>
        <p className="tipbox-tip">
          <strong>Tip:</strong> Tu sistema necesita: elementos (que),
          interacciones (como se conectan), y proposito (para que).
        </p>
      </>
    ),
  },
];

export default function ReflectionWizard({
  step,
  data,
  onChange,
  onNext,
  onBack,
}: ReflectionWizardProps) {
  const q = questions[step];
  const value = data[q.key];
  const canProceed = value.trim().length > 0;

  return (
    <div className="wizard-step">
      <div className="wizard-step-header">
        <span className="wizard-step-number">{q.number + 1}</span>
        <h2>Pregunta {q.number} de 3</h2>
      </div>

      <div className="reflection-progress">
        {questions.map((_, i) => (
          <div
            key={i}
            className={`progress-dot ${i === step ? 'active' : ''} ${i < step ? 'completed' : ''}`}
          />
        ))}
      </div>

      <p className="reflection-question">{q.text}</p>

      <TipBox title={q.tipTitle} content={q.tipContent} />

      <div className="form-group">
        <textarea
          value={value}
          onChange={(e) => onChange(q.key, e.target.value)}
          placeholder="Escribe tu reflexion aqui..."
          rows={6}
        />
      </div>

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
