# Technical Plan 001: TaskFlow Implementation

**Version:** 1.0  
**Date Created:** 2026-07-13  
**Status:** Approved for Implementation  
**Tech Stack:** Node.js, Express, SQLite, EJS, CSS

---

## 1. Executive Summary

TaskFlow is implemented as a lightweight Node.js web application designed for local development and deployment. This technical plan translates the Product Requirements Document (prd-001.md) into actionable technical decisions, architecture, and implementation milestones.

The implementation prioritizes:
- **Simplicity** - Minimal dependencies, easy to run locally
- **Security** - Password hashing, session management, CSRF protection
- **Maintainability** - Clear separation of concerns, modular design
- **Performance** - Fast page loads, efficient data persistence
- **Spec Compliance** - Every requirement maps directly to acceptance criteria

---

## 2. Architecture Overview

### 2.1 System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Browser / Client                        │
│                  (HTML, CSS, JavaScript)                    │
└────────────┬────────────────────────────────────────────────┘
             │ HTTP/HTTPS
             ↓
┌─────────────────────────────────────────────────────────────┐
│                   Express.js Server                         │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────────┐ │
│  │   Routes    │  │  Middleware  │  │  Request Handlers   │ │
│  │             │  │              │  │                     │ │
│  │ /auth       │  │ Session      │  │ Registration        │ │
│  │ /dashboard  │  │ CSRF         │  │ Authentication      │ │
│  │ /tasks      │  │ Auth Check   │  │ Task Management     │ │
│  └─────────────┘  └──────────────┘  └─────────────────────┘ │
│                           ↓                                   │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │          Service Layer / Business Logic                │ │
│  │  ┌──────────────┐  ┌──────────┐  ┌─────────────────┐   │ │
│  │  │ Auth Service │  │ Password │  │ Task Service    │   │ │
│  │  │              │  │ Hasher   │  │                 │   │ │
│  │  │ - register() │  │ (bcrypt) │  │ - create()      │   │ │
│  │  │ - login()    │  │          │  │ - getAll()      │   │ │
│  │  │ - validate() │  │          │  │ - complete()    │   │ │
│  │  └──────────────┘  └──────────┘  └─────────────────┘   │ │
│  └─────────────────────────────────────────────────────────┘ │
│                           ↓                                   │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │         Data Access Layer / Persistence                │ │
│  │  ┌──────────────────────────────────────────────────┐  │ │
│  │  │  SQLite Database (taskflow.db)                  │  │ │
│  │  │  - users table                                  │  │ │
│  │  │  - tasks table                                  │  │ │
│  │  │  - sessions table (if using persistent storage)│  │ │
│  │  └──────────────────────────────────────────────────┘  │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Technology Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Runtime** | Node.js | 22.15.0+ | JavaScript runtime |
| **Framework** | Express.js | 4.18+ | Web server and routing |
| **Template Engine** | EJS | 3.1+ | Server-side rendering |
| **Database** | SQLite3 | Latest | Local persistent storage |
| **Authentication** | bcryptjs | 2.4+ | Password hashing |
| **Session Management** | express-session | 1.17+ | Session handling |
| **Styling** | CSS3 | Native | Responsive design |
| **Environment** | dotenv | 16+ | Configuration management |

### 2.3 Deployment Model

**Local Development:**
- Node.js runs on `http://localhost:3000`
- SQLite database stored in `data/taskflow.db`
- No external dependencies beyond npm packages

**Production Ready (Future):**
- Can be deployed to Node.js hosting (Heroku, Railway, Vercel, etc.)
- Database can be upgraded to PostgreSQL
- Environment variables manage configuration

---

## 3. Database Design

### 3.1 Schema Overview

```sql
-- Users table
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tasks table
CREATE TABLE tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'open' CHECK(status IN ('open', 'completed')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Sessions table (optional, for persistent session storage)
CREATE TABLE sessions (
  sid TEXT PRIMARY KEY,
  sess TEXT NOT NULL,
  expire TIMESTAMP NOT NULL,
  UNIQUE(sid)
);

-- Index for performance
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_status ON tasks(status);
```

### 3.2 Data Relationships

```
users (1) ─── (many) tasks
  │
  └─ One user has many tasks
  └─ Tasks are deleted when user is deleted (CASCADE)
  └─ Status can only be 'open' or 'completed'
```

