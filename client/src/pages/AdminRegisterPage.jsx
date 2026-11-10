import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import {
  Shield,
  Lock,
  Mail,
  User,
  Key,
  ShieldAlert,
  ArrowRight,
  AlertCircle,
  Eye,
  EyeOff,
  CheckCircle2,
  Info,
} from 'lucide-react';
import api from '../services/api';

// ── Password rules — must mirror backend adminRegisterSchema ─────────────────
const PASSWORD_RULES = [
  { label: 'At least 8 characters', test: (p) => p.length >= 8 },
  { label: 'One uppercase letter (A–Z)', test: (p) => /[A-Z]/.test(p) },
  { label: 'One lowercase letter (a–z)', test: (p) => /[a-z]/.test(p) },
  { label: 'One number (0–9)', test: (p) => /\d/.test(p) },
  { label: 'One special character (@$!%*?&)', test: (p) => /[@$!%*?&]/.test(p) },
];

const STRONG_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const AdminRegisterPage = () => {
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    adminSecret: '',
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');
  const [passwordFocused, setPasswordFocused] = useState(false);

  // ── Per-field validation ───────────────────────────────────────────────────
  const validateField = (field, value) => {
    let err = '';

    if (field === 'name') {
      if (!value.trim()) err = 'Full name is required';
      else if (value.trim().length < 2) err = 'Name must be at least 2 characters';
      else if (value.trim().length > 60) err = 'Name cannot exceed 60 characters';
    } else if (field === 'email') {
      if (!value.trim()) err = 'Email address is required';
      else if (!EMAIL_REGEX.test(value.trim())) err = 'Please enter a valid email address';
    } else if (field === 'password') {
      if (!value) err = 'Password is required';
      else if (value.length < 8) err = 'Password must be at least 8 characters';
      else if (!STRONG_REGEX.test(value))
        err = 'Password must include uppercase, lowercase, number, and special character (@$!%*?&)';
    } else if (field === 'confirmPassword') {
      if (!value) err = 'Please confirm your password';
      else if (value !== formData.password) err = 'Passwords do not match';
    } else if (field === 'adminSecret') {
      if (!value.trim()) err = 'Admin registration secret key is required';
    }

    setErrors((prev) => ({ ...prev, [field]: err }));
    return !err;
  };

  const validateAll = () => {
    return (
      validateField('name', formData.name) &
      validateField('email', formData.email) &
      validateField('password', formData.password) &
      validateField('confirmPassword', formData.confirmPassword) &
      validateField('adminSecret', formData.adminSecret)
    );
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Live-clear error once user starts correcting the field
    if (errors[name]) validateField(name, value);

    // Live confirm-password check
    if (name === 'password' && formData.confirmPassword) {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: formData.confirmPassword !== value ? 'Passwords do not match' : '',
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError('');

    if (!validateAll()) return;

    setLoading(true);
    try {
      await api.post('/auth/register/admin', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        adminSecret: formData.adminSecret,
      });

      success('Admin account created successfully! You can now log in via the Admin Portal.');
      navigate('/login');
    } catch (err) {
      // Surface backend field-level errors
      if (err.response?.data?.errors) {
        setErrors((prev) => ({ ...prev, ...err.response.data.errors }));
      }
      const msg =
        err.response?.data?.message ||
        err.customMessage ||
        'Admin registration failed. Check your secret key and try again.';
      setGeneralError(msg);
      toastError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Password strength
  const passedRules = PASSWORD_RULES.filter((r) => r.test(formData.password));
  const strength = passedRules.length;
  const strengthLabel = ['', 'Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'][strength];
  const strengthColor = ['', 'bg-rose-500', 'bg-orange-400', 'bg-amber-400', 'bg-emerald-400', 'bg-emerald-600'][strength];

  // Input class helper
  const inputClass = (field, extra = '') =>
    `w-full ${extra} py-2.5 text-xs rounded-xl font-medium transition duration-200 focus:outline-none ${
      errors[field]
        ? 'border-2 border-rose-400 bg-rose-50/20 focus:border-rose-500 focus:ring-4 focus:ring-rose-100'
        : 'border border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50'
    }`;

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 p-8 shadow-xl space-y-6">

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-indigo-700 text-white flex items-center justify-center mx-auto shadow-md shadow-indigo-200">
            <Shield className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Admin Account Registration
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Create a new admin account. You will need the{' '}
            <strong className="text-slate-700">admin registration secret key</strong> configured by
            the server owner.
          </p>
        </div>

        {/* Security Notice */}
        <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-800 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <span className="leading-relaxed">
            This endpoint is restricted. The secret key is set by the server administrator and
            is never stored in source code.
          </span>
        </div>

        {/* General Error */}
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
              <User className={`w-4 h-4 absolute left-3.5 top-3.5 ${errors.name ? 'text-rose-400' : 'text-slate-400'}`} />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                onBlur={() => validateField('name', formData.name)}
                placeholder="Admin Full Name"
                className={inputClass('name', 'pl-10 pr-10')}
              />
              {errors.name && <AlertCircle className="w-4 h-4 text-rose-500 absolute right-3.5 top-3.5 pointer-events-none" />}
            </div>
            {errors.name && (
              <p className="text-xs text-rose-600 font-medium flex items-center gap-1 mt-1 animate-in fade-in">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />{errors.name}
              </p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700">
              Email Address <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Mail className={`w-4 h-4 absolute left-3.5 top-3.5 ${errors.email ? 'text-rose-400' : 'text-slate-400'}`} />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={() => validateField('email', formData.email)}
                placeholder="admin@yourcompany.com"
                className={inputClass('email', 'pl-10 pr-10')}
              />
              {errors.email && <AlertCircle className="w-4 h-4 text-rose-500 absolute right-3.5 top-3.5 pointer-events-none" />}
            </div>
            {errors.email && (
              <p className="text-xs text-rose-600 font-medium flex items-center gap-1 mt-1 animate-in fade-in">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />{errors.email}
              </p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700">
              Password <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Lock className={`w-4 h-4 absolute left-3.5 top-3.5 ${errors.password ? 'text-rose-400' : 'text-slate-400'}`} />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                onBlur={() => { setPasswordFocused(false); validateField('password', formData.password); }}
                onFocus={() => setPasswordFocused(true)}
                placeholder="Min. 8 chars with uppercase, number & symbol"
                className={inputClass('password', 'pl-10 pr-10')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 p-0.5 rounded"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Strength bar */}
            {formData.password && (
              <div className="mt-1.5 space-y-1">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= strength ? strengthColor : 'bg-slate-200'}`} />
                  ))}
                </div>
                {strengthLabel && (
                  <p className="text-[10px] font-bold text-slate-500">
                    Strength:{' '}
                    <span className={strength >= 4 ? 'text-emerald-600' : strength >= 3 ? 'text-amber-600' : 'text-rose-600'}>
                      {strengthLabel}
                    </span>
                  </p>
                )}
              </div>
            )}

            {/* Rules checklist */}
            {(passwordFocused || errors.password) && formData.password && (
              <ul className="mt-2 space-y-1 p-3 bg-slate-50 rounded-xl border border-slate-200">
                {PASSWORD_RULES.map((rule) => {
                  const ok = rule.test(formData.password);
                  return (
                    <li key={rule.label} className={`flex items-center gap-1.5 text-[10px] font-medium ${ok ? 'text-emerald-700' : 'text-slate-500'}`}>
                      {ok ? <CheckCircle2 className="w-3 h-3 shrink-0 text-emerald-500" /> : <div className="w-3 h-3 shrink-0 rounded-full border border-slate-300" />}
                      {rule.label}
                    </li>
                  );
                })}
              </ul>
            )}

            {errors.password && (
              <p className="text-xs text-rose-600 font-medium flex items-center gap-1 mt-1 animate-in fade-in">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />{errors.password}
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700">
              Confirm Password <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Lock className={`w-4 h-4 absolute left-3.5 top-3.5 ${errors.confirmPassword ? 'text-rose-400' : 'text-slate-400'}`} />
              <input
                type={showConfirm ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                onBlur={() => validateField('confirmPassword', formData.confirmPassword)}
                placeholder="Repeat password"
                className={`w-full pl-10 pr-10 py-2.5 text-xs rounded-xl font-medium transition duration-200 focus:outline-none ${
                  errors.confirmPassword
                    ? 'border-2 border-rose-400 bg-rose-50/20 focus:border-rose-500 focus:ring-4 focus:ring-rose-100'
                    : formData.confirmPassword && !errors.confirmPassword
                    ? 'border-2 border-emerald-400 bg-emerald-50/20 focus:ring-4 focus:ring-emerald-100'
                    : 'border border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 p-0.5 rounded"
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
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />{errors.confirmPassword}
              </p>
            )}
          </div>

          {/* Admin Secret Key */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700">
              Admin Registration Secret Key <span className="text-rose-500">*</span>
            </label>
            <p className="text-[10px] text-slate-400 font-medium">
              Provided by the server administrator. Set via <code className="bg-slate-100 px-1 rounded">ADMIN_REGISTRATION_SECRET</code> env variable.
            </p>
            <div className="relative">
              <Key className={`w-4 h-4 absolute left-3.5 top-3.5 ${errors.adminSecret ? 'text-rose-400' : 'text-slate-400'}`} />
              <input
                type={showSecret ? 'text' : 'password'}
                name="adminSecret"
                value={formData.adminSecret}
                onChange={handleChange}
                onBlur={() => validateField('adminSecret', formData.adminSecret)}
                placeholder="Enter the admin registration secret"
                autoComplete="off"
                className={inputClass('adminSecret', 'pl-10 pr-10')}
              />
              <button
                type="button"
                onClick={() => setShowSecret(!showSecret)}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 p-0.5 rounded"
                tabIndex={-1}
              >
                {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.adminSecret && (
              <p className="text-xs text-rose-600 font-medium flex items-center gap-1 mt-1 animate-in fade-in">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />{errors.adminSecret}
              </p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 rounded-xl text-xs font-bold text-white bg-indigo-700 hover:bg-indigo-800 shadow-md shadow-indigo-200 disabled:opacity-50 transition flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Create Admin Account</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-2 space-y-1">
          <p className="text-xs text-slate-500">
            Already have an admin account?{' '}
            <Link to="/login" className="font-bold text-indigo-600 hover:underline">
              Sign in via Admin Portal
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

