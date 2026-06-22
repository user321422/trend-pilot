import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import Trends from './pages/Trends';
import Briefs from './pages/Briefs';
import Assignments from './pages/Assignments';
import Drafts from './pages/Drafts';
import Publishing from './pages/Publishing';
import Login from './pages/Login';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Appearance from './pages/Appearance';
import About from './pages/About';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import './App.css';

function App() {
  useEffect(() => {
    const applyTheme = () => {
      const theme = localStorage.getItem('tp_theme') || 'system';
      if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.setAttribute('data-theme', 'dark');
      } else {
        document.documentElement.removeAttribute('data-theme');
      }
    };

    applyTheme();

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => applyTheme();
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/about" element={<About />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/" element={<DashboardLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="trends" element={<Trends />} />
        <Route path="briefs" element={<Briefs />} />
        <Route path="assignments" element={<Assignments />} />
        <Route path="drafts" element={<Drafts />} />
        <Route path="publishing" element={<Publishing />} />
        <Route path="profile" element={<Profile />} />
        <Route path="settings" element={<Settings />} />
        <Route path="appearance" element={<Appearance />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default App;
