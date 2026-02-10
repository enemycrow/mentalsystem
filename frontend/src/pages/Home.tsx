import { Link } from 'react-router-dom';
import BrandBanner from '../components/Promotion/BrandBanner';

export default function Home() {
  return (
    <div className="page-home">
      <section className="hero">
        <div className="hero-content">
          <h1>
            Transforma tus objetivos en{' '}
            <span className="text-accent">sistemas inevitables</span>
          </h1>
          <p className="hero-subtitle">
            Responde 3 preguntas poderosas y disena un sistema que haga que
            alcanzar tus metas sea automatico. Basado en pensamiento sistemico.
          </p>
          <div className="hero-cta">
            <Link to="/register" className="btn btn-primary btn-lg">
              Comienza gratis
            </Link>
            <Link to="/login" className="btn btn-ghost btn-lg">
              Ya tengo cuenta
            </Link>
          </div>
        </div>
      </section>

      <section className="how-it-works">
        <h2>Como funciona</h2>
        <div className="steps-grid">
          <div className="step-card">
            <div className="step-number">1</div>
            <h3>Define tu objetivo</h3>
            <p>
              Escribe un objetivo claro y especifico que quieras alcanzar en tu
              vida.
            </p>
          </div>
          <div className="step-card">
            <div className="step-number">2</div>
            <h3>Responde 3 preguntas</h3>
            <p>
              Reflexiona sobre el sistema actual, la friccion, y como disenar
              uno mejor.
            </p>
          </div>
          <div className="step-card">
            <div className="step-number">3</div>
            <h3>Disena tu sistema</h3>
            <p>
              Crea un sistema con elementos e interacciones que hagan el exito
              inevitable.
            </p>
          </div>
        </div>
      </section>

      <section className="home-brands">
        <BrandBanner />
      </section>
    </div>
  );
}
