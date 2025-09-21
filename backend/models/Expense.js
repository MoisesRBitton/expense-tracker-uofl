import { db } from '../config/database.js';

export class Expense {
  static async create(userId, expenseData) {
    return new Promise((resolve, reject) => {
      const { amount, category, description, date } = expenseData;
      const sql = `
        INSERT INTO expenses (user_id, amount, category, description, date)
        VALUES (?, ?, ?, ?, ?)
      `;
      db.run(sql, [userId, amount, category, description, date], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ 
            id: this.lastID, 
            user_id: userId, 
            amount, 
            category, 
            description, 
            date 
          });
        }
      });
    });
  }

  static async findByUserId(userId) {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM expenses WHERE user_id = ? ORDER BY date DESC';
      db.all(sql, [userId], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  static async findById(id, userId) {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM expenses WHERE id = ? AND user_id = ?';
      db.get(sql, [id, userId], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  static async update(id, userId, expenseData) {
    return new Promise((resolve, reject) => {
      const { amount, category, description, date } = expenseData;
      const sql = `
        UPDATE expenses 
        SET amount = ?, category = ?, description = ?, date = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ? AND user_id = ?
      `;
      db.run(sql, [amount, category, description, date, id, userId], function(err) {
        if (err) {
          reject(err);
        } else {
          if (this.changes === 0) {
            reject(new Error('Expense not found or not owned by user'));
          } else {
            resolve({ id, user_id: userId, amount, category, description, date });
          }
        }
      });
    });
  }

  static async delete(id, userId) {
    return new Promise((resolve, reject) => {
      const sql = 'DELETE FROM expenses WHERE id = ? AND user_id = ?';
      db.run(sql, [id, userId], function(err) {
        if (err) {
          reject(err);
        } else {
          if (this.changes === 0) {
            reject(new Error('Expense not found or not owned by user'));
          } else {
            resolve({ deleted: true, id });
          }
        }
      });
    });
  }

  static async getTotalByUserId(userId) {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT SUM(amount) as total FROM expenses WHERE user_id = ?';
      db.get(sql, [userId], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row?.total || 0);
        }
      });
    });
  }
}
