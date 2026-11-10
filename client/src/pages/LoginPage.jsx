import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  Calendar,
  Lock,
  Mail,
  ShieldAlert,
  ArrowRight,
  Shield,
  User,
  Sparkles,
  AlertCircle,
  Eye,
  EyeOff,
} from 'lucide-react';

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loginAdmin } = useAuth();
  const { success, error: toastError } = useToast();

  const [activeTab, setActiveTab] = useState('user'); // 'user' | 'admin'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState('');

  const from = location.state?.from?.pathname || (activeTab === 'admin' ? '/admin/dashboard' : '/');

  const validateField = (field, value) => {
    let err = '';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (field === 'email') {
      if (!value.trim()) {
        err = 'Email address is required';
      } else if (!emailRegex.test(value.trim())) {
        err = 'Please enter a valid email address (e.g. name@domain.com)';
      }
    } else if (field === 'password') {
      if (!value) {
        err = 'Password is required';
      } else if (value.length < 6) {
        err = 'Password must be at least 6 characters long';
      }
    }

    setErrors((prev) => ({ ...prev, [field]: err }));
    return !err;
  };

  const validateAll = () => {
    const isEmailValid = validateField('email', email);
    const isPasswordValid = validateField('password', password);
    return isEmailValid && isPasswordValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError('');

    if (!validateAll()) {
      return;
    }

    setLoading(true);
    try {
      if (activeTab === 'admin') {
        await loginAdmin(email, password);
        success('Administrator signed in successfully');
        navigate('/admin/dashboard');
      } else {
        await login(email, password);
        success('User signed in successfully');
        navigate(from);
      }
    } catch (err) {
      setGeneralError(err.customMessage || 'Authentication failed. Please check your credentials.');
      toastError(err.customMessage || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = (type) => {
    setErrors({});
    setGeneralError('');
    if (type === 'admin') {
      setActiveTab('admin');
      setEmail('admin@eventhub.com');
      setPassword('Password@123');
    } else {
      setActiveTab('user');
      setEmail('user@eventhub.com');
      setPassword('Password@123');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 p-8 shadow-xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mx-auto shadow-md shadow-indigo-200">
            <Calendar className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Sign In to EventHub
          </h2>
          <p className="text-xs text-slate-500">
            Choose your portal below to access discovery or management.
          </p>
        </div>

        {/* Portal Switch Tabs: Strictly User vs Admin */}
        <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-2xl text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              setActiveTab('user');
              setGeneralError('');
              setErrors({});
            }}
            className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl transition ${activeTab === 'user'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
              }`}
          >
            <User className="w-3.5 h-3.5" /> User Portal
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('admin');
              setGeneralError('');
              setErrors({});
            }}
            className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl transition ${activeTab === 'admin'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
              }`}
          >
            <Shield className="w-3.5 h-3.5 text-indigo-600" /> Admin Portal
          </button>
        </div>

        {/* General Error Alert */}
        {generalError && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs font-medium text-rose-800 flex items-start gap-2.5 animate-in fade-in">
            <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{generalError}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {/* Email Input */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700">
              Email Address <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Mail
                className={`w-4 h-4 absolute left-3.5 top-3.5 transition-colors ${errors.email ? 'text-rose-400' : 'text-slate-400'
                  }`}
              />
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) validateField('email', e.target.value);
                }}
                onBlur={() => validateField('email', email)}
                placeholder="name@example.com"
                className={`w-full pl-10 pr-10 py-2.5 text-xs rounded-xl font-medium transition duration-200 focus:outline-none ${errors.email
                    ? 'border-2 border-rose-400 bg-rose-50/20 text-slate-900 focus:border-rose-500 focus:ring-4 focus:ring-rose-100'
                    : 'border border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50'
                  }`}
              />
              {errors.email && (
                <AlertCircle className="w-4 h-4 text-rose-500 absolute right-3.5 top-3.5 pointer-events-none" />
              )}
            </div>
            {errors.email && (
              <p className="text-xs text-rose-600 font-medium flex items-center gap-1 mt-1 animate-in fade-in">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errors.email}</span>
              </p>
            )}
          </div>

          {/* Password Input */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700">
              Password <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Lock
                className={`w-4 h-4 absolute left-3.5 top-3.5 transition-colors ${errors.password ? 'text-rose-400' : 'text-slate-400'
                  }`}
              />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) validateField('password', e.target.value);
                }}
                onBlur={() => validateField('password', password)}
                placeholder="••••••••"
                className={`w-full pl-10 pr-10 py-2.5 text-xs rounded-xl font-medium transition duration-200 focus:outline-none ${errors.password
                    ? 'border-2 border-rose-400 bg-rose-50/20 text-slate-900 focus:border-rose-500 focus:ring-4 focus:ring-rose-100'
                    : 'border border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50'
                  }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 p-0.5 rounded transition"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-rose-600 font-medium flex items-center gap-1 mt-1 animate-in fade-in">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errors.password}</span>
              </p>
            )}
          </div>

          {/* Submit CTA */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-200 disabled:opacity-50 transition flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Sign In as {activeTab === 'admin' ? 'Administrator' : 'User'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* 1-Click Demo Fill for Evaluators */}
        {/* <div className="pt-4 border-t border-slate-100">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center mb-2 flex items-center justify-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500" /> Demo Credentials (1-Click Fill)
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleFillDemo('admin')}
              className="py-2 px-3 rounded-xl text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 transition text-center"
            >
              Demo Admin (Full CRUD)
            </button>
            <button
              type="button"
              onClick={() => handleFillDemo('user')}
              className="py-2 px-3 rounded-xl text-xs font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 transition text-center"
            >
              Demo User (View & Book)
            </button>
          </div>
        </div> */}

        {/* Footer Link */}
        <div className="text-center pt-2">
          <p className="text-xs text-slate-500">
            Need a user account?{' '}
            <Link to="/register" className="font-bold text-indigo-600 hover:underline">
              Register as User
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
