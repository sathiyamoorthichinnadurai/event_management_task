import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { ConfirmationModal } from '../components/ConfirmationModal';
import {
  Calendar,
  Clock,
  MapPin,
  Video,
  Tag,
  Users,
  Link as LinkIcon,
  ArrowLeft,
  Save,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Info,
} from 'lucide-react';

const CATEGORIES = [
  'Technology',
  'Design',
  'Business',
  'Marketing',
  'Workshop',
  'Conference',
  'Other',
];

const URL_REGEX = /^(https?:\/\/)([\w.-]+)+(:\d+)?(\/([/\w_.]*)(\?\S+)?)?$/i;

// ─── Validation rules (mirrors the backend Zod schema) ───────────────────────
const FIELD_VALIDATORS = {
  title: (val) => {
    if (!val || !val.trim()) return 'Event title is required';
    if (val.trim().length < 3) return 'Title must be at least 3 characters';
    if (val.trim().length > 120) return 'Title cannot exceed 120 characters';
    return '';
  },
  summary: (val) => {
    if (!val || !val.trim()) return 'Short summary is required';
    if (val.trim().length < 10) return 'Summary must be at least 10 characters';
    if (val.trim().length > 300) return 'Summary cannot exceed 300 characters';
    return '';
  },
  description: (val) => {
    if (!val || !val.trim()) return 'Full description is required';
    if (val.trim().length < 20) return 'Description must be at least 20 characters';
    return '';
  },
  bannerUrl: (val) => {
    if (!val || !val.trim()) return 'Banner image URL is required';
    // if (!URL_REGEX.test(val.trim())) return 'Must be a valid HTTP or HTTPS URL (e.g. https://...)';
    return '';
  },
  startDate: (val) => {
    if (!val) return 'Start date and time is required';
    return '';
  },
  endDate: (val, formData) => {
    if (!val) return 'End date and time is required';
    if (formData?.startDate && new Date(val) <= new Date(formData.startDate)) {
      return 'End date/time must be after the start date/time';
    }
    return '';
  },
  venue: (val) => {
    if (!val || !val.trim()) return 'Venue or online link is required';
    if (val.trim().length < 3) return 'Please enter at least 3 characters';
    return '';
  },
  targetAudience: (val) => {
    if (!val || !val.trim()) return 'Target audience is required';
    if (val.trim().length < 3) return 'Please enter at least 3 characters';
    return '';
  },
  registrationUrl: (val) => {
    if (!val || !val.trim()) return 'Registration URL is required';
    if (!URL_REGEX.test(val.trim())) return 'Must be a valid HTTP or HTTPS URL (e.g. https://...)';
    return '';
  },
};

// Fields that show a valid checkmark after a successful blur
const CHECKABLE_FIELDS = ['title', 'summary', 'bannerUrl', 'venue', 'targetAudience', 'registrationUrl'];

