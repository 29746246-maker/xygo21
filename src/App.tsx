import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import HomePage from './pages/HomePage';
import ModelsPage from './pages/ModelsPage';
import AgentsPage from './pages/AgentsPage';
import SkillsPage from './pages/SkillsPage';
import ManagementPage from './pages/ManagementPage';
import LogsPage from './pages/LogsPage';
import PlansPage from './pages/PlansPage';

function App() {
  return (
    <Router>
      <AppLayout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/models" element={<ModelsPage />} />
          <Route path="/agents" element={<AgentsPage />} />
          <Route path="/skills" element={<SkillsPage />} />
          <Route path="/management" element={<ManagementPage />} />
          <Route path="/logs" element={<LogsPage />} />
          <Route path="/plans" element={<PlansPage />} />
        </Routes>
      </AppLayout>
    </Router>
  );
}

export default App;
