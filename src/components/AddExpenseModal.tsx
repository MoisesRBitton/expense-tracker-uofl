/**
 * AddExpenseModal Component
 * 
 * Modal interface for creating and editing expenses. Provides form validation,
 * category selection, and integration with the expense store.
 * 
 * Features:
 * - Form validation with user feedback
 * - Category dropdown selection
 * - Date picker with default to today
 * - Amount input with currency formatting
 * - Description field for expense details
 * - Integration with global expense store
 * 
 * @author UofL Expense Tracker Team
 * @version 1.0.0
 */

import { useEffect, useState } from 'react';
import { useExpensesStore, type Expense } from '../store/useExpensesStore';
import { toast } from 'react-hot-toast';

type AddExpenseModalProps = {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Partial<Expense>;
  editingExpense?: Expense;
};

const AddExpenseModal = ({ isOpen, onClose, initialData, editingExpense }: AddExpenseModalProps) => {
  const addExpense = useExpensesStore((s) => s.addExpense);
  const updateExpense = useExpensesStore((s) => s.updateExpense);
  const deleteExpense = useExpensesStore((s) => s.deleteExpense);
  const studentId = useExpensesStore((s) => s.studentId);

  const [amount, setAmount] = useState<string>('');
  const [category, setCategory] = useState<string>('Other');
  const [description, setDescription] = useState<string>('');
  const [date, setDate] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      if (editingExpense) {
        // Pre-populate form for editing
        setAmount(String(editingExpense.amount));
        setCategory(editingExpense.category);
        setDescription(editingExpense.description);
        setDate(editingExpense.date);
      } else if (initialData) {
        // Pre-populate form for new expense with initial data (e.g., from OCR)
        if (typeof initialData.amount === 'number') setAmount(String(initialData.amount));
        if (initialData.category) setCategory(initialData.category);
        if (initialData.description) setDescription(initialData.description);
        if (initialData.date) setDate(initialData.date);
      } else {
        // Reset form for new expense
        setAmount('');
        setCategory('Other');
        setDescription('');
        setDate(new Date().toISOString().split('T')[0]); // Default to today
      }
    }
  }, [isOpen, initialData, editingExpense]);

  if (!isOpen) return null;

  const handleClose = () => {
    onClose();
    // Reset form state
    setAmount('');
    setCategory('Other');
    setDescription('');
    setDate('');
  };

  /**
   * Handle form submission with comprehensive validation
   * 
   * Validation includes:
   * - Student ID must be present
   * - Amount must be positive number
   * - Category must be selected
   * - Date must be provided
   * - Description is optional but trimmed
   * 
   * @param e - Form submission event
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate student ID
    if (!studentId) {
      toast.error('Student ID not found. Please log in again.');
      return;
    }
    
    // Validate amount - must be positive number
    const parsedAmount = parseFloat(amount);
    if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      toast.error('Please enter a valid amount greater than $0');
      return;
    }

    // Validate amount format - check for reasonable maximum
    if (parsedAmount > 999999) {
      toast.error('Amount seems too large. Please check your input.');
      return;
    }

    // Validate category selection
    if (!category) {
      toast.error('Please select a category');
      return;
    }

    // Validate date selection
    if (!date) {
      toast.error('Please select a date');
      return;
    }

    // Validate date is not in the future
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(23, 59, 59, 999); // End of today
    if (selectedDate > today) {
      toast.error('Expense date cannot be in the future');
      return;
    }

    try {
      const expenseData = {
        amount: parsedAmount,
        category,
        description: description.trim() || 'No description',
        date,
        studentId,
      };

      if (editingExpense) {
        // Update existing expense
        await updateExpense(editingExpense.id, expenseData);
        toast.success('Expense updated successfully!');
      } else {
        // Add new expense
        await addExpense(expenseData);
        toast.success('Expense added successfully!');
      }
      
      handleClose();
    } catch (error) {
      toast.error(editingExpense ? 'Failed to update expense. Please try again.' : 'Failed to add expense. Please try again.');
      console.error('Error with expense:', error);
    }
  };

  const handleDelete = async () => {
    if (!editingExpense) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete this expense?\n\n${editingExpense.description || 'No description'} - $${editingExpense.amount.toFixed(2)}`
    );

    if (confirmed) {
      try {
        await deleteExpense(editingExpense.id);
        toast.success('Expense deleted successfully!');
        handleClose();
      } catch (error) {
        toast.error('Failed to delete expense. Please try again.');
        console.error('Error deleting expense:', error);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
        onClick={handleClose} 
        aria-hidden="true" 
      />
      <div className="absolute inset-0 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-lg bg-white rounded-2xl shadow-strong p-8 relative animate-slide-up max-h-[90vh] overflow-y-auto">
          <button
            aria-label="Close modal"
            onClick={handleClose}
            className="absolute top-4 right-4 w-8 h-8 bg-uofl-gray-100 hover:bg-uofl-gray-200 rounded-full flex items-center justify-center text-uofl-gray-500 hover:text-uofl-gray-700 transition-all duration-300 hover:scale-110"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-uofl-red to-uofl-red-light rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h3 className="text-2xl font-display font-bold text-uofl-gray-900 mb-2">
              {editingExpense ? 'Edit Expense' : 'Add New Expense'}
            </h3>
            <p className="text-uofl-gray-600">
              {editingExpense ? 'Update your expense details' : 'Track your spending with ease'}
            </p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-uofl-gray-700">Amount</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-uofl-gray-500 font-semibold text-lg">$</div>
                <input
                  type="text"
                  inputMode="decimal"
                  value={amount}
                  onChange={(e) => {
                    // Only allow numbers, decimal point, and backspace
                    const value = e.target.value;
                    if (value === '' || /^\d*\.?\d{0,2}$/.test(value)) {
                      setAmount(value);
                    }
                  }}
                  onWheel={(e) => e.currentTarget.blur()} // Prevent scroll from changing value
                  className="w-full pl-8 pr-4 py-4 border-2 border-uofl-gray-200 rounded-xl focus:outline-none focus:border-uofl-red focus:ring-4 focus:ring-uofl-red/20 transition-all duration-300 text-lg font-mono"
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-uofl-gray-700">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full border-2 border-uofl-gray-200 rounded-xl px-4 py-4 focus:outline-none focus:border-uofl-red focus:ring-4 focus:ring-uofl-red/20 transition-all duration-300 text-lg"
              >
                <option>Tuition</option>
                <option>Meal Plan</option>
                <option>Rent</option>
                <option>Groceries</option>
                <option>Transportation</option>
                <option>Entertainment</option>
                <option>Other</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-uofl-gray-700">Description</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full border-2 border-uofl-gray-200 rounded-xl px-4 py-4 focus:outline-none focus:border-uofl-red focus:ring-4 focus:ring-uofl-red/20 transition-all duration-300 text-lg"
                placeholder="What was this expense for?"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-uofl-gray-700">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full border-2 border-uofl-gray-200 rounded-xl px-4 py-4 focus:outline-none focus:border-uofl-red focus:ring-4 focus:ring-uofl-red/20 transition-all duration-300 text-lg"
              />
              
              {/* Quick Date Options */}
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="text-xs text-uofl-gray-500 font-medium">Quick select:</span>
                {[
                  { label: 'Today', value: new Date().toISOString().split('T')[0] },
                  { label: 'Yesterday', value: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0] },
                  { label: '3 days ago', value: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] },
                  { label: '1 week ago', value: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] },
                ].map(option => (
                  <button
                    key={option.label}
                    type="button"
                    onClick={() => setDate(option.value)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-300 ${
                      date === option.value
                        ? 'bg-uofl-red text-white'
                        : 'bg-uofl-gray-100 text-uofl-gray-600 hover:bg-uofl-gray-200'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div className={`flex space-x-4 pt-4 ${editingExpense ? 'flex-col sm:flex-row' : ''}`}>
              {editingExpense && (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="w-full sm:w-auto px-6 py-4 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-medium mb-4 sm:mb-0 sm:mr-4"
                >
                  Delete Expense
                </button>
              )}
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-6 py-4 border-2 border-uofl-gray-200 text-uofl-gray-700 rounded-xl font-semibold hover:border-uofl-gray-300 hover:bg-uofl-gray-50 transition-all duration-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-6 py-4 bg-gradient-to-r from-uofl-red to-uofl-red-light hover:from-uofl-red-dark hover:to-uofl-red text-white rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-medium"
              >
                {editingExpense ? 'Update Expense' : 'Save Expense'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddExpenseModal;
