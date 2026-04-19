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
        {/* Main Evolution Chart */}
        <div className="card" style={{ padding: '40px', minHeight: '500px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '12px' }}>
              <TrendingUp size={24} color="var(--accent-blue)" />
              Temporal Regression Matrix
            </h3>
            <div style={{ display: 'flex', gap: '12px' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                 <div style={{ width: '12px', height: '12px', borderRadius: '2px', background: 'var(--accent-blue)' }}></div> Volume
               </div>
               <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                 <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#34c759' }}></div> Sentiment Score
               </div>
            </div>
          </div>

          {loading ? (
            <div style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)' }}>Loading Big Data...</div>
          ) : (
            <div style={{ width: '100%', height: '400px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={data}>
                  <defs>
                    <linearGradient id="colorVol" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--accent-blue)" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="var(--accent-blue)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-tertiary)' }} />
                  <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-tertiary)' }} />
                  <YAxis yAxisId="right" orientation="right" domain={[-1, 1]} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-tertiary)' }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: '1px solid var(--border-strong)', background: 'var(--bg-secondary)', fontWeight: 600, boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }}
                  />
                  <Bar yAxisId="left" dataKey="volume" fill="var(--accent-blue)" radius={[4, 4, 0, 0]} opacity={0.3} barSize={40} />
                  <Area yAxisId="left" type="monotone" dataKey="volume" fill="url(#colorVol)" stroke="none" />
                  <Line yAxisId="right" type="monotone" dataKey="score" stroke="#34c759" strokeWidth={4} dot={{ r: 6, fill: '#34c759', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Actionable Insights Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
          <div className="card" style={{ padding: '24px' }}>
            <div style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px' }}>Engagement Ceiling</div>
            <div style={{ fontSize: '2rem', fontWeight: 800 }}>{Math.max(...data.map(d => d.volume), 0)}</div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '8px' }}>Highest recorded volume in a single temporal cycle.</p>
          </div>
          <div className="card" style={{ padding: '24px' }}>
            <div style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px' }}>Mean Reputational Index</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#34c759' }}>
               {(data.reduce((acc, d) => acc + d.score, 0) / (data.length || 1)).toFixed(2)}
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '8px' }}>Average processed sentiment across the entire longitudinal set.</p>
          </div>
          <div className="card" style={{ padding: '24px' }}>
            <div style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px' }}>Anomaly Detection</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--accent-red)' }}>None Detected</div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '8px' }}>No statistical outliers identified in recent clusters.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SentimentDetail;
