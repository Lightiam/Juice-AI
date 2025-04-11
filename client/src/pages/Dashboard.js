import React, { useState, useRef, useEffect } from 'react';
import { Edit2, Download } from 'lucide-react';
import { useContacts } from '../context/ContactContext';
import axios from 'axios';

const Dashboard = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { type: 'system', content: 'Welcome to Juice AI! You can paste text, upload files, or enter URLs to extract contact information.' },
  ]);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const { addContacts } = useContacts();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const extractContacts = async (source, type = 'text') => {
    try {
      setIsProcessing(true);
      
      const response = await axios.post('/api/extract', { source, type });
      const extractedContacts = response.data;
      
      const savedContacts = await addContacts(extractedContacts);
      
      setMessages(prevMessages => {
        const filteredMessages = prevMessages.filter(msg => !msg.processing);
        
        return [
          ...filteredMessages,
          { 
            type: 'assistant', 
            content: `I found ${savedContacts.length} contact(s) in your input.`,
            contacts: savedContacts
          }
        ];
      });
      
      return savedContacts;
    } catch (error) {
      console.error('Extraction error:', error);
      
      setMessages(prevMessages => {
        const filteredMessages = prevMessages.filter(msg => !msg.processing);
        
        return [
          ...filteredMessages,
          { 
            type: 'assistant', 
            content: `Error: ${error.response?.data?.message || error.message}. Please try again or modify your input.`
          }
        ];
      });
      
      return [];
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;
    
    const newUserMessage = { type: 'user', content: input };
    const processingMessage = { type: 'assistant', content: 'Processing your request...', processing: true };
    
    setMessages([...messages, newUserMessage, processingMessage]);
    setInput('');
    
    const isUrl = input.match(/^(http|https):\/\/[a-zA-Z0-9-_.]+\.[a-zA-Z]{2,}(\/[a-zA-Z0-9-_./?=&]*)?$/);
    extractContacts(input, isUrl ? 'url' : 'text');
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || isProcessing) return;
    
    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target.result;
      const newUserMessage = { type: 'user', content: `Uploaded file: ${file.name}` };
      const processingMessage = { type: 'assistant', content: 'Processing your file...', processing: true };
      
      setMessages([...messages, newUserMessage, processingMessage]);
      extractContacts(content, 'file');
    };
    
    reader.readAsText(file);
  };

  return (
    <>
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex justify-between items-center">
          <div className="text-xl font-semibold">Extract Contacts</div>
          <div className="flex space-x-2">
            <button className="px-3 py-1 text-sm border border-gray-300 rounded-md flex items-center space-x-1 hover:bg-gray-50">
              <Edit2 size={14} />
              <span>New Campaign</span>
            </button>
            <button className="px-3 py-1 text-sm border border-gray-300 rounded-md flex items-center space-x-1 hover:bg-gray-50">
              <Download size={14} />
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Chat Area */}
      <div className="flex-1 overflow-auto p-4 bg-gray-50">
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.map((message, index) => (
            <div key={index} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xl rounded-lg p-3 ${
                message.type === 'user' 
                  ? 'bg-indigo-600 text-white' 
                  : message.type === 'system'
                    ? 'bg-gray-200 text-gray-800'
                    : 'bg-white border border-gray-200 shadow-sm'
              }`}>
                {message.content}
                
                {message.contacts && message.contacts.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="text-sm font-semibold mb-2">Extracted Contacts ({message.contacts.length})</div>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {message.contacts.slice(0, 5).map((contact, i) => (
                        <div key={i} className="bg-gray-50 p-2 rounded border border-gray-200 flex justify-between items-center">
                          <div>
                            <div className="font-medium">{contact.value}</div>
                            <div className="text-xs text-gray-500 flex items-center">
                              {contact.source && (
                                <>
                                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                  </svg>
                                  {contact.source}
                                </>
                              )}
                            </div>
                          </div>
                          <div className="text-xs text-indigo-600 cursor-pointer">+ Add to list</div>
                        </div>
                      ))}
                      {message.contacts.length > 5 && (
                        <div className="text-center text-sm text-indigo-600 py-1 cursor-pointer">
                          View all contacts
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {message.processing && (
                  <div className="mt-2 flex items-center">
                    <div className="animate-pulse flex space-x-1">
                      <div className="h-2 w-2 bg-gray-400 rounded-full"></div>
                      <div className="h-2 w-2 bg-gray-400 rounded-full"></div>
                      <div className="h-2 w-2 bg-gray-400 rounded-full"></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSubmit} className="flex items-end space-x-2">
            <div className="flex-1">
              <div className="text-sm font-medium mb-1">Enter URL, paste text, or upload file</div>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="https://example.com or paste text here"
                disabled={isProcessing}
              />
            </div>
            <label className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 cursor-pointer">
              Upload
              <input
                type="file"
                accept=".txt,.pdf,.doc,.docx,.csv,.xls,.xlsx"
                className="hidden"
                onChange={handleFileUpload}
                disabled={isProcessing}
              />
            </label>
            <button
              type="submit"
              className={`px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                isProcessing || !input.trim() ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              disabled={isProcessing || !input.trim()}
            >
              Extract
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
