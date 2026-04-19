import React from 'react';
import { ShieldAlert, Upload } from 'lucide-react';
import DatasetUpload from '../components/DatasetUpload';
import AuditLogViewer from '../components/AuditLogViewer';
import api from '../services/api';

const Admin = () => {
  const user = JSON.parse(localStorage.getItem('ibm_user') || '{"email": ""}');

  if (user.email !== 'admin') {
    return (
      <div style={{ padding: '80px 40px', textAlign: 'center' }}>
        <ShieldAlert size={64} color="var(--accent-red)" style={{ margin: '0 auto 24px' }} />
        <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Intrusion Blocked</h1>
        <p style={{ color: 'var(--text-secondary)' }}>You do not have systemic authorization to view this panel.</p>
      </div>
    );
  }

  const handlePurge = () => {
    if(window.confirm("CRITICAL WARNING: This deletes all uploaded datasets and map markers from the cloud. Proceed?")) {
      api.post('/api/admin/purge-database')
        .then(() => alert("Database purged successfully. Please refresh the web app."))
        .catch(err => alert("Error: " + err));
    }
  };

  return (
    <div style={{ padding: '40px', maxWidth: '1400px', margin: '0 auto' }}>
      <header style={{ marginBottom: '40px', borderBottom: '1px solid var(--border-light)', paddingBottom: '32px' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-0.04em', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--accent-red)' }}>
          <ShieldAlert size={32} />
          System Administration
        </h1>
        <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: '900px' }}>
          Restricted Zone. Direct dataset injection modules and secure API trace auditing blocks. Any interactions processed here natively write to immutable audit streams.
        </p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '40px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          <div className="card" style={{ padding: '32px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Upload size={20} color="var(--accent-blue)" /> Data Pipeline Injection
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '24px', lineHeight: 1.5 }}>
              Upload unstructured raw CSV or IBM Open Data schemas. The cloud computing matrix will automatically tokenize, process semantic weights, and natively render new analytics globally.
            </p>
            <DatasetUpload onClose={() => {}} />
          </div>

          <div className="card" style={{ padding: '32px', background: 'var(--bg-secondary)', border: '1px solid var(--border-strong)' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '16px', color: 'var(--accent-red)' }}>
              Destructive Protocol: Purge Stale Artifacts
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '20px', lineHeight: 1.5 }}>
              In the event of overlapping geospatial markers or phantom pipeline returns, execute the purge routine directly on the live infrastructure. This permanently cleanses the NoSQL aggregates to base states.
            </p>
            <button 
              onClick={handlePurge}
              style={{ padding: '12px 24px', background: 'var(--accent-red)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
            >
              EXECUTE PURGE
            </button>
          </div>
        </div>

        <div className="card" style={{ padding: '32px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldAlert size={20} color="var(--accent-red)" /> Immutable Audit Trace
          </h3>
          <div style={{ flexGrow: 1 }}>
            <AuditLogViewer isAdmin={true} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
