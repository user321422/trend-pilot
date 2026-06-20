import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import Trends from './pages/Trends';
import Briefs from './pages/Briefs';
import Assignments from './pages/Assignments';
import Drafts from './pages/Drafts';
import Publishing from './pages/Publishing';
import Login from './pages/Login';
import './App.css';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<DashboardLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="trends" element={<Trends />} />
        <Route path="briefs" element={<Briefs />} />
        <Route path="assignments" element={<Assignments />} />
        <Route path="drafts" element={<Drafts />} />
        <Route path="publishing" element={<Publishing />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default App;
