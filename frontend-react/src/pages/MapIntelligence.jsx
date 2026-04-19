import React, { useState } from 'react';
import InteractiveMap from '../components/InteractiveMap';
import PostDetailsPanel from '../components/PostDetailsPanel';
import { MapPin } from 'lucide-react';

const MapIntelligence = () => {
  const [activeFilter, setActiveFilter] = useState('Overall Map');
  const [panelOpen, setPanelOpen] = useState(false);
  const [selectedUni, setSelectedUni] = useState('');

  const handleMarkerClick = (uniName) => {
    setSelectedUni(uniName);
    setPanelOpen(true);
  };

  const filters = [
    'Overall Map', 'AI', 'Data Science', 'Design Thinking', 
    'AI and Law', 'IBM SkillsBuild', 'Hackathons', 
    'Open Source', 'Student Societies'
  ];

  return (
    <div style={{ padding: '40px', maxWidth: '1400px', margin: '0 auto' }}>
      <header style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-0.04em', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <MapPin size={32} color="var(--accent-red)" />
          Geospatial Topology
        </h1>
        <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: '900px' }}>
          This map geometrically visualizes raw engagement intersections. Each node calculates structural weight dynamically based on volume and average sentiment. Use the filters below to aggressively isolate and track specific technical fields across academic clusters.
        </p>
      </header>

      <div className="card fade-in" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
        <div className="filters-row" style={{ marginBottom: '24px', flexWrap: 'wrap', gap: '8px' }}>
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

        <div style={{ flexGrow: 1, minHeight: '600px', borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--border-light)' }}>
          <InteractiveMap activeFilter={activeFilter} onMarkerClick={handleMarkerClick} />
        </div>
      </div>

      <PostDetailsPanel 
        isOpen={panelOpen} 
        onClose={() => setPanelOpen(false)} 
        university={selectedUni} 
        activeFilter={activeFilter}
      />
    </div>
  );
};

export default MapIntelligence;
