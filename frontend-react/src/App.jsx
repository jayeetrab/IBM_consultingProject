import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';
import './index.css';

import Dashboard from './pages/Dashboard';
import SentimentDetail from './pages/SentimentDetail';
import CategoryDetail from './pages/CategoryDetail';
import BenchmarkDetail from './pages/BenchmarkDetail';
import UniversityIntelligence from './pages/UniversityIntelligence';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/analytics/sentiment" element={<SentimentDetail />} />
          <Route path="/analytics/categories" element={<CategoryDetail />} />
          <Route path="/analytics/benchmark" element={<BenchmarkDetail />} />
          <Route path="/university/:name" element={<UniversityIntelligence />} />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
