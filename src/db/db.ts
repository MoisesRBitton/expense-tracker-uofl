import Dexie, { Table } from 'dexie';

export interface ExpenseRecord {
  id?: number;
  amount: number;
  category: string;
  description: string;
  date: string;
  studentId: string;
}

export class MySubClassedDexie extends Dexie {
  expenses!: Table<ExpenseRecord, number>;

  constructor() {
    super('expenseTrackerDB');
    this.version(1).stores({
      expenses: '++id, amount, category, description, date, studentId',
    });
  }
}

export const db = new MySubClassedDexie();
