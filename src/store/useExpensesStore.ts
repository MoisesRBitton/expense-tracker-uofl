import { create } from 'zustand';
import { db, type ExpenseRecord } from '../db/db';
import { toast } from 'react-hot-toast';
import { apiService } from '../services/api';

export interface Expense extends Required<ExpenseRecord> {
  id: number;
}

interface ExpenseState {
  studentId: string | null;
  expenses: Expense[];
  totalExpenses: number;
  notificationShown: boolean;
  isOnline: boolean;
  lastSync: string | null;
  setStudentId: (id: string) => void;
  init: () => Promise<void>;
  addExpense: (expense: Omit<Expense, 'id'>) => Promise<void>;
  deleteExpense: (id: number) => Promise<void>;
  syncWithBackend: () => Promise<void>;
  setOnlineStatus: (online: boolean) => void;
}

const calculateTotal = (expenses: Expense[]) =>
  expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

const maybeNotify = (total: number, wasShown: boolean) => {
  if (total > 500 && !wasShown) {
    toast.error('Warning: Total expenses have exceeded $500!');
    return true;
  }
  if (total <= 500 && wasShown) {
    return false;
  }
  return wasShown;
};

export const useExpensesStore = create<ExpenseState>((set, get) => ({
  studentId: null,
  expenses: [],
  totalExpenses: 0,
  notificationShown: false,
  isOnline: navigator.onLine,
  lastSync: null,

  setStudentId: (id: string) => {
    localStorage.setItem('studentId', id);
    set({ studentId: id });
  },

  setOnlineStatus: (online: boolean) => {
    set({ isOnline: online });
  },

  init: async () => {
    const storedId = localStorage.getItem('studentId');
    if (storedId) {
      set({ studentId: storedId });
      
      // Load from IndexedDB first (for offline access)
      const rows = await db.expenses.where('studentId').equals(storedId).toArray();
      const typed = rows.map((r) => ({ ...(r as Expense), id: r.id! }));
      const total = calculateTotal(typed);
      const shown = maybeNotify(total, get().notificationShown);
      set({ expenses: typed, totalExpenses: total, notificationShown: shown });

      // Try to sync with backend if online
      if (get().isOnline) {
        try {
          await get().syncWithBackend();
        } catch (error) {
          console.log('Offline mode - using local data only');
        }
      }
    }
  },

  syncWithBackend: async () => {
    const studentId = get().studentId;
    if (!studentId || !get().isOnline) return;

    // Check if we have a valid token first
    const token = localStorage.getItem('authToken');
    if (!token) {
      console.log('No auth token found, skipping sync');
      return;
    }

    try {
      // Verify existing token
      const verifyResponse = await apiService.verifyToken();
      if (!verifyResponse.success) {
        throw new Error('Token verification failed');
      }

      // Get all data from backend
      const syncResponse = await apiService.syncData();
      if (syncResponse.success) {
        const { expenses, total, lastSync } = syncResponse.data;
        
        // Update IndexedDB with backend data
        await db.expenses.where('studentId').equals(studentId).delete();
        if (expenses.length > 0) {
          const expensesWithStudentId = expenses.map(exp => ({
            ...exp,
            studentId,
            id: undefined // Let IndexedDB generate new IDs
          }));
          await db.expenses.bulkAdd(expensesWithStudentId);
        }

        // Update store
        const typed = expenses.map((r) => ({ ...(r as Expense), id: r.id! }));
        const shown = maybeNotify(total, get().notificationShown);
        set({ 
          expenses: typed, 
          totalExpenses: total, 
          notificationShown: shown,
          lastSync: lastSync
        });
      }
    } catch (error) {
      console.error('Sync failed:', error);
      throw error;
    }
  },

  addExpense: async (expense: Omit<Expense, 'id'>) => {
    const studentId = get().studentId;
    if (!studentId) return;

    // Add to IndexedDB first (for offline capability)
    await db.expenses.add(expense);
    
    // Try to sync with backend if online
    if (get().isOnline) {
      try {
        const response = await apiService.createExpense(expense);
        if (response.success) {
          // Update IndexedDB with backend ID
          const localExpense = await db.expenses.where('studentId').equals(studentId).last();
          if (localExpense) {
            await db.expenses.update(localExpense.id!, { id: response.expense.id });
          }
        }
      } catch (error) {
        console.log('Failed to sync with backend, using local data');
      }
    }

    // Update store
    const rows = await db.expenses.where('studentId').equals(studentId).toArray();
    const typed = rows.map((r) => ({ ...(r as Expense), id: r.id! }));
    const total = calculateTotal(typed);
    const shown = maybeNotify(total, get().notificationShown);
    set({ expenses: typed, totalExpenses: total, notificationShown: shown });
  },

  deleteExpense: async (id: number) => {
    const studentId = get().studentId;
    if (!studentId) return;

    // Delete from IndexedDB first
    await db.expenses.delete(id);
    
    // Try to sync with backend if online
    if (get().isOnline) {
      try {
        await apiService.deleteExpense(id);
      } catch (error) {
        console.log('Failed to sync deletion with backend');
      }
    }

    // Update store
    const rows = await db.expenses.where('studentId').equals(studentId).toArray();
    const typed = rows.map((r) => ({ ...(r as Expense), id: r.id! }));
    const total = calculateTotal(typed);
    const shown = maybeNotify(total, get().notificationShown);
    set({ expenses: typed, totalExpenses: total, notificationShown: shown });
  },
}));
