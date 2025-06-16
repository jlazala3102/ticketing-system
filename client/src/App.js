import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { TicketProvider } from './context/TicketContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Tickets from './pages/Tickets';
import AuditLogs from './pages/AuditLogs';

function AppContent() {
  const { isLoggedIn, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <Login />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'tickets':
        return <Tickets currentPage={currentPage} onNavigate={setCurrentPage} />;
      case 'audit-logs':
        return <AuditLogs currentPage={currentPage} onNavigate={setCurrentPage} />;
      default:
        return <Dashboard currentPage={currentPage} onNavigate={setCurrentPage} />;
    }
  };

  return (
    <TicketProvider>
      {renderPage()}
    </TicketProvider>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
