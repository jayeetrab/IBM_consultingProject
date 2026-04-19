import React, { useState, useEffect } from 'react';
import { Activity, TrendingUp, Sparkles } from 'lucide-react';
import api from '../services/api';

const Overview = () => {
  const [globalStats, setGlobalStats] = useState({ total: 0, trajectory: '+0%', metrics: {} });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/analytics/global-stats')
      .then(res => setGlobalStats(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-0.04em', marginBottom: '16px' }}>
          Global Intelligence Overview
        </h1>
        <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: '800px' }}>
          Welcome to the central command node. This platform natively integrates advanced semantic analysis 
          with geospatial tracking to resolve precise IBM technical community footprints across UK & Ireland universities.
        </p>
      </header>

      {loading ? (
        <div style={{ padding: '3rem 0', textAlign: 'center' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '3px solid var(--border-light)', borderTopColor: 'var(--accent-blue)', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }}></div>
          <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
          
          <div className="card fade-in" style={{ padding: '32px', background: 'linear-gradient(145deg, var(--bg-secondary), var(--bg-primary))', border: '1px solid var(--border-strong)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <div style={{ padding: '12px', background: 'rgba(52, 199, 89, 0.1)', borderRadius: '12px', color: '#34c759' }}>
                <TrendingUp size={24} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Total Engagements</h3>
            </div>
            
            <div style={{ fontSize: '4rem', fontWeight: 900, letterSpacing: '-0.05em', lineHeight: 1 }}>
              {globalStats.total.toLocaleString()}
            </div>
            <div style={{ color: '#34c759', fontWeight: 600, fontSize: '1.1rem', marginTop: '12px' }}>
              Trajectory: {globalStats.trajectory}
            </div>
            
            <div style={{ marginTop: '2.5rem', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {Object.entries(globalStats.metrics).map(([key, val]) => (
                <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'var(--bg-primary)', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                  <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{key}</span>
                  <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>{val.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card fade-in" style={{ padding: '32px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', background: 'var(--bg-secondary)' }}>
            <Sparkles size={48} color="var(--accent-blue)" style={{ marginBottom: '24px' }} />
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '16px' }}>Ready for Analysis.</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '400px', lineHeight: 1.6 }}>
              Select a specialized module from the sidebar interface to initiate geographic visualization, longitudinal velocity tracking, or technical community clustering.
            </p>
          </div>

        </div>
      )}
    </div>
  );
};

export default Overview;
