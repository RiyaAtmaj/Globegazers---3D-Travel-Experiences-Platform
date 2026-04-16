import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';
import '@google/model-viewer';

const PublicProfile = () => {
  const { id } = useParams<{ id: string }>();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (id) fetchProfileData();
  }, [id]);

  const fetchProfileData = async () => {
    setLoading(true);
    // 1. Get the current logged in user
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUser(user);

    // 2. Fetch the target profile
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();
    
    setProfile(profileData);

    // 3. Check if the current user is already following this profile
    if (user && profileData) {
      const { data: followData } = await supabase
        .from('follows')
        .select('*')
        .eq('follower_id', user.id)
        .eq('following_id', id)
        .single();
      
      setIsFollowing(!!followData);
    }
    
    setLoading(false);
  };

  const toggleFollow = async () => {
    if (!currentUser) return alert('You must be logged in to follow users.');
    if (!profile) return;
    
    setActionLoading(true);
    
    if (isFollowing) {
      // Unfollow
      await supabase
        .from('follows')
        .delete()
        .eq('follower_id', currentUser.id)
        .eq('following_id', profile.id);
        
      setProfile({ ...profile, follower_count: profile.follower_count - 1 });
      setIsFollowing(false);
    } else {
      // Follow
      await supabase
        .from('follows')
        .insert({ follower_id: currentUser.id, following_id: profile.id });
        
      setProfile({ ...profile, follower_count: profile.follower_count + 1 });
      setIsFollowing(true);
    }
    
    setActionLoading(false);
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '60px' }}>Loading profile...</div>;
  if (!profile) return <div style={{ textAlign: 'center', padding: '60px' }}>User not found.</div>;

  const isSelf = currentUser?.id === profile.id;

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
          
          {!isSelf && (
            <button 
              onClick={toggleFollow} 
              disabled={actionLoading}
              className={isFollowing ? 'btn-secondary' : 'btn-primary'}
            >
              {actionLoading ? 'Saving...' : (isFollowing ? 'Unfollow' : 'Follow')}
            </button>
          )}
        </div>
      </div>
    </motion.main>
  );
};

export default PublicProfile;
