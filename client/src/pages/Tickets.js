import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTickets } from '../context/TicketContext';
import Navigation from '../components/Navigation';
import TicketCard from '../components/TicketCard';
import TicketForm from '../components/TicketForm';

function Tickets({ currentPage, onNavigate }) {
  const { user } = useAuth();
  const { tickets, loading, fetchTickets } = useTickets();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTicket, setEditingTicket] = useState(null);

  // Fetch tickets on component mount
  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <Navigation currentPage={currentPage} onNavigate={onNavigate} />

        <h1 className="text-3xl font-bold text-purple-600 mb-6">
          Support Tickets
        </h1>

        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-green-600 text-white px-4 py-2 rounded mb-4 hover:bg-green-700 transition-colors"
        >
          + Create New Ticket
        </button>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading tickets...</p>
          </div>
        ) : tickets.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tickets yet</h3>
            <p className="text-gray-600 mb-4">Create your first support ticket to get started.</p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
            >
              Create Your First Ticket
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {tickets.map(ticket => (
              <TicketCard
                key={ticket.id}
                ticket={ticket}
                onEdit={setEditingTicket}
              />
            ))}
          </div>
        )}

        {/* Create/Edit Ticket Form */}
        {(showCreateForm || editingTicket) && (
          <TicketForm
            editTicket={editingTicket}
            onClose={() => {
              setShowCreateForm(false);
              setEditingTicket(null);
            }}
          />
        )}
      </div>
    </div>
  );
}

export default Tickets;
