import React from 'react';
import { useAuth } from '../context/AuthContext';

const Navigation = ({ currentPage, onNavigate }) => {
  const { user, logout } = useAuth();

  return (
    <nav className="mb-6 flex justify-between items-center">
      <div className="flex space-x-2">
        <button
          onClick={() => onNavigate('dashboard')}
          className={`px-4 py-2 rounded ${
            currentPage === 'dashboard' 
              ? 'bg-purple-600 text-white' 
              : 'bg-purple-100 text-purple-600 hover:bg-purple-200'
          }`}
        >
          Dashboard
        </button>
        <button
          onClick={() => onNavigate('tickets')}
          className={`px-4 py-2 rounded ${
            currentPage === 'tickets' 
              ? 'bg-blue-600 text-white' 
              : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
          }`}
        >
          Tickets
        </button>
        {/* Audit Logs - Admin only */}
        {user?.role === 'admin' && (
          <button
            onClick={() => onNavigate('audit-logs')}
            className={`px-4 py-2 rounded ${
              currentPage === 'audit-logs' 
                ? 'bg-gray-600 text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Audit Logs
          </button>
        )}
      </div>
      
      <div className="flex items-center space-x-4">
        {/* User Info */}
        <div className="text-sm text-gray-600">
          Logged in as: <span className="font-medium text-purple-600">
            {user?.name} ({user?.role})
          </span>
        </div>
        <button
          onClick={logout}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navigation;
