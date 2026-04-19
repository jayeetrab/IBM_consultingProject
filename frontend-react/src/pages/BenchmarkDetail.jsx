import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, GitCompare, BarChart3, TrendingDown, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import api from '../services/api';

const BenchmarkDetail = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Default benchmarking target: Manchester vs London (can be adjusted by user)
  const [uni1, setUni1] = useState('Manchester');
  const [uni2, setUni2] = useState('London');

  useEffect(() => {
    setLoading(true);
    api.get(`/api/analytics/benchmark?uni1=${encodeURIComponent(uni1)}&uni2=${encodeURIComponent(uni2)}`)
      .then(res => setData(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [uni1, uni2]);

  const categories = ["AI", "Data Science", "Design Thinking", "Hackathons", "Open Source"];
  
  const chartData = categories.map(cat => ({
    name: cat,
    [uni1]: data?.uni1?.metrics[cat]?.count || 0,
    [`${uni1}_sent`]: data?.uni1?.metrics[cat]?.sentiment || 0,
    [uni2]: data?.uni2?.metrics[cat]?.count || 0,
    [`${uni2}_sent`]: data?.uni2?.metrics[cat]?.sentiment || 0,
  }));

  return (
    <div className="fade-in" style={{ padding: '40px', maxWidth: '1400px', margin: '0 auto', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <button 
        onClick={() => navigate('/dashboard')}
        style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '32px' }}
      >
        <ArrowLeft size={20} /> Back to Command Hub
      </button>

      <header style={{ marginBottom: '48px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ color: 'var(--accent-blue)', fontWeight: 700, fontSize: '0.85rem', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '12px' }}>
            Intelligence Detail
          </div>
          <h1 style={{ fontSize: '3rem', fontWeight: 800, letterSpacing: '-0.04em', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <GitCompare size={40} color="var(--accent-blue)" />
            Institutional Benchmarking
          </h1>
          <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: '800px' }}>
            Comparative differential analysis between leading institutions. 
            Identify competitive gaps in technical engagement volume and reputational sentiment.
          </p>
        </div>
        
        {/* Quick Select Tool */}
        <div className="card" style={{ padding: '20px', display: 'flex', flexWrap: 'wrap', gap: '16px', background: 'rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
             <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-tertiary)' }}>Target Institution A</span>
             <input value={uni1} onChange={e => setUni1(e.target.value)} style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-strong)', outline: 'none' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
             <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-tertiary)' }}>Target Institution B</span>
             <input value={uni2} onChange={e => setUni2(e.target.value)} style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-strong)', outline: 'none' }} />
          </div>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '32px' }}>
        {/* Engagement Volume Comparison */}
        <div className="card" style={{ padding: '40px' }}>
           <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <BarChart3 size={24} color="var(--accent-blue)" />
              Categorical Engagement Differential
           </h3>
           
           {loading ? (
             <div style={{ height: '350px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Running comparative matrix...</div>
           ) : (
             <div style={{ width: '100%', height: '350px' }}>
               <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 13, fontWeight: 600, fill: 'var(--text-secondary)' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-tertiary)' }} />
                    <Tooltip contentStyle={{ borderRadius: '16px', border: '1px solid var(--border-strong)', background: 'var(--bg-secondary)' }} />
                    <Legend verticalAlign="top" height={36}/>
                    <Bar dataKey={uni1} fill="var(--accent-blue)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey={uni2} fill="var(--accent-red)" radius={[4, 4, 0, 0]} />
                 </BarChart>
               </ResponsiveContainer>
             </div>
           )}
        </div>

        {/* Sentiment Spread (Proper Analysis) */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
           <div className="card" style={{ padding: '32px' }}>
              <h4 style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                 <TrendingUp size={18} color="var(--accent-blue)" /> {uni1} Reputational Spread
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                 {categories.map(cat => {
                   const sent = data?.uni1?.metrics[cat]?.sentiment || 0;
                   const color = sent > 0.1 ? '#34c759' : sent < -0.1 ? 'var(--accent-red)' : 'var(--text-tertiary)';
                   return (
                     <div key={cat} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{cat}</span>
                        <span style={{ fontWeight: 800, color }}>{sent > 0 ? '+' : ''}{sent}</span>
                     </div>
                   );
                 })}
              </div>
           </div>

           <div className="card" style={{ padding: '32px' }}>
              <h4 style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                 <TrendingDown size={18} color="var(--accent-red)" /> {uni2} Reputational Spread
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                 {categories.map(cat => {
                   const sent = data?.uni2?.metrics[cat]?.sentiment || 0;
                   const color = sent > 0.1 ? '#34c759' : sent < -0.1 ? 'var(--accent-red)' : 'var(--text-tertiary)';
                   return (
                     <div key={cat} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{cat}</span>
                        <span style={{ fontWeight: 800, color }}>{sent > 0 ? '+' : ''}{sent}</span>
                     </div>
                   );
                 })}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default BenchmarkDetail;
