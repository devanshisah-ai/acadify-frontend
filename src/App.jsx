import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./auth/useAuth";
import AuthGuard from "./auth/AuthGuard";
import VerifyEmail from "./pages/VerifyEmail";

import Landing  from "./pages/Landing";
import Login    from "./pages/Login";
import Signup   from "./pages/Signup";

import DashboardLayout from "./components/layout/DashboardLayout";
import AdminDashboard  from "./pages/dashboard/AdminDashboard";

// Student sub-pages
import StudentOverview   from "./pages/dashboard/student/Overview";
import StudentMarks      from "./pages/dashboard/student/Marks";
import StudentAttendance from "./pages/dashboard/student/Attendance";
import StudentAnalytics  from "./pages/dashboard/student/Analytics";

// Teacher sub-pages
import TeacherOverview   from "./pages/dashboard/teacher/Overview";
import TeacherDoubts     from "./pages/dashboard/teacher/AnswerDoubts";
import TeacherClasses    from "./pages/dashboard/teacher/Classes";
import TeacherStudents   from "./pages/dashboard/teacher/Students";
import TeacherAttendance from "./pages/dashboard/teacher/Attendance";
import TeacherMarks      from "./pages/dashboard/teacher/Marks";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/"             element={<Landing />} />
          <Route path="/login"        element={<Login />} />
          <Route path="/signup"       element={<Signup />} />
          <Route path="/verify-email" element={<VerifyEmail />} />

          {/* STUDENT */}
          <Route path="/dashboard/student"
            element={<AuthGuard allowedRoles={["STUDENT"]}><DashboardLayout /></AuthGuard>}>
            <Route index             element={<Navigate to="overview" replace />} />
            <Route path="overview"   element={<StudentOverview />} />
            <Route path="marks"      element={<StudentMarks />} />
            <Route path="attendance" element={<StudentAttendance />} />
            <Route path="analytics"  element={<StudentAnalytics />} />
          </Route>

          {/* TEACHER */}
          <Route path="/dashboard/teacher"
            element={<AuthGuard allowedRoles={["TEACHER"]}><DashboardLayout /></AuthGuard>}>
            <Route index             element={<Navigate to="overview" replace />} />
            <Route path="overview"   element={<TeacherOverview />} />
            <Route path="doubts"     element={<TeacherDoubts />} />
            <Route path="classes"    element={<TeacherClasses />} />
            <Route path="students"   element={<TeacherStudents />} />
            <Route path="attendance" element={<TeacherAttendance />} />
            <Route path="marks"      element={<TeacherMarks />} />
          </Route>

          {/* ADMIN */}
          <Route path="/dashboard/admin"
            element={<AuthGuard allowedRoles={["ADMIN"]}><DashboardLayout /></AuthGuard>}>
            <Route index element={<AdminDashboard />} />
          </Route>

          <Route path="/student/*" element={<Navigate to="/dashboard/student" />} />
          <Route path="/teacher/*" element={<Navigate to="/dashboard/teacher" />} />
          <Route path="/admin/*"   element={<Navigate to="/dashboard/admin" />} />
          <Route path="*"          element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;