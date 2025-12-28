// todo-service/server.js
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const mysql = require('mysql2/promise');

const app = express();
const PORT = process.env.PORT || 3002;

const corsOptions = {
  origin: ['http://35.154.6.99:3000', 'http://35.154.6.99']
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// MySQL/RDS Connection Pool Configuration
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:3001';

// Initialize Database Tables
async function initializeDatabase() {
  try {
    const connection = await pool.getConnection();
    
    // Create todos table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS todos (
        todo_id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        task TEXT NOT NULL,
        completed BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_user_id (user_id),
        INDEX idx_completed (completed)
      )
    `);
    
    connection.release();
    console.log('Database tables initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

// Initialize database on startup
initializeDatabase();

// Middleware to verify token with Auth Service
const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    // Verify token with auth service
    const response = await axios.post(
      `${AUTH_SERVICE_URL}/api/auth/verify`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (response.data.success) {
      req.user = {
        userId: response.data.userId,
        username: response.data.username
      };
      next();
    } else {
      res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({
      success: false,
      message: 'Authentication failed'
    });
  }
};

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    await connection.query('SELECT 1');
    connection.release();
    res.json({ status: 'OK', service: 'todo-service', database: 'connected' });
  } catch (error) {
    res.status(503).json({ status: 'ERROR', service: 'todo-service', database: 'disconnected' });
  }
});

// Get all todos for a user
app.get('/api/todos', verifyToken, async (req, res) => {
  let connection;
  try {
    const { userId } = req.user;

    connection = await pool.getConnection();

    const [todos] = await connection.query(
      'SELECT todo_id, user_id, task, completed, created_at, updated_at FROM todos WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );

    connection.release();

    res.json({
      success: true,
      todos: todos
    });

  } catch (error) {
    if (connection) connection.release();
    console.error('Get todos error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve todos'
    });
  }
});

// Create a new todo
app.post('/api/todos', verifyToken, async (req, res) => {
  let connection;
  try {
    const { userId } = req.user;
    const { task } = req.body;

    if (!task || task.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Task is required'
      });
    }

    const todoId = `todo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    connection = await pool.getConnection();

    await connection.query(
      'INSERT INTO todos (todo_id, user_id, task, completed) VALUES (?, ?, ?, ?)',
      [todoId, userId, task.trim(), false]
    );

    const [newTodos] = await connection.query(
      'SELECT todo_id, user_id, task, completed, created_at, updated_at FROM todos WHERE todo_id = ?',
      [todoId]
    );

    connection.release();

    res.status(201).json({
      success: true,
      todo: newTodos[0]
    });

  } catch (error) {
    if (connection) connection.release();
    console.error('Create todo error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create todo'
    });
  }
});

// Get todo statistics - MUST BE BEFORE DYNAMIC ROUTE
app.get('/api/todos/stats', verifyToken, async (req, res) => {
  let connection;
  try {
    const { userId } = req.user;

    connection = await pool.getConnection();

    const [stats] = await connection.query(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN completed = 1 THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN completed = 0 THEN 1 ELSE 0 END) as pending
      FROM todos WHERE user_id = ?`,
      [userId]
    );

    connection.release();

    res.json({
      success: true,
      stats: stats[0]
    });

  } catch (error) {
    if (connection) connection.release();
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve statistics'
    });
  }
});

// Update a todo
app.put('/api/todos/:todoId', verifyToken, async (req, res) => {
  let connection;
  try {
    const { userId } = req.user;
    const { todoId } = req.params;
    const { task, completed } = req.body;

    connection = await pool.getConnection();

    // First, verify the todo belongs to the user
    const [existingTodos] = await connection.query(
      'SELECT todo_id, user_id FROM todos WHERE todo_id = ?',
      [todoId]
    );

    if (existingTodos.length === 0) {
      connection.release();
      return res.status(404).json({
        success: false,
        message: 'Todo not found'
      });
    }

    if (existingTodos[0].user_id !== userId) {
      connection.release();
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to update this todo'
      });
    }

    // Build update query
    let updateFields = [];
    let updateValues = [];

    if (task !== undefined) {
      updateFields.push('task = ?');
      updateValues.push(task.trim());
    }

    if (completed !== undefined) {
      updateFields.push('completed = ?');
      updateValues.push(completed);
    }

    if (updateFields.length === 0) {
      connection.release();
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }

    updateValues.push(todoId);

    await connection.query(
      `UPDATE todos SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE todo_id = ?`,
      updateValues
    );

    const [updatedTodos] = await connection.query(
      'SELECT todo_id, user_id, task, completed, created_at, updated_at FROM todos WHERE todo_id = ?',
      [todoId]
    );

    connection.release();

    res.json({
      success: true,
      todo: updatedTodos[0]
    });

  } catch (error) {
    if (connection) connection.release();
    console.error('Update todo error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update todo'
    });
  }
});

// Delete a todo
app.delete('/api/todos/:todoId', verifyToken, async (req, res) => {
  let connection;
  try {
    const { userId } = req.user;
    const { todoId } = req.params;

    connection = await pool.getConnection();

    // First, verify the todo belongs to the user
    const [existingTodos] = await connection.query(
      'SELECT todo_id, user_id FROM todos WHERE todo_id = ?',
      [todoId]
    );

    if (existingTodos.length === 0) {
      connection.release();
      return res.status(404).json({
        success: false,
        message: 'Todo not found'
      });
    }

    if (existingTodos[0].user_id !== userId) {
      connection.release();
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to delete this todo'
      });
    }

    // Delete the todo
    await connection.query(
      'DELETE FROM todos WHERE todo_id = ?',
      [todoId]
    );

    connection.release();

    res.json({
      success: true,
      message: 'Todo deleted successfully'
    });

  } catch (error) {
    if (connection) connection.release();
    console.error('Delete todo error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete todo'
    });
  }
});

// Get a single todo by ID - MUST BE AFTER /stats ROUTE
app.get('/api/todos/:todoId', verifyToken, async (req, res) => {
  let connection;
  try {
    const { userId } = req.user;
    const { todoId } = req.params;

    connection = await pool.getConnection();

    const [todos] = await connection.query(
      'SELECT todo_id, user_id, task, completed, created_at, updated_at FROM todos WHERE todo_id = ?',
      [todoId]
    );

    connection.release();

    if (todos.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Todo not found'
      });
    }

    if (todos[0].user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to access this todo'
      });
    }

    res.json({
      success: true,
      todo: todos[0]
    });

  } catch (error) {
    if (connection) connection.release();
    console.error('Get todo error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve todo'
    });
  }
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server');
  await pool.end();
  process.exit(0);
});

app.listen(PORT, () => {
  console.log(`Todo service running on port ${PORT}`);
  console.log(`Database: ${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`);
});

module.exports = app;
