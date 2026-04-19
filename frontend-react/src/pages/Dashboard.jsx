import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, MapPin, Activity, Download, Settings, X, ExternalLink, Upload, ShieldAlert, User, Moon, Sun, LogOut, ChevronDown } from 'lucide-react';
import api from '../services/api';
import InteractiveMap from '../components/InteractiveMap';
import TimelineChart from '../components/TimelineChart';
import DatasetUpload from '../components/DatasetUpload';
import AIGlowSearch from '../components/AIGlowSearch';
import AuditLogViewer from '../components/AuditLogViewer';
import '../index.css';
import ibmLogo from '../assets/ibm-logo.png';
import bristolLogo from '../assets/bristol-logo.png';

const PostTile = ({ p, index }) => {
  const [expanded, setExpanded] = useState(false);
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      style={{ 
        cursor: 'pointer', padding: '1.25rem', 
        background: expanded ? 'rgba(0,0,0,0.02)' : 'white', 
        borderRadius: '12px', border: '1px solid var(--border-light)', 
        marginBottom: '12px', transition: 'all 0.2s ease'
      }}
      onClick={() => setExpanded(!expanded)}
      className="post-tile-hover"
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="post-platform">{p.source}</div>
        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: p.sentiment === 'positive' ? '#34c759' : p.sentiment === 'negative' ? '#ff3b30' : 'var(--text-tertiary)' }}>
          {p.sentiment?.toUpperCase()}
        </div>
      </div>
      
      {!expanded ? (
        <p style={{ color: 'var(--text-primary)', marginTop: '0.5rem', fontSize: '0.95rem', lineHeight: 1.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {p.text}
        </p>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginTop: '0.5rem' }}>
          <p style={{ color: 'var(--text-primary)', fontSize: '0.95rem', lineHeight: 1.5 }}>
            {p.text}
          </p>
          {p.url && (
            <a href={p.url} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: 'var(--ibm-blue)', textDecoration: 'none', marginTop: '0.75rem', fontWeight: 600 }}>
              View Original <ExternalLink size={12} />
            </a>
          )}
        </motion.div>
      )}
    </motion.div>
  );
};

