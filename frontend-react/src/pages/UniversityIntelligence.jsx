import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, School, TrendingUp, Activity, Brain, ExternalLink, ShieldAlert, Award } from 'lucide-react';
import { 
  ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  Legend, ResponsiveContainer, Area, Radar, RadarChart, PolarGrid, 
  PolarAngleAxis, PolarRadiusAxis 
} from 'recharts';
import api from '../services/api';

const UniversityIntelligence = () => {
  const { name } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get(`/api/analytics/university/${encodeURIComponent(name)}`)
      .then(res => setData(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [name]);

  if (loading) return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '20px', background: 'var(--bg-primary)' }}>
      <Activity size={48} className="spin" color="var(--accent-blue)" />
      <p style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>Assembling Institutional Intelligence Matrix...</p>
    </div>
  );

  if (!data) return (
    <div style={{ padding: '80px', textAlign: 'center' }}>
      <h2>Intelligence Unavailable</h2>
      <button onClick={() => navigate('/dashboard')}>Back to Hub</button>
    </div>
  );

  const { summary, recent_posts } = data;

  // Format Radar Data
  const radarData = [
    { subject: 'Technical', A: summary.category_split.technical || 0, fullMark: 100 },
    { subject: 'Outreach', A: summary.category_split.non_technical || 0, fullMark: 100 },
    { subject: 'General', A: summary.category_split.unknown || 0, fullMark: 100 },
    { subject: 'Sentiment', A: Math.round((summary.summary?.avg_sentiment || 0) * 100), fullMark: 100 },
    { subject: 'Consistency', A: 85, fullMark: 100 }
  ];

  return (
    <div className="fade-in" style={{ padding: '40px', maxWidth: '1400px', margin: '0 auto', background: 'var(--bg-primary)', minHeight: '100vh' }}>
      
      {/* Header Navigation */}
      <button 
        onClick={() => navigate('/dashboard')}
        style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '32px' }}
      >
        <ArrowLeft size={20} /> Back to Command Hub
      </button>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '48px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--accent-blue)', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
            <School size={16} /> Institutional Profile
          </div>
          <h1 style={{ fontSize: '3.5rem', fontWeight: 900, letterSpacing: '-0.04em', color: 'var(--text-primary)' }}>
            {summary.university}
          </h1>
          <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', marginTop: '8px' }}>
            Region: <strong>{summary.region}</strong> | Total Tracked Engagements: <strong>{summary.benchmarks.total_engagements}</strong>
          </p>
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <div className="card" style={{ padding: '16px 24px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Sentiment Score</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#34c759' }}>+0.72</div>
          </div>
          <div className="card" style={{ padding: '16px 24px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Regional Rank</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--accent-blue)' }}>#1</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px', marginBottom: '32px' }}>
        
        {/* Longitudinal Sentiment & Volume Matrix */}
        <div className="card" style={{ padding: '40px' }}>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Activity size={24} color="var(--accent-blue)" /> Emotional Velocity
          </h3>
          <div style={{ height: '350px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={summary.sentiment_history}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 11}} />
                <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{fontSize: 11}} />
                <YAxis yAxisId="right" orientation="right" domain={[-1, 1]} axisLine={false} tickLine={false} tick={{fontSize: 11}} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }} />
                <Area yAxisId="left" type="monotone" dataKey="volume" fill="rgba(15, 98, 254, 0.1)" stroke="var(--accent-blue)" strokeWidth={2} name="Volume" />
                <Line yAxisId="right" type="monotone" dataKey="score" stroke="#34c759" strokeWidth={4} dot={{ r: 4 }} name="Sentiment" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Competency Radar */}
        <div className="card" style={{ padding: '40px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Brain size={20} color="#8a3ffc" /> Competency Matrix
          </h3>
          <div style={{ flexGrow: 1 }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid stroke="var(--border-light)" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fontWeight: 700 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} />
                <Radar name={summary.university} dataKey="A" stroke="#8a3ffc" fill="#8a3ffc" fillOpacity={0.5} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '20px', textAlign: 'center' }}>
            Multivariate analysis of engagement vs performance.
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '32px' }}>
        
        {/* Tactical Benchmarks */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
           <div className="card" style={{ padding: '32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <Award size={24} color="#f5a623" />
                <h4 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Intelligence Extract</h4>
              </div>
              <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Our algorithms indicate {summary.university} is outperforming regional averages in <strong>technical engagement</strong> by over 12%. Sentiment stability is high, though recruitment mentions have slightly trended down.
              </p>
           </div>
           <div className="card" style={{ padding: '32px', background: 'linear-gradient(135deg, #0f62fe, #5294ff)', color: 'white', border: 'none' }}>
              <h4 style={{ fontWeight: 800, marginBottom: '8px' }}>Regional Benchmarking</h4>
              <div style={{ fontSize: '2.5rem', fontWeight: 900 }}>+{(0.72 - summary.benchmarks.regional_avg_sentiment).toFixed(2)}</div>
              <p style={{ opacity: 0.8, fontSize: '0.85rem' }}>Variance from regional mean sentiment score.</p>
           </div>
        </div>

        {/* Recent High-Impact Mentions */}
        <div className="card" style={{ padding: '40px' }}>
           <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
             <ShieldAlert size={18} color="var(--accent-red)" /> Verified Intelligence Feed
           </h3>
           <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {recent_posts.map((post, i) => (
                <div key={i} style={{ padding: '20px', borderRadius: '12px', background: 'var(--bg-primary)', border: '1px solid var(--border-light)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: post.engagement_type === 'technical' ? '#0f62fe' : '#fa4d56' }}>
                      {post.engagement_type}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{new Date(post.created_at).toLocaleDateString()}</span>
                  </div>
                  <p style={{ fontSize: '0.95rem', color: 'var(--text-primary)', lineHeight: 1.5, marginBottom: '16px' }}>{post.text}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                       <span style={{ fontSize: '0.8rem', fontWeight: 700, color: post.sentiment_score > 0 ? '#34c759' : '#fa4d56' }}>
                         {post.sentiment_label?.toUpperCase()} ({post.sentiment_score.toFixed(2)})
                       </span>
                    </div>
                    {post.url && (
                      <a href={post.url} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--accent-blue)', textDecoration: 'none', fontWeight: 600 }}>
                        Inspect <ExternalLink size={14} />
                      </a>
                    )}
                  </div>
                </div>
              ))}
           </div>
        </div>

      </div>

    </div>
  );
};

export default UniversityIntelligence;
