# 🎓 acadify - Academic Intelligence Platform

**Frontend Application** - Premium, Modern, Production-Ready

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Backend API running on `http://localhost:8080`

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The app will open at `http://localhost:3000`

---

## 📁 Project Structure

```
acadify-frontend/
│
├── src/
│   ├── theme/              # Design system (colors, typography, motion)
│   ├── canvas/             # 3D particle scene (Three.js)
│   ├── components/
│   │   ├── ui/            # Reusable UI components
│   │   └── layout/        # Layout components (Sidebar, Topbar)
│   ├── pages/             # Page components
│   │   ├── dashboard/     # Role-based dashboards
│   │   ├── Landing.jsx
│   │   ├── Login.jsx
│   │   └── Signup.jsx
│   ├── auth/              # Authentication logic
│   ├── api/               # Backend API calls
│   ├── App.jsx            # Main app with routing
│   └── main.jsx           # Entry point
│
├── tailwind.config.js     # Tailwind theme configuration
└── package.json
```

---

## 🎨 Design System

### Brand Identity
- **Name**: acadify (lowercase, intentional)
- **Personality**: Intelligent, Calm, Premium, Trustworthy
- **Feel**: "Quietly powerful"

### Color Palette
```js
Base Dark:      #0b1020
Secondary Dark: #0f172a
Primary Blue:   #4f9cff (Trust & Intelligence)
Secondary:      #7c7cff (Innovation)
Success:        #22c55e
Error:          #ef4444
```

### Typography
- **Display Font**: Satoshi (brand name, headings)
- **UI Font**: Inter (everything else)
- **Weights**: 400 (normal), 500 (medium), 600 (semibold)
- **Rule**: Maximum 3 weights, 2 fonts only

### Motion Philosophy
- **Timing**: 0.3s - 0.6s only
- **Style**: Slow & smooth
- **When**: Motion only where it adds meaning
- **Effects**: Fade-in, subtle scale, glow on hover, lift on cards

---

## 🏗️ Architecture

### Data Flow
```
React UI
   ↓
Axios API Layer
   ↓
Java Backend (Spring Boot)
   ↓
PostgreSQL + Python Analytics
```

### Key Principles
1. **Frontend NEVER talks to database directly**
2. **Session-based authentication** (HTTP cookies, no localStorage)
3. **Role-based access control** enforced at both frontend & backend
4. **Canvas only on auth pages** (Landing, Login, Signup)
5. **Dashboards = pure React** (no 3D, performance first)

---

## 🔐 Authentication Flow

### Session Management
```js
// Login
POST /auth/login
→ Backend creates session
→ Session ID stored in HTTP-only cookie
→ Frontend auto-sends cookie on every request

// Session Check
GET /auth/me
→ Backend validates session
→ Returns user data { id, role, name, email }

// Logout
POST /auth/logout
→ Backend destroys session
```

### Protected Routes
```jsx
<AuthGuard allowedRoles={['STUDENT']}>
  <StudentDashboard />
</AuthGuard>
```

---

## 📡 API Integration

### File Structure
```
src/
├── axios.js          # Axios config with session cookies
├── auth.api.js       # Login, signup, logout, session check
└── dashboard.api.js  # Role-specific data endpoints
```

### Example Usage
```jsx
import { dashboardAPI } from '../dashboard.api';

// Student dashboard
const data = await dashboardAPI.student.getOverview();

// Teacher dashboard
const classes = await dashboardAPI.teacher.getClasses();

// Admin dashboard
const users = await dashboardAPI.admin.getUsers();
```

---

## 🎯 Feature Breakdown

### 3D Canvas (Auth Pages Only)
- **Technology**: React Three Fiber + Three.js
- **Theme**: Abstract particle field (blue → purple glow)
- **Performance**: Capped at 60fps, max 3000 particles
- **Interaction**: Subtle mouse tracking
- **Pages**: Landing, Login, Signup

