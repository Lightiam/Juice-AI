import React from 'react';
import { useCampaigns } from '../context/CampaignContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const Analytics = () => {
  const { campaigns } = useCampaigns();
  
  const sentCampaigns = campaigns.filter(campaign => campaign.status === 'sent' && campaign.stats);
  
  const campaignPerformanceData = sentCampaigns.map(campaign => ({
    name: campaign.name,
    opens: campaign.stats.opens || 0,
    clicks: campaign.stats.clicks || 0,
    bounces: campaign.stats.bounces || 0
  }));
  
  const totalSent = sentCampaigns.reduce((sum, campaign) => sum + (campaign.stats.totalSent || 0), 0);
  const totalOpens = sentCampaigns.reduce((sum, campaign) => sum + (campaign.stats.opens || 0), 0);
  const totalClicks = sentCampaigns.reduce((sum, campaign) => sum + (campaign.stats.clicks || 0), 0);
  const totalBounces = sentCampaigns.reduce((sum, campaign) => sum + (campaign.stats.bounces || 0), 0);
  
  const deliverabilityData = [
    { name: 'Delivered', value: totalSent - totalBounces },
    { name: 'Bounced', value: totalBounces }
  ];
  
  const engagementData = [
    { name: 'Opened', value: totalOpens },
    { name: 'Clicked', value: totalClicks },
    { name: 'No Engagement', value: totalSent - totalOpens - totalBounces }
  ];
  
  const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444'];
  
  return (
    <div className="flex-1 flex flex-col">
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex justify-between items-center">
          <div className="text-xl font-semibold">Analytics &amp; Insights</div>
        </div>
      </div>
      
      {/* Analytics Content */}
      <div className="flex-1 overflow-auto p-4 bg-gray-50">
        <div className="max-w-6xl mx-auto space-y-6">
          {sentCampaigns.length > 0 ? (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="text-sm font-medium text-gray-500">Total Sent</div>
                  <div className="text-2xl font-bold">{totalSent}</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="text-sm font-medium text-gray-500">Open Rate</div>
                  <div className="text-2xl font-bold">
                    {totalSent ? Math.round((totalOpens / totalSent) * 100) : 0}%
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="text-sm font-medium text-gray-500">Click Rate</div>
                  <div className="text-2xl font-bold">
                    {totalSent ? Math.round((totalClicks / totalSent) * 100) : 0}%
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="text-sm font-medium text-gray-500">Bounce Rate</div>
                  <div className="text-2xl font-bold">
                    {totalSent ? Math.round((totalBounces / totalSent) * 100) : 0}%
                  </div>
                </div>
              </div>
              
              {/* Campaign Performance Chart */}
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <h3 className="text-lg font-medium mb-4">Campaign Performance</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={campaignPerformanceData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="opens" fill="#4f46e5" name="Opens" />
                      <Bar dataKey="clicks" fill="#10b981" name="Clicks" />
                      <Bar dataKey="bounces" fill="#ef4444" name="Bounces" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              {/* Pie Charts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <h3 className="text-lg font-medium mb-4">Deliverability</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={deliverabilityData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {deliverabilityData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <h3 className="text-lg font-medium mb-4">Engagement</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={engagementData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {engagementData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center text-gray-500 py-8">
              <div className="mb-2">No campaign data available yet</div>
              <p>Send your first campaign to see analytics</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analytics;
