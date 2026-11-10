import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ProtectedRoute } from './components/ProtectedRoute';

import { HomePage } from './pages/HomePage';
import { EventDetailsPage } from './pages/EventDetailsPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { AdminRegisterPage } from './pages/AdminRegisterPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { CreateEditEventPage } from './pages/CreateEditEventPage';
import { MyBookingsPage } from './pages/MyBookingsPage';

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900">
            <Navbar />
            <div className="flex-1">
              <Routes>
                {/* Public Discovery & Details (Accessible to everyone without login) */}
                <Route path="/" element={<HomePage />} />
                <Route path="/events/:id" element={<EventDetailsPage />} />

                {/* Public Authentication Portals */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/admin/register" element={<AdminRegisterPage />} />

                {/* User-Only Protected Route (Requires Login) */}
                <Route
                  path="/my-bookings"
                  element={
                    <ProtectedRoute>
                      <MyBookingsPage />
                    </ProtectedRoute>
                  }
                />

                {/* Admin-Only Management Routes */}
                <Route
                  path="/admin/dashboard"
                  element={
                    <ProtectedRoute requireAdmin={true}>
                      <AdminDashboardPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/events/new"
                  element={
                    <ProtectedRoute requireAdmin={true}>
                      <CreateEditEventPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/events/:id/edit"
                  element={
                    <ProtectedRoute requireAdmin={true}>
                      <CreateEditEventPage />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </div>
            {/* <Footer /> */}
          </div>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
