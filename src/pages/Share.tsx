import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';

const Share = () => {
  const [country, setCountry] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert("You must be logged in!");
      return setLoading(false);
    }
    
    // Default image support is omitted for simplicity in MVP
    const { error } = await supabase.from('posts').insert({
      author_id: user.id,
      country,
      content,
      status: 'pending' // As per moderation requirements
    });

    if (error) alert(error.message);
    else {
      alert('Experience submitted! It is pending moderation.');
      setCountry('');
      setContent('');
    }
    setLoading(false);
  };

  return (
    <motion.main 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="container"
      style={{ padding: '60px 24px', maxWidth: '600px' }}
    >
      <h2 style={{ fontSize: '2.5rem', marginBottom: '8px' }}>Share Your Journey</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>
        Tell us about your trip. Once approved by our team, it'll appear on the platform.
      </p>

      <form className="glass-panel" onSubmit={handleSubmit} style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Country</label>
          <input 
            type="text" 
            className="input-field" 
            placeholder="e.g., Japan, Italy..." 
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            required
          />
        </div>
        
        <div>
          <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Experience</label>
          <textarea 
            className="input-field" 
            placeholder="What was the highlight of your visit?" 
            rows={5}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            style={{ resize: 'vertical' }}
            required
          />
        </div>

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Submitting...' : 'Submit for Moderation'}
        </button>
      </form>
    </motion.main>
  );
};

export default Share;
