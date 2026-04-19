import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Box, Radar, Target } from 'lucide-react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar as RadarArea, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import api from '../services/api';

const CategoryDetail = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get('/api/analytics/category-intersection')
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
        <div style={{ color: 'var(--accent-red)', fontWeight: 700, fontSize: '0.85rem', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '12px' }}>
          Intelligence Detail
        </div>
        <h1 style={{ fontSize: '3rem', fontWeight: 800, letterSpacing: '-0.04em', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Target size={40} color="var(--accent-red)" />
          Technical Intersection Matrix
        </h1>
        <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: '800px' }}>
          Visualizing the "Technical Density" of student engagement. 
          The Radar mapping exposes which institutions are multi-disciplinary hubs vs specialized hotspots.
        </p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '32px' }}>
        {/* Leading Hubs List */}
        <div className="card" style={{ padding: '32px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '24px' }}>Top Multi-Disciplinary Hubs</h3>
          {loading ? (
             <div style={{ color: 'var(--text-tertiary)' }}>Calculating breadth...</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {data.map((hub, i) => (
                <div key={i} style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
                   <div style={{ fontWeight: 700, fontSize: '1rem' }}>{hub.university}</div>
                   <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      Across {hub.total_breadth} technical categories
                   </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Radar Visualization */}
        <div className="card" style={{ padding: '40px', display: 'flex', flexDirection: 'column' }}>
           <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '32px' }}>Institutional Density Mapping</h3>
           {loading ? (
             <div style={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Correlating nodes...</div>
           ) : data.length === 0 ? (
             <div style={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)' }}>No distribution data found.</div>
           ) : (
             <div style={{ width: '100%', height: '500px' }}>
                <ResponsiveContainer width="100%" height="100%">
                   <RadarChart cx="50%" cy="50%" outerRadius="80%" data={
                      // Construct shared categories for top 3 unis for comparison
                      ["AI", "Data Science", "Design Thinking", "Hackathons", "Open Source"].map(cat => {
                        const row = { subject: cat };
                        data.slice(0, 3).forEach(hub => {
                          row[hub.university] = hub.matrix[cat] || 0;
                        });
                        return row;
                      })
                   }>
                      <PolarGrid stroke="rgba(0,0,0,0.1)" />
                      <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12, fill: 'var(--text-secondary)', fontWeight: 600 }} />
                      <PolarRadiusAxis />
                      <RadarArea name={data[0]?.university} dataKey={data[0]?.university} stroke="var(--accent-blue)" fill="var(--accent-blue)" fillOpacity={0.6} />
                      <RadarArea name={data[1]?.university} dataKey={data[1]?.university} stroke="var(--accent-red)" fill="var(--accent-red)" fillOpacity={0.4} />
                      <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid var(--border-strong)', background: 'var(--bg-secondary)' }} />
                      <Legend />
                   </RadarChart>
                </ResponsiveContainer>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default CategoryDetail;