---

## 4. API Endpoints

### 4.1 Authentication Routes

#### Register User
```
POST /auth/register
Content-Type: application/x-www-form-urlencoded

Request:
  email: string (required, unique, valid format)
  password: string (required, min 8 chars)

Response:
  200 OK - Redirect to /auth/login with success message
  400 Bad Request - Validation errors displayed
  409 Conflict - Email already exists

Spec Mapping:
  - Requirement 7.1 (User Registration)
  - Acceptance Criteria: Register with email and password
```

#### Login User
```
POST /auth/login
Content-Type: application/x-www-form-urlencoded

Request:
  email: string (required)
  password: string (required)

Response:
  200 OK - Redirect to /dashboard with session created
  401 Unauthorized - Invalid credentials
  400 Bad Request - Missing fields

Spec Mapping:
  - Requirement 7.2 (User Login)
  - Acceptance Criteria: Login with registered credentials
```

#### Logout User
```
POST /auth/logout
Authorization: Session required

Response:
  302 Redirect to /auth/login
  Clears session, user cannot access protected routes

Spec Mapping:
  - Requirement 7.5 (Logout)
  - Acceptance Criteria: Logout securely
```

### 4.2 Dashboard Routes

#### Get Dashboard
```
GET /dashboard
Authorization: Session required

Response:
  200 OK - Render dashboard with:
    - User greeting (e.g., "Hello, john@example.com")
    - Total tasks count
    - Open tasks count
    - Completed tasks count
    - Task list filtered by status

Spec Mapping:
  - Requirement 7.3 (Dashboard)
  - Requirement 7.4 (Task Viewing)
  - Acceptance Criteria: View personalized dashboard, View all tasks
```

### 4.3 Task Routes

#### Create Task
```
POST /tasks/create
Authorization: Session required
Content-Type: application/x-www-form-urlencoded

Request:
  title: string (required, not empty)
  description: string (optional)

Response:
  200 OK - Redirect to /dashboard with success message
  400 Bad Request - Validation errors
  401 Unauthorized - Not authenticated

Spec Mapping:
  - Requirement 7.4 (Task Creation)
  - Acceptance Criteria: Create task with title and description
```

#### Mark Task Complete
```
POST /tasks/:id/complete
Authorization: Session required

Response:
  200 OK - JSON: { success: true, task }
  404 Not Found - Task not found
  401 Unauthorized - Not task owner or not authenticated

Spec Mapping:
  - Requirement 7.4 (Task Completion)
  - Acceptance Criteria: Mark task as completed, See updated counts
```

#### Get Tasks (JSON API)
```
GET /api/tasks
Authorization: Session required

Query Parameters:
  status: 'open' | 'completed' | 'all' (default: 'all')

Response:
  200 OK - JSON array of tasks for current user
  401 Unauthorized - Not authenticated

Spec Mapping:
  - Requirement 7.4 (Task Viewing)
```

---

## 5. Project Structure

```
sdd-meetup-demo/
│
├── data/
│   └── taskflow.db              # SQLite database (generated on first run)
│
├── public/
│   ├── css/
│   │   └── style.css            # Responsive styling
│   └── js/
│       └── app.js               # Client-side JavaScript (minimal)
│
├── views/
│   ├── layouts/
│   │   └── main.ejs             # Main layout template
│   ├── auth/
│   │   ├── register.ejs         # Registration form
│   │   └── login.ejs            # Login form
│   ├── dashboard/
│   │   └── index.ejs            # Dashboard with task stats
│   └── tasks/
│       ├── list.ejs             # Task list view
│       └── create.ejs           # Task creation form
│
├── src/
│   ├── db.js                    # Database initialization and utilities
│   ├── middleware/
│   │   ├── auth.js              # Authentication middleware
│   │   └── errorHandler.js      # Error handling middleware
│   ├── routes/
│   │   ├── auth.js              # Authentication routes (/auth/*)
│   │   ├── dashboard.js         # Dashboard routes (/dashboard)
│   │   └── tasks.js             # Task routes (/tasks/*, /api/tasks)
│   ├── services/
│   │   ├── authService.js       # Business logic for authentication
│   │   ├── taskService.js       # Business logic for tasks
│   │   └── passwordService.js   # Password hashing/validation
│   ├── utils/
│   │   ├── validation.js        # Input validation rules
│   │   └── helpers.js           # Helper functions
│   └── app.js                   # Express app configuration
│
├── .env.example                 # Environment variables template
├── .gitignore                   # Git ignore rules
├── package.json                 # Dependencies and scripts
├── server.js                    # Entry point
│
├── specs/
│   └── prd-001.md              # Product Requirements Document
│
├── tech-plans/
│   └── tech-plan-001.md        # This file
│
├── CONVENTIONS.md              # SDD conventions and guidelines
└── README.md                   # Project README
```

