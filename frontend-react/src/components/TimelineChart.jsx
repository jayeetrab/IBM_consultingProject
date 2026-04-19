import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import api from '../services/api';

const TimelineChart = ({ filter }) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchTimeline = async () => {
      try {
        let url = '/api/timeline/';
        if (filter !== 'Overall Map') {
          url += `?category=${encodeURIComponent(filter)}`;
        }
        const res = await api.get(url);
        
        // Format dates correctly from string
        const formatted = res.data.map(d => {
          const dateObj = new Date(d.date);
          const fullDateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
          return { name: fullDateStr, engagements: d.post_count };
        });
        
        setData(formatted);
      } catch (err) {
        console.error("Error fetching timeline:", err);
      }
    };
    
    fetchTimeline();
  }, [filter]);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          {/* Smooth gradient fill for the chart */}
          <linearGradient id="colorEngs" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#0f62fe" stopOpacity={0.4}/>
            <stop offset="95%" stopColor="#0f62fe" stopOpacity={0}/>
          </linearGradient>
        </defs>
        
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.04)" />
        <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 12, fill: '#86868b' }} 
            dy={10}
        />
        <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 12, fill: '#86868b' }} 
        />
        <Tooltip 
            contentStyle={{ borderRadius: '12px', border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 8px 30px rgba(0,0,0,0.08)' }}
            itemStyle={{ color: '#0f62fe', fontWeight: 600 }}
        />
        <Area 
            type="monotone" 
            dataKey="engagements" 
            stroke="#0f62fe" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorEngs)" 
            animationDuration={1500}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default TimelineChart;