const NewInsightsGrid = () => {
  const [data, setData] = useState({
    tech_interest: [], regional: [], active_locations: [], community: []
  });

  React.useEffect(() => {
    api.get('/api/analytics/insight-sections')
      .then(res => setData(res.data))
      .catch(err => console.error("Error fetching insights:", err));
  }, []);

  const renderList = (title, items, emoji) => (
    <div className="card" style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column' }}>
      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.5rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
        {emoji} {title}
      </h3>
      {items.length === 0 ? (
        <div style={{ color: 'var(--text-tertiary)', fontSize: '0.9rem' }}>Loading insights...</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {items.map((item, idx) => {
            const maxVal = items[0].count || 1;
            const pct = (item.count / maxVal) * 100;
            return (
              <div key={idx}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    {item.university || item.region}
                  </span>
                  <span style={{ fontWeight: 700, color: 'var(--accent-blue)', fontSize: '0.85rem' }}>{item.count.toLocaleString()}</span>
                </div>
                <div style={{ width: '100%', height: '6px', background: 'var(--border-light)', borderRadius: '4px', overflow: 'hidden' }}>
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
    <div style={{ padding: '0 2rem 4rem', maxWidth: '1400px', margin: '-1rem auto 0' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
        {renderList("Tech Interest Leaders", data.tech_interest, <Activity size={18} color="var(--accent-red)"/>)}
        {renderList("Regional Variation", data.regional, <MapPin size={18} color="var(--accent-blue)"/>)}
        {renderList("Active Communities", data.active_locations, <Sparkles size={18} color="#f5a623"/>)}
        {renderList("Skills & Open Source", data.community, <Activity size={18} color="#34c759"/>)}
      </div>
    </div>
  );
};

// The Side Panel Component
const PostDetailsPanel = ({ isOpen, onClose, university, activeFilter }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (isOpen && university) {
      setLoading(true);
      let url = `/api/posts/university/${encodeURIComponent(university)}?limit=25`;
      if (activeFilter && activeFilter !== 'Overall Map') {
        url += `&category=${encodeURIComponent(activeFilter)}`;
      }
      api.get(url)
        .then(res => setPosts(res.data))
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [isOpen, university, activeFilter]);

  // Insights Calculations based on fetched data
  const posCount = posts.filter(p => p.sentiment === 'positive').length;
  const negCount = posts.filter(p => p.sentiment === 'negative').length;
  let sentimentScore = "Neutral";
  let sentimentColor = "var(--text-secondary)";
  if (posCount > negCount + 2) { sentimentScore = "Highly Positive"; sentimentColor = "#34c759"; }
  else if (posCount > negCount) { sentimentScore = "Positive"; sentimentColor = "#34c759"; }
  else if (negCount > posCount) { sentimentScore = "Critical Attention"; sentimentColor = "var(--accent-red)"; }

  // Finding Top Category amongst recent posts
  const catCounts = {};
  posts.forEach(p => { catCounts[p.category] = (catCounts[p.category] || 0) + 1; });
  const topCat = Object.keys(catCounts).sort((a,b) => catCounts[b] - catCounts[a])[0] || 'Unknown';

  return (
    <div className={`side-panel ${isOpen ? 'open' : ''}`} style={{ width: '450px', right: isOpen ? '0' : '-450px' }}>
      <button className="close-panel-btn" onClick={onClose} style={{ position: 'absolute', top: '24px', right: '24px' }}>
        <X size={20} color="var(--text-primary)" />
      </button>

      <div style={{ marginTop: '2.5rem', marginBottom: '1.5rem' }}>
        <div style={{ color: 'var(--accent-blue)', fontWeight: 700, fontSize: '0.75rem', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '8px' }}>
          Real-Time Analysis
        </div>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
          {university}
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Deep dive into the latest localized technical sentiment and engagement trends.
        </p>
      </div>

      {loading ? (
        <div style={{ padding: '3rem 0', textAlign: 'center' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '3px solid var(--border-light)', borderTopColor: 'var(--accent-red)', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }}></div>
          <div style={{ color: 'var(--text-tertiary)', fontWeight: 500 }}>Correlating intelligent data...</div>
          <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
        </div>
      ) : posts.length === 0 ? (
        <div style={{ padding: '3rem 0', textAlign: 'center', background: 'rgba(0,0,0,0.02)', borderRadius: '16px', border: '1px dashed var(--border-strong)' }}>
          <Activity size={32} color="var(--text-tertiary)" style={{ margin: '0 auto 12px' }}/>
          <div style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>No recent data matches the filter.</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* KPI Dashboard Tiles */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: '16px', border: '1px solid var(--border-light)', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '8px' }}>Recent Volume</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{posts.length >= 25 ? '25+' : posts.length}</div>
            </div>
            
            <div style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: '16px', border: '1px solid var(--border-light)', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '8px' }}>Trend Alignment</div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: sentimentColor }}>{sentimentScore}</div>
            </div>

            <div style={{ gridColumn: '1 / -1', background: 'linear-gradient(145deg, var(--bg-secondary), #f5f5f7)', padding: '16px', borderRadius: '16px', border: '1px solid var(--border-light)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '4px' }}>Primary Technical Theme</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent-blue)' }}>{topCat}</div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--border-strong)', paddingTop: '16px' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>
              Latest Signal Feed
            </div>
            <div className="posts-list" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {posts.map((p, i) => (
                <PostTile key={p.id || i} p={p} index={i} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


// The Modal Component for Navigation Links
const NavModal = ({ isOpen, onClose, title, content }) => {
  if (!isOpen) return null;
  return (
    <div className="modal-overlay fade-in" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="close-panel-btn" onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px', marginBottom: 0 }}>
          <X size={20} color="var(--text-primary)" />
        </button>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem', letterSpacing: '-0.02em' }}>
          {title}
        </h2>
        <div style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          {content}
        </div>
      </div>
    </div>
  );
};

function Dashboard() {
  // Interactive Filters
  const [activeFilter, setActiveFilter] = useState('Overall Map');
  
  // Side Panel State
  const [panelOpen, setPanelOpen] = useState(false);
  const [selectedUni, setSelectedUni] = useState(null);
  
  // Modal State
  // Stats State
  const [globalStats, setGlobalStats] = useState({ 
    total: '---', trajectory: '--', metrics: {} 
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', content: null });
  
  // Real Website SaaS State
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const user = JSON.parse(localStorage.getItem('ibm_user') || '{"name": "Admin", "email": "admin"}');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    // Click outside handler for dropdown
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);

  // Fetch global stats on load
  useEffect(() => {
    api.get('/api/analytics/global-stats')
      .then(res => setGlobalStats(res.data))
      .catch(err => console.error("Error fetching stats:", err));
  }, []);

  const openModal = (title, content) => {
    setModalContent({ title, content });
    setModalOpen(true);
  };


  const handleMarkerClick = (uniName) => {
    setSelectedUni(uniName);
    setPanelOpen(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('ibm_token');
    localStorage.removeItem('ibm_user');
    window.location.href = '/login';
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
    setDropdownOpen(false);
  };

  const openProfile = () => {
    openModal('My Profile', (
      <div style={{ padding: '1rem 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-blue), #5294ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '1.5rem', fontWeight: 700 }}>
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{user.name}</div>
            <div style={{ color: 'var(--text-secondary)' }}>{user.email}</div>
          </div>
        </div>
        <div style={{ background: 'var(--bg-primary)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px', fontWeight: 700 }}>Account Status</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#34c759', fontWeight: 600 }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#34c759' }}></div>
            Active Intelligence Tier
          </div>
        </div>
      </div>
    ));
    setDropdownOpen(false);
  };

  const openSettings = () => {
    openModal('Platform Settings', (
      <div style={{ padding: '1rem 0', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Configure global alert sensitivity and dataset caching rules.</p>
        <button className="nav-btn-primary" onClick={() => setModalOpen(false)}>Save Preferences</button>
      </div>
    ));
    setDropdownOpen(false);
  };

  return (
    <div className="landing-wrapper">
      
      {/* 1. Floating Pill Navigation */}
      <nav className="pill-nav fade-in">
        <div className="brand-logos">
          <img src={ibmLogo} alt="IBM" style={{ height: '32px', width: 'auto' }} />
          <div style={{ width: '1px', height: '20px', background: 'var(--border-strong)' }}></div>
          <img src={bristolLogo} alt="University of Bristol" style={{ height: '32px', width: 'auto' }} />
        </div>
        
        <div className="nav-links">
          <button className="nav-btn" onClick={() => openModal('Documentation', <p>Full API documentation is available at <code>/docs</code> on the backend. Fast, fully typed asynchronous endpoints powered by FastAPI and MongoDB.</p>)}>Documentation</button>
          
          <button 
            className="nav-btn" 
            style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-blue)' }}
            onClick={() => openModal('Upload Dataset', <DatasetUpload onClose={() => setModalOpen(false)} />)}
          >
            <Upload size={16} /> Upload
          </button>
          
          <button 
            className="nav-btn" 
            style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#f5a623' }}
            onClick={() => openModal('System Audit Trail', <AuditLogViewer />)}
          >
            <ShieldAlert size={16} /> Audit Logs
          </button>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(0,0,0,0.03)', padding: '4px 8px', borderRadius: '8px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Export:</span>
            <a href="/api/export/csv" className="nav-btn" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 8px' }}>
              <Download size={14} /> CSV
            </a>
          </div>
          
          {/* User Profile Dropdown */}
          <div style={{ position: 'relative' }} ref={dropdownRef}>
            <button 
              className="nav-btn" 
              onClick={() => setDropdownOpen(!dropdownOpen)}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-secondary)', padding: '6px 12px', borderRadius: '100px', border: '1px solid var(--border-strong)', color: 'var(--text-primary)' }}
            >
              <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--accent-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.8rem', fontWeight: 700 }}>
                {user.name.charAt(0).toUpperCase()}
              </div>
              <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{user.name.split(' ')[0]}</span>
              <ChevronDown size={14} style={{ color: 'var(--text-tertiary)', transform: dropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
            </button>

            <AnimatePresence>
              {dropdownOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  style={{ 
                    position: 'absolute', top: 'calc(100% + 8px)', right: 0, 
                    background: 'var(--bg-secondary)', border: '1px solid var(--border-strong)', 
                    borderRadius: '16px', minWidth: '220px', padding: '8px', 
                    boxShadow: '0 10px 40px rgba(0,0,0,0.1)', zIndex: 3000
                  }}
                >
                  <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border-light)', marginBottom: '4px' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{user.name}</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{user.email}</div>
                  </div>

                  <button className="dropdown-item" onClick={openProfile}>
                    <User size={16} /> My Profile
                  </button>
                  <button className="dropdown-item" onClick={openSettings}>
                    <Settings size={16} /> Settings
                  </button>
                  <button className="dropdown-item" onClick={toggleTheme}>
                    {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />} 
                    {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
                  </button>
                  
                  <div style={{ height: '1px', background: 'var(--border-light)', margin: '4px 0' }}></div>
                  
                  <button className="dropdown-item" onClick={handleLogout} style={{ color: 'var(--accent-red)' }}>
                    <LogOut size={16} /> Logout
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
        </div>
      </nav>

      {/* Basic Dropdown Item CSS */}
      <style dangerouslySetInnerHTML={{__html: `
        .dropdown-item {
          display: flex; align-items: center; gap: 10px; width: 100%; border: none; 
          background: none; padding: 10px 12px; border-radius: 8px; text-align: left; 
          font-size: 0.9rem; font-weight: 500; cursor: pointer; color: var(--text-primary);
          transition: background 0.2s;
        }
        .dropdown-item:hover {
          background: var(--bg-primary);
        }
      `}} />

      {/* 2. Premium Hero Section */}
      <header className="hero-section fade-in">
        <div className="hero-tag">Pulse Engine v2.0 Live</div>
        <h1 className="hero-title">
          Intelligence for the <span>Next Generation</span> of Engineers.
        </h1>
        <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto', lineHeight: 1.6 }}>
          Track, analyze, and engage with technical sentiment across universities in the UK & Ireland using cutting-edge HuggingFace models.
        </p>

        {/* 3. Glowing Advanced Search Box */}
        <AIGlowSearch />
      </header>

      {/* 4. Dashboard Core */}
      <main className="dashboard-grid fade-in">
        
        {/* Left Column: Stats & Timeline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="card">
            <h3 style={{ fontSize: '1rem', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '0.5rem' }}>Total Tracked Engagements</h3>
            <div style={{ fontSize: '3rem', fontWeight: 800, letterSpacing: '-0.04em' }}>
              {globalStats.total.toLocaleString()}
            </div>
            <div style={{ color: '#34c759', fontWeight: 600, fontSize: '0.9rem', marginTop: '0.25rem' }}>
              {globalStats.trajectory} trajectory
            </div>
            
            <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {Object.entries(globalStats.metrics).map(([key, val]) => (
                <div key={key} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{key}</span>
                  <span style={{ fontWeight: 600 }}>{val}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="card" style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
               <Activity size={18} color="var(--accent-blue)" /> Velocity Timeline
            </h3>
            <div style={{ flexGrow: 1, minHeight: '250px' }}>
              <TimelineChart filter={activeFilter} />
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Map */}
        <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MapPin size={18} color="var(--accent-red)" /> Engagement Topology
            </h3>
            
            <div className="filters-row" style={{ marginBottom: 0, flexWrap: 'wrap', gap: '8px' }}>
              {[
                'Overall Map', 'AI', 'Data Science', 'Design Thinking', 
                'AI and Law', 'IBM SkillsBuild', 'Hackathons', 
                'Open Source', 'Student Societies'
              ].map(flt => (
                <button 
                  key={flt}
                  className={`filter-chip ${activeFilter === flt ? 'active' : ''}`}
                  onClick={() => setActiveFilter(flt)}
                >
                  {flt}
                </button>
              ))}
            </div>
          </div>

          <div style={{ flexGrow: 1, minHeight: '400px', borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--border-light)' }}>
            <InteractiveMap activeFilter={activeFilter} onMarkerClick={handleMarkerClick} />
          </div>

        </div>

      </main>
      
      {/* 5. New Expanded Insights Section */}
      <NewInsightsGrid />

      {/* Detail Slide Panel */}
      <PostDetailsPanel 
        isOpen={panelOpen} 
        onClose={() => setPanelOpen(false)} 
        university={selectedUni} 
        activeFilter={activeFilter}
      />

      {/* Nav Modal */}
      <NavModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        title={modalContent.title} 
        content={modalContent.content} 
      />

    </div>
  );
}

export default Dashboard;
