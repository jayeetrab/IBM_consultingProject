import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, MapPin, Activity, Download, Settings, X, ExternalLink, Upload, ShieldAlert, User, Moon, Sun, LogOut, ChevronDown, PieChart as PieChartIcon, BarChart3 } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import api from '../services/api';
import InteractiveMap from '../components/InteractiveMap';
import TimelineChart from '../components/TimelineChart';
import DatasetUpload from '../components/DatasetUpload';
import AIGlowSearch from '../components/AIGlowSearch';
import AuditLogViewer from '../components/AuditLogViewer';
import PostDetailsPanel from '../components/PostDetailsPanel';
import '../index.css';
import ibmLogo from '../assets/ibm-logo.png';
import bristolLogo from '../assets/bristol-logo.png';


const BusinessAnalyticsGrid = () => {
  const navigate = useNavigate();
  const [pieData, setPieData] = useState([]);;
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
    <div style={{ padding: '0 2rem 4rem', maxWidth: '1400px', margin: '-1rem auto 0' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '32px' }}>
        
        {/* Sentiment Pie Chart */}
        <div className="card fade-in" style={{ padding: '32px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <PieChartIcon size={20} color="#f5a623" />
            Global Sentiment Ratio
          </h3>
          
          {loading ? (
             <div style={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading BI...</div>
          ) : pieData.length === 0 ? (
             <div style={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)' }}>No data available.</div>
          ) : (
            <>
              <div 
                style={{ width: '100%', height: '320px', cursor: 'pointer', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                onClick={() => navigate('/analytics/sentiment')}
                title="Click for Deep Sentiment Analysis"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="45%"
                      innerRadius={75}
                      outerRadius={110}
                      paddingAngle={6}
                      dataKey="value"
                      stroke="none"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} cornerRadius={6} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ borderRadius: '16px', border: '1px solid var(--border-strong)', background: 'var(--bg-secondary)', fontWeight: 700, boxShadow: '0 8px 30px rgba(0,0,0,0.1)' }}
                    />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '0.85rem', fontWeight: 600 }} />
                  </PieChart>
                </ResponsiveContainer>
                
                {/* Center Label for Donut - Refined Centering */}
                {!loading && pieData.length > 0 && (
                  <div style={{ position: 'absolute', top: '45%', left: '50%', transform: 'translate(-50%, -100%)', textAlign: 'center', pointerEvents: 'none' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Matrix Volume</div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1 }}>
                      {pieData.reduce((acc, d) => acc + d.value, 0)}
                    </div>
                  </div>
                )}
              </div>

              <button 
                onClick={() => navigate('/analytics/sentiment')}
                style={{ 
                  marginTop: '1rem', width: '100%', padding: '0.75rem', borderRadius: '12px',
                  background: 'rgba(15, 98, 254, 0.05)', color: 'var(--accent-blue)',
                  border: 'none', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer',
                  transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                }}
              >
                View Sentiment Evolution <ExternalLink size={14} />
              </button>
            </>
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
             <div style={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)' }}>No data available.</div>
          ) : (
            <>
              <div 
                style={{ width: '100%', height: '300px', cursor: 'pointer' }}
                onClick={() => navigate('/analytics/categories')}
                title="Click for Detailed Technical Mapping"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} />
                    <Tooltip 
                      cursor={{ fill: 'var(--bg-primary)' }}
                      contentStyle={{ borderRadius: '12px', border: '1px solid var(--border-strong)', background: 'var(--bg-secondary)', fontWeight: 600 }}
                    />
                    <Bar dataKey="engagements" fill="var(--accent-blue)" radius={[6, 6, 0, 0]} maxBarSize={60} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <button 
                onClick={() => navigate('/analytics/categories')}
                style={{ 
                  marginTop: '1rem', width: '100%', padding: '0.75rem', borderRadius: '12px',
                  background: 'rgba(15, 98, 254, 0.05)', color: 'var(--accent-blue)',
                  border: 'none', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer',
                  transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                }}
              >
                View Academic Mapping <ExternalLink size={14} />
              </button>
            </>
          )}
        </div>

      </div>
    </div>
  );
};

