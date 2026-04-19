import React, { useState } from 'react';
import TimelineChart from '../components/TimelineChart';
import { Activity } from 'lucide-react';

const TimelineIntelligence = () => {
  const [activeFilter, setActiveFilter] = useState('Overall Map');

  const filters = [
    'Overall Map', 'AI', 'Data Science', 'Design Thinking', 
    'AI and Law', 'IBM SkillsBuild', 'Hackathons', 
    'Open Source', 'Student Societies'
  ];

  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-0.04em', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Activity size={32} color="var(--accent-blue)" />
          Velocity & Trend Forecasting
        </h1>
        <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: '900px' }}>
          Analyze historical engagement momentum across all UK & Ireland channels. The graphical rendering exposes surges in categorical interest mapping against the timeline.
        </p>
      </header>

      <div className="card fade-in" style={{ padding: '32px', display: 'flex', flexDirection: 'column' }}>
        <div className="filters-row" style={{ marginBottom: '32px', flexWrap: 'wrap', gap: '8px' }}>
          {filters.map(flt => (
            <button 
              key={flt}
              className={`filter-chip ${activeFilter === flt ? 'active' : ''}`}
              onClick={() => setActiveFilter(flt)}
            >
              {flt}
            </button>
          ))}
        </div>

        <div style={{ flexGrow: 1, minHeight: '500px' }}>
          <TimelineChart filter={activeFilter} />
        </div>
      </div>
    </div>
  );
};

export default TimelineIntelligence;
