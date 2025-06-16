const express = require('express');
const { Sequelize } = require('sequelize');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// PostgreSQL connection
const sequelize = new Sequelize('ticketing_system', 'postgres', 'M@rio3569981', {
  host: 'localhost',
  dialect: 'postgresql',
  port: 5432,
  logging: false
});

// Database Models
const { DataTypes } = require('sequelize');

// User Model
const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM('admin', 'agent', 'customer'),
    defaultValue: 'customer'
  }
});

// Ticket Model
const Ticket = sequelize.define('Ticket', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  status: {
    type: DataTypes.ENUM('Open', 'In Progress', 'Resolved'),
    defaultValue: 'Open'
  },
  priority: {
    type: DataTypes.ENUM('Low', 'Medium', 'High', 'Critical'),
    defaultValue: 'Medium'
  },
  category: {
    type: DataTypes.STRING,
    defaultValue: 'General'
  }
});

// Audit Log Model
const AuditLog = sequelize.define('AuditLog', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  action: {
    type: DataTypes.STRING,
    allowNull: false
  },
  entityType: {
    type: DataTypes.STRING,
    allowNull: false
  },
  entityId: {
    type: DataTypes.INTEGER
  },
  oldValues: {
    type: DataTypes.JSON
  },
  newValues: {
    type: DataTypes.JSON
  },
  description: {
    type: DataTypes.STRING
  }
});

// Relationships
User.hasMany(Ticket, { foreignKey: 'customerId', as: 'customerTickets' });
User.hasMany(Ticket, { foreignKey: 'assigneeId', as: 'assignedTickets' });
Ticket.belongsTo(User, { foreignKey: 'customerId', as: 'customer' });
Ticket.belongsTo(User, { foreignKey: 'assigneeId', as: 'assignee' });

User.hasMany(AuditLog, { foreignKey: 'userId' });
AuditLog.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Audit logging helper function
const logAudit = async (userId, action, entityType, entityId, oldValues = null, newValues = null, description = null) => {
  try {
    await AuditLog.create({
      userId,
      action,
      entityType,
      entityId,
      oldValues,
      newValues,
      description
    });
  } catch (error) {
    console.error('Audit logging failed:', error);
  }
};

// Test connection and create tables
sequelize.authenticate()
  .then(() => {
    console.log('PostgreSQL connected!');
    return sequelize.sync({ force: false });
  })
  .then(() => console.log('Database tables created!'))
  .catch(err => console.error('Database error:', err));

// API Routes

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'Ticketing System API is running!' });
});

// Create test user route (for development)
app.get('/api/create-test-user', async (req, res) => {
  try {
    const testUser = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      role: 'admin'
    });
    res.json({ message: 'Test user created!', user: testUser });
  } catch (error) {
    res.status(500).json({ message: 'Error creating test user', error: error.message });
  }
});

