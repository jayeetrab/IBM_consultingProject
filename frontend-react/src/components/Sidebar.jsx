import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Map as MapIcon, Activity, Sparkles, ShieldAlert, ChevronRight, Moon, Sun, Settings, User, LogOut } from 'lucide-react';
import ibmLogo from '../assets/ibm-logo.png';
import bristolLogo from '../assets/bristol-logo.png';
import NavModal from './NavModal';

const Sidebar = () => {
  const user = JSON.parse(localStorage.getItem('ibm_user') || '{"name": "Guest", "email": ""}');
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', content: null });

  const openModal = (title, content) => {
    setModalContent({ title, content });
    setModalOpen(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('ibm_token');
    localStorage.removeItem('ibm_user');
    navigate('/login');
  };

  const toggleTheme = () => {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    const next = current === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('ibm_theme', next);
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
      </div>
    ));
    setDropdownOpen(false);
  };

  const openSettings = () => {
    openModal('Platform Settings', (
      <div style={{ padding: '1rem 0', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Customize your analytical workspace and privacy rules.</p>
        <button className="nav-btn-primary" onClick={() => setModalOpen(false)}>Save & Apply</button>
      </div>
    ));
    setDropdownOpen(false);
  };

  const links = [
    { to: "/overview", label: "Overview", icon: <LayoutDashboard size={20} /> },
    { to: "/intelligence/map", label: "Geo-Intelligence", icon: <MapIcon size={20} /> },
    { to: "/intelligence/timeline", label: "Velocity Tracking", icon: <Activity size={20} /> },
    { to: "/intelligence/insights", label: "Community Insights", icon: <Sparkles size={20} /> },
  ];

  if (user.email === 'admin') {
    links.push({ to: "/admin", label: "System Administration", icon: <ShieldAlert size={20} /> });
  }

  return (
    <div style={{
      width: '280px', height: '100vh', position: 'fixed', top: 0, left: 0,
      background: 'var(--bg-secondary)', borderRight: '1px solid var(--border-strong)',
      display: 'flex', flexDirection: 'column', padding: '24px 16px', zIndex: 1000
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px', padding: '0 8px' }}>
        <img src={ibmLogo} alt="IBM" style={{ height: '24px' }} />
        <div style={{ width: '1px', height: '16px', background: 'var(--border-strong)' }}></div>
        <img src={bristolLogo} alt="Bristol" style={{ height: '24px' }} />
      </div>

      <div style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px', padding: '0 8px' }}>
        Analytical Modules
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', flexGrow: 1 }}>
        {links.map(link => (
          <NavLink 
            key={link.to} 
            to={link.to}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            style={{ textDecoration: 'none' }}
          >
            {({ isActive }) => (
              <div style={{ 
                display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', 
                borderRadius: '12px', color: isActive ? 'white' : 'var(--text-secondary)',
                background: isActive ? 'var(--accent-blue)' : 'transparent',
                fontWeight: isActive ? 600 : 500, transition: 'all 0.2s'
              }}>
                {link.icon}
                <span style={{ flexGrow: 1 }}>{link.label}</span>
                {isActive && <ChevronRight size={16} />}
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      <div style={{ position: 'relative' }}>
        <div 
          onClick={() => setDropdownOpen(!dropdownOpen)}
          style={{ 
            background: 'var(--bg-primary)', padding: '16px', borderRadius: '16px', 
            border: '1px solid var(--border-light)', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '12px', transition: 'all 0.2s'
          }}
          className="sidebar-link"
        >
          <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-blue), #5294ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700 }}>
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div style={{ overflow: 'hidden', flexGrow: 1 }}>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{user.name}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{user.email}</div>
          </div>
        </div>

        {dropdownOpen && (
          <div style={{ 
            position: 'absolute', bottom: 'calc(100% + 8px)', left: 0, width: '100%',
            background: 'var(--bg-secondary)', border: '1px solid var(--border-strong)', 
            borderRadius: '16px', padding: '8px', 
            boxShadow: '0 -10px 40px rgba(0,0,0,0.1)', zIndex: 3000
          }}>
            <button className="dropdown-item" onClick={openProfile}>
              <User size={14} /> My Profile
            </button>
            <button className="dropdown-item" onClick={toggleTheme}>
              {document.documentElement.getAttribute('data-theme') === 'dark' ? <><Sun size={14} /> Light Mode</> : <><Moon size={14} /> Dark Mode</>}
            </button>
            <button className="dropdown-item" onClick={openSettings}>
              <Settings size={14} /> Settings
            </button>
            <div style={{ height: '1px', background: 'var(--border-light)', margin: '4px 0' }}></div>
            <button className="dropdown-item danger" onClick={handleLogout}>
              <LogOut size={14} /> Sign out
            </button>
          </div>
        )}
      </div>

      <NavModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        title={modalContent.title} 
        content={modalContent.content} 
      />
    </div>
  );
};

export default Sidebar;
