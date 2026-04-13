# 🚀 Acadify Frontend - Quick Start Guide

## 📦 What You Have

A **complete, production-ready** frontend application for the acadify academic platform with:

✅ Premium dark UI with 3D particle canvas
✅ Session-based authentication
✅ Role-based dashboards (Student/Teacher/Admin)
✅ Complete API integration layer
✅ Performance-optimized components
✅ Comprehensive documentation

## ⚡ Get Started in 3 Steps

### Step 1: Install Dependencies

```bash
cd acadify-frontend
npm install
```

### Step 2: Configure Backend URL

The `.env` file is already configured for local development:
```env
VITE_API_URL=http://localhost:8080/api
```

**Important:** Make sure your Java Spring Boot backend is running on port 8080.

### Step 3: Start Development Server

```bash
npm run dev
```

App will open at: `http://localhost:3000`

## 🎯 What to Test

### Landing Page
- Navigate to `http://localhost:3000`
- See 3D particle canvas in background
- Click "Get Started" → goes to signup
- Click "Login" → goes to login

### Login Flow
1. Go to `http://localhost:3000/login`
2. Enter credentials (connected to your backend)
3. On successful login → redirects to role-based dashboard
4. Session persists on page refresh

### Dashboards

**Student Dashboard:**
- URL: `/dashboard/student/overview`
- Features: Marks, Attendance, AI Analytics
- Data fetched from: `/student/*` endpoints

**Teacher Dashboard:**
- URL: `/dashboard/teacher/overview`
- Features: Classes, Students, Grades
- Data fetched from: `/teacher/*` endpoints

**Admin Dashboard:**
- URL: `/dashboard/admin/overview`
- Features: User Management, System Analytics
- Data fetched from: `/admin/*` endpoints

## 📁 Project Structure

```
acadify-frontend/
├── src/
│   ├── theme/              # Design system (colors, fonts, animations)
│   ├── canvas/             # 3D particle scene
│   ├── components/         # Reusable UI components
│   ├── pages/              # Page components
│   ├── auth/               # Authentication logic
│   ├── api/                # Backend API calls
│   └── App.jsx             # Main routing
├── tailwind.config.js      # Theme configuration
├── package.json            # Dependencies
└── README.md               # Full documentation
```

## 🔧 Available Scripts

```bash
npm run dev      # Start development server (port 3000)
npm run build    # Build for production
npm run preview  # Preview production build
```

## 🔌 Backend Integration

### Required Backend Endpoints

Your Spring Boot backend should implement these endpoints:

**Authentication:**
- `POST /auth/login` - Login with email/password
- `POST /auth/signup` - Create new user
- `GET /auth/me` - Get current user (session validation)
- `POST /auth/logout` - Logout

**Student:**
- `GET /student/dashboard` - Student overview
- `GET /student/marks` - Grades
- `GET /student/analytics/performance` - AI insights

**Teacher:**
- `GET /teacher/dashboard` - Teacher overview
- `GET /teacher/classes` - Classes taught

**Admin:**
- `GET /admin/dashboard` - Admin overview
- `GET /admin/users` - User list

### Session Configuration

Backend must enable CORS with credentials:

```java
@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:3000")
                .allowedMethods("GET", "POST", "PUT", "DELETE")
                .allowCredentials(true);  // CRITICAL!
    }
}
```

## 📚 Documentation Files

- **README.md** - Complete setup and architecture guide
- **BACKEND_INTEGRATION.md** - Detailed API integration guide
- **DEPLOYMENT.md** - Production deployment guide
- **PROJECT_OVERVIEW.md** - Full technical overview

## 🎨 Design System

### Colors
- Base Dark: `#0b1020`
- Primary Blue: `#4f9cff`
- Secondary Purple: `#7c7cff`

### Fonts
- Display: Satoshi
- UI: Inter

### Components
All components are in `src/components/ui/`:
- Button (Primary, Secondary, Ghost variants)
- Input (with validation states)
- Card (Glass and Flat variants)
- Loader (Skeleton and Spinner)

## 🐛 Troubleshooting

### "CORS error"
→ Check backend CORS configuration
→ Ensure `allowCredentials(true)` is set

### "401 Unauthorized"
→ Backend not running or session expired
→ Check `/auth/me` endpoint

### "Canvas not showing"
→ Normal on dashboards (canvas only on auth pages)
→ Check browser console for Three.js errors

### "API calls failing"
→ Verify backend is running on port 8080
→ Check `.env` file has correct API URL

## 🚀 Next Steps

1. **Connect to Backend**
   - Ensure backend is running
   - Test login with valid credentials
   - Verify session persistence

2. **Customize**
   - Add your logo/branding
   - Customize colors in `src/theme/colors.js`
   - Add more dashboard features

3. **Deploy**
   - See `DEPLOYMENT.md` for production deployment
   - Configure environment variables
   - Set up HTTPS

## 💡 Tips

- **Canvas Performance:** Already optimized (60fps cap, 3000 particles max)
- **Role Testing:** Create test users for each role (Student, Teacher, Admin)
- **API Mocking:** Use `json-server` if backend not ready
- **State Management:** Uses React Context (can add Redux if needed)

## 📞 Need Help?

Check these files:
1. `README.md` - Full documentation
2. `BACKEND_INTEGRATION.md` - API details
3. `DEPLOYMENT.md` - Production guide

## ✅ Production Checklist

- [ ] Backend endpoints implemented
- [ ] Session cookies working
- [ ] All three roles tested
- [ ] Responsive on mobile
- [ ] Build passes (`npm run build`)
- [ ] Environment variables set for production

---

**You're ready to build something amazing!** 🎓

*acadify - Transforming academic data into meaningful insights*