---

## 6. Implementation Milestones

### Milestone 1: Foundation Setup (Days 1-2)
**Objective:** Create project structure, database setup, dependencies

**Tasks:**
- [ ] Initialize Node.js project with `npm init`
- [ ] Install core dependencies: express, sqlite3, bcryptjs, express-session, ejs, dotenv
- [ ] Create project directory structure
- [ ] Implement database initialization (`src/db.js`)
- [ ] Create `.env` and `.env.example` for configuration
- [ ] Setup Express app skeleton (`src/app.js`)
- [ ] Create entry point (`server.js`)

**Success Criteria:**
- Project runs without errors: `npm start`
- Database initializes on first run
- Server listens on port 3000

**Spec Mapping:**
- Establishes foundation for all features
- Enables local development environment

---

### Milestone 2: Authentication System (Days 3-5)
**Objective:** Implement user registration and login

**Tasks:**
- [ ] Create `users` table schema
- [ ] Implement `authService.js`:
  - `register(email, password)` - Creates new user
  - `login(email, password)` - Validates credentials
  - `validateEmail(email)` - Email format and uniqueness
  - `validatePassword(password)` - Min 8 chars, not empty
- [ ] Implement `passwordService.js`:
  - `hashPassword(password)` - Uses bcryptjs
  - `comparePassword(plain, hash)` - Compares passwords
- [ ] Create authentication middleware (`src/middleware/auth.js`)
- [ ] Create auth routes (`src/routes/auth.js`):
  - `GET /auth/register` - Show registration form
  - `POST /auth/register` - Process registration
  - `GET /auth/login` - Show login form
  - `POST /auth/login` - Process login
- [ ] Create EJS templates:
  - `views/auth/register.ejs` - Registration form
  - `views/auth/login.ejs` - Login form
- [ ] Configure express-session for session management
- [ ] Add CSRF protection (if using cookies-based sessions)

**Success Criteria:**
- User can register with email and password
- Invalid emails are rejected
- Passwords < 8 chars are rejected
- Duplicate emails are rejected
- User can login with registered credentials
- Invalid credentials show error message
- Session persists across requests

**Spec Mapping:**
- Requirement 7.1: User Registration
- Requirement 7.2: User Authentication
- Acceptance Criteria: Register, Login, Re-login sees data

---

### Milestone 3: Dashboard Implementation (Days 6-7)
**Objective:** Create dashboard with task statistics

**Tasks:**
- [ ] Create dashboard route (`GET /dashboard`)
- [ ] Implement dashboard view logic:
  - Fetch user info from session
  - Get total tasks count
  - Get open tasks count
  - Get completed tasks count
- [ ] Create `views/dashboard/index.ejs` template with:
  - Personalized greeting (e.g., "Hello, john@example.com")
  - Task statistics cards
  - Task list display area
  - Quick action buttons
- [ ] Style dashboard for responsiveness
- [ ] Add logout button with `POST /auth/logout` route

**Success Criteria:**
- Dashboard loads within 2 seconds (Performance requirement)
- Greeting shows user email
- Task counts are accurate
- Statistics update when tasks change
- Mobile-friendly layout
- Can logout and return to login

**Spec Mapping:**
- Requirement 7.3: Dashboard
- Non-Functional: Responsive Design, Performance
- Acceptance Criteria: View dashboard with summary

---

### Milestone 4: Task Management (Days 8-10)
**Objective:** Implement task creation, viewing, and completion

**Tasks:**
- [ ] Create `tasks` table schema
- [ ] Implement `taskService.js`:
  - `create(userId, title, description)` - Creates new task
  - `getAll(userId)` - Gets all user tasks
  - `getByStatus(userId, status)` - Gets tasks by status
  - `complete(taskId, userId)` - Marks task as completed
  - `getStats(userId)` - Returns task statistics
