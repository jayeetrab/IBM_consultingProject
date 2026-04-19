import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Login from './pages/Login';

import ProtectedRoute from './components/ProtectedRoute';
import './index.css';

import Sidebar from './components/Sidebar';
import Overview from './pages/Overview';
import MapIntelligence from './pages/MapIntelligence';
import TimelineIntelligence from './pages/TimelineIntelligence';
import Insights from './pages/Insights';
import Admin from './pages/Admin';

const AppLayout = () => (
  <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
    <Sidebar />
    <div style={{ marginLeft: '280px', flexGrow: 1, overflowY: 'auto' }}>
      <Outlet />
    </div>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/overview" element={<Overview />} />
            <Route path="/intelligence/map" element={<MapIntelligence />} />
            <Route path="/intelligence/timeline" element={<TimelineIntelligence />} />
            <Route path="/intelligence/insights" element={<Insights />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/dashboard" element={<Navigate to="/overview" replace />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/overview" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
