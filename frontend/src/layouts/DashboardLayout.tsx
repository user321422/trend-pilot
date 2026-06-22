import { Outlet, NavLink, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useRef, useEffect } from 'react';

export default function DashboardLayout() {
  const { user, logout, isLoading } = useAuth();
  const navigate = useNavigate();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [showHelpMenu, setShowHelpMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
        <div className="sidebar-footer" ref={menuRef}>
          <button 
            className="user-profile-btn"
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            aria-haspopup="true"
            aria-expanded={isProfileMenuOpen}
          >
            <div className="user-avatar">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="user-info">
              <span className="user-name">{user.name}</span>
              <span className="user-role">{user.role?.toLowerCase() || 'user'}</span>
            </div>
          </button>
          
          {isProfileMenuOpen && (
            <div className="profile-popover">
              <div className="popover-header">
                <div className="popover-name">{user.name}</div>
                <div className="popover-email">{user.email}</div>
              </div>
              <div className="popover-divider" />
              <button 
                className="popover-item" 
                onClick={() => { setIsProfileMenuOpen(false); navigate('/profile'); }}
              >
                Profile
              </button>
              <button 
                className="popover-item" 
                onClick={() => { setIsProfileMenuOpen(false); navigate('/settings'); }}
              >
                Settings
              </button>
              <button 
                className="popover-item" 
                onClick={() => { setIsProfileMenuOpen(false); navigate('/appearance'); }}
              >
                Appearance
              </button>
              <div 
                className="popover-item help-menu-container" 
                onMouseEnter={() => setShowHelpMenu(true)}
                onMouseLeave={() => setShowHelpMenu(false)}
                onClick={(e) => { e.stopPropagation(); setShowHelpMenu(!showHelpMenu); }}
                style={{ position: 'relative', cursor: 'pointer' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  Help
                  <span style={{ fontSize: '10px', color: 'var(--muted)' }}>▶</span>
                </div>
                {showHelpMenu && (
                  <div className="help-submenu" style={{
                    position: 'absolute',
                    left: '100%',
                    bottom: 0,
                    background: 'var(--canvas)',
                    border: '1px solid var(--hairline)',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(20, 20, 19, 0.08)',
                    padding: '4px',
                    width: '180px',
                    zIndex: 101,
                    marginLeft: '4px',
                    animation: 'popIn 0.15s ease-out'
                  }}>
                    <button className="popover-item" onClick={(e) => { e.stopPropagation(); setIsProfileMenuOpen(false); setShowHelpMenu(false); navigate('/about'); }}>
                      About
                    </button>
                    <button className="popover-item" onClick={(e) => { e.stopPropagation(); setIsProfileMenuOpen(false); setShowHelpMenu(false); navigate('/privacy'); }}>
                      Privacy Policy
                    </button>
                    <button className="popover-item" onClick={(e) => { e.stopPropagation(); setIsProfileMenuOpen(false); setShowHelpMenu(false); navigate('/terms'); }}>
                      Terms & Legals
                    </button>
                  </div>
                )}
              </div>
              <div className="popover-divider" />
              <button className="popover-item logout-item" onClick={handleLogout}>
                Log out
              </button>
            </div>
          )}
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
