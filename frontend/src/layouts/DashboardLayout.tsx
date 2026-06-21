import { Outlet, NavLink, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function DashboardLayout() {
  const { user, logout, isLoading } = useAuth();
  const navigate = useNavigate();

  if (isLoading) return null;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <main className="dashboard-shell">
      <aside className="sidebar" aria-label="Trendy navigation">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true" />
          <span>Trendy</span>
        </div>
        <nav className="nav-list">
          <NavLink to="/" end className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            Chat Assistant
          </NavLink>
          <div style={{ height: '24px' }}></div>
          <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--muted)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px', paddingLeft: '12px' }}>Pipeline</div>
          <NavLink to="/trends" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            Trends & Sync
          </NavLink>
          <NavLink to="/briefs" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            Content Briefs
          </NavLink>
          <NavLink to="/assignments" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            Writers
          </NavLink>
          <NavLink to="/drafts" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            Draft Reviews
          </NavLink>
          <NavLink to="/publishing" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            Publishing
          </NavLink>
        </nav>
        <div className="sidebar-footer">
          <div className="user-profile">
            <span className="user-name">{user.name}</span>
          </div>
          <button className="logout-btn" onClick={handleLogout}>Log out</button>
        </div>
      </aside>

      <section className="content-area">
        <header className="topbar">
          Trendy AI
        </header>
        <Outlet />
      </section>
    </main>
  );
}
