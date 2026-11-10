import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import {
  Calendar,
  MapPin,
  Video,
  Share2,
  ArrowRight,
  BookmarkCheck,
  Tag,
  Check,
} from 'lucide-react';
import { ShareModal } from './ShareModal';
import { AuthPromptModal } from './AuthPromptModal';
import { ConfirmationModal } from './ConfirmationModal';

export const EventCard = ({ event, onBookSuccess }) => {
  const { user, isAdmin, isUser, isAuthenticated } = useAuth();
  const { success, error: toastError } = useToast();
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [authPromptOpen, setAuthPromptOpen] = useState(false);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [booking, setBooking] = useState(false);
  const [isBooked, setIsBooked] = useState(event.isBookedByCurrentUser);

  const [imgSrc, setImgSrc] = useState(
    event.bannerUrl ||
      'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80'
  );

  const startDate = new Date(event.startDate);
  const formattedDate = !isNaN(startDate)
    ? startDate.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      })
    : 'Date TBA';

  const formattedTime = !isNaN(startDate)
    ? startDate.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
      })
    : '';

  const handleBookClick = (e) => {
    e.preventDefault();

    // If user is not logged in, show the requested auth popup
    if (!isAuthenticated) {
      setAuthPromptOpen(true);
      return;
    }

    // If logged in as admin, reject booking
    if (isAdmin) {
      toastError('Administrators cannot book events. Only users can book events.');
      return;
    }

    // Open confirmation modal
    setBookingModalOpen(true);
  };

  const handleConfirmBooking = async () => {
    setBooking(true);
    try {
      await api.post(`/events/${event._id || event.id}/book`);
      setIsBooked(true);
      success(`Booked! Your seat is reserved for "${event.title}"`);
      if (onBookSuccess) onBookSuccess(event._id || event.id);
      setBookingModalOpen(false);
    } catch (err) {
      toastError(err.customMessage || 'Booking failed');
    } finally {
      setBooking(false);
    }
  };

  return (
    <>
      <div className="group bg-white rounded-2xl border border-slate-200 hover:border-indigo-300 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col h-full">
        {/* Banner with Format & Category Badges */}
        <div className="relative h-48 w-full overflow-hidden bg-slate-100">
          <img
            src={imgSrc}
            alt={event.title}
            onError={() =>
              setImgSrc(
                'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=1200&q=80'
              )
            }
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />

          {/* Badges Overlay */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
            <span className="px-2.5 py-1 text-xs font-bold rounded-lg backdrop-blur-md bg-white/90 text-slate-800 shadow-sm">
              {event.category}
            </span>

            <span
              className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg backdrop-blur-md shadow-sm ${
                event.format === 'online'
                  ? 'bg-emerald-500/90 text-white'
                  : 'bg-indigo-600/90 text-white'
              }`}
            >
              {event.format === 'online' ? (
                <>
                  <Video className="w-3 h-3" /> Online
                </>
              ) : (
                <>
                  <MapPin className="w-3 h-3" /> In-Person
                </>
              )}
            </span>
          </div>

          {/* Date Tag over Banner */}
          <div className="absolute bottom-3 left-3 text-white">
            <p className="text-xs font-semibold tracking-wide flex items-center gap-1.5 drop-shadow-md">
              <Calendar className="w-3.5 h-3.5 text-indigo-300" />
              <span>{formattedDate}</span>
              {formattedTime && <span className="opacity-80">• {formattedTime}</span>}
            </p>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 flex-1 flex flex-col justify-between">
          <div>
            <Link to={`/events/${event._id || event.id}`}>
              <h3 className="font-bold text-lg text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1 mb-2">
                {event.title}
              </h3>
            </Link>

            <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4">
              {event.summary}
            </p>

            {/* Venue / Meeting Details */}
            <p className="text-xs text-slate-500 flex items-center gap-1.5 mb-3">
              {event.format === 'online' ? (
                <Video className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              ) : (
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              )}
              <span className="truncate">{event.venue}</span>
            </p>

            {/* Tags Pills */}
            {event.tags && event.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-4">
                {event.tags.slice(0, 3).map((tag, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-600"
                  >
                    <Tag className="w-2.5 h-2.5 text-slate-400" />
                    {tag}
                  </span>
                ))}
                {event.tags.length > 3 && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] text-slate-400">
                    +{event.tags.length - 3}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Action Row */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
            <button
              onClick={() => setShareModalOpen(true)}
              className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
              title="Share event link"
              aria-label="Share event"
            >
              <Share2 className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2">
              <Link
                to={`/events/${event._id || event.id}`}
                className="px-3 py-1.5 text-xs font-bold text-slate-700 hover:text-indigo-600 hover:bg-slate-50 rounded-lg transition"
              >
                Learn more
              </Link>

              {/* Booking CTA (for users & unauthenticated visitors) */}
              {!isAdmin && (
                <button
                  onClick={handleBookClick}
                  disabled={booking || isBooked}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition shadow-sm ${
                    isBooked
                      ? 'bg-emerald-100 text-emerald-800 cursor-default'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  }`}
                >
                  {isBooked ? (
                    <>
                      <Check className="w-3.5 h-3.5" /> Booked
                    </>
                  ) : booking ? (
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <BookmarkCheck className="w-3.5 h-3.5" /> Book Event
                    </>
                  )}
                </button>
              )}

              {/* Admin CTA (Edit Event) */}
              {isAdmin && (
                <Link
                  to={`/events/${event._id || event.id}/edit`}
                  className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-sm transition"
                >
                  Edit Event
                  <ArrowRight className="w-3 h-3" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      <ShareModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        event={event}
      />

      <AuthPromptModal
        isOpen={authPromptOpen}
        onClose={() => setAuthPromptOpen(false)}
        event={event}
      />

      {/* Booking Confirmation Modal */}
      <ConfirmationModal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        onConfirm={handleConfirmBooking}
        loading={booking}
        title="Confirm Seat Reservation?"
        message="Would you like to reserve a confirmed seat for this event?"
        details={
          event ? (
            <div className="space-y-0.5">
              <p className="font-bold">{event.title}</p>
              <p className="text-[11px] opacity-80">
                {formattedDate} • {event.format === 'online' ? 'Virtual' : 'In-Person'}
              </p>
            </div>
          ) : null
        }
        confirmText="Confirm Reservation"
        cancelText="Cancel"
        variant="primary"
        iconType="booking"
      />
    </>
  );
};

export default EventCard;