- [ ] Create task routes (`src/routes/tasks.js`):
  - `GET /tasks/create` - Show task creation form
  - `POST /tasks/create` - Process task creation
  - `POST /tasks/:id/complete` - Mark task complete
  - `GET /api/tasks` - JSON API for task list
- [ ] Create EJS templates:
  - `views/tasks/create.ejs` - Task creation form
  - `views/tasks/list.ejs` - Task list with status filters
- [ ] Add form validation:
  - Title required, not empty
  - Description optional
- [ ] Update dashboard to show task list

**Success Criteria:**
- User can create task with title only
- User can create task with title and description
- Empty titles are rejected with error
- Tasks appear in task list immediately
- Can mark task as completed
- Completed tasks show with visual distinction
- Dashboard statistics update immediately
- Task list shows all user's tasks

**Spec Mapping:**
- Requirement 7.4: Task Creation, Viewing, Completion
- Non-Functional: Real-time updates
- Acceptance Criteria: Create, View, Complete tasks, See updated counts

---

### Milestone 5: Styling & Responsiveness (Days 11-12)
**Objective:** Polish UI for desktop, tablet, and mobile

**Tasks:**
- [ ] Create `public/css/style.css` with:
  - Responsive layout (mobile-first)
  - Form styling and validation states
  - Dashboard card layout
  - Task list styling
  - Button states and interactions
- [ ] Implement media queries:
  - Mobile: < 640px
  - Tablet: 640px - 1024px
  - Desktop: > 1024px
- [ ] Add touch-friendly elements:
  - Larger tap targets (48px minimum)
  - Appropriate spacing
- [ ] Test responsiveness on different screen sizes

**Success Criteria:**
- Application works on desktop, tablet, mobile
- Touch targets are accessible (min 48px)
- Forms are readable on all screen sizes
- Page load time < 2 seconds
- No horizontal scrolling on mobile

**Spec Mapping:**
- Non-Functional: Responsive Design, Mobile-Friendly
- Acceptance Criteria: Works on desktop, tablet, mobile

---

### Milestone 6: Security Hardening (Days 13-14)
**Objective:** Implement security best practices

**Tasks:**
- [ ] Implement password hashing with bcryptjs
- [ ] Add CSRF protection
- [ ] Implement input validation and sanitization
- [ ] Add rate limiting for login attempts (future consideration)
- [ ] Implement secure session handling
- [ ] Add HTTP headers (helmet.js optional)
- [ ] Ensure HTTPS headers for production mode
- [ ] Validate all user inputs before database operations

**Success Criteria:**
- Passwords are never stored in plaintext
- Session data is secure
- Input validation prevents injection attacks
- CSRF tokens protect forms
- Authentication flow is secure

**Spec Mapping:**
- Non-Functional: Security
- Acceptance Criteria: Zero critical bugs in auth flow

---

### Milestone 7: Testing & Validation (Days 15-16)
**Objective:** Create tests and validate against spec

**Tasks:**
- [ ] Create unit tests for services:
  - Auth service tests
  - Task service tests
  - Password service tests
- [ ] Create integration tests:
  - Registration flow
  - Login flow
  - Task creation flow
  - Task completion flow
  - Logout flow
- [ ] Create test data seeding script
- [ ] Validate all acceptance criteria from spec
- [ ] Performance testing (page load times)
- [ ] Cross-browser testing
- [ ] Mobile device testing

**Success Criteria:**
- All unit tests pass
- All integration tests pass
- All acceptance criteria validated
- Page load times < 2 seconds
- Works on Chrome, Firefox, Safari
- Mobile testing confirms responsiveness

**Spec Mapping:**
- All Acceptance Criteria items
- All Success Criteria items
- Non-Functional Requirements validation

---

### Milestone 8: Documentation & Finalization (Days 17-18)
**Objective:** Complete documentation and prepare for deployment

**Tasks:**
- [ ] Update README with setup instructions
- [ ] Create SETUP.md with detailed installation steps
- [ ] Create API.md with endpoint documentation
- [ ] Add code comments and JSDoc
- [ ] Create DEPLOYMENT.md for production setup
- [ ] Create TROUBLESHOOTING.md for common issues
- [ ] Finalize package.json with proper scripts
- [ ] Update .env.example with all variables
- [ ] Create CHANGELOG.md for version tracking

