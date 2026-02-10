import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">
          <span className="navbar-logo">MS</span>
          <span className="navbar-title">MentalSystem</span>
        </Link>

        <button
          className="navbar-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span className={`hamburger ${menuOpen ? 'open' : ''}`} />
        </button>

        <div className={`navbar-links ${menuOpen ? 'show' : ''}`}>
          {user ? (
            <>
              <Link to="/dashboard" onClick={() => setMenuOpen(false)}>
                Dashboard
              </Link>
              <button className="btn btn-ghost" onClick={handleLogout}>
                Cerrar Sesion
              </button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setMenuOpen(false)}>
                Iniciar Sesion
              </Link>
              <Link
                to="/register"
                className="btn btn-primary btn-sm"
                onClick={() => setMenuOpen(false)}
              >
                Registrarse
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
