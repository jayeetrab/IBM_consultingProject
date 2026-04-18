import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import api from '../services/api';

const AIGlowSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [aiResponse, setAiResponse] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    setAiResponse(null);
    try {
      const res = await api.post('/api/analytics/ask', { query: searchQuery });
      setAiResponse(res.data.answer);
    } catch (err) {
      setAiResponse("I'm currently unable to reach the intelligence layer. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="search-container">
      <form onSubmit={handleSearch} style={{ position: 'relative' }}>
        <input 
          type="text" 
          className="search-box"
          placeholder="Ask anything (e.g., 'What is the sentiment at Oxford?')"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button type="submit" className="search-btn" disabled={isSearching}>
          <Sparkles size={18} />
        </button>
      </form>

      <AnimatePresence>
        {aiResponse && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
            className="ai-answer-box"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontWeight: 600, color: 'var(--accent-red)' }}>
              <Sparkles size={16} /> AI Natural Language Insights
            </div>
            <div style={{ color: 'var(--text-primary)', lineHeight: 1.6 }} dangerouslySetInnerHTML={{ __html: aiResponse.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AIGlowSearch;
