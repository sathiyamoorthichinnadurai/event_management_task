import React, { useState } from 'react';
import { X, Copy, Check, Share2, Globe, ExternalLink } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export const ShareModal = ({ isOpen, onClose, event }) => {
  const [copied, setCopied] = useState(false);
  const { success } = useToast();

  if (!isOpen || !event) return null;

  const shareUrl = `${window.location.origin}/events/${event._id || event.id}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      success('Event link copied to clipboard!');
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      // Fallback for clipboard API restrictions
      const input = document.getElementById('share-url-input');
      if (input) {
        input.select();
        document.execCommand('copy');
        setCopied(true);
        success('Event link copied to clipboard!');
        setTimeout(() => setCopied(false), 2500);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Share2 className="w-4 h-4" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Share Event</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="my-5">
          <p className="text-sm font-semibold text-slate-900 line-clamp-1 mb-1">
            {event.title}
          </p>
          <p className="text-xs text-slate-500 mb-4">
            Anyone with this unique link can view event details and register.
          </p>

          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Shareable Event URL
          </label>
          <div className="flex items-center gap-2">
            <input
              id="share-url-input"
              type="text"
              readOnly
              value={shareUrl}
              className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-mono focus:outline-none"
            />
            <button
              onClick={handleCopy}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm'
              }`}
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

