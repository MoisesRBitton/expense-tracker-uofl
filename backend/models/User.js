import { db } from '../config/database.js';
import bcrypt from 'bcryptjs';

export class User {
  static async create(studentId, password) {
    const passwordHash = await bcrypt.hash(password, 10);
    return new Promise((resolve, reject) => {
      const sql = 'INSERT INTO users (student_id, password_hash) VALUES (?, ?)';
      db.run(sql, [studentId, passwordHash], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID, student_id: studentId });
        }
      });
    });
  }

  static async findByStudentId(studentId) {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM users WHERE student_id = ?';
      db.get(sql, [studentId], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  static async findOrCreate(studentId, password) {
    try {
      let user = await this.findByStudentId(studentId);
      if (!user) {
        user = await this.create(studentId, password);
      }
      return user;
    } catch (error) {
      throw error;
    }
  }

  static async validatePassword(studentId, password) {
    const user = await this.findByStudentId(studentId);
    if (!user) {
      return false;
    }
    return await bcrypt.compare(password, user.password_hash);
  }

  static async updateLastSync(userId) {
    return new Promise((resolve, reject) => {
      const sql = 'UPDATE users SET last_sync = CURRENT_TIMESTAMP WHERE id = ?';
      db.run(sql, [userId], (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
}