export const CreateEditEventPage = () => {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    description: '',
    bannerUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
    startDate: '',
    endDate: '',
    format: 'in-person',
    venue: '',
    category: 'Technology',
    tags: '',
    targetAudience: 'Software Engineers, Architects, and Tech Enthusiasts',
    registrationUrl: 'https://example.com/register',
    status: 'published',
    isActive: true,
  });

  const [initialLoading, setInitialLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  // { fieldName: 'Error message string' | '' }
  const [fieldErrors, setFieldErrors] = useState({});
  // Track which fields have been touched (blurred at least once)
  const [touched, setTouched] = useState({});

  // ─── Fetch existing event in edit mode ──────────────────────────────────────
  useEffect(() => {
    if (!isEditMode) return;

    const fetchExistingEvent = async () => {
      try {
        const res = await api.get(`/events/${id}`);
        const ev = res.data.data;

        const formatForInput = (isoStr) => {
          if (!isoStr) return '';
          const d = new Date(isoStr);
          const pad = (n) => String(n).padStart(2, '0');
          return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
        };

        setFormData({
          title: ev.title || '',
          summary: ev.summary || '',
          description: ev.description || '',
          bannerUrl: ev.bannerUrl || '',
          startDate: formatForInput(ev.startDate),
          endDate: formatForInput(ev.endDate),
          format: ev.format || 'in-person',
          venue: ev.venue || '',
          category: ev.category || 'Technology',
          tags: Array.isArray(ev.tags) ? ev.tags.join(', ') : '',
          targetAudience: ev.targetAudience || '',
          registrationUrl: ev.registrationUrl || '',
          status: ev.status || 'published',
          isActive: ev.isActive ?? true,
        });
      } catch (err) {
        toastError(err.customMessage || 'Failed to fetch event for editing');
        navigate('/admin/dashboard');
      } finally {
        setInitialLoading(false);
      }
    };

    fetchExistingEvent();
  }, [id, isEditMode, navigate, toastError]);

  // ─── Validate a single field ─────────────────────────────────────────────────
  const validateField = useCallback(
    (name, value, currentFormData) => {
      const validator = FIELD_VALIDATORS[name];
      if (!validator) return '';
      return validator(value, currentFormData || formData);
    },
    [formData]
  );

  // ─── onChange — clear error as user types if already in error state ──────────
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;

    setFormData((prev) => ({ ...prev, [name]: newValue }));

    // Live-clear error once user starts correcting the field
    if (touched[name]) {
      const updatedForm = { ...formData, [name]: newValue };
      const err = validateField(name, newValue, updatedForm);
      setFieldErrors((prev) => ({ ...prev, [name]: err }));

      // If endDate is affected by a startDate change, re-validate endDate too
      if (name === 'startDate' && touched['endDate']) {
        const endErr = validateField('endDate', formData.endDate, updatedForm);
        setFieldErrors((prev) => ({ ...prev, endDate: endErr }));
      }
    }
  };

  // ─── onBlur — validate on first blur and every subsequent blur ──────────────
  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const err = validateField(name, value, formData);
    setFieldErrors((prev) => ({ ...prev, [name]: err }));
  };

  // ─── Validate all required fields before submit ──────────────────────────────
  const validateAll = () => {
    const requiredFields = Object.keys(FIELD_VALIDATORS);
    const errors = {};
    const newTouched = {};

    requiredFields.forEach((name) => {
      newTouched[name] = true;
      const err = validateField(name, formData[name], formData);
      if (err) errors[name] = err;
    });

    setTouched((prev) => ({ ...prev, ...newTouched }));
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ─── Form submit ─────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateAll()) {
      toastError('Please fix the highlighted errors before submitting');
      // Scroll to first error
      setTimeout(() => {
        const firstError = document.querySelector('[data-field-error="true"]');
        firstError?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 50);
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        tags: formData.tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
      };

      let res;
      if (isEditMode) {
        res = await api.put(`/events/${id}`, payload);
        success('Event updated successfully');
      } else {
        res = await api.post('/events', payload);
        success('Event published successfully');
      }

      const targetId = res.data.data?._id || id;
      navigate(`/events/${targetId}`);
    } catch (err) {
      // Handle backend field-level validation errors (from Zod via validateMiddleware)
      if (err.response?.data?.errors) {
        const serverErrors = err.response.data.errors;
        setFieldErrors((prev) => ({ ...prev, ...serverErrors }));
        toastError('Server validation failed — please review the highlighted fields');
      } else {
        toastError(err.customMessage || 'Failed to save event. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Helper: input class based on error/valid state ─────────────────────────
  const inputClass = (name, extra = '') => {
    const hasError = touched[name] && fieldErrors[name];
    const isValid = touched[name] && !fieldErrors[name] && formData[name];
    if (hasError) {
      return `w-full px-4 py-2.5 text-xs rounded-xl font-medium focus:outline-none transition duration-200
        border-2 border-rose-400 bg-rose-50/30 text-slate-900
        focus:border-rose-500 focus:ring-4 focus:ring-rose-100 ${extra}`;
    }
    if (isValid && CHECKABLE_FIELDS.includes(name)) {
      return `w-full px-4 py-2.5 text-xs rounded-xl font-medium focus:outline-none transition duration-200
        border-2 border-emerald-400 bg-emerald-50/20 text-slate-900
        focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 ${extra}`;
    }
    return `w-full px-4 py-2.5 text-xs rounded-xl font-medium focus:outline-none transition duration-200
      border border-slate-200 bg-slate-50 focus:bg-white
      focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 ${extra}`;
  };

  // ─── Helper: render field-level error message ────────────────────────────────
  const FieldError = ({ name }) => {
    if (!touched[name] || !fieldErrors[name]) return null;
    return (
      <p
        data-field-error="true"
        className="text-xs text-rose-600 font-medium flex items-center gap-1 mt-1.5 animate-in fade-in"
      >
        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
        <span>{fieldErrors[name]}</span>
      </p>
    );
  };

  // ─── Helper: valid checkmark icon inside input ───────────────────────────────
  const ValidIcon = ({ name }) => {
    if (!CHECKABLE_FIELDS.includes(name)) return null;
    if (!touched[name] || fieldErrors[name] || !formData[name]) return null;
    return <CheckCircle2 className="w-4 h-4 text-emerald-500 absolute right-3.5 top-3 pointer-events-none" />;
  };

  if (initialLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-500 font-semibold mt-4">Loading event details for editing...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-6 border-b border-slate-200">
        <div>
          <Link
            to="/admin/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 transition mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {isEditMode ? 'Edit Event Details' : 'Publish a New Event'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Fields marked <span className="text-rose-500 font-bold">*</span> are required. All data is validated on
            both client and server.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-8">

        {/* ── Section 1: Core Event Information ───────────────────────────── */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-600" /> Core Event Information
          </h2>

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Event Title <span className="text-rose-500">*</span>{' '}
              <span className="text-[10px] text-slate-400 font-normal">(3–120 characters)</span>
            </label>
            <div className="relative">
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="e.g. Global AI & Cloud Architecture Summit 2026"
                className={inputClass('title')}
              />
              <ValidIcon name="title" />
              {touched.title && fieldErrors.title && (
                <AlertCircle className="w-4 h-4 text-rose-500 absolute right-3.5 top-3 pointer-events-none" />
              )}
            </div>
            <FieldError name="title" />
          </div>

          {/* Summary */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Short Summary <span className="text-rose-500">*</span>{' '}
              <span className="text-[10px] text-slate-400 font-normal">
                Shown on event cards &amp; discovery ({formData.summary.length}/300)
              </span>
            </label>
            <div className="relative">
              <textarea
                name="summary"
                rows={2}
                value={formData.summary}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="A concise 1–2 sentence hook highlighting key topics, speakers, or takeaways..."
                className={inputClass('summary')}
              />
            </div>
            <FieldError name="summary" />
          </div>

          {/* Full Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Full Description <span className="text-rose-500">*</span>{' '}
              <span className="text-[10px] text-slate-400 font-normal">(min. 20 characters)</span>
            </label>
            <textarea
              name="description"
              rows={5}
              value={formData.description}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Comprehensive agenda, keynote speakers, session breakdown, prerequisites, and takeaway details..."
              className={inputClass('description')}
            />
            <FieldError name="description" />
          </div>

          {/* Banner URL */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
              <span>
                Banner Image URL <span className="text-rose-500">*</span>
              </span>
              <span className="text-[10px] text-slate-400 font-normal flex items-center gap-1">
                <Info className="w-3 h-3" /> Must start with https://
              </span>
            </label>
            <div className="relative">
              <input
                type="url"
                name="bannerUrl"
                value={formData.bannerUrl}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="https://images.unsplash.com/photo-..."
                className={inputClass('bannerUrl')}
              />
              <ValidIcon name="bannerUrl" />
              {touched.bannerUrl && fieldErrors.bannerUrl && (
                <AlertCircle className="w-4 h-4 text-rose-500 absolute right-3.5 top-3 pointer-events-none" />
              )}
            </div>
            <FieldError name="bannerUrl" />

            {/* Live Image Preview */}
            {formData.bannerUrl && !fieldErrors.bannerUrl && (
              <div className="mt-3 relative h-36 w-full rounded-2xl overflow-hidden border border-slate-200 bg-slate-100">
                <img
                  src={formData.bannerUrl}
                  alt="Banner preview"
                  onError={(e) => {
                    e.target.src =
                      'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80';
                  }}
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900/80 text-white">
                  Live Preview
                </span>
              </div>
            )}
          </div>
        </div>

        {/* ── Section 2: Schedule & Format ────────────────────────────────── */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-600" /> Schedule &amp; Format
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Start Date */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Start Date &amp; Time <span className="text-rose-500">*</span>
              </label>
              <input
                type="datetime-local"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                onBlur={handleBlur}
                className={inputClass('startDate')}
              />
              <FieldError name="startDate" />
            </div>

            {/* End Date */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                End Date &amp; Time <span className="text-rose-500">*</span>
              </label>
              <input
                type="datetime-local"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                onBlur={handleBlur}
                className={inputClass('endDate')}
              />
              <FieldError name="endDate" />
            </div>
          </div>

          {/* Format Radio */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Event Format <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3 max-w-sm">
              <label
                className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition ${formData.format === 'in-person'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-900 font-bold'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
              >
                <input
                  type="radio"
                  name="format"
                  value="in-person"
                  checked={formData.format === 'in-person'}
                  onChange={handleChange}
                  className="hidden"
                />
                <MapPin className="w-4 h-4 text-indigo-600" />
                <span className="text-xs">In-Person Event</span>
              </label>

              <label
                className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition ${formData.format === 'online'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
              >
                <input
                  type="radio"
                  name="format"
                  value="online"
                  checked={formData.format === 'online'}
                  onChange={handleChange}
                  className="hidden"
                />
                <Video className="w-4 h-4 text-emerald-600" />
                <span className="text-xs">Virtual / Online</span>
              </label>
            </div>
          </div>

          {/* Venue / Online Link */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              {formData.format === 'online'
                ? 'Online Meeting Link or Portal URL'
                : 'Physical Venue Address'}{' '}
              <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                name="venue"
                value={formData.venue}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder={
                  formData.format === 'online'
                    ? 'https://meet.google.com/abc-defg-hij or Zoom URL'
                    : 'Hall 4, Moscone Convention Center, 747 Howard St, San Francisco, CA'
                }
                className={inputClass('venue')}
              />
              <ValidIcon name="venue" />
              {touched.venue && fieldErrors.venue && (
                <AlertCircle className="w-4 h-4 text-rose-500 absolute right-3.5 top-3 pointer-events-none" />
              )}
            </div>
            <FieldError name="venue" />
          </div>
        </div>

        {/* ── Section 3: Category, Audience & Registration ─────────────────── */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-600" /> Category, Audience &amp; Registration
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Category — no validation needed (always has a value from enum) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Category <span className="text-rose-500">*</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 transition"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Target Audience */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Target Audience <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="targetAudience"
                  value={formData.targetAudience}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="e.g. Software Engineers, Tech Leads, Founders"
                  className={inputClass('targetAudience')}
                />
                <ValidIcon name="targetAudience" />
                {touched.targetAudience && fieldErrors.targetAudience && (
                  <AlertCircle className="w-4 h-4 text-rose-500 absolute right-3.5 top-3 pointer-events-none" />
                )}
              </div>
              <FieldError name="targetAudience" />
            </div>
          </div>

          {/* Tags — optional, no validation */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
              <span>Technologies &amp; Interest Tags</span>
              <span className="text-[10px] text-slate-400 font-normal">Optional — comma-separated</span>
            </label>
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="React, TypeScript, Cloud, AI, Security"
              className="w-full px-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 transition"
            />
          </div>

          {/* Registration URL */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Registration URL (CTA Target) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <LinkIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
              <input
                type="url"
                name="registrationUrl"
                value={formData.registrationUrl}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="https://eventbrite.com/e/..."
                className={`${inputClass('registrationUrl', 'pl-10')}`}
              />
              {touched.registrationUrl && !fieldErrors.registrationUrl && formData.registrationUrl && (
                <CheckCircle2 className="w-4 h-4 text-emerald-500 absolute right-3.5 top-3 pointer-events-none" />
              )}
              {touched.registrationUrl && fieldErrors.registrationUrl && (
                <AlertCircle className="w-4 h-4 text-rose-500 absolute right-3.5 top-3 pointer-events-none" />
              )}
            </div>
            <FieldError name="registrationUrl" />
          </div>

          {/* Visibility Toggle */}
          <div className="pt-4 border-t border-slate-100 flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
              />
              <span className="text-xs font-bold text-slate-800 group-hover:text-indigo-700 transition">
                Active &amp; Discoverable (Enable Public Listing)
              </span>
            </label>
          </div>
        </div>

        {/* ── Submit Bar ──────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between gap-3 pt-2">
          {/* Error summary hint */}
          {Object.values(fieldErrors).some(Boolean) && (
            <p className="text-xs text-rose-600 font-medium flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              Please fix the highlighted errors above before submitting
            </p>
          )}
          <div className="flex items-center gap-3 ml-auto">
            <button
              type="button"
              onClick={() => setCancelModalOpen(true)}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-200 disabled:opacity-50 transition"
            >
              {submitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{isEditMode ? 'Save Changes' : 'Publish Event'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Cancel Confirmation Modal */}
      <ConfirmationModal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        onConfirm={() => {
          setCancelModalOpen(false);
          navigate('/admin/dashboard');
        }}
        title="Discard Unsaved Changes?"
        message="Are you sure you want to cancel? Any details or edits entered will be discarded."
        confirmText="Yes, Discard & Leave"
        cancelText="Continue Editing"
        variant="warning"
        iconType="cancel"
      />
    </div>
  );
};