// Create complete test user set (for development)
app.get('/api/create-test-users', async (req, res) => {
  try {
    const users = await User.bulkCreate([
      // Test Agent
      {
        name: 'Sarah Johnson',
        email: 'agent@test.com',
        password: 'password123',
        role: 'agent'
      },
      // Test Customer
      {
        name: 'John Customer',
        email: 'customer@test.com',
        password: 'password123',
        role: 'customer'
      },
      // Additional Agent
      {
        name: 'Mike Chen',
        email: 'mike@company.com',
        password: 'password123',
        role: 'agent'
      },
      // Additional Admin
      {
        name: 'Lisa Rodriguez',
        email: 'lisa@company.com',
        password: 'password123',
        role: 'admin'
      }
    ], { ignoreDuplicates: true }); // Won't create duplicates if they already exist

    res.json({
      message: 'Test users created!',
      users: users.map(u => ({
        name: u.name,
        email: u.email,
        role: u.role
      })),
      loginCredentials: [
        { role: 'Admin', email: 'test@example.com', password: 'password123' },
        { role: 'Agent', email: 'agent@test.com', password: 'password123' },
        { role: 'Customer', email: 'customer@test.com', password: 'password123' }
      ]
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating test users', error: error.message });
  }
});

// Debug route - see all users
app.get('/api/debug/users', async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'name', 'email', 'role', 'password'] // Include password for debugging
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, role = 'customer' } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    const user = await User.create({ name, email, password, role });
    res.status(201).json({
      message: 'User created successfully',
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user || user.password !== password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    res.json({
      message: 'Login successful',
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Ticket Routes
app.get('/api/tickets', async (req, res) => {
  try {
    const { userId, userRole } = req.query; // Pass user info from frontend

    let whereClause = {};

    // Role-based access control
    if (userRole === 'customer') {
      // Customers can only see their own tickets
      whereClause.customerId = userId;
    }
    // Admins and agents can see all tickets (no additional filter)

    const tickets = await Ticket.findAll({
      where: whereClause,
      include: [
        { model: User, as: 'customer', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'assignee', attributes: ['id', 'name', 'email'] }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.post('/api/tickets', async (req, res) => {
  try {
    const { title, description, priority, category, customerId, assigneeId, userRole } = req.body;

    // Set defaults for customer-created tickets
    let ticketData = {
      title,
      description,
      customerId
    };

    if (userRole === 'customer') {
      // Customers can't set these - use defaults
      ticketData.priority = 'Medium';
      ticketData.category = 'General';
      ticketData.assigneeId = null; // Unassigned
    } else {
      // Admins/agents can set these values
      ticketData.priority = priority || 'Medium';
      ticketData.category = category || 'General';
      ticketData.assigneeId = assigneeId || null;
    }

    const ticket = await Ticket.create(ticketData);

    // Log detailed audit
    await logAudit(customerId, 'CREATE', 'Ticket', ticket.id, null, {
      title, description, priority, category, assigneeId
    }, `Ticket #${ticket.id}: "${title}" created with priority ${priority}`);

    // Get the ticket with user info
    const ticketWithUser = await Ticket.findByPk(ticket.id, {
      include: [
        { model: User, as: 'customer', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'assignee', attributes: ['id', 'name', 'email'] }
      ]
    });

    res.status(201).json(ticketWithUser);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.put('/api/tickets/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, ...updates } = req.body; // Extract userId from updates

    // Get old values for audit
    const oldTicket = await Ticket.findByPk(id);
    if (!oldTicket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    // Check what specifically changed for detailed logging
    const changes = {};
    const changedFields = [];

    Object.keys(updates).forEach(key => {
      const oldValue = oldTicket[key];
      const newValue = updates[key];

      // Handle different data types properly
      let hasChanged = false;

      if (key === 'assigneeId') {
        // Convert both to numbers for comparison, handle null/undefined
        const oldId = oldValue ? parseInt(oldValue) : null;
        const newId = newValue ? parseInt(newValue) : null;
        hasChanged = oldId !== newId;
      } else {
        // For other fields, do direct comparison
        hasChanged = oldValue !== newValue;
      }

      if (hasChanged) {
        changes[key] = { from: oldValue, to: newValue };
        changedFields.push(key);
      }
    });

    await Ticket.update(updates, { where: { id } });

    // Log detailed audit for each change
    if (changedFields.length > 0) {
      for (const field of changedFields) {
        let description = '';
        if (field === 'status') {
          description = `Status changed from "${changes[field].from}" to "${changes[field].to}"`;
        } else if (field === 'assigneeId') {
          const oldAssignee = changes[field].from ? await User.findByPk(changes[field].from) : null;
          const newAssignee = changes[field].to ? await User.findByPk(changes[field].to) : null;
          description = `Assignment changed from "${oldAssignee?.name || 'Unassigned'}" to "${newAssignee?.name || 'Unassigned'}"`;
        } else if (field === 'priority') {
          description = `Priority changed from "${changes[field].from}" to "${changes[field].to}"`;
        } else if (field === 'title') {
          description = `Title changed from "${changes[field].from}" to "${changes[field].to}"`;
        } else {
          description = `${field} updated`;
        }

        await logAudit(userId || oldTicket.customerId, 'UPDATE', 'Ticket', id,
          { [field]: changes[field].from },
          { [field]: changes[field].to },
          `Ticket #${id}: ${description}`);
      }
    }

    const updatedTicket = await Ticket.findByPk(id, {
      include: [
        { model: User, as: 'customer', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'assignee', attributes: ['id', 'name', 'email'] }
      ]
    });

    res.json(updatedTicket);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete ticket (admin only)
app.delete('/api/tickets/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.query; // Pass userId as query parameter

    const ticket = await Ticket.findByPk(id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    // Log audit before deletion
    await logAudit(userId, 'DELETE', 'Ticket', id, ticket.dataValues, null,
      `Ticket #${id}: "${ticket.title}" permanently deleted`);

    await Ticket.destroy({ where: { id } });
    res.json({ message: 'Ticket deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Audit Log Routes (Admin only)
app.get('/api/audit-logs', async (req, res) => {
  try {
    const logs = await AuditLog.findAll({
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email', 'role'] }
      ],
      order: [['createdAt', 'DESC']],
      limit: 100 // Limit to last 100 entries
    });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Auto-cleanup function (runs automatically)
const autoCleanupResolvedTickets = async () => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const oldTickets = await Ticket.findAll({
      where: {
        status: 'Resolved',
        updatedAt: {
          [require('sequelize').Op.lt]: thirtyDaysAgo
        }
      }
    });

    if (oldTickets.length > 0) {
      console.log(`Auto-cleanup: Found ${oldTickets.length} old resolved tickets`);

      for (const ticket of oldTickets) {
        // Log the auto-cleanup
        await logAudit(null, 'AUTO_DELETE', 'Ticket', ticket.id, ticket.dataValues, null,
          `Auto-cleanup: Ticket "${ticket.title}" removed after 30 days`);

        await Ticket.destroy({ where: { id: ticket.id } });
      }

      console.log(`Auto-cleanup: Removed ${oldTickets.length} old resolved tickets`);
    }
  } catch (error) {
    console.error('Auto-cleanup failed:', error);
  }
};

// Run auto-cleanup every 24 hours
setInterval(autoCleanupResolvedTickets, 24 * 60 * 60 * 1000);

app.listen(PORT, () => {
  console.log(` Server running on port ${PORT}`);
});
