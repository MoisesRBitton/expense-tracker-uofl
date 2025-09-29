const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3001/api';

interface ApiResponse {
  success: boolean;
  error?: string;
  [key: string]: any;
}

interface ExpenseData {
  amount: number;
  category: string;
  description: string;
  date: string;
  studentId: string;
}

class ApiService {
  private token: string | null;

  constructor() {
    this.token = localStorage.getItem('authToken');
  }

  setToken(token: string): void {
    this.token = token;
    localStorage.setItem('authToken', token);
  }

  clearToken(): void {
    this.token = null;
    localStorage.removeItem('authToken');
    localStorage.removeItem('studentId');
  }

  async request(endpoint: string, options: RequestInit = {}): Promise<ApiResponse> {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Auth endpoints
  async login(studentId: string, password: string): Promise<ApiResponse> {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ studentId, password }),
    });
    
    if (response.success && response.token) {
      this.setToken(response.token);
    }
    
    return response;
  }

  async register(studentId: string, password: string): Promise<ApiResponse> {
    const response = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ studentId, password }),
    });
    
    if (response.success && response.token) {
      this.setToken(response.token);
    }
    
    return response;
  }

  async verifyToken(): Promise<ApiResponse> {
    if (!this.token) {
      throw new Error('No token available');
    }
    
    return this.request('/auth/verify');
  }

  // Expense endpoints
  async getExpenses(): Promise<ApiResponse> {
    return this.request('/expenses');
  }

  async getTotalExpenses(): Promise<ApiResponse> {
    return this.request('/expenses/total');
  }

  async createExpense(expenseData: ExpenseData): Promise<ApiResponse> {
    return this.request('/expenses', {
      method: 'POST',
      body: JSON.stringify(expenseData),
    });
  }

  async updateExpense(id: number, expenseData: ExpenseData): Promise<ApiResponse> {
    return this.request(`/expenses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(expenseData),
    });
  }

  async deleteExpense(id: number): Promise<ApiResponse> {
    return this.request(`/expenses/${id}`, {
      method: 'DELETE',
    });
  }

  async syncData(): Promise<ApiResponse> {
    return this.request('/expenses/sync');
  }
}

export const apiService = new ApiService();
