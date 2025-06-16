import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTickets } from '../context/TicketContext';
import Navigation from '../components/Navigation';

function Dashboard({ currentPage, onNavigate }) {
  const { user } = useAuth();
  const { tickets, loading: ticketsLoading, fetchTickets } = useTickets();
  const [stats, setStats] = useState({
    totalTickets: 0,
    openTickets: 0,
    inProgressTickets: 0,
    resolvedTickets: 0
  });
  const [recentTickets, setRecentTickets] = useState([]);
  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  useEffect(() => {
    if (tickets.length >= 0) {
      // Calculate statistics
      const newStats = {
        totalTickets: tickets.length,
        openTickets: tickets.filter(t => t.status === 'Open').length,
        inProgressTickets: tickets.filter(t => t.status === 'In Progress').length,
        resolvedTickets: tickets.filter(t => t.status === 'Resolved').length
      };

      // Get recent tickets (last 5)
      const recent = tickets.slice(0, 5);

      setStats(newStats);
      setRecentTickets(recent);
    }
  }, [tickets]);
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <Navigation currentPage={currentPage} onNavigate={onNavigate} />

        <h1 className="text-3xl font-bold text-purple-600 mb-6">
          {JSON.parse(localStorage.getItem('user') || '{}').role === 'customer'
            ? 'My Support Tickets'
            : 'Support Dashboard'
          }
        </h1>

        {ticketsLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading dashboard...</p>
          </div>
        ) : (
          <>
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg p-6 shadow-md border-l-4 border-blue-500">
                <h3 className="text-lg font-semibold text-gray-700">
                  {JSON.parse(localStorage.getItem('user') || '{}').role === 'customer'
                    ? 'My Total Tickets'
                    : 'Total Tickets'
                  }
                </h3>
                <p className="text-3xl font-bold text-blue-600">{stats.totalTickets}</p>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-md border-l-4 border-yellow-500">
                <h3 className="text-lg font-semibold text-gray-700">
                  {JSON.parse(localStorage.getItem('user') || '{}').role === 'customer'
                    ? 'My Open Tickets'
                    : 'Open Tickets'
                  }
                </h3>
                <p className="text-3xl font-bold text-yellow-600">{stats.openTickets}</p>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-md border-l-4 border-purple-500">
                <h3 className="text-lg font-semibold text-gray-700">
                  {JSON.parse(localStorage.getItem('user') || '{}').role === 'customer'
                    ? 'My In Progress'
                    : 'In Progress'
                  }
                </h3>
                <p className="text-3xl font-bold text-purple-600">{stats.inProgressTickets}</p>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-md border-l-4 border-green-500">
                <h3 className="text-lg font-semibold text-gray-700">
                  {JSON.parse(localStorage.getItem('user') || '{}').role === 'customer'
                    ? 'My Resolved'
                    : 'Resolved'
                  }
                </h3>
                <p className="text-3xl font-bold text-green-600">{stats.resolvedTickets}</p>
              </div>
            </div>

            {/* Recent Tickets */}
            <div className="bg-white rounded-lg p-6 shadow-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">
                  {JSON.parse(localStorage.getItem('user') || '{}').role === 'customer'
                    ? 'My Recent Tickets'
                    : 'Recent Tickets'
                  }
                </h2>
                <button
                  onClick={() => onNavigate('tickets')}
                  className="text-purple-600 hover:text-purple-800 font-medium"
                >
                  View All →
                </button>
              </div>

              {recentTickets.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-400 mb-4">
                    <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {JSON.parse(localStorage.getItem('user') || '{}').role === 'customer'
                      ? 'No tickets yet'
                      : 'No tickets in the system'
                    }
                  </h3>
                  <p className="text-gray-600">
                    {JSON.parse(localStorage.getItem('user') || '{}').role === 'customer'
                      ? 'Create your first support ticket to get help with any issues.'
                      : 'Tickets will appear here as customers create them.'
                    }
                  </p>
                  {JSON.parse(localStorage.getItem('user') || '{}').role === 'customer' && (
                    <button
                      onClick={() => onNavigate('tickets')}
                      className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                    >
                      Create Your First Ticket
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {recentTickets.map(ticket => (
                    <div key={ticket.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <div>
                        <h4 className="font-medium">{ticket.title}</h4>
                        <p className="text-sm text-gray-600">
                          {JSON.parse(localStorage.getItem('user') || '{}').role === 'customer'
                            ? `Created ${new Date(ticket.createdAt).toLocaleDateString()}`
                            : `by ${ticket.customer?.name || 'Unknown'} • ${new Date(ticket.createdAt).toLocaleDateString()}`
                          }
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          ticket.status === 'Open' ? 'bg-blue-100 text-blue-800' :
                          ticket.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {ticket.status}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          ticket.priority === 'Critical' ? 'bg-red-100 text-red-800' :
                          ticket.priority === 'High' ? 'bg-orange-100 text-orange-800' :
                          ticket.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {ticket.priority}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
