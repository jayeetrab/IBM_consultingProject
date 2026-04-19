import React, { useState, useEffect } from 'react';
import { Sparkles, MapPin, Activity } from 'lucide-react';
import api from '../services/api';

const Insights = () => {
  const [data, setData] = useState({
    tech_interest: [], regional: [], active_locations: [], community: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get('/api/analytics/insight-sections')
      .then(res => setData(res.data))
      .catch(err => console.error("Error fetching insights:", err))
      .finally(() => setLoading(false));
  }, []);

  const renderList = (title, items, emoji, description) => (
    <div className="card fade-in" style={{ flex: '1 1 400px', display: 'flex', flexDirection: 'column', padding: '32px' }}>
      <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '12px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
        {emoji} {title}
      </h3>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '24px', lineHeight: 1.5 }}>
        {description}
      </p>

      {loading ? (
        <div style={{ padding: '2rem 0', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '0.9rem' }}>
          Correlating algorithmic properties...
        </div>
      ) : items.length === 0 ? (
        <div style={{ padding: '2rem 0', textAlign: 'center', background: 'rgba(0,0,0,0.02)', borderRadius: '12px', border: '1px dashed var(--border-strong)' }}>
          <div style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>No data matched this vector matrix in the current dataset.</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {items.map((item, idx) => {
            const maxVal = items[0].count || 1;
            const pct = (item.count / maxVal) * 100;
            return (
              <div key={idx}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
                    {item.university || item.region}
                  </span>
                  <span style={{ fontWeight: 800, color: 'var(--accent-blue)', fontSize: '1rem' }}>{item.count.toLocaleString()}</span>
                </div>
                <div style={{ width: '100%', height: '8px', background: 'var(--border-light)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${pct}%`, height: '100%', background: 'linear-gradient(90deg, var(--accent-blue), #5294ff)', borderRadius: '4px' }}></div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  return (
    <div style={{ padding: '40px', maxWidth: '1400px', margin: '0 auto' }}>
      <header style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-0.04em', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Sparkles size={32} color="#f5a623" />
          Community Insights
        </h1>
        <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: '900px' }}>
          This sector breaks down the aggregate computational load by extracting semantic meaning from raw engagement metrics. Here, you observe pure volume ranked dynamically, revealing optimal locations for immediate IBM recruiting initiatives or corporate engagement drops based strictly on objective metric weighting.
        </p>
      </header>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '32px' }}>
        {renderList(
          "Tech Interest Leaders",
          data.tech_interest,
          <Activity size={24} color="var(--accent-red)" />,
          "The highest volume institutional density ranked strictly by raw technical discussion engagement."
        )}
        {renderList(
          "Regional Variations",
          data.regional,
          <MapPin size={24} color="var(--accent-blue)" />,
          "Macrometric analysis spanning territorial domains across the country."
        )}
        {renderList(
          "Active Communities",
          data.active_locations,
          <Sparkles size={24} color="#f5a623" />,
          "Specifically isolated clusters of student societies and open engineering forums."
        )}
        {renderList(
          "Skills & Open Source",
          data.community,
          <Activity size={24} color="#34c759" />,
          "Rankings based entirely on recognized open-source intelligence matrices and programming density."
        )}
      </div>
    </div>
  );
};

export default Insights;
