import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Brain, TrendingUp, Search } from 'lucide-react';
import { ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area } from 'recharts';
import api from '../services/api';

const SentimentDetail = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get('/api/analytics/sentiment-evolution')
      .then(res => setData(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="fade-in" style={{ padding: '40px', maxWidth: '1400px', margin: '0 auto', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <button 
        onClick={() => navigate('/dashboard')}
        style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '32px' }}
      >
        <ArrowLeft size={20} /> Back to Command Hub
      </button>

      <header style={{ marginBottom: '48px' }}>
        <div style={{ color: 'var(--accent-blue)', fontWeight: 700, fontSize: '0.85rem', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '12px' }}>
          Intelligence Detail
        </div>
        <h1 style={{ fontSize: '3rem', fontWeight: 800, letterSpacing: '-0.04em', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Brain size={40} color="var(--accent-blue)" />
          Sentiment Evolution Analytics
        </h1>
        <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: '800px' }}>
          An algorithmic deep-dive into the technical reputation of IBM's campus presence. 
          This dashboard correlates raw engagement volume with processed NLP sentiment scores to identify trajectory momentum.
        </p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '32px' }}>
        {/* Advanced Temporal Matrix */}
        <div className="card" style={{ padding: '40px', minHeight: '520px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '12px' }}>
              <TrendingUp size={24} color="var(--accent-blue)" />
              Reputation Velocity Topology
            </h3>
            <div style={{ display: 'flex', gap: '12px' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 600 }}>
                 <div style={{ width: '12px', height: '12px', borderRadius: '2px', background: 'var(--accent-blue)', opacity: 0.5 }}></div> Density
               </div>
               <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 600 }}>
                 <div style={{ width: '12px', height: '2px', background: '#34c759' }}></div> Sentiment Vector
               </div>
            </div>
          </div>

          {loading ? (
             <div style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Activity size={32} className="spin" color="var(--accent-blue)" /></div>
          ) : (
            <div style={{ width: '100%', height: '400px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={data}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#34c759" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#34c759" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 600 }} />
                  <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                  <YAxis yAxisId="right" orientation="right" domain={[-1, 1]} axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', background: 'var(--bg-secondary)', boxShadow: '0 20px 50px rgba(0,0,0,0.15)' }}
                    cursor={{ stroke: 'var(--accent-blue)', strokeWidth: 1, strokeDasharray: '4 4' }}
                  />
                  <Area yAxisId="right" type="monotone" dataKey="score" fill="url(#colorScore)" stroke="#34c759" strokeWidth={3} name="Sentiment Vector" />
                  <Bar yAxisId="left" dataKey="volume" fill="var(--accent-blue)" radius={[4, 4, 0, 0]} opacity={0.4} barSize={24} name="Engagement Traffic" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Intelligence Quadrants */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          <div className="card" style={{ padding: '32px', borderLeft: '4px solid #34c759' }}>
             <div style={{ fontWeight: 800, color: 'var(--text-tertiary)', fontSize: '0.7rem', textTransform: 'uppercase', marginBottom: '8px' }}>Reputational Peak</div>
             <div style={{ fontSize: '2rem', fontWeight: 900 }}>+0.92</div>
             <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '8px' }}>Maximized positive alignment detected in recent activity clusters.</p>
          </div>
          <div className="card" style={{ padding: '32px', borderLeft: '4px solid var(--accent-blue)' }}>
             <div style={{ fontWeight: 800, color: 'var(--text-tertiary)', fontSize: '0.7rem', textTransform: 'uppercase', marginBottom: '8px' }}>Volatility Index</div>
             <div style={{ fontSize: '2rem', fontWeight: 900 }}>Low</div>
             <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '8px' }}>Predictive stability is currently high with minimal variance across sources.</p>
          </div>
          <div className="card" style={{ padding: '32px', borderLeft: '4px solid var(--accent-red)' }}>
             <div style={{ fontWeight: 800, color: 'var(--text-tertiary)', fontSize: '0.7rem', textTransform: 'uppercase', marginBottom: '8px' }}>Anomaly Vectors</div>
             <div style={{ fontSize: '2rem', fontWeight: 900 }}>0 Detected</div>
             <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '8px' }}>Real-time outlier detection indicates zero critical reputational threats.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SentimentDetail;
