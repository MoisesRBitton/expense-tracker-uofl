# UofL Expense Tracker - Setup Instructions

## Environment Configuration

### Frontend Setup

1. **Copy the environment file:**
   ```bash
   cp env.example .env
   ```

2. **Configure frontend environment variables in `.env`:**
   ```env
   # Frontend Environment Variables
   VITE_API_URL=http://localhost:3001/api
   VITE_NODE_ENV=development
   ```

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Copy the environment file:**
   ```bash
   cp env.example .env
   ```

3. **Configure backend environment variables in `backend/.env`:**
   ```env
   # Backend Environment Variables
   PORT=3001
   NODE_ENV=development
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   DB_PATH=./database/expense_tracker.db
   ```

   **Important:** Change the `JWT_SECRET` to a strong, random secret in production!

## Installation & Running

### 1. Install Frontend Dependencies
```bash
npm install
```

### 2. Install Backend Dependencies
```bash
cd backend
npm install
```

### 3. Initialize Database
```bash
cd backend
npm run init-db
```

### 4. Start Backend Server
```bash
cd backend
npm run dev
```

### 5. Start Frontend Development Server
```bash
npm run dev
```

The application will be available at:
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3001

## New Features Added

### ✅ Expense Editing Functionality

**What was implemented:**
1. **Updated AddExpenseModal** - Now supports both adding new expenses and editing existing ones
2. **Enhanced Zustand Store** - Added `updateExpense` method with offline/online sync support
3. **Dashboard Integration** - Added edit buttons to each expense item (appear on hover)
4. **TypeScript Support** - Converted API service to TypeScript with proper type definitions
5. **Environment Configuration** - Created example .env files for easy setup

**How to use:**
- **Add new expense:** Click the floating "+" button
- **Edit existing expense:** Hover over any expense item and click the edit icon (pencil)
- **Receipt OCR:** Upload a receipt to auto-populate expense fields

**Key Features:**
- ✅ Full CRUD operations (Create, Read, Update, Delete)
- ✅ Offline-first architecture with sync when online
- ✅ Form validation and error handling
- ✅ Modern UI with hover effects and animations
- ✅ TypeScript type safety throughout

## Development Notes

- The app uses an offline-first approach - data is stored locally and synced with the backend when online
- All expense operations work offline and sync when connection is restored
- JWT tokens are used for authentication with 7-day expiration
- Student IDs must be exactly 7 digits (UofL format)
- Passwords must be at least 6 characters

## Production Deployment

For production deployment:
1. Update environment variables with production URLs
2. Use a strong, random JWT_SECRET
3. Configure CORS origins for your frontend domain
4. Set NODE_ENV=production
5. Build frontend with `npm run build`
