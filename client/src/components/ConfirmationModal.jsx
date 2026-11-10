import React from 'react';
import {
  AlertTriangle,
  Trash2,
  LogOut,
  BookmarkCheck,
  CheckCircle2,
  X,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

/**
 * Reusable Confirmation Modal
 *
 * Props:
 * - isOpen (boolean): visibility state
 * - onClose (fn): callback when canceled or closed
 * - onConfirm (fn): callback when confirmed
 * - title (string): modal heading
 * - message (string): description of the action
 * - details (string | ReactNode): optional highlighted details box
 * - confirmText (string): text on the action button (e.g. "Yes, Delete")
 * - cancelText (string): text on the dismiss button (default "Cancel")
 * - variant ('danger' | 'primary' | 'warning'): style preset
 * - iconType ('delete' | 'logout' | 'booking' | 'warning' | 'cancel'): icon preset
 * - loading (boolean): shows spinner on confirm button
 */
export const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message = 'Please confirm if you would like to proceed with this action.',
  details = null,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'primary',
  iconType = 'warning',
  loading = false,
}) => {
  if (!isOpen) return null;

  // Variant styling
  const variantStyles = {
    danger: {
      btn: 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-200',
      iconBg: 'bg-rose-100 text-rose-600',
      badge: 'text-rose-700 bg-rose-50 border-rose-200',
    },
    primary: {
      btn: 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200',
      iconBg: 'bg-indigo-100 text-indigo-600',
      badge: 'text-indigo-700 bg-indigo-50 border-indigo-200',
    },
    warning: {
      btn: 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-200',
      iconBg: 'bg-amber-100 text-amber-600',
      badge: 'text-amber-800 bg-amber-50 border-amber-200',
    },
  };

  const style = variantStyles[variant] || variantStyles.primary;

  // Icon selector
  const renderIcon = () => {
    switch (iconType) {
      case 'delete':
        return <Trash2 className="w-6 h-6" />;
      case 'logout':
        return <LogOut className="w-6 h-6" />;
      case 'booking':
        return <BookmarkCheck className="w-6 h-6" />;
      case 'cancel':
        return <AlertCircle className="w-6 h-6" />;
      case 'warning':
      default:
        return <AlertTriangle className="w-6 h-6" />;
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-100 space-y-5 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header: Icon + Close button */}
        <div className="flex items-start justify-between">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${style.iconBg}`}>
            {renderIcon()}
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-2">
          <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">
            {title}
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            {message}
          </p>

          {details && (
            <div className={`p-3 rounded-xl border text-xs font-medium mt-3 ${style.badge}`}>
              {details}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition disabled:opacity-50"
          >
            {cancelText}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold shadow-md transition disabled:opacity-50 ${style.btn}`}
          >
            {loading && (
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            <span>{confirmText}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
