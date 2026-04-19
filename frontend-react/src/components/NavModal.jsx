import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const NavModal = ({ isOpen, onClose, title, content }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{ 
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 
        }}
        onClick={onClose}
      >
        <motion.div 
          initial={{ scale: 0.95, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          style={{ 
            background: 'var(--bg-secondary)', padding: '32px', borderRadius: '24px', 
            width: '90%', maxWidth: '500px', border: '1px solid var(--border-strong)',
            position: 'relative', boxShadow: '0 24px 48px rgba(0,0,0,0.2)'
          }}
        >
          <button 
            onClick={onClose}
            style={{ position: 'absolute', top: '24px', right: '24px', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)' }}
          >
            <X size={24} />
          </button>
          
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '24px', paddingRight: '32px', color: 'var(--text-primary)' }}>
            {title}
          </h2>
          
          <div style={{ color: 'var(--text-primary)' }}>
            {content}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default NavModal;
