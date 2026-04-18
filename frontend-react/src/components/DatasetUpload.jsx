import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, File, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import api from '../services/api';

const DatasetUpload = ({ onClose }) => {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('idle'); // idle, uploading, success, error
  const [message, setMessage] = useState('');
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) validateAndSetFile(droppedFile);
  };

  const validateAndSetFile = (selectedFile) => {
    const validTypes = ['.csv', '.json'];
    const isExtensionValid = validTypes.some(ext => selectedFile.name.toLowerCase().endsWith(ext));
    
    if (!isExtensionValid) {
      setStatus('error');
      setMessage('Please upload a .csv or .json file.');
      return;
    }

    setFile(selectedFile);
    setStatus('idle');
    setMessage('');
  };

  const handleUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setStatus('uploading');
    try {
      const response = await api.post('/api/ingest/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setStatus('success');
      setMessage(response.data.message);
    } catch (error) {
      console.error('Upload failed:', error);
      setStatus('error');
      setMessage(error.response?.data?.detail || 'An unexpected error occurred during upload.');
    }
  };

  const reset = () => {
    setFile(null);
    setStatus('idle');
    setMessage('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div style={{ position: 'relative' }}>
      <button 
        onClick={onClose}
        style={{ 
          position: 'absolute', top: '-10px', right: '-10px', 
          background: 'var(--bg-secondary)', border: '1px solid var(--border-light)',
          borderRadius: '50%', padding: '4px', cursor: 'pointer', zIndex: 10
        }}
      >
        <X size={16} />
      </button>

      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Upload Dataset</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Enrich the dashboard with custom engagement data (.csv or .json)
        </p>
      </div>

      <AnimatePresence mode="wait">
        {status === 'success' ? (
          <motion.div 
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{ 
              background: 'rgba(52, 199, 89, 0.05)', borderRadius: '16px', 
              padding: '2rem', textAlign: 'center', border: '1px solid rgba(52, 199, 89, 0.2)' 
            }}
          >
            <CheckCircle size={48} color="#34c759" style={{ marginBottom: '1rem' }} />
            <h4 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>Upload Successful</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              {message}
            </p>
            <button 
              onClick={reset}
              style={{ 
                marginTop: '1.5rem', background: 'var(--text-primary)', color: 'white',
                border: 'none', padding: '0.6rem 1.2rem', borderRadius: 'var(--radius-pill)',
                fontWeight: 600, cursor: 'pointer'
              }}
            >
              Upload Another
            </button>
          </motion.div>
        ) : (
          <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div 
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current.click()}
              style={{
                border: '2px dashed var(--border-strong)',
                borderRadius: '20px',
                padding: '3rem 2rem',
                textAlign: 'center',
                cursor: 'pointer',
                background: file ? 'rgba(15, 98, 254, 0.02)' : 'transparent',
                transition: 'all 0.2s ease',
                position: 'relative',
                overflow: 'hidden'
              }}
              className="upload-dropzone"
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                style={{ display: 'none' }} 
                accept=".csv,.json"
                onChange={(e) => validateAndSetFile(e.target.files[0])}
              />
              
              <AnimatePresence>
                {status === 'uploading' && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{ 
                      position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.8)', 
                      display: 'flex', flexDirection: 'column', alignItems: 'center', 
                      justifyContent: 'center', zIndex: 5, backdropFilter: 'blur(4px)'
                    }}
                  >
                    <Loader2 size={32} className="spin" color="var(--accent-blue)" />
                    <p style={{ marginTop: '1rem', fontWeight: 600 }}>Analyzing & Processing...</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {file ? (
                <div>
                  <div style={{ 
                    width: '48px', height: '48px', background: 'var(--accent-blue)', 
                    borderRadius: '12px', display: 'flex', alignItems: 'center', 
                    justifyContent: 'center', margin: '0 auto 1rem', color: 'white'
                  }}>
                    <File size={24} />
                  </div>
                  <p style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{file.name}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              ) : (
                <div>
                  <Upload size={40} color="var(--text-tertiary)" style={{ marginBottom: '1rem' }} />
                  <p style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                    Choose a file or drag & drop
                  </p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', marginTop: '0.5rem' }}>
                    CSV or JSON (max 50MB)
                  </p>
                </div>
              )}
            </div>

            {status === 'error' && (
              <div style={{ 
                marginTop: '1rem', padding: '0.75rem', borderRadius: '12px', 
                background: 'rgba(255, 59, 48, 0.05)', color: '#ff3b30', 
                fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px',
                border: '1px solid rgba(255, 59, 48, 0.2)'
              }}>
                <AlertCircle size={16} /> {message}
              </div>
            )}

            <button 
              disabled={!file || status === 'uploading'}
              onClick={handleUpload}
              style={{
                width: '100%',
                marginTop: '1.5rem',
                padding: '1rem',
                borderRadius: 'var(--radius-pill)',
                background: !file ? 'var(--border-light)' : 'var(--text-primary)',
                color: 'white',
                border: 'none',
                fontWeight: 700,
                fontSize: '1rem',
                cursor: !file || status === 'uploading' ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <Upload size={18} /> Process Dataset
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ marginTop: '1.5rem', padding: '1rem', borderRadius: '12px', background: '#f8f9fa', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
        <strong>Pro-tip:</strong> Your dataset should have a <code>text</code> column to enable sentiment analysis and keyword extraction.
      </div>
    </div>
  );
};

export default DatasetUpload;
