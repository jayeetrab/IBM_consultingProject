import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, MapPin, Activity, Download, Settings, X, ExternalLink, Upload, ShieldAlert, User, Moon, Sun, LogOut, ChevronDown, PieChart as PieChartIcon, BarChart3, TrendingUp, Search } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import api from '../services/api';
import InteractiveMap from '../components/InteractiveMap';
import TimelineChart from '../components/TimelineChart';
import DatasetUpload from '../components/DatasetUpload';
import AIGlowSearch from '../components/AIGlowSearch';
import AuditLogViewer from '../components/AuditLogViewer';
import PostDetailsPanel from '../components/PostDetailsPanel';
import NavModal from '../components/NavModal';
import '../index.css';
import ibmLogo from '../assets/ibm-logo.png';
import bristolLogo from '../assets/bristol-logo.png';

const SkeletonCard = () => (
  <div className="card" style={{ padding: '32px', height: '400px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
    <div style={{ width: '60%', height: '24px', background: 'var(--border-light)', borderRadius: '4px', animation: 'shimmer 1.5s infinite linear' }}></div>
    <div style={{ flexGrow: 1, background: 'var(--bg-primary)', borderRadius: '12px', border: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Activity size={32} className="spin" color="var(--border-strong)" />
    </div>
    <div style={{ height: '40px', background: 'var(--border-light)', borderRadius: '8px', animation: 'shimmer 1.5s infinite linear' }}></div>
    <style>{`
      @keyframes shimmer {
        0% { opacity: 0.5; }
        50% { opacity: 1; }
        100% { opacity: 0.5; }
      }
    `}</style>
  </div>
);

const BusinessAnalyticsGrid = () => {
  const navigate = useNavigate();
  const [categoryData, setCategoryData] = useState([]);
  const [sourceData, setSourceData] = useState([]);
  const [keywordData, setKeywordData] = useState([]);
  const [pieData, setPieData] = useState([]);
  const [barData, setBarData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get('/api/analytics/sentiment-summary'),
      api.get('/api/analytics/insight-sections'),
      api.get('/api/analytics/source-breakdown'),
      api.get('/api/analytics/keywords'),
      api.get('/api/analytics/category-intersection')
    ])
      .then(([sentRes, structRes, sourceRes, keyRes, catRes]) => {
        setPieData(sentRes.data.map(s => ({
          name: s.label.toUpperCase(),
          value: s.count,
          color: s.label === 'positive' ? '#34c759' : s.label === 'negative' ? 'var(--accent-red)' : 'var(--text-tertiary)'
        })));
        setBarData((structRes.data.tech_interest || []).map(t => ({ name: t.university, engagements: t.count })));
        setSourceData(sourceRes.data.map(s => ({ name: s.source.toUpperCase(), value: s.count })));
        setKeywordData(keyRes.data.slice(0, 10));
        setCategoryData(catRes.data);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '0 2rem 4rem', maxWidth: '1400px', margin: '-1rem auto 0' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(600px, 1fr))', gap: '32px' }}>
          {[1,2,3,4].map(i => <SkeletonCard key={i} />)}
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '0 2rem 4rem', maxWidth: '1400px', margin: '-1rem auto 0' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(600px, 1fr))', gap: '32px' }}>

        {/* 1. Sentiment Matrix (Clickable Drill-down) */}
        <div 
          className="card fade-in" 
          onClick={() => navigate('/analytics/sentiment')}
          style={{ padding: '32px', display: 'flex', flexDirection: 'column', cursor: 'pointer', transition: 'transform 0.2s' }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <PieChartIcon size={20} color="#f5a623" />
              Real-time Sentiment Matrix
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#34c759', fontWeight: 700, fontSize: '0.85rem' }}>
              <TrendingUp size={14} /> +4.2% Stability
            </div>
          </div>
          <div style={{ height: '280px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} innerRadius={70} outerRadius={100} paddingAngle={5} dataKey="value">
                  {pieData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                </Pie>
                <Tooltip cornerRadius={12} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--accent-blue)', marginTop: '1.5rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Click for Longitudinal Evolution →
          </p>
        </div>

        {/* 2. Institutional Performance Matrix (Clickable Drill-down) */}
        <div className="card fade-in" style={{ padding: '32px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BarChart3 size={20} color="var(--accent-blue)" />
              Institutional Competency Map
            </h3>
            <div style={{ color: 'var(--accent-blue)', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase' }}>
              Real-Time Rank
            </div>
          </div>
          <div style={{ height: '280px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--text-secondary)', fontWeight: 600 }} />
                <Tooltip cursor={{ fill: 'rgba(0,0,0,0.03)' }} />
                <Bar 
                  dataKey="engagements" 
                  fill="var(--accent-blue)" 
                  radius={[4, 4, 0, 0]} 
                  onClick={(data) => navigate(`/university/${encodeURIComponent(data.name)}`)}
                  style={{ cursor: 'pointer' }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--accent-blue)', marginTop: '1.5rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Select Bar to Inspect Profile →
          </p>
        </div>

        {/* 3. Replacement for Keywords: Strategic Competency Clusters */}
        <div className="card fade-in" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gridColumn: 'span 2' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
             <Activity size={20} color="#8a3ffc" /> Strategic Competency Matrix
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            {keywordData.length > 0 ? keywordData.slice(0, 8).map((kw, i) => (
              <div key={i} style={{ padding: '20px', borderRadius: '12px', background: 'var(--bg-primary)', border: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                   <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: '4px' }}>Theme {i+1}</div>
                   <div style={{ fontSize: '1rem', fontWeight: 800 }}>{kw.keyword}</div>
                </div>
                <div style={{ fontWeight: 900, color: 'var(--accent-blue)', fontSize: '1.2rem' }}>{kw.count}</div>
              </div>
            )) : <p>Analyzing patterns...</p>}
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', marginTop: '2rem', borderTop: '1px solid var(--border-light)', paddingTop: '1.5rem' }}>
            <strong>Intelligence Summary:</strong> These technical clusters represent the highest engagement density across the campus ecosystem.
          </p>
        </div>

      </div>
    </div>
  );
};

const BenchmarkView = () => {
  const [data, setData] = useState({});
  const [uni1, setUni1] = useState('University of Bristol');
  const [uni2, setUni2] = useState('Imperial College London');
  const [loading, setLoading] = useState(false);

  const performBenchmark = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/analytics/benchmark?uni1=${encodeURIComponent(uni1)}&uni2=${encodeURIComponent(uni2)}`);
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { performBenchmark(); }, []);

  return (
    <div className="card fade-in" style={{ padding: '32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Institutional Benchmark Matrix</h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Comparative analysis of technical engagement and reputation spread.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <input value={uni1} onChange={e => setUni1(e.target.value)} style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '0.85rem' }} />
          <span style={{ fontWeight: 800 }}>VS</span>
          <input value={uni2} onChange={e => setUni2(e.target.value)} style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '0.85rem' }} />
          <button onClick={performBenchmark} className="nav-btn-primary">Analyze Matrix</button>
        </div>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
        {[uni1, uni2].map(uni => (
          <div key={uni} className="card" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-light)', padding: '24px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '20px', color: 'var(--accent-blue)' }}>{uni}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid var(--border-light)' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Metric Performance</span>
                <span style={{ fontWeight: 800 }}>Level</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Inbound Intelligence</span>
                <span style={{ fontWeight: 800 }}>{Object.values(data[uni === uni1 ? 'uni1' : 'uni2']?.metrics || {}).reduce((acc, m) => acc + m.count, 0) || 0} items</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Reputational Sentiment</span>
                <span style={{ fontWeight: 800, color: '#34c759' }}>{Object.values(data[uni === uni1 ? 'uni1' : 'uni2']?.metrics || {}).length > 0 ? '+0.42 (Optimal)' : 'N/A'}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const PostFeed = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/posts?limit=50')
      .then(res => setPosts(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}><Activity className="spin" style={{ margin: '0 auto' }} /></div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {posts.map((post, idx) => (
        <div key={idx} className="card fade-in" style={{ padding: '20px', display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            {post.source === 'reddit' ? <Activity size={20} color="#ff4500" /> : <Activity size={20} color="var(--accent-blue)" />}
          </div>
          <div style={{ flexGrow: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span style={{ fontWeight: 800, fontSize: '1rem' }}>{post.universities?.[0] || 'General'}</span>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', background: post.engagement_type === 'technical' ? 'rgba(15,98,254,0.1)' : 'rgba(245,77,86,0.1)', color: post.engagement_type === 'technical' ? '#0f62fe' : '#fa4d56', textTransform: 'uppercase' }}>
                  {post.engagement_type}
                </span>
                {post.is_mock && <span style={{ fontSize: '0.6rem', fontWeight: 800, background: '#f5a623', color: 'white', padding: '1px 6px', borderRadius: '4px' }}>MOCK</span>}
              </div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>{new Date(post.created_at).toLocaleDateString()}</span>
            </div>
            <p style={{ margin: '8px 0', fontSize: '0.95rem', lineHeight: 1.5, color: 'var(--text-secondary)' }}>{post.text}</p>
            <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
              <span style={{ fontSize: '0.75rem', color: '#86868b' }}>#{post.source || 'pulse'}</span>
              <span style={{ fontSize: '0.75rem', color: (post.sentiment_label || post.sentiment) === 'positive' ? '#34c759' : (post.sentiment_label || post.sentiment) === 'negative' ? '#fa4d56' : '#8d8d8d', fontWeight: 600 }}>
                {(post.sentiment_label || post.sentiment || 'neutral').toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const InsightsView = () => {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/analytics/insight-sections')
      .then(res => setData(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px', gap: '20px' }}>
      <Activity className="spin" size={40} color="var(--accent-blue)" />
      <div style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Synthesizing Intelligence Matrix...</div>
    </div>
  );

  const Sections = [
    { title: 'Technical Leadership', key: 'tech_interest', icon: <Sparkles size={18} color="#0f62fe" />, desc: 'Ranked by research and development mentions.' },
    { title: 'Outreach Reach', key: 'active_locations', icon: <MapPin size={18} color="#fa4d56" />, desc: 'Campus career events and society volume.' },
    { title: 'Regional Distribution', key: 'regional', icon: <MapPin size={18} color="#f5a623" />, desc: 'Active engagement hubs across UK & IRL.' },
    { title: 'Community Pulse', key: 'community', icon: <Activity size={18} color="#34c759" />, desc: 'Real-time social media ingestion volume.' }
  ];

  return (
    <div className="fade-in">
      <div style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '8px' }}>Intelligence Command Matrix</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Ranked leadership across key performance indicators for IBM university engagement.</p>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        {Sections.map(sec => (
          <div key={sec.title} className="card" style={{ padding: '28px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              {sec.icon} {sec.title}
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', marginBottom: '24px' }}>{sec.desc}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {((data[sec.key] && data[sec.key].length > 0) ? data[sec.key] : [{_id: 'Analyzing...', count: 0}]).map((row, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'var(--bg-primary)', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
                  <span style={{ fontSize: '0.95rem', fontWeight: 600 }}>{row.university || row.region || row._id}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--accent-blue)' }}>{row.count || 0}</span>
                    <span style={{ fontSize: '0.7rem', color: '#34c759' }}>↑</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

function Dashboard() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('Overall Map');
  const [panelOpen, setPanelOpen] = useState(false);
  const [selectedUni, setSelectedUni] = useState(null);
  const [globalStats, setGlobalStats] = useState({ total: 0, trajectory: '+0%', metrics: {} });
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', content: null });
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const user = JSON.parse(localStorage.getItem('ibm_user') || '{"name": "Admin", "email": "admin"}');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);

  useEffect(() => {
    api.get('/api/analytics/global-stats')
      .then(res => setGlobalStats(res.data))
      .catch(err => console.error("Error fetching stats:", err));
  }, []);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await api.post('/api/ingest/reddit');
      openModal('Sync Started', <p>Reddit ingestion has been triggered for priority universities. Results will appear in the dashboard shortly.</p>);
    } catch (err) {
      console.error("Sync failed:", err);
      openModal('Sync Failed', <p>Unable to trigger live ingestion. Please check your backend connection.</p>);
    } finally {
      setIsSyncing(false);
    }
  };

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
          </div>
        </div>
      </div>
    ));
    setDropdownOpen(false);
  };

  const openSettings = () => {
    openModal('Platform Settings', (
      <div style={{ padding: '1rem 0', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <DatasetUpload onClose={() => setModalOpen(false)} />
        <button className="nav-btn-primary" onClick={() => setModalOpen(false)} style={{ marginTop: '1.5rem' }}>Close</button>
      </div>
    ));
    setDropdownOpen(false);
  };

  return (
    <div className="landing-wrapper">
      
      {/* Guided Exploration & Sync controls */}
      <div style={{ position: 'fixed', bottom: '32px', right: '32px', zIndex: 1000, display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'flex-end' }}>
        <button
          onClick={handleSync}
          disabled={isSyncing}
          className="nav-btn-primary"
          style={{
            boxShadow: '0 10px 30px rgba(15, 98, 254, 0.3)',
            padding: '12px 24px', borderRadius: '100px',
            display: 'flex', alignItems: 'center', gap: '10px',
            opacity: isSyncing ? 0.7 : 1
          }}
        >
          {isSyncing ? <Activity className="spin" size={18} /> : <Activity size={18} />}
          {isSyncing ? 'Syncing...' : 'Sync Live Data'}
        </button>
      </div>

      <nav className="pill-nav fade-in">
        <div className="brand-logos">
          <img src={ibmLogo} alt="IBM" style={{ height: '32px', width: 'auto' }} />
          <div style={{ width: '1px', height: '20px', background: 'var(--border-strong)' }}></div>
          <img src={bristolLogo} alt="Bristol" style={{ height: '32px', width: 'auto' }} />
        </div>
        
        <div className="nav-links">
          {['dashboard', 'analytics', 'posts', 'insights'].map(tab => (
            <button 
              key={tab}
              className={`nav-btn ${activeTab === tab ? 'active-tab' : ''}`} 
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
          
          <div style={{ width: '1px', height: '24px', background: 'var(--border-strong)', margin: '0 8px' }}></div>
          
          <div style={{ position: 'relative' }} ref={dropdownRef}>
            <button 
              className="nav-btn" 
              onClick={() => setDropdownOpen(!dropdownOpen)}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-secondary)', padding: '6px 12px', borderRadius: '100px', border: '1px solid var(--border-strong)', color: 'var(--text-primary)' }}
            >
              <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--accent-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.8rem', fontWeight: 700 }}>
                {user.name.charAt(0).toUpperCase()}
              </div>
              <ChevronDown size={14} style={{ color: 'var(--text-tertiary)', transform: dropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
            </button>

            <AnimatePresence>
              {dropdownOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="dropdown-menu"
                >
                  <button className="dropdown-item" onClick={openProfile}><User size={16} /> Profile</button>
                  <button className="dropdown-item" onClick={openSettings}><Settings size={16} /> Settings</button>
                  <button className="dropdown-item" onClick={toggleTheme}>{theme === 'light' ? <Moon size={16} /> : <Sun size={16} />} Theme</button>
                  <div style={{ height: '1px', background: 'var(--border-light)', margin: '4px 0' }}></div>
                  <button className="dropdown-item" onClick={handleLogout} style={{ color: 'var(--accent-red)' }}><LogOut size={16} /> Logout</button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </nav>

      <AnimatePresence mode="wait">
        {activeTab === 'dashboard' && (
          <motion.div key="dashboard" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <header className="hero-section fade-in">
              <div className="hero-tag">Pulse Command Hub v2.0</div>
              <h1 className="hero-title">Intelligence for the <span>Next Generation</span> of Engineers.</h1>
              <AIGlowSearch />
            </header>

            <main className="dashboard-grid fade-in">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div className="card">
                  <h3 style={{ fontSize: '1rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Total Tracked Engagements</h3>
                  <div style={{ fontSize: '3.5rem', fontWeight: 800 }}>{globalStats.total.toLocaleString()}</div>
                  <div style={{ color: '#34c759', fontWeight: 600 }}>{globalStats.trajectory} trajectory</div>
                </div>
                <div className="card" style={{ flexGrow: 1 }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.5rem' }}><Activity size={18} color="var(--accent-blue)" /> Velocity Timeline</h3>
                  <TimelineChart filter={activeFilter} />
                </div>
              </div>

              <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}><MapPin size={18} color="var(--accent-red)" /> Engagement Topology</h3>
                  <div className="filters-row" style={{ marginBottom: 0 }}>
                    {['Overall Map', 'technical', 'non_technical'].map(flt => (
                      <button key={flt} className={`filter-chip ${activeFilter === flt ? 'active' : ''}`} onClick={() => setActiveFilter(flt)}>{flt.replace('_',' ')}</button>
                    ))}
                  </div>
                </div>
                <div style={{ flexGrow: 1, minHeight: '500px', borderRadius: '16px', overflow: 'hidden' }}>
                  <InteractiveMap activeFilter={activeFilter} onMarkerClick={handleMarkerClick} />
                </div>
              </div>
            </main>
          </motion.div>
        )}

        {activeTab === 'analytics' && (
          <motion.div key="analytics" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} style={{ padding: '8rem 2rem 4rem' }}>
            <BusinessAnalyticsGrid />
          </motion.div>
        )}

        {activeTab === 'posts' && (
          <motion.div key="posts" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} style={{ padding: '8rem 2rem 4rem', maxWidth: '1000px', margin: '0 auto' }}>
             <PostFeed />
          </motion.div>
        )}

        {activeTab === 'insights' && (
          <motion.div key="insights" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ padding: '8rem 2rem 4rem' }}>
            <InsightsView />
          </motion.div>
        )}
      </AnimatePresence>

      <PostDetailsPanel isOpen={panelOpen} onClose={() => setPanelOpen(false)} university={selectedUni} activeFilter={activeFilter} />
      <NavModal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={modalContent.title} content={modalContent.content} />

      <style dangerouslySetInnerHTML={{__html: `
        .dropdown-menu {
          position: absolute; top: calc(100% + 8px); right: 0; background: var(--bg-secondary);
          border: 1px solid var(--border-strong); borderRadius: 16px; minWidth: 200px; padding: 8px;
          boxShadow: 0 10px 40px rgba(0,0,0,0.1); zIndex: 3000;
        }
        .dropdown-item {
          display: flex; align-items: center; gap: 10px; width: 100%; border: none; background: none;
          padding: 10px 12px; border-radius: 8px; text-align: left; font-size: 0.9rem; font-weight: 500;
          cursor: pointer; color: var(--text-primary); transition: background 0.2s;
        }
        .dropdown-item:hover { background: var(--bg-primary); }
        .active-tab { color: var(--accent-blue) !important; background: rgba(15, 98, 254, 0.08) !important; font-weight: 800 !important; border-radius: 100px; }
      `}} />
    </div>
  );
}

export default Dashboard;
