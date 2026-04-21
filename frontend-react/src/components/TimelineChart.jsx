import React, { useState, useEffect } from 'react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import api from '../services/api';
import { Activity } from 'lucide-react';

const TimelineChart = ({ filter }) => {
  const [data, setData] = useState([]);
  const [viewMode, setViewMode] = useState('pulse'); // 'pulse' (Line/Area) or 'stacked' (Bar)
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTimeline = async () => {
      setLoading(true);
      try {
        const [volRes, sentRes] = await Promise.all([
          api.get(`/api/timeline/?category=${filter !== 'Overall Map' ? encodeURIComponent(filter) : ''}`),
          api.get(`/api/analytics/sentiment-evolution?category=${filter !== 'Overall Map' ? encodeURIComponent(filter) : ''}`)
        ]);

        const dateMap = {};
        volRes.data.forEach(d => {
          const dateStr = new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          if (!dateMap[dateStr]) dateMap[dateStr] = { name: dateStr, technical: 0, non_technical: 0, unknown: 0, volume: 0, sentiment: 0 };
          dateMap[dateStr][d.engagement_type] = (dateMap[dateStr][d.engagement_type] || 0) + d.post_count;
          dateMap[dateStr].volume += d.post_count;
        });

        sentRes.data.forEach(s => {
          const dateStr = new Date(s.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          if (dateMap[dateStr]) dateMap[dateStr].sentiment = parseFloat(s.weighted_sentiment.toFixed(2));
        });

        setData(Object.values(dateMap));
      } catch (err) {
        console.error("Error fetching timeline:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTimeline();
  }, [filter]);

  if (loading) return <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Activity size={24} className="spin" /></div>;

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginBottom: '12px' }}>
        <button 
          onClick={() => setViewMode('pulse')} 
          style={{ padding: '6px 14px', borderRadius: '100px', border: '1px solid var(--border-strong)', background: viewMode === 'pulse' ? 'var(--accent-blue)' : 'transparent', color: viewMode === 'pulse' ? 'white' : 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}
        >
          Activity Pulse
        </button>
        <button 
          onClick={() => setViewMode('stacked')} 
          style={{ padding: '6px 14px', borderRadius: '100px', border: '1px solid var(--border-strong)', background: viewMode === 'stacked' ? 'var(--accent-blue)' : 'transparent', color: viewMode === 'stacked' ? 'white' : 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}
        >
          Type Density
        </button>
      </div>

      <div style={{ flexGrow: 1 }}>
        <ResponsiveContainer width="100%" height="100%">
          {viewMode === 'pulse' ? (
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorVol" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0f62fe" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#0f62fe" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.04)" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
              <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
              <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }} />
              <Area yAxisId="left" type="monotone" dataKey="volume" stroke="#0f62fe" strokeWidth={3} fillOpacity={1} fill="url(#colorVol)" name="Volunteer/Post Count" />
              <Area yAxisId="right" type="monotone" dataKey="sentiment" stroke="#34c759" strokeWidth={2} fill="transparent" name="Sentiment Index" />
            </AreaChart>
          ) : (
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.04)" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
              <Tooltip cursor={{ fill: 'var(--bg-primary)' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }} />
              <Legend verticalAlign="top" height={36} iconType="circle" />
              <Bar dataKey="technical" stackId="a" fill="#0f62fe" name="Technical" />
              <Bar dataKey="non_technical" stackId="a" fill="#fa4d56" name="Non-Technical" />
              <Bar dataKey="unknown" stackId="a" fill="#8d8d8d" name="Other/Unknown" radius={[4, 4, 0, 0]} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TimelineChart;
