import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import ibmLogo from '../assets/ibm-logo.png';
import bristolLogo from '../assets/bristol-logo.png';
import api from '../services/api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const res = await api.post('/api/auth/login', { email, password });
      localStorage.setItem('ibm_token', res.data.access_token);
      localStorage.setItem('ibm_user', JSON.stringify(res.data.user));
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ 
          background: 'var(--glass-bg)', backdropFilter: 'var(--glass-blur)',
          border: '1px solid var(--border-light)', borderRadius: '24px',
          padding: '3rem', width: '100%', maxWidth: '420px', textAlign: 'center',
          boxShadow: '0 24px 60px rgba(0,0,0,0.05)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginBottom: '2.5rem' }}>
          <img src={ibmLogo} alt="IBM" style={{ height: '32px' }} />
          <div style={{ width: '1px', height: '24px', background: 'var(--border-strong)' }}></div>
          <img src={bristolLogo} alt="Bristol" style={{ height: '32px' }} />
        </div>

        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
          Pulse Engine Connect
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '2rem' }}>
          MSc Business Analytics Intelligence Platform
        </p>

        {error && <div style={{ color: 'var(--accent-red)', background: 'rgba(184,11,11,0.05)', padding: '12px', borderRadius: '12px', marginBottom: '1.5rem', fontSize: '0.9rem', fontWeight: 600 }}>
          {error}
        </div>}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <input 
            type="email" 
            placeholder="IBM or University Email" 
            className="search-box"
            style={{ padding: '1rem', width: '100%', borderRadius: '12px' }}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input 
            type="password" 
            placeholder="Password" 
            className="search-box"
            style={{ padding: '1rem', width: '100%', borderRadius: '12px' }}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button 
            type="submit" 
            className="nav-btn-primary"
            style={{ padding: '1rem', borderRadius: '12px', fontSize: '1rem', fontWeight: 600, marginTop: '1rem', cursor: loading ? 'not-allowed' : 'pointer' }}
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Secure Login'}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default Login;
