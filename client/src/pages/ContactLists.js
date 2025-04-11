import React, { useState, useEffect } from 'react';
import { useContacts } from '../context/ContactContext';
import { Plus, Edit, Trash, User, Download, ChevronDown, ChevronUp, Search } from 'lucide-react';

const ContactLists = () => {
  const { contactLists, contacts, createContactList, addContactsToList } = useContacts();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [listName, setListName] = useState('');
  const [expandedList, setExpandedList] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredLists = contactLists.filter(list => 
    list.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateList = (e) => {
    e.preventDefault();
    if (listName.trim()) {
      createContactList(listName.trim());
      setListName('');
      setIsCreateModalOpen(false);
    }
  };

  const toggleListExpansion = (listId) => {
    if (expandedList === listId) {
      setExpandedList(null);
    } else {
      setExpandedList(listId);
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex justify-between items-center">
          <div className="text-xl font-semibold">Contact Lists</div>
          <div className="flex space-x-2">
            <button 
              onClick={() => setIsCreateModalOpen(true)}
              className="px-3 py-1 text-sm bg-indigo-600 text-white rounded-md flex items-center space-x-1 hover:bg-indigo-700"
            >
              <Plus size={14} />
              <span>New List</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Search and Lists */}
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
                placeholder="Search lists..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
          
          {/* Lists */}
          {filteredLists.length > 0 ? (
            <div className="space-y-3">
              {filteredLists.map(list => (
                <div key={list.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <div 
                    className="p-4 flex justify-between items-center cursor-pointer hover:bg-gray-50"
                    onClick={() => toggleListExpansion(list.id)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
                        <User size={16} />
                      </div>
                      <div>
                        <div className="font-medium">{list.name}</div>
                        <div className="text-sm text-gray-500">
                          {list.contacts ? list.contacts.length : 0} contacts
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="p-1 text-gray-500 hover:text-gray-700">
                        <Edit size={16} />
                      </button>
                      <button className="p-1 text-gray-500 hover:text-gray-700">
                        <Download size={16} />
                      </button>
                      <button className="p-1 text-gray-500 hover:text-gray-700">
                        <Trash size={16} />
                      </button>
                      {expandedList === list.id ? (
                        <ChevronUp size={18} className="text-gray-500" />
                      ) : (
                        <ChevronDown size={18} className="text-gray-500" />
                      )}
                    </div>
                  </div>
                  
                  {/* Expanded view with contacts */}
                  {expandedList === list.id && (
                    <div className="border-t border-gray-200 p-4">
                      {list.contacts && list.contacts.length > 0 ? (
                        <div className="space-y-2">
                          {contacts
                            .filter(contact => list.contacts.includes(contact.id))
                            .map(contact => (
                            <div key={contact.id} className="flex justify-between items-center p-2 bg-gray-50 rounded border border-gray-200">
                              <div>
                                <div className="font-medium">{contact.value}</div>
                                <div className="text-xs text-gray-500">
                                  {contact.type} • {contact.source || 'Manual entry'}
                                </div>
                              </div>
                              <button className="text-xs text-red-600 hover:text-red-800">
                                Remove
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center text-gray-500 py-4">
                          No contacts in this list yet
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              {contactLists.length === 0 ? (
                <div>
                  <div className="mb-2">You don't have any contact lists yet</div>
                  <button 
                    onClick={() => setIsCreateModalOpen(true)}
                    className="text-indigo-600 hover:text-indigo-800"
                  >
                    Create your first list
                  </button>
                </div>
              ) : (
                <div>No lists match your search</div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Create List Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
            <h3 className="text-lg font-semibold mb-4">Create New Contact List</h3>
            <form onSubmit={handleCreateList}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  List Name
                </label>
                <input
                  type="text"
                  value={listName}
                  onChange={(e) => setListName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="My Contact List"
                  required
                />
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
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactLists;
