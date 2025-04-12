import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ContactProvider } from './context/ContactContext';
import { CampaignProvider } from './context/CampaignContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import ContactLists from './pages/ContactLists';
import Campaigns from './pages/Campaigns';
import Analytics from './pages/Analytics';
import LandingPage from './pages/LandingPage';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  
  useEffect(() => {
    const user = localStorage.getItem('juiceAI_user');
    if (user) {
      setIsAuthenticated(true);
      setShowDashboard(true);
    }
  }, []);
  
  
  return (
    <ContactProvider>
      <CampaignProvider>
        <Router>
          {isAuthenticated && showDashboard ? (
            <Routes>
              <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
              <Route path="/dashboard/contact-lists" element={<Layout><ContactLists /></Layout>} />
              <Route path="/dashboard/campaigns" element={<Layout><Campaigns /></Layout>} />
              <Route path="/dashboard/analytics" element={<Layout><Analytics /></Layout>} />
              <Route path="/dashboard/settings" element={<Layout><div className="p-4">Settings Page</div></Layout>} />
              <Route path="/dashboard/help" element={<Layout><div className="p-4">Help Page</div></Layout>} />
              <Route path="/" element={<Navigate to="/dashboard" />} />
            </Routes>
          ) : (
            <Routes>
              <Route path="*" element={
                <LandingPage 
                  setIsAuthenticated={setIsAuthenticated} 
                  setShowDashboard={setShowDashboard}
                />
              } />
            </Routes>
          )}
        </Router>
      </CampaignProvider>
    </ContactProvider>
  );
}

export default App;
