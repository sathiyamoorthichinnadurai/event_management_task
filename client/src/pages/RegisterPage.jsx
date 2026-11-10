import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  User,
  Lock,
  Mail,
  ShieldAlert,
  ArrowRight,
  AlertCircle,
  Eye,
  EyeOff,
  CheckCircle2,
  Info,
} from 'lucide-react';

// ── Password strength rules (must mirror backend Zod schema) ─────────────────
const PASSWORD_RULES = [
  { label: 'At least 8 characters', test: (p) => p.length >= 8 },
  { label: 'One uppercase letter (A–Z)', test: (p) => /[A-Z]/.test(p) },
  { label: 'One lowercase letter (a–z)', test: (p) => /[a-z]/.test(p) },
  { label: 'One number (0–9)', test: (p) => /\d/.test(p) },
  { label: 'One special character (@$!%*?&)', test: (p) => /[@$!%*?&]/.test(p) },
];

const STRONG_PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/;

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { success, error: toastError } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');
  const [passwordFocused, setPasswordFocused] = useState(false);

  const validateField = (field, value) => {
    let err = '';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (field === 'name') {
      if (!value.trim()) {
        err = 'Full name is required';
      } else if (value.trim().length < 2) {
        err = 'Name must be at least 2 characters long';
      } else if (value.trim().length > 60) {
        err = 'Name cannot exceed 60 characters';
      }
    } else if (field === 'email') {
      if (!value.trim()) {
        err = 'Email address is required';
      } else if (!emailRegex.test(value.trim())) {
        err = 'Please enter a valid email address (e.g. name@domain.com)';
      }
    } else if (field === 'password') {
      if (!value) {
        err = 'Password is required';
      } else if (value.length < 8) {
        err = 'Password must be at least 8 characters long';
      } else if (!STRONG_PASSWORD_REGEX.test(value)) {
        err = 'Password must include uppercase, lowercase, a number, and a special character (@$!%*?&)';
      }
    } else if (field === 'confirmPassword') {
      if (!value) {
        err = 'Please confirm your password';
      } else if (value !== formData.password) {
        err = 'Passwords do not match';
      }
    }

    setErrors((prev) => ({ ...prev, [field]: err }));
    return !err;
  };

  const validateAll = () => {
    const isNameValid = validateField('name', formData.name);
    const isEmailValid = validateField('email', formData.email);
    const isPasswordValid = validateField('password', formData.password);
    const isConfirmValid = validateField('confirmPassword', formData.confirmPassword);
    return isNameValid && isEmailValid && isPasswordValid && isConfirmValid;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      validateField(name, value);
    }

    // Live-sync confirm password check when user is typing in password field
    if (name === 'password' && formData.confirmPassword) {
      if (formData.confirmPassword !== value) {
        setErrors((prev) => ({ ...prev, confirmPassword: 'Passwords do not match' }));
      } else {
        setErrors((prev) => ({ ...prev, confirmPassword: '' }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError('');

    if (!validateAll()) {
      return;
    }

    setLoading(true);
    try {
      await register(formData.name, formData.email, formData.password);
      success('Account created successfully! Welcome to EventHub.');
      navigate('/');
    } catch (err) {
      // Handle backend field-level errors
      if (err.response?.data?.errors) {
        const serverErrors = err.response.data.errors;
        // Map backend field names to our local state
        setErrors((prev) => ({ ...prev, ...serverErrors }));
        setGeneralError(err.response.data.message || 'Registration failed. Please review the highlighted fields.');
      } else {
        setGeneralError(err.customMessage || 'Registration failed. Please try again.');
      }
      toastError(err.customMessage || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  // Password strength indicator
  const passedRules = PASSWORD_RULES.filter((r) => r.test(formData.password));
  const strength = passedRules.length; // 0–5

  const strengthLabel = ['', 'Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'][strength];
  const strengthColor = [
    '',
    'bg-rose-500',
    'bg-orange-400',
    'bg-amber-400',
    'bg-emerald-400',
    'bg-emerald-600',
  ][strength];

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 p-8 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center mx-auto shadow-md">
            <User className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Create an Attendee Account
          </h2>
          <p className="text-xs text-slate-500">
            Sign up to discover, share, and book events across top tech communities.
          </p>
        </div>

        {generalError && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs font-medium text-rose-800 flex items-start gap-2.5 animate-in fade-in">
            <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{generalError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {/* Full Name */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700">
              Full Name <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <User
                className={`w-4 h-4 absolute left-3.5 top-3.5 transition-colors ${
                  errors.name ? 'text-rose-400' : 'text-slate-400'
                }`}
              />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                onBlur={() => validateField('name', formData.name)}
                placeholder="Jane Doe"
                className={`w-full pl-10 pr-10 py-2.5 text-xs rounded-xl font-medium transition duration-200 focus:outline-none ${
                  errors.name
                    ? 'border-2 border-rose-400 bg-rose-50/20 text-slate-900 focus:border-rose-500 focus:ring-4 focus:ring-rose-100'
                    : 'border border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50'
                }`}
              />
              {errors.name && (
                <AlertCircle className="w-4 h-4 text-rose-500 absolute right-3.5 top-3.5 pointer-events-none" />
              )}
            </div>
            {errors.name && (
              <p className="text-xs text-rose-600 font-medium flex items-center gap-1 mt-1 animate-in fade-in">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errors.name}</span>
              </p>
            )}
          </div>

          {/* Email Address */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700">
              Email Address <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Mail
                className={`w-4 h-4 absolute left-3.5 top-3.5 transition-colors ${
                  errors.email ? 'text-rose-400' : 'text-slate-400'
                }`}
              />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={() => validateField('email', formData.email)}
                placeholder="name@example.com"
                className={`w-full pl-10 pr-10 py-2.5 text-xs rounded-xl font-medium transition duration-200 focus:outline-none ${
                  errors.email
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

          {/* Password */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700">
              Password <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Lock
                className={`w-4 h-4 absolute left-3.5 top-3.5 transition-colors ${
                  errors.password ? 'text-rose-400' : 'text-slate-400'
                }`}
              />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                onBlur={() => {
                  setPasswordFocused(false);
                  validateField('password', formData.password);
                }}
                onFocus={() => setPasswordFocused(true)}
                placeholder="Min. 8 chars with uppercase, number & symbol"
                className={`w-full pl-10 pr-10 py-2.5 text-xs rounded-xl font-medium transition duration-200 focus:outline-none ${
                  errors.password
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

            {/* Password Strength Bar */}
            {formData.password && (
              <div className="mt-2 space-y-1.5">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                        i <= strength ? strengthColor : 'bg-slate-200'
                      }`}
                    />
                  ))}
                </div>
                {strengthLabel && (
                  <p className="text-[10px] font-bold text-slate-500">
                    Password strength:{' '}
                    <span
                      className={
                        strength >= 4
                          ? 'text-emerald-600'
                          : strength >= 3
                          ? 'text-amber-600'
                          : 'text-rose-600'
                      }
                    >
                      {strengthLabel}
                    </span>
                  </p>
                )}
              </div>
            )}

            {/* Password Rules Checklist — shown while focused or on error */}
            {(passwordFocused || errors.password) && formData.password && (
              <ul className="mt-2 space-y-1 p-3 bg-slate-50 rounded-xl border border-slate-200">
                {PASSWORD_RULES.map((rule) => {
                  const passed = rule.test(formData.password);
                  return (
                    <li
                      key={rule.label}
                      className={`flex items-center gap-1.5 text-[10px] font-medium transition-colors ${
                        passed ? 'text-emerald-700' : 'text-slate-500'
                      }`}
                    >
                      {passed ? (
                        <CheckCircle2 className="w-3 h-3 shrink-0 text-emerald-500" />
                      ) : (
                        <div className="w-3 h-3 shrink-0 rounded-full border border-slate-300" />
                      )}
                      {rule.label}
                    </li>
                  );
                })}
              </ul>
            )}

            {errors.password && (
              <p className="text-xs text-rose-600 font-medium flex items-center gap-1 mt-1 animate-in fade-in">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errors.password}</span>
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700">
              Confirm Password <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Lock
                className={`w-4 h-4 absolute left-3.5 top-3.5 transition-colors ${
                  errors.confirmPassword ? 'text-rose-400' : 'text-slate-400'
                }`}
              />
              <input
                type={showConfirm ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                onBlur={() => validateField('confirmPassword', formData.confirmPassword)}
                placeholder="Repeat password"
                className={`w-full pl-10 pr-10 py-2.5 text-xs rounded-xl font-medium transition duration-200 focus:outline-none ${
                  errors.confirmPassword
                    ? 'border-2 border-rose-400 bg-rose-50/20 text-slate-900 focus:border-rose-500 focus:ring-4 focus:ring-rose-100'
                    : formData.confirmPassword && !errors.confirmPassword
                    ? 'border-2 border-emerald-400 bg-emerald-50/20 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100'
                    : 'border border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 p-0.5 rounded transition"
                tabIndex={-1}
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
              {formData.confirmPassword && !errors.confirmPassword && (
                <CheckCircle2 className="w-4 h-4 text-emerald-500 absolute right-9 top-3.5 pointer-events-none" />
              )}
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-rose-600 font-medium flex items-center gap-1 mt-1 animate-in fade-in">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errors.confirmPassword}</span>
              </p>
            )}
          </div>

          {/* Submit CTA */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 shadow-md disabled:opacity-50 transition flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Complete Registration</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-2">
          <p className="text-xs text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-indigo-600 hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
