/**
 * Dashboard Component
 * 
 * Main application interface displaying expense overview, recent transactions,
 * and category management. Provides access to expense creation and management features.
 * 
 * Features:
 * - Total expenses display with visual emphasis
 * - Recent expenses list with detailed information
 * - Category-based expense organization
 * - Online/offline status indicators
 * - Data synchronization controls
 * - Receipt upload integration
 * 
 * @author UofL Expense Tracker Team
 * @version 1.0.0
 */

import { useEffect, useState } from 'react';
import { useExpensesStore } from '../store/useExpensesStore';
import AddExpenseModal from '../components/AddExpenseModal';
import ReceiptUpload from '../components/ReceiptUpload';
import { toast } from 'react-hot-toast';
import type { Expense } from '../store/useExpensesStore';

const categories = [
  'Tuition',
  'Meal Plan',
  'Rent',
  'Groceries',
  'Transportation',
  'Entertainment',
  'Other',
];

// Category color mapping
const getCategoryColor = (category: string) => {
  const colorMap: Record<string, string> = {
    'Tuition': 'red',
    'Meal Plan': 'blue',
    'Rent': 'purple',
    'Groceries': 'green',
    'Transportation': 'orange',
    'Entertainment': 'pink',
    'Other': 'gray',
  };
  return colorMap[category] || 'gray';
};

const getCategoryIcon = (category: string) => {
  const iconMap: Record<string, string> = {
    'Tuition': '🎓',
    'Meal Plan': '🍽️',
    'Rent': '🏠',
    'Groceries': '🛒',
    'Transportation': '🚗',
    'Entertainment': '🎬',
    'Other': '📝',
  };
  return iconMap[category] || '📝';
};