### Dashboards (No 3D)
- **Student**: Marks, Attendance, AI Analytics
- **Teacher**: Classes, Students, Grade Management
- **Admin**: User Management, System Analytics
- **Performance**: Skeleton loaders, lazy loading, memoization

---

## 🔌 Backend Integration

### Expected Backend Endpoints

#### Auth Endpoints
```
POST   /auth/login          { email, password }
POST   /auth/signup         { name, email, password, role }
GET    /auth/me             Returns current user
POST   /auth/logout         Destroys session
```

#### Student Endpoints
```
GET    /student/dashboard        Overview data
GET    /student/marks            Grades/marks
GET    /student/attendance       Attendance data
GET    /student/analytics/performance  AI insights (from Python)
```

#### Teacher Endpoints
```
GET    /teacher/dashboard        Overview data
GET    /teacher/classes          Classes taught
GET    /teacher/analytics/class/:id  Class performance (from Python)
POST   /teacher/grades/submit    Submit grades
```

#### Admin Endpoints
```
GET    /admin/dashboard          Overview data
GET    /admin/users?role=STUDENT List users
GET    /admin/analytics/system   System analytics (from Python)
POST   /admin/users/create       Create user
PUT    /admin/users/:id          Update user
DELETE /admin/users/:id          Delete user
```

---

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Environment Variables
Create `.env.production`:
```env
VITE_API_URL=https://api.acadify.com/api
```

### Hosting Options
- **Frontend**: Vercel, Netlify, AWS S3 + CloudFront
- **Backend**: AWS EC2, Render, Railway
- **Database**: Managed PostgreSQL (AWS RDS, DigitalOcean)

---

## 🎨 UI Guidelines

### Component Usage
```jsx
// Button
<Button variant="primary" size="large" loading={isLoading}>
  Submit
</Button>

// Input
<Input
  label="Email"
  type="email"
  error={errors.email}
  value={email}
  onChange={handleChange}
/>

// Card
<Card variant="glass" hover>
  <p>Content here</p>
</Card>

// Loader
<SkeletonLoader variant="card" />
<TableSkeleton rows={5} />
```

### Animation Rules
```jsx
// Page load
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
>
  Content
</motion.div>

// Hover
<motion.div whileHover={{ y: -4 }}>
  Card
</motion.div>
```

---

## 🛠️ Development Scripts

```bash
npm run dev      # Start dev server
npm run build    # Build for production
npm run preview  # Preview production build
```

---

## 📝 Code Style

### Naming Conventions
- **Components**: PascalCase (`StudentDashboard.jsx`)
- **Utilities**: camelCase (`useAuth.js`)
- **Constants**: SCREAMING_SNAKE_CASE (`API_BASE_URL`)

### Import Order
1. React/External libraries
2. Internal components
3. API/Utils
4. Styles

---

## 🔒 Security

- ✅ HTTP-only session cookies (no token in localStorage)
- ✅ CORS configured for backend origin
- ✅ Role-based access control on routes
- ✅ Input validation on forms
- ✅ API error handling

---

## 🎯 Performance Optimization

1. **Canvas**: Only on auth pages
2. **Lazy Loading**: Route-based code splitting
3. **Memoization**: React.memo for expensive components
4. **Skeleton Loaders**: Better UX than spinners
5. **Debouncing**: For search/filter inputs

---

## 📚 Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Three.js + React Three Fiber** - 3D canvas
- **React Router** - Routing
- **Axios** - HTTP client

---

## 🤝 Contributing

1. Follow the established file structure
2. Use the design system (colors, typography, motion)
3. Add proper error handling
4. Test across roles (Student, Teacher, Admin)
5. Check responsive design

---

## 📧 Support

For issues or questions:
- Check the documentation
- Review API integration guide
- Ensure backend is running properly

---

**Built with ❤️ for academic excellence**

*acadify - Transforming academic data into meaningful insights*
