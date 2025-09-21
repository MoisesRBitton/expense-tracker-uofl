# UofL Expense Tracker Backend

Backend API for the University of Louisville Expense Tracker application.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Initialize the database:
```bash
npm run init-db
```

3. Start the development server:
```bash
npm run dev
```

The server will run on http://localhost:3001

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login with student ID
- `GET /api/auth/verify` - Verify JWT token

### Expenses
- `GET /api/expenses` - Get all expenses for authenticated user
- `GET /api/expenses/total` - Get total expenses for authenticated user
- `POST /api/expenses` - Create new expense
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense
- `GET /api/expenses/sync` - Get all user data for sync

## Environment Variables

Copy `.env.example` to `.env` and configure:
- `PORT` - Server port (default: 3001)
- `JWT_SECRET` - Secret for JWT tokens
- `DB_PATH` - SQLite database file path
- `NODE_ENV` - Environment (development/production)
