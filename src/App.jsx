import { useState, useEffect } from 'react';
import { LoginPage } from './components/pages/LoginPage.jsx';

import { OwnerLayout } from './owner/OwnerLayout.jsx';
import { SupervisorLayout } from './supervisor/SupervisorLayout.jsx';
import FleetLayout from './Fleet/FleetLayout.jsx';

const SESSION_KEY = 'fm_session_v1';
const THEME_KEY = 'fm_theme';

function normalizeRole(role) {
  const normalized = String(role || '').toUpperCase();
  if (normalized === 'OWNER' || normalized === 'SUPERVISOR' || normalized === 'FLEET') {
    return normalized;
  }
  return null;
}

export default function App() {
  const [theme, setTheme] = useState(() => {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
    return 'dark';
  });

  const [session, setSession] = useState(() => {
    const stored = localStorage.getItem(SESSION_KEY);
    if (!stored) {
      return { isLoggedIn: false, role: null, user: null };
    }
    try {
      const parsed = JSON.parse(stored);
      const role = normalizeRole(parsed?.role);
      if (!parsed?.isLoggedIn || !role) {
        return { isLoggedIn: false, role: null, user: null };
      }
      return { isLoggedIn: true, role, user: parsed?.user || null };
    } catch {
      return { isLoggedIn: false, role: null, user: null };
    }
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  const handleLogin = (role, userData) => {
    const normalizedRole = normalizeRole(role);
    if (!normalizedRole) return;

    let nextUser = userData || null;

    if (!nextUser) {
      if (normalizedRole === 'OWNER') {
        nextUser = {
          owner_id: '204ef1b2-a937-442e-abd0-b9a75110c7ec',
          owner_name: 'Azad',
          name: 'Azad',
          role: 'OWNER',
        };
      }

      if (normalizedRole === 'SUPERVISOR') {
        nextUser = {
          supervisor_id: '22222222-2222-2222-2222-222222222222',
          name: 'Supervisor',
          role: 'SUPERVISOR',
        };
      }

      if (normalizedRole === 'FLEET') {
        nextUser = {
          fleet_id: '11111111-1111-1111-1111-111111111111',
          name: 'Fleet User',
          role: 'FLEET',
        };
      }
    }

    if (normalizedRole === 'OWNER') {
      localStorage.setItem('owner', JSON.stringify(nextUser));
    }

    const nextSession = { isLoggedIn: true, role: normalizedRole, user: nextUser };
    setSession(nextSession);
    localStorage.setItem(SESSION_KEY, JSON.stringify(nextSession));
  };

  const handleLogout = () => {
    setSession({ isLoggedIn: false, role: null, user: null });
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem('owner');
  };

  if (!session?.isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />;
  }

  /* =========================
     EXACTLY ONE PORTAL OPENS
  ========================= */
  return (
    <>
      {session.role === 'OWNER' && (
        <OwnerLayout
          onLogout={handleLogout}
          user={session.user}
          theme={theme}
          onThemeChange={setTheme}
        />
      )}

      {session.role === 'SUPERVISOR' && (
        <SupervisorLayout
          onLogout={handleLogout}
          user={session.user}
          theme={theme}
          onThemeChange={setTheme}
        />
      )}

      {session.role === 'FLEET' && (
        <FleetLayout
          onLogout={handleLogout}
          user={session.user}
          theme={theme}
          onThemeChange={setTheme}
        />
      )}

      {!session.role && <LoginPage onLogin={handleLogin} />}
    </>
  );
}
