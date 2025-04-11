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
  
  useEffect(() => {
    const user = localStorage.getItem('juiceAI_user');
    if (user) {
      setIsAuthenticated(true);
    }
  }, []);
  
  const ProtectedRoute = ({ children }) => {
    if (!isAuthenticated) {
      return <Navigate to="/" replace />;
    }
    return children;
  };

  return (
    <ContactProvider>
      <CampaignProvider>
        <Router>
          <Routes>
            {/* Public landing page route */}
            <Route path="/" element={<LandingPage setIsAuthenticated={setIsAuthenticated} />} />
            
            {/* Protected app routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }>
              <Route index element={<Dashboard />} />
              <Route path="contact-lists" element={<ContactLists />} />
              <Route path="campaigns" element={<Campaigns />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="settings" element={<div className="p-4">Settings Page</div>} />
              <Route path="help" element={<div className="p-4">Help Page</div>} />
            </Route>
          </Routes>
        </Router>
      </CampaignProvider>
    </ContactProvider>
  );
}

export default App;
