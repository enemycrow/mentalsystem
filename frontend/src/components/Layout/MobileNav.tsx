import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function MobileNav() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (!user) return null;

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="mobile-nav">
      <Link
        to="/dashboard"
        className={`mobile-nav-item ${isActive('/dashboard') ? 'active' : ''}`}
      >
        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
        <span>Dashboard</span>
      </Link>
      <Link
        to="/new-objective"
        className={`mobile-nav-item ${isActive('/new-objective') ? 'active' : ''}`}
      >
        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="16" />
          <line x1="8" y1="12" x2="16" y2="12" />
        </svg>
        <span>Nuevo</span>
      </Link>
      <button
        className={`mobile-nav-item`}
        onClick={handleLogout}
      >
        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
          <polyline points="16,17 21,12 16,7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
        <span>Salir</span>
      </button>
    </nav>
  );
}