const Dashboard = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [prefill, setPrefill] = useState<Partial<Expense>>({});
  const [editingExpense, setEditingExpense] = useState<Expense | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'category'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [dateRange, setDateRange] = useState<'current-month' | 'all-time' | 'last-week' | 'last-month'>('current-month');
  
  const totalExpenses = useExpensesStore((s) => s.totalExpenses);
  const expenses = useExpensesStore((s) => s.expenses);
  
  // Calculate current month expenses
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const currentMonthExpenses = expenses.filter(exp => {
    const expDate = new Date(exp.date);
    return expDate.getMonth() === currentMonth && expDate.getFullYear() === currentYear;
  });
  const currentMonthTotal = currentMonthExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  const isOnline = useExpensesStore((s) => s.isOnline);
  const lastSync = useExpensesStore((s) => s.lastSync);
  const studentId = useExpensesStore((s) => s.studentId);
  const init = useExpensesStore((s) => s.init);
  const syncWithBackend = useExpensesStore((s) => s.syncWithBackend);

  useEffect(() => {
    init();
  }, [init]);

  // Debug: Log expenses and total
  useEffect(() => {
    console.log('Dashboard - Expenses:', expenses);
    console.log('Dashboard - Total:', totalExpenses);
  }, [expenses, totalExpenses]);

  const handleSync = async () => {
    try {
      await syncWithBackend();
      toast.success('Data synced successfully!');
    } catch (error) {
      toast.error('Sync failed. Using offline data.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('studentId');
    window.location.href = '/';
  };

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setPrefill({});
    setIsModalOpen(true);
  };

  const handleAddExpense = () => {
    setEditingExpense(undefined);
    setPrefill({});
    setIsModalOpen(true);
  };

  const handleCategoryClick = (category: string) => {
    setEditingExpense(undefined);
    setPrefill({ category });
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingExpense(undefined);
    setPrefill({});
  };

  // Date range filtering logic
  const getDateRangeFilter = (dateRange: string) => {
    const now = new Date();
    const expenseDate = new Date();
    
    switch (dateRange) {
      case 'current-month':
        return (exp: Expense) => {
          const expDate = new Date(exp.date);
          return expDate.getMonth() === now.getMonth() && expDate.getFullYear() === now.getFullYear();
        };
      case 'last-week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return (exp: Expense) => new Date(exp.date) >= weekAgo;
      case 'last-month':
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
        return (exp: Expense) => {
          const expDate = new Date(exp.date);
          return expDate >= lastMonth && expDate <= endLastMonth;
        };
      case 'all-time':
      default:
        return () => true;
    }
  };

  // Filter and sort expenses
  const filteredAndSortedExpenses = expenses
    .filter(expense => {
      const matchesSearch = !searchTerm || 
        expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.amount.toString().includes(searchTerm);
      
      const matchesCategory = !selectedCategory || expense.category === selectedCategory;
      const matchesDateRange = getDateRangeFilter(dateRange)(expense);
      
      return matchesSearch && matchesCategory && matchesDateRange;
    })
    .sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        case 'amount':
          comparison = a.amount - b.amount;
          break;
        case 'category':
          comparison = a.category.localeCompare(b.category);
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const handleSortChange = (newSortBy: 'date' | 'amount' | 'category') => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('desc');
    }
  };

  // Analytics calculations
  const categoryTotals = categories.reduce((acc, category) => {
    acc[category] = expenses
      .filter(exp => exp.category === category)
      .reduce((sum, exp) => sum + exp.amount, 0);
    return acc;
  }, {} as Record<string, number>);

  const topCategory = Object.entries(categoryTotals).reduce((max, [category, amount]) => 
    amount > max.amount ? { category, amount } : max, 
    { category: '', amount: 0 }
  );

  const analyticsThisMonth = new Date().getMonth();
  const analyticsThisYear = new Date().getFullYear();
  const analyticsThisMonthExpenses = expenses.filter(exp => {
    const expDate = new Date(exp.date);
    return expDate.getMonth() === analyticsThisMonth && expDate.getFullYear() === analyticsThisYear;
  });
  const analyticsThisMonthTotal = analyticsThisMonthExpenses.reduce((sum, exp) => sum + exp.amount, 0);

  const averageExpense = expenses.length > 0 ? totalExpenses / expenses.length : 0;

  // Calculate total for the selected date range
  const getTotalForDateRange = (range: string) => {
    switch (range) {
      case 'current-month':
        return currentMonthTotal;
      case 'last-week':
        return filteredAndSortedExpenses.reduce((sum, exp) => sum + exp.amount, 0);
      case 'last-month':
        return filteredAndSortedExpenses.reduce((sum, exp) => sum + exp.amount, 0);
      case 'all-time':
        return totalExpenses;
      default:
        return currentMonthTotal;
    }
  };

  const displayTotal = getTotalForDateRange(dateRange);

  return (
    <div className="min-h-screen bg-gradient-to-br from-uofl-gray-50 via-white to-uofl-gray-100">
      <header className="bg-gradient-to-r from-uofl-black via-uofl-gray-900 to-uofl-red-dark text-white py-6 shadow-strong">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center animate-float">
                <img 
                  src="/public/Red_Budget_Logo.png" 
                  alt="Red Budget Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-display font-bold">Red Budget</h1>
                <p className="text-uofl-gray-300 text-sm">Student ID: {studentId}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className={`flex items-center space-x-2 px-3 py-2 rounded-full ${isOnline ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                <div className={`w-2 h-2 rounded-full animate-pulse ${isOnline ? 'bg-green-400' : 'bg-red-400'}`}></div>
                <span className="text-sm font-medium">{isOnline ? 'Online' : 'Offline'}</span>
              </div>
              
              {isOnline && (
                <button
                  onClick={handleSync}
                  className="px-4 py-2 bg-gradient-to-r from-uofl-red to-uofl-red-light hover:from-uofl-red-dark hover:to-uofl-red rounded-xl text-sm font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-medium"
                >
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span>Sync</span>
                  </div>
                </button>
              )}
              
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-uofl-gray-600/20 hover:bg-uofl-gray-600/30 rounded-xl text-sm font-medium transition-all duration-300 hover:scale-105"
              >
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>Logout</span>
                </div>
              </button>
            </div>
          </div>
          
          {lastSync && (
            <div className="mt-4 flex items-center space-x-2 text-uofl-gray-300 text-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Last synced: {new Date(lastSync).toLocaleString()}</span>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Total Expenses Card */}
        <div className="bg-gradient-to-br from-uofl-red via-uofl-red-light to-uofl-red-dark text-white rounded-2xl p-8 shadow-strong relative overflow-hidden animate-slide-up">
          <div className="absolute top-0 right-0 w-32 h-32 bg-uofl-redLighter/25 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-uofl-redLight/20 rounded-full translate-y-12 -translate-x-12"></div>
          <div className="absolute top-1/2 left-1/2 w-40 h-40 bg-uofl-redDarker/15 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute top-4 left-4 w-16 h-16 bg-uofl-red/30 rounded-full"></div>
          <div className="absolute bottom-4 right-4 w-12 h-12 bg-uofl-redLight/25 rounded-full"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-uofl-redPale text-sm uppercase tracking-wider font-semibold">Total Expenses</div>
                <div className="text-5xl md:text-6xl font-display font-bold mt-2 animate-pulse-slow text-white drop-shadow-lg">
                  ${displayTotal.toFixed(2)}
                </div>
              </div>
              <div className="text-right">
                <div className="w-16 h-16 bg-uofl-redLighter/40 rounded-2xl flex items-center justify-center mb-2 backdrop-blur-sm border border-uofl-red/20">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <div className="text-uofl-white text-sm font-medium">
                  {dateRange === 'current-month' ? 'This Month' :
                   dateRange === 'last-week' ? 'Last Week' :
                   dateRange === 'last-month' ? 'Last Month' :
                   'All Time'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Expenses Section */}
        <section className="bg-white rounded-2xl shadow-soft p-6 animate-slide-up">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-display font-bold text-uofl-gray-900">Recent Expenses</h2>
              <p className="text-uofl-gray-600 text-sm mt-1">Your latest transactions</p>
            </div>
            <ReceiptUpload
              onDataExtracted={(data) => {
                setPrefill(data);
                setIsModalOpen(true);
              }}
            />
          </div>

          {/* Search and Filter Controls */}
          <div className="mb-6 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search Input */}
              <div className="flex-1">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-uofl-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Search expenses..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border-2 border-uofl-gray-200 rounded-xl focus:outline-none focus:border-uofl-red focus:ring-4 focus:ring-uofl-red/20 transition-all duration-300"
                  />
                </div>
              </div>

              {/* Date Range Filter */}
              <div className="sm:w-40">
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value as any)}
                  className="w-full px-4 py-3 border-2 border-uofl-gray-200 rounded-xl focus:outline-none focus:border-uofl-red focus:ring-4 focus:ring-uofl-red/20 transition-all duration-300"
                >
                  <option value="current-month">This Month</option>
                  <option value="last-week">Last Week</option>
                  <option value="last-month">Last Month</option>
                  <option value="all-time">All Time</option>
                </select>
              </div>

              {/* Category Filter */}
              <div className="sm:w-48">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-uofl-gray-200 rounded-xl focus:outline-none focus:border-uofl-red focus:ring-4 focus:ring-uofl-red/20 transition-all duration-300"
                >
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Sort Controls */}
            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-uofl-gray-600 font-medium">Sort by:</span>
              {(['date', 'amount', 'category'] as const).map(field => (
                <button
                  key={field}
                  onClick={() => handleSortChange(field)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-300 ${
                    sortBy === field
                      ? 'bg-uofl-red text-white'
                      : 'bg-uofl-gray-100 text-uofl-gray-700 hover:bg-uofl-gray-200'
                  }`}
                >
                  {field.charAt(0).toUpperCase() + field.slice(1)}
                  {sortBy === field && (
                    <span className="ml-1">
                      {sortOrder === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </button>
              ))}
              {(searchTerm || selectedCategory || dateRange !== 'current-month') && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('');
                    setDateRange('current-month');
                  }}
                  className="px-3 py-1 rounded-full text-sm font-medium bg-uofl-gray-200 text-uofl-gray-700 hover:bg-uofl-gray-300 transition-all duration-300"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>
          
          <div className="space-y-3">
            {filteredAndSortedExpenses.length > 0 ? (
              filteredAndSortedExpenses.slice(0, 10).map((exp, index) => (
                <div 
                  key={exp.id} 
                  className="group p-4 rounded-xl border-2 border-uofl-gray-100 hover:border-uofl-red/30 hover:shadow-medium transition-all duration-300 animate-slide-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 bg-gradient-to-br from-uofl-${getCategoryColor(exp.category)}/10 to-uofl-${getCategoryColor(exp.category)}/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                        <span className="text-lg">
                          {getCategoryIcon(exp.category)}
                        </span>
                      </div>
                      <div>
                        <div className="font-semibold text-uofl-gray-900 group-hover:text-uofl-red transition-colors duration-300">
                          {exp.description || 'No description'}
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-uofl-gray-500">
                          <span className="px-2 py-1 bg-uofl-gray-100 rounded-full text-xs font-medium">
                            {exp.category}
                          </span>
                          <span>•</span>
                          <span>
                            {exp.date ? new Date(exp.date).toLocaleDateString() : 'No date'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <div className="text-xl font-bold text-uofl-gray-900">
                          ${Number(exp.amount).toFixed(2)}
                        </div>
                      </div>
                      <button
                        onClick={() => handleEditExpense(exp)}
                        className="p-2 text-uofl-gray-400 hover:text-uofl-red hover:bg-uofl-red/10 rounded-lg transition-all duration-300 opacity-0 group-hover:opacity-100"
                        title="Edit expense"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 animate-fade-in">
                <div className="w-24 h-24 bg-gradient-to-br from-uofl-gray-100 to-uofl-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-12 h-12 text-uofl-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="text-xl font-semibold text-uofl-gray-600 mb-2">
                  {expenses.length === 0 
                    ? 'No expenses yet' 
                    : currentMonthExpenses.length === 0 && !searchTerm && !selectedCategory
                    ? 'No expenses this month'
                    : 'No expenses match your search'
                  }
                </div>
                <div className="text-uofl-gray-500">
                  {expenses.length === 0 
                    ? 'Add your first expense using the + button below'
                    : currentMonthExpenses.length === 0 && !searchTerm && !selectedCategory
                    ? 'Add an expense to see it here'
                    : 'Try adjusting your search or filter criteria'
                  }
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Analytics Section */}
        {expenses.length > 0 && (
          <section className="bg-white rounded-2xl shadow-soft p-6 animate-slide-up">
            <div className="mb-6">
              <h2 className="text-2xl font-display font-bold text-uofl-gray-900">Spending Insights</h2>
              <p className="text-uofl-gray-600 text-sm mt-1">Your expense patterns and statistics</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* This Month Total */}
              <div className="bg-gradient-to-br from-uofl-blue-50 to-uofl-blue-100 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="w-10 h-10 bg-uofl-blue-500/20 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-uofl-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
                <div className="text-2xl font-bold text-uofl-gray-900">${analyticsThisMonthTotal.toFixed(2)}</div>
                <div className="text-sm text-uofl-gray-600">This Month</div>
              </div>

              {/* Average Expense */}
              <div className="bg-gradient-to-br from-uofl-green-50 to-uofl-green-100 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="w-10 h-10 bg-uofl-green-500/20 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-uofl-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                </div>
                <div className="text-2xl font-bold text-uofl-gray-900">${averageExpense.toFixed(2)}</div>
                <div className="text-sm text-uofl-gray-600">Average Expense</div>
              </div>

              {/* Top Category */}
              <div className="bg-gradient-to-br from-uofl-purple-50 to-uofl-purple-100 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="w-10 h-10 bg-uofl-purple-500/20 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-uofl-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                    </svg>
                  </div>
                </div>
                <div className="text-lg font-bold text-uofl-gray-900">{topCategory.category || 'N/A'}</div>
                <div className="text-sm text-uofl-gray-600">Top Category</div>
                <div className="text-xs text-uofl-gray-500">${topCategory.amount.toFixed(2)}</div>
              </div>

              {/* Total Expenses Count */}
              <div className="bg-gradient-to-br from-uofl-orange-50 to-uofl-orange-100 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="w-10 h-10 bg-uofl-orange-500/20 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-uofl-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                </div>
                <div className="text-2xl font-bold text-uofl-gray-900">{expenses.length}</div>
                <div className="text-sm text-uofl-gray-600">Total Expenses</div>
              </div>
            </div>

            {/* Category Breakdown */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-uofl-gray-900 mb-4">Category Breakdown</h3>
              <div className="space-y-3">
                {Object.entries(categoryTotals)
                  .filter(([_, amount]) => amount > 0)
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 5)
                  .map(([category, amount]) => {
                    const percentage = totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0;
                    return (
                      <div key={category} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 bg-uofl-red rounded-full"></div>
                          <span className="text-sm font-medium text-uofl-gray-700">{category}</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="text-sm text-uofl-gray-600">${amount.toFixed(2)}</div>
                          <div className="text-xs text-uofl-gray-500">({percentage.toFixed(1)}%)</div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </section>
        )}

        {/* Categories Section */}
        <section className="animate-slide-up">
          <div className="mb-6">
            <h2 className="text-2xl font-display font-bold text-uofl-gray-900">Expense Categories</h2>
            <p className="text-uofl-gray-600 text-sm mt-1">Quick access to common expense types</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {categories.map((category, index) => (
              <button 
                key={category} 
                onClick={() => handleCategoryClick(category)}
                className={`group p-4 bg-white rounded-xl border-2 border-uofl-gray-100 hover:border-uofl-${getCategoryColor(category)}/30 hover:shadow-medium transition-all duration-300 transform hover:scale-105 animate-slide-up cursor-pointer`}
                style={{ animationDelay: `${index * 0.05}s` }}
                title={`Add ${category} expense`}
              >
                <div className="text-center">
                  <div className={`w-12 h-12 bg-gradient-to-br from-uofl-${getCategoryColor(category)}/10 to-uofl-${getCategoryColor(category)}/20 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300`}>
                    <span className="text-lg">
                      {getCategoryIcon(category)}
                    </span>
                  </div>
                  <div className={`text-sm font-medium text-uofl-gray-700 group-hover:text-uofl-${getCategoryColor(category)} transition-colors duration-300`}>
                    {category}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>
      </main>

      {/* Floating Action Button */}
      <button
        aria-label="Add expense"
        onClick={handleAddExpense}
        className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-r from-uofl-red to-uofl-red-light hover:from-uofl-red-dark hover:to-uofl-red text-white rounded-2xl shadow-strong hover:shadow-strong transform hover:scale-110 transition-all duration-300 animate-float group"
      >
        <div className="flex items-center justify-center">
          <svg className="w-8 h-8 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </div>
      </button>

      <AddExpenseModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        initialData={prefill}
        editingExpense={editingExpense}
      />
    </div>
  );
};

export default Dashboard;
