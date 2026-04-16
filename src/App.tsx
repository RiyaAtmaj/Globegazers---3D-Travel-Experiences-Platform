import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Home from './pages/Home';
import Navbar from './components/Navbar';

import Auth from './pages/Auth';
import Profile from './pages/Profile';
import Share from './pages/Share';
import PublicProfile from './pages/PublicProfile';

function App() {
  return (
    <Router>
      <div className="page-wrapper">
        <Navbar />
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/user/:id" element={<PublicProfile />} />
            <Route path="/share" element={<Share />} />
          </Routes>
        </AnimatePresence>
      </div>
    </Router>
  );
}

export default App;
