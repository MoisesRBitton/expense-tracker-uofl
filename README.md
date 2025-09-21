# UofL Expense Tracker

A modern, full-stack web application designed to help University of Louisville students manage their personal expenses with ease. Built with React, TypeScript, Node.js, and SQLite.

## 🎯 Project Overview

The UofL Expense Tracker is a comprehensive financial management tool specifically designed for University of Louisville students. It provides an intuitive interface for tracking expenses, managing budgets, and gaining insights into spending habits.

### Key Features

- **🔐 Secure Authentication**: Student ID and password-based login/registration
- **💰 Expense Management**: Add, edit, and delete expenses with categories
- **📊 Budget Tracking**: Monitor spending with visual summaries
- **📱 Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **☁️ Cloud Storage**: Data synced across devices with offline capability
- **📄 OCR Receipt Scanning**: Upload receipts for automatic data extraction
- **🔔 Smart Notifications**: Alerts when spending exceeds thresholds

## 🏗️ Architecture

### Frontend (React + TypeScript)
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and building
- **Styling**: TailwindCSS with custom UofL theme
- **State Management**: Zustand for global state
- **Local Storage**: Dexie.js (IndexedDB) for offline data
- **Routing**: React Router DOM
- **UI Components**: Custom components with modern design
- **OCR**: Tesseract.js for receipt text extraction

### Backend (Node.js + Express)
- **Runtime**: Node.js with Express.js
- **Database**: SQLite for data persistence
- **Authentication**: JWT tokens with bcrypt password hashing
- **Security**: CORS, Helmet, Rate limiting
- **API**: RESTful API design

### Data Flow
1. **Login**: User authenticates with student ID and password
2. **Sync**: Frontend syncs with backend to get latest data
3. **Offline**: Data stored locally in IndexedDB for offline access
4. **Real-time**: Changes sync to backend when online

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn package manager
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd expense-tracker-uofl
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

4. **Set up environment variables**
   ```bash
   # Frontend (.env)
   VITE_API_BASE_URL=http://localhost:3001/api
   
   # Backend (.env)
   JWT_SECRET=your-secret-key
   PORT=3001
   ```

5. **Initialize the database**
   ```bash
   cd backend
   node scripts/init-db.js
   ```

### Running the Application

1. **Start the backend server**
   ```bash
   cd backend
   npm start
   ```

2. **Start the frontend development server**
   ```bash
   npm run dev
   ```

3. **Open your browser**
   Navigate to `http://localhost:5173`

## 📁 Project Structure

```
expense-tracker-uofl/
├── src/                          # Frontend source code
│   ├── components/               # Reusable UI components
│   │   ├── AddExpenseModal.tsx   # Expense creation modal
│   │   └── ReceiptUpload.tsx     # OCR receipt upload
│   ├── pages/                    # Main application pages
│   │   ├── LoginPage.tsx         # Authentication page
│   │   └── Dashboard.tsx         # Main dashboard
│   ├── store/                    # State management
│   │   └── useExpensesStore.ts   # Zustand store
│   ├── services/                 # API services
│   │   └── api.js               # Backend communication
│   ├── db/                      # Database configuration
│   │   └── db.ts                # Dexie IndexedDB setup
│   └── App.tsx                   # Main application component
├── backend/                      # Backend source code
│   ├── models/                   # Database models
│   ├── routes/                   # API routes
│   ├── database/                 # Database schema
│   └── server.js                 # Express server
├── public/                       # Static assets
└── README.md                     # Project documentation
```

## 🎨 Design System

### Color Palette
- **Primary Red**: #AD0000 (UofL Red)
- **Secondary Red**: #C41E3A (UofL Red Light)
- **Dark Red**: #8B0000 (UofL Red Dark)
- **Black**: #000000 (UofL Black)
- **White**: #FFFFFF (UofL White)
- **Gold**: #FFD700 (UofL Gold)

### Typography
- **Headings**: Poppins (Display font)
- **Body**: Inter (Sans-serif)

### Components
- **Cards**: Rounded corners with soft shadows
- **Buttons**: Gradient backgrounds with hover effects
- **Forms**: Clean inputs with focus states
- **Modals**: Backdrop blur with smooth animations

## 🔧 Development

### Available Scripts

#### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

#### Backend
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon

### Code Standards

- **TypeScript**: Strict mode enabled
- **ESLint**: Configured for React and TypeScript
- **Prettier**: Code formatting
- **Comments**: JSDoc style documentation
- **Naming**: camelCase for variables, PascalCase for components

## 🧪 Testing

### Manual Testing Checklist

- [ ] User registration with valid student ID
- [ ] User login with correct credentials
- [ ] Add new expense with all fields
- [ ] Edit existing expense
- [ ] Delete expense
- [ ] Receipt upload and OCR processing
- [ ] Offline functionality
- [ ] Data synchronization
- [ ] Responsive design on mobile
- [ ] Error handling and validation

## 🚀 Deployment

### Frontend (Vercel)
1. Connect GitHub repository to Vercel
2. Configure build settings:
   - Build Command: `npm run build`
   - Output Directory: `dist`
3. Set environment variables
4. Deploy

### Backend (Railway/Heroku)
1. Connect GitHub repository
2. Set environment variables
3. Configure database
4. Deploy

## 📊 Features Implementation

### Core Requirements ✅
- [x] **Basic Functionality**: Complete expense management system
- [x] **Modular Design**: Clean separation of concerns
- [x] **Clean Code**: Well-structured with meaningful names
- [x] **User Interface**: Functional and user-friendly
- [x] **Comments**: Comprehensive documentation

### Optional Features ✅
- [x] **Enhanced UI**: Responsive design with animations
- [x] **Advanced Features**: OCR integration, offline support
- [x] **Mobile-Friendly**: Responsive design
- [x] **Modern Design**: Glassmorphism, gradients, animations

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 👥 Team

- **Frontend Development**: React + TypeScript implementation
- **Backend Development**: Node.js + Express API
- **UI/UX Design**: Modern, responsive interface
- **Database Design**: SQLite schema and IndexedDB integration

## 📞 Support

For support or questions, please contact the development team or create an issue in the repository.

---

**Built with ❤️ for University of Louisville Students**
