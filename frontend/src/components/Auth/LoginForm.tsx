import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function LoginForm() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Por favor completa todos los campos.');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Error al iniciar sesion.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <h2>Iniciar Sesion</h2>
      <p className="auth-subtitle">Bienvenido de vuelta a MentalSystem</p>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="form-group">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@email.com"
          autoComplete="email"
        />
      </div>

      <div className="form-group">
        <label htmlFor="password">Contrasena</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Tu contrasena"
          autoComplete="current-password"
        />
      </div>

      <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
        {loading ? 'Ingresando...' : 'Iniciar Sesion'}
      </button>

      <p className="auth-link">
        No tienes cuenta?{' '}
        <Link to="/register">Registrate aqui</Link>
      </p>
    </form>
  );
}
