import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTickets } from '../context/TicketContext';

const TicketForm = ({ onClose, editTicket = null }) => {
  const { user } = useAuth();
  const { createTicket, updateTicket } = useTickets();
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'Medium',
    category: 'General',
    assignedTo: ''
  });

  const isEditing = !!editTicket;
  const canSetAdminFields = user?.role === 'admin' || user?.role === 'agent';

  // Load form data if editing
  useEffect(() => {
    if (editTicket) {
      setFormData({
        title: editTicket.title || '',
        description: editTicket.description || '',
        priority: editTicket.priority || 'Medium',
        category: editTicket.category || 'General',
        assignedTo: editTicket.assigneeId || ''
      });
    }
  }, [editTicket]);

  // Fetch users for assignment dropdown
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/debug/users');
        const data = await response.json();
        setUsers(data.filter(u => u.role === 'agent' || u.role === 'admin'));
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    if (canSetAdminFields) {
      fetchUsers();
    }
  }, [canSetAdminFields]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const ticketData = {
      title: formData.title,
      description: formData.description,
      ...(canSetAdminFields && {
        priority: formData.priority,
        category: formData.category,
        assigneeId: formData.assignedTo ? parseInt(formData.assignedTo) : null
      })
    };

    let result;
    if (isEditing) {
      result = await updateTicket(editTicket.id, ticketData);
    } else {
      result = await createTicket(ticketData);
    }

    if (result.success) {
      alert(isEditing ? 'Ticket updated successfully' : 'Ticket created successfully');
      onClose();
    } else {
      alert(result.message || `Failed to ${isEditing ? 'update' : 'create'} ticket`);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 shadow-lg w-96 max-h-96 overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4">
          {isEditing ? 'Edit Ticket' : 'Create New Ticket'}
        </h3>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Title:</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Description:</label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              className="w-full px-3 py-2 border rounded h-20"
              placeholder="Describe the issue..."
            />
          </div>

          {/* Admin/Agent fields only */}
          {canSetAdminFields && (
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1">Priority:</label>
                <select
                  value={formData.priority}
                  onChange={(e) => handleChange('priority', e.target.value)}
                  className="w-full px-3 py-2 border rounded"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Category:</label>
                <select
                  value={formData.category}
                  onChange={(e) => handleChange('category', e.target.value)}
                  className="w-full px-3 py-2 border rounded"
                >
                  <option value="General">General</option>
                  <option value="Technical">Technical</option>
                  <option value="Billing">Billing</option>
                  <option value="Feature Request">Feature Request</option>
                </select>
              </div>
            </div>
          )}

          {canSetAdminFields && (
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Assign To:</label>
              <select
                value={formData.assignedTo}
                onChange={(e) => handleChange('assignedTo', e.target.value)}
                className="w-full px-3 py-2 border rounded"
              >
                <option value="">Unassigned</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.role})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Customer notice */}
          {!canSetAdminFields && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
              <p className="text-sm text-blue-700">
                📝 <strong>Note:</strong> Priority and assignment will be determined by our support team based on your issue description.
              </p>
            </div>
          )}

          <div className="flex space-x-2">
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
            >
              {isEditing ? 'Save Changes' : 'Create Ticket'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TicketForm;
