import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useTickets } from '../context/TicketContext';

const TicketCard = ({ ticket, onEdit }) => {
  const { user } = useAuth();
  const { updateTicketStatus, deleteTicket } = useTickets();

  const handleStatusChange = async (newStatus) => {
    const result = await updateTicketStatus(ticket.id, newStatus);
    if (!result.success) {
      alert(result.message || 'Failed to update ticket status');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this ticket? This action cannot be undone.')) {
      return;
    }

    const result = await deleteTicket(ticket.id);
    if (result.success) {
      alert('Ticket deleted successfully');
    } else {
      alert(result.message || 'Failed to delete ticket');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Open': return 'bg-blue-100 text-blue-800';
      case 'In Progress': return 'bg-yellow-100 text-yellow-800';
      case 'Resolved': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Critical': return 'bg-red-100 text-red-800';
      case 'High': return 'bg-orange-100 text-orange-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const canEditTickets = user?.role === 'admin' || user?.role === 'agent';
  const canDeleteTickets = user?.role === 'admin';

  return (
    <div className="bg-white rounded-lg p-6 shadow-md mb-4">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-medium text-lg">{ticket.title}</h3>
      </div>
      
      {ticket.description && (
        <p className="text-gray-700 mb-2">{ticket.description}</p>
      )}
      
      <div className="text-sm text-gray-500 flex justify-between items-center">
        <div className="flex space-x-4">
          {ticket.category && <span>Category: {ticket.category}</span>}
          {ticket.assignee && <span>Assigned: {ticket.assignee.name}</span>}
          {ticket.customer && <span>Customer: {ticket.customer.name}</span>}
          <span>Created: {new Date(ticket.createdAt).toLocaleDateString()}</span>
        </div>
        
        <div className="flex space-x-2">
          {/* Status - Dropdown for Admin/Agent, Badge for Customer */}
          {canEditTickets ? (
            <select
              value={ticket.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="text-xs px-2 py-1 border rounded"
            >
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>
          ) : (
            <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(ticket.status)}`}>
              {ticket.status}
            </span>
          )}
          
          {/* Priority Badge */}
          <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
            {ticket.priority}
          </span>

          {/* Action Buttons */}
          {canEditTickets && (
            <>
              <button
                onClick={() => onEdit(ticket)}
                className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors mr-1"
                title="Edit ticket"
              >
                Edit
              </button>
              {canDeleteTickets && (
                <button
                  onClick={handleDelete}
                  className="text-xs px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                  title="Delete ticket (Admin only)"
                >
                  Delete
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TicketCard;
