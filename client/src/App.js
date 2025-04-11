import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ContactProvider } from './context/ContactContext';
import { CampaignProvider } from './context/CampaignContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import ContactLists from './pages/ContactLists';
import Campaigns from './pages/Campaigns';
import Analytics from './pages/Analytics';

function App() {
  return (
    <ContactProvider>
      <CampaignProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Layout />}>
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
