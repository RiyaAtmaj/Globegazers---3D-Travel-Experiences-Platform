import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Compass, User, LogIn } from 'lucide-react';
import { supabase } from '../lib/supabase';

const Navbar = () => {
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <nav style={{ padding: '20px 0', borderBottom: '1px solid var(--glass-border)' }}>
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', fontSize: '1.25rem' }}>
          <Compass size={28} color="var(--accent-primary)" />
          <span className="text-gradient">Globegazers</span>
        </Link>
        
        <div style={{ display: 'flex', gap: '16px' }}>
          {session ? (
            <>
              <Link to="/share" className="btn-secondary" style={{ padding: '8px 16px' }}>
                Share Experience
              </Link>
              <Link to="/profile" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px' }}>
                <User size={18} /> Profile
              </Link>
            </>
          ) : (
            <Link to="/auth" className="btn-primary" style={{ padding: '8px 20px' }}>
              <LogIn size={18} /> Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
