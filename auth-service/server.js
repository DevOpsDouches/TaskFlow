// auth-service/server.js
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2/promise');

const app = express();
const PORT = process.env.PORT || 3001;

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

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Initialize Database Tables
async function initializeDatabase() {
  try {
    const connection = await pool.getConnection();
    
    // Create users table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        user_id VARCHAR(255) PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_username (username)
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

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    await connection.query('SELECT 1');
    connection.release();
    res.json({ status: 'OK', service: 'auth-service', database: 'connected' });
  } catch (error) {
    res.status(503).json({ status: 'ERROR', service: 'auth-service', database: 'disconnected' });
  }
});

// Create Account Endpoint
app.post('/api/auth/register', async (req, res) => {
  let connection;
  try {
    const { username, password } = req.body;

    // Validation
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    }

    connection = await pool.getConnection();

    // Check if user already exists
    const [existingUsers] = await connection.query(
      'SELECT user_id FROM users WHERE username = ?',
      [username]
    );

    if (existingUsers.length > 0) {
      connection.release();
      return res.status(409).json({
        success: false,
        message: 'Username already exists'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    await connection.query(
      'INSERT INTO users (user_id, username, password) VALUES (?, ?, ?)',
      [userId, username, hashedPassword]
    );

    connection.release();

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      userId
    });

  } catch (error) {
    if (connection) connection.release();
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Login Endpoint
app.post('/api/auth/login', async (req, res) => {
  let connection;
  try {
    const { username, password } = req.body;

    // Validation
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required'
      });
    }

    connection = await pool.getConnection();

    // Get user from database
    const [users] = await connection.query(
      'SELECT user_id, username, password FROM users WHERE username = ?',
      [username]
    );

    connection.release();

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const user = users[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.user_id, 
        username: user.username 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      token,
      userId: user.user_id,
      username: user.username
    });

  } catch (error) {
    if (connection) connection.release();
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Verify Token Endpoint (for other microservices to use)
app.post('/api/auth/verify', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    res.json({
      success: true,
      userId: decoded.userId,
      username: decoded.username
    });

  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
});

// Logout Endpoint (optional - mainly for token blacklisting if implemented)
app.post('/api/auth/logout', (req, res) => {
  // In a stateless JWT system, logout is handled client-side by removing the token
  // You could implement token blacklisting here if needed
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

// Get User Profile Endpoint
app.get('/api/auth/profile', async (req, res) => {
  let connection;
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    connection = await pool.getConnection();

    const [users] = await connection.query(
      'SELECT user_id, username, created_at FROM users WHERE user_id = ?',
      [decoded.userId]
    );

    connection.release();

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user: users[0]
    });

  } catch (error) {
    if (connection) connection.release();
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
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
  console.log(`Auth service running on port ${PORT}`);
  console.log(`Database: ${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`);
});

module.exports = app;
