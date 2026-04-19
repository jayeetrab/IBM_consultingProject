import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { ShieldAlert, Clock, Settings } from 'lucide-react';

const AuditLogViewer = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/admin/audit-logs')
      .then(res => setLogs(res.data))
      .catch(err => console.error("Error fetching audit logs", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div style={{ padding: '2rem', color: 'var(--text-tertiary)', textAlign: 'center' }}>Connecting to Audit Stream...</div>;
  }

  return (
    <div style={{ maxHeight: '60vh', overflowY: 'auto', paddingRight: '12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', padding: '12px', background: 'rgba(52, 199, 89, 0.05)', borderRadius: '8px', border: '1px solid rgba(52, 199, 89, 0.2)' }}>
        <ShieldAlert size={18} color="#34c759" />
        <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>System actions are permanently recorded securely into MongoDB for strict presentation verification.</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {logs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-tertiary)' }}>No audit events found.</div>
        ) : logs.map((log) => (
          <div key={log._id} style={{ 
            background: 'var(--bg-secondary)', 
            padding: '16px', 
            borderRadius: '12px', 
            border: '1px solid var(--border-light)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ 
                  background: 'var(--accent-blue)', 
                  color: 'white', 
                  padding: '4px 8px', 
                  borderRadius: '6px', 
                  fontSize: '0.75rem', 
                  fontWeight: 700,
                  textTransform: 'uppercase'
                }}>
                  {log.action.replace('_', ' ')}
                </span>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  <Settings size={12} style={{ display: 'inline', marginRight: '4px', position: 'relative', top: '2px' }}/> 
                  {log.user}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
                <Clock size={12} />
                {new Date(log.timestamp).toLocaleString()}
              </div>
            </div>
            
            <div style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              {log.details}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AuditLogViewer;
