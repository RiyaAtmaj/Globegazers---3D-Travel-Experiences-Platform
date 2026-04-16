import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';
import '@google/model-viewer';

const Profile = () => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      setProfile(data);
    }
    setLoading(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '60px' }}>Loading...</div>;
  if (!profile) return <div style={{ textAlign: 'center', padding: '60px' }}>Please login to view profile.</div>;

  return (
    <motion.main 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="container"
      style={{ padding: '60px 24px', maxWidth: '800px' }}
    >
      <div className="glass-panel" style={{ padding: '40px', display: 'flex', gap: '32px', alignItems: 'center' }}>
        
        {/* Render 3D Avatar (Ready Player Me GLB) */}
        <div style={{ width: '180px', height: '180px', borderRadius: '50%', backgroundColor: 'var(--bg-tertiary)', overflow: 'hidden' }}>
          <model-viewer
            src={profile.avatar_url || 'https://models.readyplayer.me/659e99a8dfc47102adcf03fe.glb'}
            alt="3D Avatar"
            auto-rotate
            camera-controls
            disable-zoom
            style={{ width: '100%', height: '100%', backgroundColor: 'transparent' }}
          ></model-viewer>
        </div>

        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '8px' }}>@{profile.username}</h2>
          <div style={{ display: 'flex', gap: '24px', color: 'var(--text-secondary)', marginBottom: '24px' }}>
            <span><strong style={{ color: 'white' }}>{profile.follower_count}</strong> Followers</span>
            <span><strong style={{ color: 'white' }}>{profile.following_count}</strong> Following</span>
          </div>
          <button onClick={handleSignOut} className="btn-secondary">Sign Out</button>
        </div>
      </div>
    </motion.main>
  );
};

export default Profile;
