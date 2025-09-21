import sqlite3 from 'sqlite3';
import { readFileSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = join(__dirname, '..', 'database', 'expense_tracker.db');
const schemaPath = join(__dirname, '..', 'database', 'schema.sql');

// Ensure database directory exists
mkdirSync(join(__dirname, '..', 'database'), { recursive: true });

const db = new sqlite3.Database(dbPath);

// Read and execute schema
const schema = readFileSync(schemaPath, 'utf8');
db.exec(schema, (err) => {
  if (err) {
    console.error('Error initializing database:', err);
  } else {
    console.log('Database initialized successfully');
  }
  db.close();
});
