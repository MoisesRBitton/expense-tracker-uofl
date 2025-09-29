/**
 * LoginPage Component
 * 
 * This component handles user authentication for the UofL Expense Tracker.
 * It provides both login and registration functionality with student ID and password validation.
 * 
 * Features:
 * - Student ID validation (7-digit format)
 * - Password validation (minimum 6 characters)
 * - Toggle between login and registration modes
 * - Form validation with user feedback
 * - Integration with backend API for authentication
 * - Automatic redirect to dashboard on successful login
 * 
 * @author UofL Expense Tracker Team
 * @version 1.0.0
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useExpensesStore } from '../store/useExpensesStore';
import { apiService } from '../services/api';
import { toast } from 'react-hot-toast';

/**
 * LoginPage Component - Main authentication interface
 * 
 * State Management:
 * - studentIdInput: Current student ID input value
 * - password: Current password input value  
 * - isLogin: Toggle between login/register modes
 * - isLoading: Loading state for API calls
 * 
 * Dependencies:
 * - useNavigate: React Router navigation hook
 * - useExpensesStore: Global state management for user data
 * - apiService: Backend API communication service
 */
const LoginPage = () => {
  // Form state management
  const [studentIdInput, setStudentIdInput] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  
  // Hooks and services
  const navigate = useNavigate();
  const setStudentId = useExpensesStore((s) => s.setStudentId);

  /**
   * Effect: Check for existing authentication on component mount
   * 
   * If both student ID and auth token are found in localStorage, 
   * automatically redirect to dashboard. This provides a seamless 
   * user experience for returning users.
   */
  useEffect(() => {
    const existing = localStorage.getItem('studentId');
    const token = localStorage.getItem('authToken');
    if (existing && token) {
      navigate('/dashboard', { replace: true });
    }
  }, [navigate]);

  /**
   * Handle form submission for both login and registration
   * 
   * Process:
   * 1. Prevent default form submission
   * 2. Trim whitespace from inputs
   * 3. Validate all fields are filled
   * 4. Validate student ID format (7 digits)
   * 5. Validate password length (minimum 6 characters)
   * 6. Call appropriate API endpoint (login/register)
   * 7. Handle success/error responses with user feedback
   * 8. Update global state and localStorage on success
   * 9. Navigate to dashboard on successful authentication
   * 
   * @param e - Form submission event
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedId = studentIdInput.trim();
    const trimmedPassword = password.trim();
    
    // Validate all fields are filled
    if (!trimmedId || !trimmedPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    // Validate student ID format (7-digit format)
    if (!/^\d{7}$/.test(trimmedId)) {
      toast.error('Student ID must be 7 digits');
      return;
    }

    // Validate password length
    if (trimmedPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);

    try {
      // Call appropriate API endpoint based on mode
      const response = isLogin 
        ? await apiService.login(trimmedId, trimmedPassword)
        : await apiService.register(trimmedId, trimmedPassword);

      if (response.success) {
        // Update global state and localStorage
        setStudentId(trimmedId);
        localStorage.setItem('studentId', trimmedId);
        toast.success(isLogin ? 'Login successful!' : 'Registration successful!');
        navigate('/dashboard');
      } else {
        toast.error(response.error || 'Authentication failed');
      }
    } catch (error) {
      // Enhanced error handling with proper type checking
      if (error instanceof Error) {
        toast.error(error.message || 'Authentication failed');
      } else {
        toast.error('Authentication failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-uofl-black via-uofl-gray-800 to-uofl-red-dark relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=&quot;60&quot; height=&quot;60&quot; viewBox=&quot;0 0 60 60&quot; xmlns=&quot;http://www.w3.org/2000/svg&quot;%3E%3Cg fill=&quot;none&quot; fill-rule=&quot;evenodd&quot;%3E%3Cg fill=&quot;%23AD0000&quot; fill-opacity=&quot;0.05&quot;%3E%3Ccircle cx=&quot;30&quot; cy=&quot;30&quot; r=&quot;2&quot;/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
        
        <div className="w-full max-w-md bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-strong relative z-10 animate-fade-in border border-uofl-red/10">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 animate-bounce-gentle">
              <img 
                src="/public/Red_Budget_Logo.png" 
                alt="Red Budget Logo" 
                className="w-full h-full object-contain"
              />
            </div>
            <h1 className="text-3xl font-display font-bold text-uofl-gray-900 mb-2">Red Budget</h1>
            <p className="text-uofl-gray-600">Manage your student finances with ease</p>
          </div>
          
          <div className="flex mb-8 bg-uofl-gray-100 rounded-xl p-1">
            <button
              type="button"
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-3 px-4 rounded-lg transition-all duration-300 font-medium ${
                isLogin 
                  ? 'bg-uofl-red text-white shadow-medium transform scale-105' 
                  : 'text-uofl-gray-600 hover:text-uofl-gray-900 hover:bg-white/50'
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-3 px-4 rounded-lg transition-all duration-300 font-medium ${
                !isLogin 
                  ? 'bg-uofl-red text-white shadow-medium transform scale-105' 
                  : 'text-uofl-gray-600 hover:text-uofl-gray-900 hover:bg-white/50'
              }`}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="studentId" className="block text-sm font-semibold text-uofl-gray-700">
                Student ID
              </label>
              <div className="relative">
                <input
                  id="studentId"
                  type="text"
                  value={studentIdInput}
                  onChange={(e) => setStudentIdInput(e.target.value)}
                  className="w-full border-2 border-uofl-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-uofl-red focus:ring-4 focus:ring-uofl-red/20 transition-all duration-300 font-mono text-lg"
                  placeholder="1234567"
                  maxLength={7}
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <span className="text-uofl-gray-400 text-sm">7 digits</span>
                </div>
              </div>
              <p className="text-xs text-uofl-gray-500">Enter your 7-digit UofL Student ID</p>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-semibold text-uofl-gray-700">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border-2 border-uofl-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-uofl-red focus:ring-4 focus:ring-uofl-red/20 transition-all duration-300"
                  placeholder="Enter your password"
                  minLength={6}
                />
              </div>
              <p className="text-xs text-uofl-gray-500">Minimum 6 characters</p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-uofl-red to-uofl-red-light hover:from-uofl-red-dark hover:to-uofl-red disabled:from-uofl-gray-400 disabled:to-uofl-gray-400 text-white rounded-xl py-4 font-semibold text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-strong disabled:scale-100 disabled:shadow-none"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Please wait...</span>
                </div>
              ) : (
                isLogin ? 'Login' : 'Create Account'
              )}
            </button>
           </form>
         </div>
       </div>
     </>
   );
 };
 
 export default LoginPage;
