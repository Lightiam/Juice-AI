import React, { useState } from 'react';
import { useCampaigns } from '../context/CampaignContext';
import { useContacts } from '../context/ContactContext';
import { Plus, Edit, Copy, Trash, Mail, Clock, ChevronRight, Search, Calendar, CheckCircle, AlertCircle } from 'lucide-react';

const Campaigns = () => {
  const { campaigns, createCampaign, updateCampaign, scheduleCampaign } = useCampaigns();
  const { contactLists } = useContacts();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newCampaign, setNewCampaign] = useState({
    name: '',
    subject: '',
    body: '',
    contactListId: ''
  });

  const filteredCampaigns = campaigns.filter(campaign => 
    campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    campaign.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateCampaign = (e) => {
    e.preventDefault();
    if (newCampaign.name && newCampaign.subject && newCampaign.body && newCampaign.contactListId) {
      createCampaign({
        ...newCampaign,
        status: 'draft',
        createdAt: new Date().toISOString()
      });
      setNewCampaign({
        name: '',
        subject: '',
        body: '',
        contactListId: ''
      });
      setIsCreateModalOpen(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'draft':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            Draft
          </span>
        );
      case 'scheduled':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <Clock size={12} className="mr-1" />
            Scheduled
          </span>
        );
      case 'sending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <AlertCircle size={12} className="mr-1" />
            Sending
          </span>
        );
      case 'sent':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle size={12} className="mr-1" />
            Sent
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex justify-between items-center">
          <div className="text-xl font-semibold">Email Campaigns</div>
          <div className="flex space-x-2">
            <button 
              onClick={() => setIsCreateModalOpen(true)}
              className="px-3 py-1 text-sm bg-indigo-600 text-white rounded-md flex items-center space-x-1 hover:bg-indigo-700"
            >
              <Plus size={14} />
              <span>New Campaign</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Search and Campaigns */}
      <div className="flex-1 overflow-auto p-4 bg-gray-50">
        <div className="max-w-4xl mx-auto space-y-4">
          {/* Search Bar */}
          <div className="bg-white rounded-lg p-3 shadow-sm">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={18} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search campaigns..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
          
          {/* Campaigns */}
          {filteredCampaigns.length > 0 ? (
            <div className="space-y-3">
              {filteredCampaigns.map(campaign => (
                <div key={campaign.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <div className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium text-lg">{campaign.name}</h3>
                          {getStatusBadge(campaign.status)}
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          Subject: {campaign.subject}
                        </div>
                        <div className="text-sm text-gray-500 mt-1 flex items-center">
                          <Mail size={14} className="mr-1" />
                          {contactLists.find(list => list.id === campaign.contactListId)?.name || 'Unknown list'}
                          {' • '}
                          {contactLists.find(list => list.id === campaign.contactListId)?.contacts?.length || 0} recipients
                        </div>
                        {campaign.scheduledDate && (
                          <div className="text-sm text-gray-500 mt-1 flex items-center">
                            <Calendar size={14} className="mr-1" />
                            Scheduled for: {new Date(campaign.scheduledDate).toLocaleString()}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <button className="p-1 text-gray-500 hover:text-gray-700">
                          <Edit size={16} />
                        </button>
                        <button className="p-1 text-gray-500 hover:text-gray-700">
                          <Copy size={16} />
                        </button>
                        <button className="p-1 text-gray-500 hover:text-gray-700">
                          <Trash size={16} />
                        </button>
                        <button className="ml-2 p-1 text-indigo-600 hover:text-indigo-800">
                          <ChevronRight size={20} />
                        </button>
                      </div>
                    </div>
                    
                    {/* Campaign metrics if sent */}
                    {campaign.status === 'sent' && campaign.stats && (
                      <div className="mt-3 pt-3 border-t border-gray-200 grid grid-cols-4 gap-4 text-center">
                        <div>
                          <div className="text-sm font-medium">Sent</div>
                          <div className="text-lg font-semibold">{campaign.stats.totalSent}</div>
                        </div>
                        <div>
                          <div className="text-sm font-medium">Opens</div>
                          <div className="text-lg font-semibold">{campaign.stats.opens || 0}</div>
                          <div className="text-xs text-gray-500">
                            {campaign.stats.totalSent ? Math.round((campaign.stats.opens || 0) / campaign.stats.totalSent * 100) : 0}%
                          </div>
                        </div>
                        <div>
                          <div className="text-sm font-medium">Clicks</div>
                          <div className="text-lg font-semibold">{campaign.stats.clicks || 0}</div>
                          <div className="text-xs text-gray-500">
                            {campaign.stats.totalSent ? Math.round((campaign.stats.clicks || 0) / campaign.stats.totalSent * 100) : 0}%
                          </div>
                        </div>
                        <div>
                          <div className="text-sm font-medium">Bounces</div>
                          <div className="text-lg font-semibold">{campaign.stats.bounces || 0}</div>
                          <div className="text-xs text-gray-500">
                            {campaign.stats.totalSent ? Math.round((campaign.stats.bounces || 0) / campaign.stats.totalSent * 100) : 0}%
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              {campaigns.length === 0 ? (
                <div>
                  <div className="mb-2">You don't have any campaigns yet</div>
                  <button 
                    onClick={() => setIsCreateModalOpen(true)}
                    className="text-indigo-600 hover:text-indigo-800"
                  >
                    Create your first campaign
                  </button>
                </div>
              ) : (
                <div>No campaigns match your search</div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Create Campaign Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 shadow-xl overflow-y-auto max-h-screen">
            <h3 className="text-lg font-semibold mb-4">Create New Campaign</h3>
            <form onSubmit={handleCreateCampaign}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Campaign Name
                </label>
                <input
                  type="text"
                  value={newCampaign.name}
                  onChange={(e) => setNewCampaign({...newCampaign, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="April Newsletter"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact List
                </label>
                <select
                  value={newCampaign.contactListId}
                  onChange={(e) => setNewCampaign({...newCampaign, contactListId: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                >
                  <option value="">Select a contact list</option>
                  {contactLists.map(list => (
                    <option key={list.id} value={list.id}>
                      {list.name} ({list.contacts?.length || 0} contacts)
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Subject
                </label>
                <input
                  type="text"
                  value={newCampaign.subject}
                  onChange={(e) => setNewCampaign({...newCampaign, subject: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Your April Newsletter is here!"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Content
                </label>
                <textarea
                  value={newCampaign.body}
                  onChange={(e) => setNewCampaign({...newCampaign, body: e.target.value})}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Write your email content here..."
                  required
                ></textarea>
              </div>
              
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  Create Campaign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Campaigns;
