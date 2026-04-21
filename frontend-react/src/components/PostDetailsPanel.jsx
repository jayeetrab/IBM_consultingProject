import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, ExternalLink, Activity } from 'lucide-react';
import api from '../services/api';

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
        <div className="post-platform">{p.source || 'pulse'}</div>
        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: (p.sentiment_label || p.sentiment) === 'positive' ? '#34c759' : (p.sentiment_label || p.sentiment) === 'negative' ? '#ff3b30' : 'var(--text-tertiary)' }}>
          {(p.sentiment_label || p.sentiment || 'neutral')?.toUpperCase()}
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

const PostDetailsPanel = ({ isOpen, onClose, university, activeFilter }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (isOpen && university) {
      setLoading(true);
      let url = `/api/posts/university/${encodeURIComponent(university)}?limit=25`;
      if (activeFilter && activeFilter !== 'Overall Map') {
        url += `&engagement_type=${encodeURIComponent(activeFilter)}`;
      }
      api.get(url)
        .then(res => setPosts(res.data))
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [isOpen, university, activeFilter]);

  const posCount = posts.filter(p => (p.sentiment_label || p.sentiment) === 'positive').length;
  const negCount = posts.filter(p => (p.sentiment_label || p.sentiment) === 'negative').length;
  let sentimentScore = "Neutral";
  let sentimentColor = "var(--text-secondary)";
  if (posCount > negCount + 2) { sentimentScore = "Highly Positive"; sentimentColor = "#34c759"; }
  else if (posCount > negCount) { sentimentScore = "Positive"; sentimentColor = "#34c759"; }
  else if (negCount > posCount) { sentimentScore = "Critical Attention"; sentimentColor = "var(--accent-red)"; }

  const catCounts = {};
  posts.forEach(p => { 
    const type = p.engagement_type || 'unknown';
    catCounts[type] = (catCounts[type] || 0) + 1; 
  });
  const topCat = Object.keys(catCounts).sort((a,b) => catCounts[b] - catCounts[a])[0] || 'Unknown';

  return (
    <div className={`side-panel ${isOpen ? 'open' : ''}`} style={{ width: '450px', right: isOpen ? '0' : '-450px', position: 'fixed', top: 0, height: '100vh', background: 'var(--bg-primary)', zIndex: 5000, boxShadow: '-5px 0 30px rgba(0,0,0,0.1)', overflowY: 'auto', padding: '24px', transition: 'right 0.3s ease' }}>
      <button className="close-panel-btn" onClick={onClose} style={{ position: 'absolute', top: '24px', right: '24px', background: 'transparent', border: 'none', cursor: 'pointer' }}>
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

export default PostDetailsPanel;