**Success Criteria:**
- New developers can setup locally within 10 minutes
- All APIs are documented
- Code is well-commented
- Deployment guide is clear
- Package.json has proper npm scripts

**Spec Mapping:**
- Enables others to understand and extend the project
- Supports SDD documentation practices

---

## 7. Development Environment Setup

### 7.1 Prerequisites

- Node.js 22.15.0+ (as provided)
- npm 10.8.0+ (included with Node.js)
- Git (for version control)
- Text editor (VS Code recommended)

### 7.2 Local Setup Instructions

```bash
# 1. Clone repository (if not already cloned)
git clone https://github.com/orwanec/sdd-meetup-demo.git
cd sdd-meetup-demo

# 2. Install dependencies
npm install

# 3. Setup environment
cp .env.example .env

# 4. Initialize database (runs on first server start)
npm start

# Application will be available at http://localhost:3000
```

### 7.3 Environment Variables (.env)

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Session Configuration
SESSION_SECRET=your-secret-key-change-in-production
SESSION_TIMEOUT=3600000  # 1 hour in milliseconds

# Database Configuration
DB_PATH=./data/taskflow.db

# CORS (if needed in future)
CORS_ORIGIN=http://localhost:3000
```

### 7.4 Development Scripts

```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "jest",
    "test:watch": "jest --watch",
    "seed": "node scripts/seed.js",
    "lint": "eslint src/ --fix"
  }
}
```

---

## 8. Deployment Strategy

### 8.1 Development Deployment

**What:** Local machine running Node.js  
**How:** `npm start`  
**Database:** SQLite (local file)

### 8.2 Production Deployment (Future)

**Options:**
1. **Railway** - Simple deployment with environment variables
2. **Heroku** - Classic Node.js hosting (Procfile required)
3. **Vercel** - Serverless option (API routes)
4. **Self-hosted** - VPS with Node.js and nginx reverse proxy

**Database Upgrades:**
- Development: SQLite
- Production: PostgreSQL or MySQL

---

## 9. Testing Strategy

### 9.1 Unit Tests

**Coverage:**
- Authentication service (register, login, validation)
- Password service (hash, compare)
- Task service (CRUD operations, filtering)

**Tools:** Jest, Supertest (for API testing)

### 9.2 Integration Tests

**Scenarios:**
- Complete registration flow
- Complete login flow
- Create and complete task
- Task persistence across sessions

**Tools:** Jest, Supertest

### 9.3 End-to-End Tests (Future)

**Scenarios:**
- New user journey (spec section 6.1)
- Returning user workflow (spec section 6.2)

**Tools:** Cypress, Playwright (future enhancement)

---

## 10. Monitoring & Logging

### 10.1 Development Logging

- Console output for errors and info
- Structured logging for debugging

### 10.2 Production Logging (Future)

- File-based logging
- Log rotation
- Error tracking (Sentry, Rollbar)

---

## 11. Performance Targets

| Metric | Target | Verification |
|--------|--------|--------------|
| Page Load (Dashboard) | < 2 seconds | Lighthouse, Dev Tools |
| Task Creation | < 500ms | API timing |
| Task Completion | < 300ms | API timing |
| Registration | < 800ms | API timing (includes bcrypt) |
| Login | < 600ms | API timing (includes password check) |
| Database Queries | < 100ms | SQLite query timing |

---

## 12. Security Considerations

### 12.1 Authentication

- ✅ Passwords hashed with bcryptjs (salted)
- ✅ Session-based authentication
- ✅ CSRF protection on forms
- ✅ Input validation on all endpoints

### 12.2 Data Protection

- ✅ SQLite database encrypted (file permissions)
- ✅ No sensitive data in logs
- ✅ Foreign key constraints for referential integrity
- ✅ Automatic cleanup of related data (CASCADE delete)

### 12.3 Future Enhancements

- [ ] HTTPS/TLS in production
- [ ] Rate limiting on auth endpoints
- [ ] Email verification
- [ ] Password reset with token validation
- [ ] Audit logging
- [ ] Two-factor authentication

---

## 13. Maintenance & Support

### 13.1 Dependency Management

- Review dependencies quarterly
- Keep Node.js and npm updated
- Use `npm audit` for security vulnerabilities

### 13.2 Database Maintenance

- Backup database regularly
- Monitor database size
- Cleanup old sessions periodically

### 13.3 Monitoring

- Track error rates
- Monitor performance metrics
- User feedback collection

---

## 14. Rollback & Contingency

### 14.1 Version Control

- Use semantic versioning (1.0.0, 1.1.0, etc.)
- Tag releases in Git
- Maintain CHANGELOG.md

### 14.2 Database Rollback

- Backup before schema changes
- Test migrations in development first
- Keep backup of data/taskflow.db

---

## 15. Traceability Matrix

Maps technical plan to product specification:

| PRD Section | Requirement | Technical Implementation | Milestone |
|------------|-------------|------------------------|-----------|
| 7.1 | User Registration | authService.register() | MS-2 |
| 7.2 | User Login | authService.login() | MS-2 |
| 7.3 | Dashboard | GET /dashboard | MS-3 |
| 7.4 | Task Creation | POST /tasks/create | MS-4 |
| 7.4 | Task Viewing | GET /dashboard, /api/tasks | MS-4 |
| 7.4 | Task Completion | POST /tasks/:id/complete | MS-4 |
| 7.5 | Logout | POST /auth/logout | MS-2 |
| Non-Functional | Responsive Design | CSS media queries | MS-5 |
| Non-Functional | Performance | Optimized queries, caching | MS-5 |
| Non-Functional | Security | bcryptjs, session, CSRF | MS-6 |
| Success Criteria | All workflows < 2 min | UI/UX design | MS-5 |

---

## 16. Resource Allocation

### 16.1 Team Structure (Solo Development)

**Role:** Full-stack developer  
**Responsibilities:** All tasks  
**Time Estimate:** 18 days (concurrent work possible)

### 16.2 Estimated Timeline

```
Week 1:
  Days 1-2: Foundation Setup
  Days 3-5: Authentication System
  Days 6-7: Dashboard

