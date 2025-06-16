import React, { createContext, useContext, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';

const TicketContext = createContext();

export const useTickets = () => {
  const context = useContext(TicketContext);
  if (!context) {
    throw new Error('useTickets must be used within a TicketProvider');
  }
  return context;
};

export const TicketProvider = ({ children }) => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch tickets with role-based filtering
  const fetchTickets = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/tickets?userId=${user.id}&userRole=${user.role}`);
      const data = await response.json();
      setTickets(data);
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Create a new ticket
  const createTicket = async (ticketData) => {
    try {
      const response = await fetch('http://localhost:5000/api/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...ticketData,
          customerId: user.id,
          userRole: user.role
        }),
      });

      if (response.ok) {
        const newTicket = await response.json();
        setTickets(prev => [newTicket, ...prev]);
        return { success: true, ticket: newTicket };
      } else {
        const error = await response.json();
        return { success: false, message: error.message };
      }
    } catch (error) {
      console.error('Error creating ticket:', error);
      return { success: false, message: 'Network error. Please try again.' };
    }
  };

  // Update ticket status
  const updateTicketStatus = async (ticketId, newStatus) => {
    try {
      const response = await fetch(`http://localhost:5000/api/tickets/${ticketId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          status: newStatus,
          userId: user.id 
        }),
      });

      if (response.ok) {
        const updatedTicket = await response.json();
        setTickets(prev => prev.map(ticket => 
          ticket.id === ticketId ? updatedTicket : ticket
        ));
        return { success: true };
      } else {
        return { success: false, message: 'Failed to update ticket status' };
      }
    } catch (error) {
      console.error('Error updating ticket:', error);
      return { success: false, message: 'Network error. Please try again.' };
    }
  };

  // Update ticket details
  const updateTicket = async (ticketId, updates) => {
    try {
      const response = await fetch(`http://localhost:5000/api/tickets/${ticketId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...updates,
          userId: user.id
        }),
      });

      if (response.ok) {
        const updatedTicket = await response.json();
        setTickets(prev => prev.map(ticket => 
          ticket.id === ticketId ? updatedTicket : ticket
        ));
        return { success: true, ticket: updatedTicket };
      } else {
        return { success: false, message: 'Failed to update ticket' };
      }
    } catch (error) {
      console.error('Error updating ticket:', error);
      return { success: false, message: 'Network error. Please try again.' };
    }
  };

  // Delete ticket (admin only)
  const deleteTicket = async (ticketId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/tickets/${ticketId}?userId=${user.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setTickets(prev => prev.filter(ticket => ticket.id !== ticketId));
        return { success: true };
      } else {
        return { success: false, message: 'Failed to delete ticket' };
      }
    } catch (error) {
      console.error('Error deleting ticket:', error);
      return { success: false, message: 'Network error. Please try again.' };
    }
  };

  const value = {
    tickets,
    loading,
    fetchTickets,
    createTicket,
    updateTicketStatus,
    updateTicket,
    deleteTicket,
  };

  return (
    <TicketContext.Provider value={value}>
      {children}
    </TicketContext.Provider>
  );
};
