import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';
import '@google/model-viewer';

const Home = () => {
  const [posts, setPosts] = useState<any[]>([]);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    // Only fetch 'approved' status posts, assuming RLS already handles it, but good to be explicit
    const { data, error } = await supabase
      .from('posts')
      .select('*, profiles(username, avatar_url)')
      .eq('status', 'approved')
      .order('created_at', { ascending: false });
    
    if (!error && data) setPosts(data);
  };

  return (
    <motion.main 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      style={{ flex: 1, padding: '60px 0' }}
    >
      <div className="container">
        <header style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h1 className="text-gradient" style={{ fontSize: '4rem', marginBottom: '16px', lineHeight: '1.1' }}>
            Discover The World<br/>In 3D
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.25rem', maxWidth: '600px', margin: '0 auto 32px' }}>
            Explore immersive glimpses of different countries, share your own travel experiences, and connect with other globetrotters.
          </p>
          <Link to="/share">
            <button className="btn-primary" style={{ padding: '16px 32px', fontSize: '1.1rem' }}>
              Share Your Journey
            </button>
          </Link>
        </header>

        {/* 3D Model Glimpse Showcase */}
        <section style={{ marginBottom: '80px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', marginBottom: '24px' }}>
            <h2>Featured Destination: Japan</h2>
            <span style={{ color: 'var(--accent-primary)', cursor: 'pointer' }}>Interactive View &rarr;</span>
          </div>
          
          <div className="glass-panel" style={{ padding: '8px', height: '500px', width: '100%', overflow: 'hidden' }}>
            <iframe 
              title="Japanese Torii Gate environment" 
              frameBorder="0" 
              allowFullScreen 
              allow="autoplay; fullscreen; xr-spatial-tracking" 
              src="https://sketchfab.com/models/b209e729a6dc41deabccabaa936a282f/embed?autostart=1&camera=0&preload=1&ui_theme=dark&dnt=1"
              style={{ width: '100%', height: '100%', borderRadius: '12px' }}
            ></iframe>
          </div>
        </section>

        {/* Dynamic Feed */}
        <section>
          <h2 style={{ marginBottom: '24px', fontSize: '2rem' }}>Latest Experiences</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
            {posts.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)' }}>No experiences shared yet. Be the first!</p>
            ) : (
              posts.map(post => (
                <div key={post.id} className="glass-panel" style={{ padding: '24px' }}>
                  <Link to={`/user/${post.author_id}`} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#222', overflow: 'hidden' }}>
                      <model-viewer
                        src={post.profiles?.avatar_url || 'https://models.readyplayer.me/659e99a8dfc47102adcf03fe.glb'}
                        alt="avatar"
                        camera-controls={false}
                        disable-zoom
                        disable-pan
                        style={{ width: '100%', height: '100%', backgroundColor: 'transparent' }}
                      ></model-viewer>
                    </div>
                    <div>
                      <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>@{post.profiles?.username}</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--accent-primary)' }}>{post.country}</div>
                    </div>
                  </Link>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6' }}>
                    {post.content}
                  </p>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </motion.main>
  );
};

export default Home;
