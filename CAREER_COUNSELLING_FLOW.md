# Career Counselling Web Application - Complete Flow & File Structure

## 📁 Project Structure Overview

### Backend Files (`/backend/`)

#### Core Server Files

- **`server.js`** - Main Express server with middleware, routes, and database connection
- **`package.json`** - Backend dependencies (Express, MongoDB, jsPDF, xlsx, etc.)

#### API Routes (`/backend/routes/`)

- **`auth.js`** - User registration, OTP verification, profile updates
- **`test.js`** - Psychometric test questions, submission, results retrieval
- **`report.js`** - Career guidance reports, scholarship options, college recommendations
- **`portfolio.js`** - Portfolio data fetching and PDF generation
- **`export.js`** - Excel file generation and export functionality

#### Utility Services (`/backend/utils/`)

- **`db.js`** - MongoDB connection with in-memory fallback
- **`testService.js`** - Psychometric assessment logic (RIASEC, Multiple Intelligence, EI)
- **`reportService.js`** - Career report generation, scholarship filtering, college recommendations
- **`pdfGenerator.js`** - PDF creation for portfolios and reports
- **`excelGenerator.js`** - Excel file generation for data export
- **`otpService.js`** - OTP generation and validation logic

#### Data Files (`/backend/data/`)

- **`scholarships.js`** - Scholarship database with eligibility criteria

### Frontend Files (`/frontend/`)

#### Core Application Files

- **`App.tsx`** - Main React app with routing (Chat, Profile, Portfolio, Downloads, Extras, Research)
- **`index.tsx`** - React app entry point
- **`index.css`** - Global styles and CSS variables
- **`package.json`** - Frontend dependencies (React, TypeScript, Bootstrap, etc.)

#### Pages (`/frontend/src/pages/`)

- **`ChatPage.tsx`** - Main conversational interface with multi-stage user flow
- **`ProfilePage.tsx`** - Career report display with scholarships and college recommendations
- **`PortfolioPage.tsx`** - Personal portfolio view with assessment results
- **`DownloadsPage.tsx`** - File download management interface
- **`ExtrasPage.tsx`** - Additional features and tools
- **`ResearchPage.tsx`** - Research paper submission interface

#### Components (`/frontend/src/components/`)

- **`ChatBubble.tsx`** - Chat message component with options and input handling
- **`InputField.tsx`** - Text input component for user responses
- **`ReportCard.tsx`** - Career report display component

#### Services (`/frontend/src/services/`)

- **`api.ts`** - API service layer with all backend communication methods

## 🔄 Complete Application Flow

### 1. User Journey

```
Landing → Registration → Profile Collection → Authentication → Assessment → Results → Portfolio
```

### 2. Technical Flow

```
Frontend (React) ↔ API Calls ↔ Backend (Express) ↔ Database (MongoDB/Memory)
```

### 3. Data Flow

```
User Input → State Management → API Service → Backend Routes → Business Logic → Database → Response → UI Update
```

## 🛠️ Key Features by File

### Authentication Flow

- **`auth.js`** - Handles user registration, OTP generation, verification
- **`otpService.js`** - OTP logic and validation
- **`ChatPage.tsx`** - User registration interface

### Assessment System

- **`testService.js`** - Psychometric questions and scoring algorithm
- **`test.js`** - Test API endpoints
- **`ChatPage.tsx`** - Test interface and question flow

### Report Generation

- **`reportService.js`** - Career guidance logic, scholarship filtering
- **`report.js`** - Report API endpoints
- **`ProfilePage.tsx`** - Report display interface

### Portfolio Management

- **`portfolio.js`** - Portfolio data and PDF generation
- **`pdfGenerator.js`** - PDF creation logic
- **`PortfolioPage.tsx`** - Portfolio display interface

### Data Export

- **`export.js`** - Excel export endpoints
- **`excelGenerator.js`** - Excel generation logic
- **`DownloadsPage.tsx`** - Download management

## 📊 Data Storage Strategy

### In-Memory Storage (Primary)

- **`server.js`** - `global.userData` and `global.testResponses` maps
- **Fast access** for development and testing

### MongoDB Storage (Secondary)

- **`db.js`** - Database connection with fallback
- **Collections**: `users`, `testResponses`
- **Persistent storage** for production

## 🎯 Assessment Categories

### Question Types (in `testService.js`)

1. **RIASEC Model** - 6 personality types
2. **Multiple Intelligences** - 8 intelligence types
3. **Emotional Intelligence** - 5 EI components
4. **Legacy Questions** - General career preferences

### Scoring System

- **Likert Scale**: 1-5 rating system
- **Category Aggregation**: Score calculation by domain
- **Career Suggestions**: Domain-based recommendations

## 🔧 API Endpoints Summary

### Authentication (`/api/auth/`)

- `POST /register` - User registration
- `POST /verify-otp` - OTP verification
- `POST /update-profile` - Profile updates

### Testing (`/api/test/`)

- `GET /questions` - Fetch assessment questions
- `POST /submit` - Submit test answers
- `GET /results/:userId` - Get test results

### Reports (`/api/report/`)

- `GET /career-guidance/:userId` - Generate career report
- `GET /scholarships/:userId` - Get scholarship options

### Portfolio (`/api/portfolio/`)

- `GET /data/:userId` - Get portfolio data
- `GET /generate/:userId` - Generate PDF

### Export (`/api/export/`)

- `GET /excel/:userId` - Generate Excel file

## 🎨 UI Components Overview

### Main Pages

- **ChatPage** - Conversational interface with state management
- **ProfilePage** - Career report with recommendations
- **PortfolioPage** - Personal portfolio display
- **DownloadsPage** - File management
- **ExtrasPage** - Additional features
- **ResearchPage** - Research submission

### Reusable Components

- **ChatBubble** - Message display with options
- **InputField** - Text input handling
- **ReportCard** - Report visualization

## 🔒 Security & Performance

### Security Features

- **OTP Authentication** - Phone-based verification
- **Input Validation** - Data sanitization
- **CORS Configuration** - Cross-origin security

### Performance Optimizations

- **In-Memory Storage** - Fast data access
- **Component Lazy Loading** - Optimized rendering
- **API Caching** - Reduced server calls

## 📝 Future Editing Guidelines

### Backend Modifications

- **Routes**: Add new endpoints in respective route files
- **Services**: Business logic in `/utils/` directory
- **Database**: Modify connection logic in `db.js`

### Frontend Modifications

- **Pages**: Add new pages in `/pages/` directory
- **Components**: Reusable components in `/components/`
- **API**: Update service methods in `api.ts`

### Data Flow Changes

- **Assessment**: Modify questions in `testService.js`
- **Reports**: Update logic in `reportService.js`
- **UI**: Update components and pages as needed

## 🚀 Deployment Considerations

### Environment Setup

- **Database**: MongoDB connection string
- **OTP Service**: SMS/Email service configuration
- **File Storage**: PDF/Excel generation settings

### Production Requirements

- **MongoDB**: Persistent database storage
- **OTP Service**: Real SMS/Email integration
- **Security**: HTTPS, input validation, rate limiting

---

_This documentation provides a complete overview of the Career Counselling Web Application structure and flow for future development and maintenance._
