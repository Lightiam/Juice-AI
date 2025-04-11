import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Home, Users, Mail, BarChart2, Settings, HelpCircle } from 'lucide-react';

const Layout = () => {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-md">
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-bold text-indigo-600">Juice AI</h1>
          <p className="text-sm text-gray-500">Contact Extractor</p>
        </div>
        <nav className="mt-4">
          <NavLink 
            to="#/dashboard" 
            className={({ isActive }) => 
              `flex items-center px-4 py-3 text-gray-700 ${isActive ? 'bg-indigo-50 text-indigo-600 border-r-4 border-indigo-600' : 'hover:bg-gray-50'}`
            }
            end
          >
            <Home size={18} className="mr-3" />
            <span>Dashboard</span>
          </NavLink>
          <NavLink 
            to="#/dashboard/contact-lists" 
            className={({ isActive }) => 
              `flex items-center px-4 py-3 text-gray-700 ${isActive ? 'bg-indigo-50 text-indigo-600 border-r-4 border-indigo-600' : 'hover:bg-gray-50'}`
            }
          >
            <Users size={18} className="mr-3" />
            <span>Contact Lists</span>
          </NavLink>
          <NavLink 
            to="#/dashboard/campaigns" 
            className={({ isActive }) => 
              `flex items-center px-4 py-3 text-gray-700 ${isActive ? 'bg-indigo-50 text-indigo-600 border-r-4 border-indigo-600' : 'hover:bg-gray-50'}`
            }
          >
            <Mail size={18} className="mr-3" />
            <span>Campaigns</span>
          </NavLink>
          <NavLink 
            to="#/dashboard/analytics" 
            className={({ isActive }) => 
              `flex items-center px-4 py-3 text-gray-700 ${isActive ? 'bg-indigo-50 text-indigo-600 border-r-4 border-indigo-600' : 'hover:bg-gray-50'}`
            }
          >
            <BarChart2 size={18} className="mr-3" />
            <span>Analytics</span>
          </NavLink>
          <div className="border-t border-gray-200 mt-4 pt-4">
            <NavLink 
              to="#/dashboard/settings" 
              className={({ isActive }) => 
                `flex items-center px-4 py-3 text-gray-700 ${isActive ? 'bg-indigo-50 text-indigo-600 border-r-4 border-indigo-600' : 'hover:bg-gray-50'}`
              }
            >
              <Settings size={18} className="mr-3" />
              <span>Settings</span>
            </NavLink>
            <NavLink 
              to="#/dashboard/help" 
              className={({ isActive }) => 
                `flex items-center px-4 py-3 text-gray-700 ${isActive ? 'bg-indigo-50 text-indigo-600 border-r-4 border-indigo-600' : 'hover:bg-gray-50'}`
              }
            >
              <HelpCircle size={18} className="mr-3" />
              <span>Help</span>
            </NavLink>
          </div>
        </nav>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;
