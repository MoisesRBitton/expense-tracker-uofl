import express from 'express';
import { Expense } from '../models/Expense.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Get all expenses for user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const expenses = await Expense.findByUserId(req.user.userId);
    res.json({ success: true, expenses });
  } catch (error) {
    console.error('Get expenses error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get total expenses for user
router.get('/total', authenticateToken, async (req, res) => {
  try {
    const total = await Expense.getTotalByUserId(req.user.userId);
    res.json({ success: true, total });
  } catch (error) {
    console.error('Get total error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new expense
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { amount, category, description, date } = req.body;

    if (!amount || !category || !date) {
      return res.status(400).json({ 
        error: 'Missing required fields: amount, category, date' 
      });
    }

    const expense = await Expense.create(req.user.userId, {
      amount: parseFloat(amount),
      category,
      description: description || '',
      date
    });

    res.status(201).json({ success: true, expense });
  } catch (error) {
    console.error('Create expense error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update expense
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, category, description, date } = req.body;

    if (!amount || !category || !date) {
      return res.status(400).json({ 
        error: 'Missing required fields: amount, category, date' 
      });
    }

    const expense = await Expense.update(parseInt(id), req.user.userId, {
      amount: parseFloat(amount),
      category,
      description: description || '',
      date
    });

    res.json({ success: true, expense });
  } catch (error) {
    if (error.message === 'Expense not found or not owned by user') {
      return res.status(404).json({ error: 'Expense not found' });
    }
    console.error('Update expense error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete expense
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    await Expense.delete(parseInt(id), req.user.userId);
    res.json({ success: true, message: 'Expense deleted successfully' });
  } catch (error) {
    if (error.message === 'Expense not found or not owned by user') {
      return res.status(404).json({ error: 'Expense not found' });
    }
    console.error('Delete expense error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Sync endpoint - get all user data for initial sync
router.get('/sync', authenticateToken, async (req, res) => {
  try {
    const expenses = await Expense.findByUserId(req.user.userId);
    const total = await Expense.getTotalByUserId(req.user.userId);
    
    res.json({
      success: true,
      data: {
        expenses,
        total,
        lastSync: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Sync error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
