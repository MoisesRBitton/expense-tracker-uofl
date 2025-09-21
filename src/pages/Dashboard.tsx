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

const Dashboard = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [prefill, setPrefill] = useState<Partial<Expense>>({});
  const totalExpenses = useExpensesStore((s) => s.totalExpenses);
  const expenses = useExpensesStore((s) => s.expenses);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-uofl-gray-50 via-white to-uofl-gray-100">
      <header className="bg-gradient-to-r from-uofl-black via-uofl-gray-900 to-uofl-red-dark text-white py-6 shadow-strong">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-uofl-red to-uofl-red-light rounded-xl flex items-center justify-center animate-float">
                <span className="text-xl font-bold">U</span>
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-display font-bold">UofL Expense Tracker</h1>
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
                  ${totalExpenses.toFixed(2)}
                </div>
              </div>
              <div className="text-right">
                <div className="w-16 h-16 bg-uofl-redLighter/40 rounded-2xl flex items-center justify-center mb-2 backdrop-blur-sm border border-uofl-red/20">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <div className="text-uofl-redPale text-sm font-medium">This Month</div>
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
          
          <div className="space-y-3">
            {expenses.length > 0 ? (
              expenses.slice(0, 5).map((exp, index) => (
                <div 
                  key={exp.id} 
                  className="group p-4 rounded-xl border-2 border-uofl-gray-100 hover:border-uofl-red/30 hover:shadow-medium transition-all duration-300 animate-slide-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-uofl-red/10 to-uofl-red-light/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <span className="text-uofl-red font-bold text-lg">
                          {exp.category.charAt(0)}
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
                    <div className="text-right">
                      <div className="text-xl font-bold text-uofl-gray-900">
                        ${Number(exp.amount).toFixed(2)}
                      </div>
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
                <div className="text-xl font-semibold text-uofl-gray-600 mb-2">No expenses yet</div>
                <div className="text-uofl-gray-500">Add your first expense using the + button below</div>
              </div>
            )}
          </div>
        </section>

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
                className="group p-4 bg-white rounded-xl border-2 border-uofl-gray-100 hover:border-uofl-red/30 hover:shadow-medium transition-all duration-300 transform hover:scale-105 animate-slide-up"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-uofl-red/10 to-uofl-red-light/10 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                    <span className="text-uofl-red font-bold text-lg">
                      {category.charAt(0)}
                    </span>
                  </div>
                  <div className="text-sm font-medium text-uofl-gray-700 group-hover:text-uofl-red transition-colors duration-300">
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
        onClick={() => setIsModalOpen(true)}
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
        onClose={() => setIsModalOpen(false)}
        initialData={prefill}
      />
    </div>
  );
};

export default Dashboard;
