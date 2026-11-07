import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Public & Student Pages
import Home from './pages/Home';
import Colleges from './pages/Colleges';
import CollegeDetails from './pages/CollegeDetails';
import CompareColleges from './pages/CompareColleges';
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/StudentDashboard';

// College Admin Pages
import CollegeAdminDashboard from './pages/CollegeAdminDashboard';
import CollegeProfileManager from './pages/CollegeProfileManager';
import ManageCourses from './pages/ManageCourses';
import ManageEnquiries from './pages/ManageEnquiries';
import CollegeSubscription from './pages/CollegeSubscription';

// Super Admin Pages
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import ManageColleges from './pages/ManageColleges';
import ManageUsers from './pages/ManageUsers';
import ManageSubscriptions from './pages/ManageSubscriptions';
import PlatformAnalytics from './pages/PlatformAnalytics';

import './App.css';

function App() {
  return (
    <AuthProvider>
      <div className="app-shell">
        <Navbar />

        <div className="app-body">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/colleges" element={<Colleges />} />
            <Route path="/colleges/:idOrSlug" element={<CollegeDetails />} />
            <Route path="/compare" element={<CompareColleges />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Student Protected Routes */}
            <Route
              path="/student/dashboard"
              element={
                <ProtectedRoute allowedRoles={['student', 'super_admin']}>
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/wishlist"
              element={
                <ProtectedRoute allowedRoles={['student', 'super_admin']}>
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />

            {/* College Admin Protected Routes */}
            <Route
              path="/college-admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={['college_admin', 'super_admin']}>
                  <CollegeAdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/college-admin/profile"
              element={
                <ProtectedRoute allowedRoles={['college_admin', 'super_admin']}>
                  <CollegeProfileManager />
                </ProtectedRoute>
              }
            />
            <Route
              path="/college-admin/courses"
              element={
                <ProtectedRoute allowedRoles={['college_admin', 'super_admin']}>
                  <ManageCourses />
                </ProtectedRoute>
              }
            />
            <Route
              path="/college-admin/enquiries"
              element={
                <ProtectedRoute allowedRoles={['college_admin', 'super_admin']}>
                  <ManageEnquiries />
                </ProtectedRoute>
              }
            />
            <Route
              path="/college-admin/subscription"
              element={
                <ProtectedRoute allowedRoles={['college_admin', 'super_admin']}>
                  <CollegeSubscription />
                </ProtectedRoute>
              }
            />

            {/* Super Admin Protected Routes */}
            <Route
              path="/super-admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={['super_admin']}>
                  <SuperAdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/super-admin/colleges"
              element={
                <ProtectedRoute allowedRoles={['super_admin']}>
                  <ManageColleges />
                </ProtectedRoute>
              }
            />
            <Route
              path="/super-admin/users"
              element={
                <ProtectedRoute allowedRoles={['super_admin']}>
                  <ManageUsers />
                </ProtectedRoute>
              }
            />
            <Route
              path="/super-admin/subscriptions"
              element={
                <ProtectedRoute allowedRoles={['super_admin']}>
                  <ManageSubscriptions />
                </ProtectedRoute>
              }
            />
            <Route
              path="/super-admin/analytics"
              element={
                <ProtectedRoute allowedRoles={['super_admin']}>
                  <PlatformAnalytics />
                </ProtectedRoute>
              }
            />

            {/* Catch-all Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>

        <Footer />
      </div>
    </AuthProvider>
  );
}

export default App;

