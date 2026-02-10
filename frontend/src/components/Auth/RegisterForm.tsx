import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function RegisterForm() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name || !email || !password || !confirmPassword) {
      setError('Por favor completa todos los campos.');
      return;
    }

    if (password.length < 6) {
      setError('La contrasena debe tener al menos 6 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contrasenas no coinciden.');
      return;
    }

    setLoading(true);
    try {
      await register(name, email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al registrarse.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <h2>Crear Cuenta</h2>
      <p className="auth-subtitle">Comienza a disenar tus sistemas</p>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="form-group">
        <label htmlFor="name">Nombre</label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Tu nombre"
          autoComplete="name"
        />
      </div>

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
          placeholder="Minimo 6 caracteres"
          autoComplete="new-password"
        />
      </div>

      <div className="form-group">
        <label htmlFor="confirmPassword">Confirmar Contrasena</label>
        <input
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Repite tu contrasena"
          autoComplete="new-password"
        />
      </div>

      <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
        {loading ? 'Creando cuenta...' : 'Registrarse'}
      </button>

      <p className="auth-link">
        Ya tienes cuenta?{' '}
        <Link to="/login">Inicia sesion</Link>
      </p>
    </form>
  );
}
