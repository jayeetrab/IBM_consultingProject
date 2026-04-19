import React, { useState, useEffect } from 'react';
import { Sparkles, MapPin, Activity, PieChart as PieChartIcon, BarChart3 } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import api from '../services/api';

const Insights = () => {
  const [pieData, setPieData] = useState([]);
  const [barData, setBarData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get('/api/analytics/sentiment-summary'),
      api.get('/api/analytics/insight-sections')
    ])
    .then(([sentRes, structRes]) => {
      // Map Sentiment for PieChart
      const sRaw = sentRes.data;
      const formattedPie = sRaw.map(s => ({
        name: s.label.charAt(0).toUpperCase() + s.label.slice(1),
        value: s.count,
        color: s.label === 'positive' ? '#34c759' : s.label === 'negative' ? 'var(--accent-red)' : 'var(--text-tertiary)'
      }));
      setPieData(formattedPie);

      // Map Categories for BarChart
      const techArr = structRes.data.tech_interest || [];
      const formattedBar = techArr.map(t => ({
        name: t.university,
        engagements: t.count
      }));
      setBarData(formattedBar);
    })
    .catch(err => console.error(err))
    .finally(() => setLoading(false));
  }, []);

  return (
    <div className="fade-in" style={{ padding: '40px', maxWidth: '1400px', margin: '0 auto' }}>
      <header style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-0.04em', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Sparkles size={32} color="#f5a623" />
          Semantic & Categorical Analytics
        </h1>
        <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: '900px' }}>
          Detailed analytics examining specific sentiment distributions and category breakdowns. Use these pure business analytic Recharts to identify exactly what technical pipelines perform best and how students react to IBM's presence.
        </p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(350px, 1fr) minmax(500px, 1.5fr)', gap: '32px' }}>
        
        {/* Sentiment Pie Chart */}
        <div className="card fade-in" style={{ padding: '32px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <PieChartIcon size={20} color="#f5a623" />
            Global Sentiment Ratio
          </h3>
          
          {loading ? (
             <div style={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading BI...</div>
          ) : pieData.length === 0 ? (
             <div style={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)' }}>No data available. Validate pipeline payload.</div>
          ) : (
            <div style={{ width: '100%', height: '350px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: '1px solid var(--border-strong)', background: 'var(--bg-secondary)', fontWeight: 600 }}
                  />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Categories Bar Chart */}
        <div className="card fade-in" style={{ padding: '32px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BarChart3 size={20} color="var(--accent-blue)" />
            Top Institutional Performers
          </h3>
          
          {loading ? (
             <div style={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading BI...</div>
          ) : barData.length === 0 ? (
             <div style={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)' }}>No data available. Validate pipeline payload.</div>
          ) : (
            <div style={{ width: '100%', height: '350px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} />
                  <Tooltip 
                    cursor={{ fill: 'var(--bg-primary)' }}
                    contentStyle={{ borderRadius: '12px', border: '1px solid var(--border-strong)', background: 'var(--bg-secondary)', fontWeight: 600 }}
                  />
                  <Bar dataKey="engagements" fill="var(--accent-blue)" radius={[8, 8, 0, 0]} maxBarSize={70} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Insights;
