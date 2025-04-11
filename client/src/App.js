import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
    }
  }, []);
  
  
  return (
    <ContactProvider>
      <CampaignProvider>
        <Router>
          {isAuthenticated && showDashboard ? (
            <Layout>
              <Routes>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/dashboard/contact-lists" element={<ContactLists />} />
                <Route path="/dashboard/campaigns" element={<Campaigns />} />
                <Route path="/dashboard/analytics" element={<Analytics />} />
                <Route path="/dashboard/settings" element={<div className="p-4">Settings Page</div>} />
                <Route path="/dashboard/help" element={<div className="p-4">Help Page</div>} />
                <Route path="/" element={<Navigate to="/dashboard" />} />
              </Routes>
            </Layout>
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
