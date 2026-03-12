import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { LayoutDashboard, Receipt, BarChart2, Target, LogOut, Sun, Moon } from 'lucide-react';

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/expenses', label: 'Expenses', icon: Receipt },
  { to: '/analytics', label: 'Analytics', icon: BarChart2 },
  { to: '/budget', label: 'Budget', icon: Target },
];

// Sidebar (desktop)
function SidebarNav() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <aside className="sidebar">
      <div className="sidebar-logo-wrap">
        <div className="sidebar-logo-icon">
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <div className="sidebar-logo-text">ExpenseIQ</div>
          <div className="sidebar-logo-sub">Finance Tracker</div>
        </div>
      </div>

      <div className="sidebar-section-label">Menu</div>
      <nav className="sidebar-nav">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) => `nav-item${isActive ? ' nav-item--active' : ''}`}
          >
            <Icon size={17} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-footer-inner">
          <div className="user-avatar" aria-label={user?.name}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="user-info-wrap">
            <div className="user-name">{user?.name}</div>
            <div className="user-email">{user?.email}</div>
          </div>
          <div className="sidebar-actions">
            <button
              className="theme-btn"
              onClick={toggleTheme}
              title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <Moon size={15} /> : <Sun size={15} />}
            </button>
            <button className="icon-btn icon-btn--danger" onClick={logout} title="Logout" aria-label="Logout">
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}

// Bottom nav (mobile)
function BottomNav() {
  const location = useLocation();

  return (
    <nav className="bottom-nav" aria-label="Mobile navigation">
      {NAV_ITEMS.map(({ to, label, icon: Icon }) => {
        const isActive = to === '/' ? location.pathname === '/' : location.pathname.startsWith(to);
        return (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={`bottom-nav-item${isActive ? ' bottom-nav-item--active' : ''}`}
            aria-label={label}
          >
            <Icon size={22} />
            <span>{label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}

export default function Navbar() {
  return (
    <>
      <SidebarNav />
      <BottomNav />
    </>
  );
}
