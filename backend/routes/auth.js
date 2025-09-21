import express from 'express';
import { User } from '../models/User.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Student ID validation - UofL student IDs are 7 digits
const isValidStudentId = (studentId) => {
  return /^\d{7}$/.test(studentId);
};

// Password validation
const isValidPassword = (password) => {
  return password && password.length >= 6;
};

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { studentId, password } = req.body;

    if (!studentId || !isValidStudentId(studentId)) {
      return res.status(400).json({ 
        error: 'Invalid student ID. Please enter a valid 7-digit UofL student ID.' 
      });
    }

    if (!password || !isValidPassword(password)) {
      return res.status(400).json({ 
        error: 'Password must be at least 6 characters long.' 
      });
    }

    // Check if user exists and validate password
    const user = await User.findByStudentId(studentId);
    if (!user) {
      return res.status(401).json({ 
        error: 'Invalid student ID or password.' 
      });
    }

    const isValid = await User.validatePassword(studentId, password);
    if (!isValid) {
      return res.status(401).json({ 
        error: 'Invalid student ID or password.' 
      });
    }
    
    // Update last sync time
    await User.updateLastSync(user.id);

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, studentId: user.student_id },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      user: {
        id: user.id,
        studentId: user.student_id
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Register endpoint
router.post('/register', async (req, res) => {
  try {
    const { studentId, password } = req.body;

    if (!studentId || !isValidStudentId(studentId)) {
      return res.status(400).json({ 
        error: 'Invalid student ID. Please enter a valid 7-digit UofL student ID.' 
      });
    }

    if (!password || !isValidPassword(password)) {
      return res.status(400).json({ 
        error: 'Password must be at least 6 characters long.' 
      });
    }

    // Check if user already exists
    const existingUser = await User.findByStudentId(studentId);
    if (existingUser) {
      return res.status(409).json({ 
        error: 'Student ID already registered. Please login instead.' 
      });
    }

    // Create new user
    const user = await User.create(studentId, password);
    
    // Update last sync time
    await User.updateLastSync(user.id);

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, studentId: user.student_id },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      user: {
        id: user.id,
        studentId: user.student_id
      },
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Verify token endpoint
router.get('/verify', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    const user = await User.findByStudentId(decoded.studentId);
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        studentId: user.student_id
      }
    });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

export default router;