// The Side Panel Component


// The Modal Component for Navigation Links

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
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-blue), #5294ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '2rem', fontWeight: 700, boxShadow: '0 8px 16px rgba(15, 98, 254, 0.2)' }}>
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{user.name}</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>{user.email}</div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(52, 199, 89, 0.1)', color: '#34c759', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700, marginTop: '8px', textTransform: 'uppercase' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#34c759' }}></div>
              Active Tier
            </div>
          </div>
        </div>
        
        <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '1.5rem', marginTop: '1.5rem' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>Security Settings</div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ background: 'var(--bg-primary)', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 500, fontSize: '0.95rem' }}>Change Password</span>
              <button className="nav-btn" style={{ color: 'var(--accent-blue)' }}>Edit</button>
            </div>
            <div style={{ background: 'var(--bg-primary)', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 500, fontSize: '0.95rem' }}>Two-Factor Authentication</span>
              <button className="nav-btn" style={{ color: 'var(--text-tertiary)' }}>Disabled</button>
            </div>
          </div>
        </div>
      </div>
    ));
    setDropdownOpen(false);
  };

  const openSettings = () => {
    openModal('Platform Settings', (
      <div style={{ padding: '1rem 0', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '0.5rem' }}>Customize your analytical workspace and privacy rules.</p>
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border-light)' }}>
          <div>
            <div style={{ fontWeight: 600 }}>Email Notifications</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>Receive alerts for critical sentiment drops</div>
          </div>
          <div style={{ width: '44px', height: '24px', background: 'var(--accent-blue)', borderRadius: '12px', position: 'relative', cursor: 'pointer' }}>
             <div style={{ position: 'absolute', top: '2px', right: '2px', width: '20px', height: '20px', background: 'white', borderRadius: '50%' }}></div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border-light)' }}>
          <div>
            <div style={{ fontWeight: 600 }}>Daily Digest Reports</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>Sent at 08:00 AM UTC</div>
          </div>
          <div style={{ width: '44px', height: '24px', background: 'var(--border-strong)', borderRadius: '12px', position: 'relative', cursor: 'pointer' }}>
             <div style={{ position: 'absolute', top: '2px', left: '2px', width: '20px', height: '20px', background: 'white', borderRadius: '50%' }}></div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border-light)' }}>
          <div>
            <div style={{ fontWeight: 600 }}>Data Anonymization</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>Hide explicit names from analytical extracts</div>
          </div>
          <div style={{ width: '44px', height: '24px', background: 'var(--accent-blue)', borderRadius: '12px', position: 'relative', cursor: 'pointer' }}>
             <div style={{ position: 'absolute', top: '2px', right: '2px', width: '20px', height: '20px', background: 'white', borderRadius: '50%' }}></div>
          </div>
        </div>

        <div style={{ marginTop: '1rem', borderTop: '1px solid var(--border-light)', paddingTop: '1.5rem' }}>
          <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-primary)' }}>Administrative Actions</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <DatasetUpload onClose={() => setModalOpen(false)} />
          </div>
        </div>

        <button className="nav-btn-primary" onClick={() => setModalOpen(false)} style={{ marginTop: '1.5rem' }}>Save & Apply</button>
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
                  
                  {user.email === 'admin' && (
                    <button className="dropdown-item" onClick={() => { setDropdownOpen(false); openModal('System Audit Trail', <AuditLogViewer />); }} style={{ color: '#f5a623' }}>
                      <ShieldAlert size={16} /> Audit Logs
                    </button>
                  )}
                  
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

            <button 
              onClick={() => navigate('/analytics/benchmark')}
              className="nav-btn-primary" 
              style={{ marginTop: '1.5rem', width: '100%', fontSize: '0.85rem' }}
            >
              Benchmark Institutions
            </button>
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
      
      {/* 5. New Expanded Insights Section (Business Analytics Upgrade) */}
      <BusinessAnalyticsGrid />

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
