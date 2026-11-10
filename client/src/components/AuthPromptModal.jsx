import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, UserPlus, Info, Calendar } from 'lucide-react';

export const AuthPromptModal = ({ isOpen, onClose, event }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleRegister = () => {
    onClose();
    navigate('/register');
  };

  const handleLearnMore = () => {
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 text-center space-y-6">
        {/* Top Close Icon */}
        <div className="flex justify-end -mr-2 -mt-2">
          <button
            onClick={handleCancel}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Header & Icon */}
        <div className="space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto shadow-inner">
            <UserPlus className="w-7 h-7" />
          </div>

          <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Account Required to Book
          </h3>

          <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
            Please create an attendee account or sign in to reserve your seat for this event.
          </p>

          {event && (
            <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl text-left flex items-start gap-2.5">
              <Calendar className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-slate-800 line-clamp-1">
                  {event.title}
                </p>
                <p className="text-[11px] text-slate-500">
                  {event.format === 'online' ? 'Virtual Event' : 'In-Person Event'} • {event.category}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons as Requested: Register, Learn More, Cancel */}
        <div className="space-y-2 pt-2">
          {/* Primary Action: Register */}
          <button
            onClick={handleRegister}
            className="w-full py-3 px-4 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-200 transition"
          >
            Register Now
          </button>

          {/* Secondary Action: Learn More (Closes popup) */}
          <button
            onClick={handleLearnMore}
            className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
          >
            Learn More
          </button>

          {/* Cancel Action */}
          <button
            onClick={handleCancel}
            className="w-full py-2 px-4 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-600 transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