Week 2:
  Days 8-10: Task Management
  Days 11-12: Styling & Responsiveness
  Days 13-14: Security Hardening

Week 3:
  Days 15-16: Testing & Validation
  Days 17-18: Documentation & Finalization
```

---

## 17. Approval & Sign-Off

| Role | Name | Date | Status | Signature |
|------|------|------|--------|-----------|
| Technical Lead | [Name] | [Date] | Pending | |
| Architect | [Name] | [Date] | Pending | |
| Security Review | [Name] | [Date] | Pending | |

---

## 18. Appendix

### A. Technology Justification

**Why Express.js?**
- Lightweight and minimal
- Large community and ecosystem
- Perfect for learning and simple applications
- Easy to deploy

**Why SQLite?**
- No external database server needed
- Perfect for local development
- Simple setup (zero configuration)
- Can migrate to PostgreSQL later

**Why EJS?**
- Simple template syntax
- Server-side rendering
- Easy to learn
- Good for this use case

**Why bcryptjs?**
- Industry standard for password hashing
- Salting built-in
- Timing-attack resistant

### B. Future Enhancements

**Phase 2 Technical Requirements:**
- Email verification (nodemailer)
- Password reset (token-based)
- Task editing (UPDATE operation)
- Task deletion (DELETE operation)

**Phase 3 & Beyond:**
- WebSocket for real-time updates
- Search functionality with full-text search
- Task categorization (new table + relationships)
- File uploads (multer)
- Mobile app (React Native or Flutter)

### C. Dependencies Reference

```json
{
  "express": "^4.18.2",
  "sqlite3": "^5.1.6",
  "bcryptjs": "^2.4.3",
  "express-session": "^1.17.3",
  "ejs": "^3.1.9",
  "dotenv": "^16.0.3",
  "helmet": "^7.0.0",
  "express-validator": "^7.0.0"
}
```

### D. Document History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-07-13 | Initial technical plan for TaskFlow MVP with Node.js stack |

---

## End of Technical Plan

**Next Step:** Implementation Phase begins with Milestone 1 (Foundation Setup)

**Important:** This technical plan should be reviewed and approved before implementation begins. Each milestone should be completed, tested, and validated against the specification before moving to the next milestone.
