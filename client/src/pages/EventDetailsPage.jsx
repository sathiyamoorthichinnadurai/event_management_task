import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ShareModal } from '../components/ShareModal';
import { AuthPromptModal } from '../components/AuthPromptModal';
import { ConfirmationModal } from '../components/ConfirmationModal';
import {
  Calendar,
  Clock,
  MapPin,
  Video,
  Share2,
  ExternalLink,
  Users,
  Tag,
  ArrowLeft,
  Edit,
  Trash2,
  BookmarkCheck,
  CheckCircle,
  AlertCircle,
  Shield,
  XCircle,
} from 'lucide-react';

export const EventDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin, isUser, isAuthenticated } = useAuth();
  const { success, error: toastError } = useToast();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [authPromptOpen, setAuthPromptOpen] = useState(false);

  // Modal confirmation states
  // confirmModal: { isOpen, action: 'book' | 'cancelBooking' | 'delete' | 'edit', loading }
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    action: null,
    loading: false,
  });

  const [isBooked, setIsBooked] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get(`/events/${id}`);
        setEvent(res.data.data);
        setIsBooked(res.data.data.isBookedByCurrentUser);
      } catch (err) {
        setError(err.customMessage || 'Failed to retrieve event information');
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  // Click handler for Book Event
  const handleBookClick = () => {
    if (!isAuthenticated) {
      setAuthPromptOpen(true);
      return;
    }

    if (isAdmin) {
      toastError('Administrators cannot book events. Only users can book events.');
      return;
    }

    setConfirmModal({
      isOpen: true,
      action: 'book',
      loading: false,
    });
  };

  // Click handler for Cancel Booking
  const handleCancelBookingClick = () => {
    setConfirmModal({
      isOpen: true,
      action: 'cancelBooking',
      loading: false,
    });
  };

  // Click handler for Delete Event
  const handleDeleteClick = () => {
    setConfirmModal({
      isOpen: true,
      action: 'delete',
      loading: false,
    });
  };

  // Click handler for Edit Event
  const handleEditClick = () => {
    setConfirmModal({
      isOpen: true,
      action: 'edit',
      loading: false,
    });
  };

  const closeConfirmModal = () => {
    setConfirmModal({ isOpen: false, action: null, loading: false });
  };

  // Execute confirmed modal action
  const handleExecuteConfirmedAction = async () => {
    const { action } = confirmModal;
    setConfirmModal((prev) => ({ ...prev, loading: true }));

    try {
      if (action === 'book') {
        await api.post(`/events/${id}/book`);
        setIsBooked(true);
        success('Booking confirmed! Your seat has been reserved.');
        closeConfirmModal();
      } else if (action === 'cancelBooking') {
        await api.delete(`/events/${id}/book`);
        setIsBooked(false);
        success('Your seat reservation has been cancelled.');
        closeConfirmModal();
      } else if (action === 'delete') {
        await api.delete(`/events/${id}`);
        success('Event deleted successfully');
        closeConfirmModal();
        navigate('/admin/dashboard');
      } else if (action === 'edit') {
        closeConfirmModal();
        navigate(`/events/${id}/edit`);
      }
    } catch (err) {
      toastError(err.customMessage || 'Action failed. Please try again.');
      setConfirmModal((prev) => ({ ...prev, loading: false }));
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 animate-pulse space-y-6">
        <div className="h-6 w-32 bg-slate-200 rounded" />
        <div className="h-80 w-full bg-slate-200 rounded-3xl" />
        <div className="h-10 w-2/3 bg-slate-200 rounded" />
        <div className="h-24 w-full bg-slate-200 rounded" />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white border border-slate-200 rounded-3xl text-center shadow-sm space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Event Unavailable</h2>
        <p className="text-xs text-slate-600 leading-relaxed">
          {error || 'This event could not be found or has been disabled by an administrator.'}
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Discovery
        </Link>
      </div>
    );
  }

  const startDate = new Date(event.startDate);
  const endDate = new Date(event.endDate);

  const formattedStartDate = !isNaN(startDate)
    ? startDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'TBA';

  const formattedStartTime = !isNaN(startDate)
    ? startDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    : '';

  const formattedEndTime = !isNaN(endDate)
    ? endDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZoneName: 'short' })
    : '';

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Breadcrumb & Controls */}
      <div className="flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-indigo-600 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to all events
        </Link>

        <div className="flex items-center gap-2">
          {isAdmin && (
            <>
              <button
                type="button"
                onClick={handleEditClick}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
              >
                <Edit className="w-3.5 h-3.5" /> Edit Event
              </button>
              <button
                type="button"
                onClick={handleDeleteClick}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </button>
            </>
          )}

          <button
            onClick={() => setShareModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold border border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50 transition"
          >
            <Share2 className="w-3.5 h-3.5" /> Share
          </button>
        </div>
      </div>

      {/* Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden shadow-lg aspect-[21/9] max-h-[420px] bg-slate-900">
        <img
          src={event.bannerUrl}
          alt={event.title}
          onError={(e) => {
            e.target.src =
              'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80';
          }}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />

        {/* Badges */}
        <div className="absolute top-4 left-4 flex items-center gap-2">
          <span className="px-3 py-1 text-xs font-bold rounded-xl bg-white/95 text-slate-900 shadow-sm backdrop-blur-md">
            {event.category}
          </span>
          <span
            className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-bold rounded-xl shadow-sm text-white backdrop-blur-md ${
              event.format === 'online' ? 'bg-emerald-600/90' : 'bg-indigo-600/90'
            }`}
          >
            {event.format === 'online' ? (
              <>
                <Video className="w-3.5 h-3.5" /> Virtual Event
              </>
            ) : (
              <>
                <MapPin className="w-3.5 h-3.5" /> In-Person Event
              </>
            )}
          </span>
        </div>
      </div>

      {/* Main Grid: Details + Booking/Action Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Event Content */}
        <div className="lg:col-span-2 space-y-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-snug">
              {event.title}
            </h1>
            <p className="mt-3 text-base sm:text-lg text-slate-600 leading-relaxed font-medium">
              {event.summary}
            </p>
          </div>

          {/* Full Description */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
            <h2 className="text-xl font-bold text-slate-900">About this event</h2>
            <div className="prose prose-slate max-w-none text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {event.description}
            </div>
          </div>

          {/* Target Audience & Tags */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-indigo-600" /> Target Audience
              </h3>
              <p className="text-sm font-semibold text-slate-800">
                {event.targetAudience}
              </p>
            </div>

            {event.tags && event.tags.length > 0 && (
              <div className="pt-4 border-t border-slate-100">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-1.5">
                  <Tag className="w-4 h-4 text-indigo-600" /> Technologies & Topics
                </h3>
                <div className="flex flex-wrap gap-2">
                  {event.tags.map((t, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Booking / Admin CTA Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-lg space-y-6 sticky top-24">
            {/* Booking Action for User and Unauthenticated Guests */}
            {!isAdmin && (
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={handleBookClick}
                  disabled={isBooked}
                  className={`w-full inline-flex items-center justify-center gap-2 py-4 px-6 rounded-2xl font-bold transition shadow-md ${
                    isBooked
                      ? 'bg-emerald-50 text-emerald-800 border-2 border-emerald-300 shadow-none cursor-default'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200'
                  }`}
                >
                  {isBooked ? (
                    <>
                      <CheckCircle className="w-5 h-5 text-emerald-600" />
                      <span>Seat Reserved</span>
                    </>
                  ) : (
                    <>
                      <BookmarkCheck className="w-5 h-5" />
                      <span>Book Event Seat</span>
                    </>
                  )}
                </button>

                {/* If booked, allow cancellation */}
                {isBooked && (
                  <button
                    type="button"
                    onClick={handleCancelBookingClick}
                    className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-4 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 transition"
                  >
                    <XCircle className="w-4 h-4" />
                    Cancel My Booking
                  </button>
                )}

                <p className="text-[11px] text-center text-slate-400 mt-1">
                  {isBooked
                    ? 'You hold a confirmed seat for this event'
                    : isAuthenticated
                    ? 'Instant reservation with your user account'
                    : 'Sign in or register to reserve your seat'}
                </p>
              </div>
            )}

            {/* Admin Role Notice */}
            {isAdmin && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 text-amber-800 font-bold text-xs">
                  <Shield className="w-4 h-4 text-amber-600" />
                  <span>Admin Mode Active</span>
                </div>
                <p className="text-[11px] text-amber-700 leading-snug">
                  Administrators have full event management permissions (Create, Edit, Delete, Disable). Booking seats is reserved strictly for users.
                </p>
                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={handleEditClick}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition"
                  >
                    <Edit className="w-3.5 h-3.5" /> Edit Event
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteClick}
                    className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold hover:bg-rose-100 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-600" /> Delete
                  </button>
                </div>
              </div>
            )}

            {/* External Registration URL Link */}
            {event.registrationUrl && (
              <a
                href={event.registrationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-xs text-slate-700 hover:text-indigo-600 border border-slate-200 hover:bg-slate-50 transition"
              >
                <span>External Link: Official Website</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}

            <hr className="border-slate-100" />

            {/* Date and Time Details */}
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Date</p>
                <p className="text-sm font-bold text-slate-900 mt-0.5">{formattedStartDate}</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {formattedStartTime} - {formattedEndTime}
                </p>
              </div>
            </div>

            {/* Venue or Online Meeting Link */}
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                {event.format === 'online' ? (
                  <Video className="w-5 h-5" />
                ) : (
                  <MapPin className="w-5 h-5" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  {event.format === 'online' ? 'Virtual Location' : 'Venue Address'}
                </p>
                <p className="text-sm font-bold text-slate-900 mt-0.5 break-words">
                  {event.venue}
                </p>
              </div>
            </div>

            {/* Attendees / Bookings Count */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-semibold">Total Registered Attendees:</span>
              <span className="font-extrabold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                {event.totalBookings || event.bookings?.length || 0}
              </span>
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

      {/* Confirmation Modal for Booking, Cancellation, Edit, and Delete */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={closeConfirmModal}
        onConfirm={handleExecuteConfirmedAction}
        loading={confirmModal.loading}
        title={
          confirmModal.action === 'book'
            ? 'Confirm Seat Reservation?'
            : confirmModal.action === 'cancelBooking'
            ? 'Cancel Your Seat Reservation?'
            : confirmModal.action === 'delete'
            ? 'Delete Event Permanently?'
            : 'Proceed to Edit Event?'
        }
        message={
          confirmModal.action === 'book'
            ? 'Are you ready to reserve your seat for this event? Your registration will be confirmed immediately.'
            : confirmModal.action === 'cancelBooking'
            ? 'Are you sure you want to cancel your seat reservation? Your spot will be released immediately.'
            : confirmModal.action === 'delete'
            ? 'Are you sure you want to permanently delete this event? This action cannot be reversed.'
            : 'You are about to navigate to the event editor. Changes will take effect immediately upon updating.'
        }
        details={
          event ? (
            <div className="space-y-1">
              <p className="font-bold">{event.title}</p>
              <p className="text-[11px] opacity-80">
                {event.format === 'online' ? 'Virtual Event' : 'In-Person Event'} • {event.category}
              </p>
            </div>
          ) : null
        }
        confirmText={
          confirmModal.action === 'book'
            ? 'Yes, Confirm Reservation'
            : confirmModal.action === 'cancelBooking'
            ? 'Yes, Cancel Reservation'
            : confirmModal.action === 'delete'
            ? 'Yes, Delete Event'
            : 'Proceed to Edit'
        }
        variant={
          confirmModal.action === 'delete' || confirmModal.action === 'cancelBooking'
            ? 'danger'
            : 'primary'
        }
        iconType={
          confirmModal.action === 'book'
            ? 'booking'
            : confirmModal.action === 'cancelBooking'
            ? 'cancel'
            : confirmModal.action === 'delete'
            ? 'delete'
            : 'warning'
        }
      />
    </div>
  );
};
