import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  Calendar,
  PlusCircle,
  LayoutDashboard,
  LogOut,
  User,
  Shield,
  Menu,
  X,
  Compass,
  BookmarkCheck,
} from 'lucide-react';
import { ConfirmationModal } from './ConfirmationModal';

export const Navbar = () => {
  const { user, logout, isAdmin, isUser } = useAuth();
  const { success } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);

  const handleLogoutClick = () => {
    setLogoutModalOpen(true);
  };

  const confirmLogout = () => {
    setLogoutModalOpen(false);
    logout();
    success('Logged out successfully');
    navigate('/login');
    setMobileMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-200 group-hover:scale-105 transition-transform">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors">
                Event<span className="text-indigo-600">Hub</span>
              </span>
              <span className="hidden sm:inline-block ml-2 px-2 py-0.5 text-[10px] font-semibold bg-indigo-50 text-indigo-700 rounded-full border border-indigo-100">
                {isAdmin ? 'Admin Console' : 'Event Platform'}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              to="/"
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition ${
                isActive('/')
                  ? 'bg-indigo-50 text-indigo-600'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Compass className="w-4 h-4" />
              Discover Events
            </Link>

            {/* User only navigation */}
            {isUser && (
              <Link
                to="/my-bookings"
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition ${
                  isActive('/my-bookings')
                    ? 'bg-indigo-50 text-indigo-600'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <BookmarkCheck className="w-4 h-4" />
                My Bookings
              </Link>
            )}

            {/* Admin only navigation */}
            {isAdmin && (
              <>
                <Link
                  to="/admin/dashboard"
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition ${
                    isActive('/admin/dashboard')
                      ? 'bg-indigo-50 text-indigo-600'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Admin Dashboard
                </Link>

                <Link
                  to="/events/new"
                  className="flex items-center gap-1.5 ml-2 px-4 py-2 rounded-lg text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm hover:shadow transition"
                >
                  <PlusCircle className="w-4 h-4" />
                  Create Event
                </Link>
              </>
            )}
          </nav>

          {/* Desktop Auth Controls */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
                <div className="flex items-center gap-2 text-right">
                  <div>
                    <p className="text-xs font-bold text-slate-900 leading-tight">{user.name}</p>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        user.role === 'admin'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-indigo-100 text-indigo-800'
                      }`}
                    >
                      {user.role === 'admin' ? (
                        <Shield className="w-3 h-3 text-amber-600" />
                      ) : (
                        <User className="w-3 h-3 text-indigo-600" />
                      )}
                      {user.role}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleLogoutClick}
                  className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-2 text-sm font-semibold text-slate-700 hover:text-indigo-600 hover:bg-slate-50 rounded-lg transition"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu trigger */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-base font-semibold text-slate-700 hover:bg-slate-50"
          >
            <Compass className="w-5 h-5 text-indigo-600" />
            Discover Events
          </Link>

          {isUser && (
            <Link
              to="/my-bookings"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-base font-semibold text-slate-700 hover:bg-slate-50"
            >
              <BookmarkCheck className="w-5 h-5 text-indigo-600" />
              My Bookings
            </Link>
          )}

          {isAdmin && (
            <>
              <Link
                to="/admin/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-base font-semibold text-slate-700 hover:bg-slate-50"
              >
                <LayoutDashboard className="w-5 h-5 text-indigo-600" />
                Admin Dashboard
              </Link>
              <Link
                to="/events/new"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-base font-bold bg-indigo-600 text-white"
              >
                <PlusCircle className="w-5 h-5" />
                Create New Event
              </Link>
            </>
          )}

          <div className="pt-3 border-t border-slate-100">
            {user ? (
              <div className="space-y-2">
                <div className="px-3 py-1">
                  <p className="text-sm font-bold text-slate-900">{user.name}</p>
                  <p className="text-xs text-slate-500 capitalize">{user.role} • {user.email}</p>
                </div>
                <button
                  onClick={handleLogoutClick}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold text-rose-600 hover:bg-rose-50"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center px-4 py-2 border border-slate-300 rounded-lg text-sm font-bold text-slate-700 hover:bg-slate-50"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center px-4 py-2 bg-indigo-600 rounded-lg text-sm font-bold text-white hover:bg-indigo-700"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      <ConfirmationModal
        isOpen={logoutModalOpen}
        onClose={() => setLogoutModalOpen(false)}
        onConfirm={confirmLogout}
        title="Sign Out of EventHub?"
        message="Are you sure you want to end your session? You will need to sign back in to access personalized event management or registered bookings."
        details={user ? `Signed in as ${user.name} (${user.email})` : null}
        confirmText="Yes, Sign Out"
        cancelText="Stay Signed In"
        variant="danger"
        iconType="logout"
      />
    </header>
  );
};
