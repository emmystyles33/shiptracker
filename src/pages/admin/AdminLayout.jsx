import { Link, Outlet, useNavigate } from 'react-router-dom';
import { clearToken } from '../../lib/api.js';
import './admin.css';

export default function AdminLayout() {
  const navigate = useNavigate();

  function handleLogout() {
    clearToken();
    navigate('/admin/login', { replace: true });
  }

  return (
    <div className="admin-shell">
      <header className="admin-header">
        <div className="admin-header-inner">
          <Link to="/admin" className="brand">
            <span className="dot" />
            <span className="brand-name">SHIPTRACK</span>
            <span className="brand-sub">/ Admin</span>
          </Link>
          <nav className="admin-nav">
            <Link to="/admin">Shipments</Link>
            <Link to="/admin/new" className="accent">
              + New
            </Link>
            <Link to="/" target="_blank" rel="noreferrer">
              Public site ↗
            </Link>
            <button onClick={handleLogout}>Log out</button>
          </nav>
        </div>
      </header>
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
