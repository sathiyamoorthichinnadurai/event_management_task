import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { SkeletonCard } from '../components/SkeletonCard';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { ShareModal } from '../components/ShareModal';
import {
  BookmarkCheck,
  Calendar,
  ArrowLeft,
  RefreshCw,
  Compass,
  MapPin,
  Video,
  Share2,
  Trash2,
  CheckCircle,
  Clock,
  Tag,
  ArrowRight,
} from 'lucide-react';

export const MyBookingsPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const { success, error: toastError } = useToast();

  // Cancel booking confirmation state
  const [cancelModal, setCancelModal] = useState({
    isOpen: false,
    event: null,
    loading: false,
  });

  // Share modal state
  const [shareEvent, setShareEvent] = useState(null);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await api.get('/events/user/my-bookings');
      setEvents(res.data.data || []);
    } catch (err) {
      toastError(err.customMessage || 'Failed to load your booked events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const promptCancelBooking = (event) => {
    setCancelModal({
      isOpen: true,
      event,
      loading: false,
    });
  };

  const handleConfirmCancel = async () => {
    const { event } = cancelModal;
    if (!event) return;

    setCancelModal((prev) => ({ ...prev, loading: true }));
    try {
      await api.delete(`/events/${event._id || event.id}/book`);
      setEvents((prev) => prev.filter((ev) => (ev._id || ev.id) !== (event._id || event.id)));
      success(`Booking for "${event.title}" has been cancelled successfully`);
      setCancelModal({ isOpen: false, event: null, loading: false });
    } catch (err) {
      toastError(err.customMessage || 'Failed to cancel booking');
      setCancelModal((prev) => ({ ...prev, loading: false }));
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 min-h-[80vh]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 transition mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Discovery
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <BookmarkCheck className="w-7 h-7 text-indigo-600" />
            My Booked Events
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track, share, and manage your upcoming registered event seats.
          </p>
        </div>

        <button
          onClick={fetchBookings}
          className="self-start sm:self-auto p-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition"
          title="Refresh bookings"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Loading Skeletons */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && events.length === 0 && (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-md mx-auto space-y-4 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
            <Calendar className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No events booked yet</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            You haven't reserved seats for any events yet. Explore our discovery catalog and register for your first event!
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-200 transition"
          >
            <Compass className="w-4 h-4" /> Browse Upcoming Events
          </Link>
        </div>
      )}

      {/* Events Grid with Explicit Cancel Booking Action */}
      {!loading && events.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((ev) => {
            const startDate = new Date(ev.startDate);
            const formattedDate = !isNaN(startDate)
              ? startDate.toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })
              : 'TBA';

            return (
              <div
                key={ev._id || ev.id}
                className="group bg-white rounded-2xl border border-slate-200 hover:border-indigo-300 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col h-full"
              >
                {/* Banner with Badges */}
                <div className="relative h-44 w-full overflow-hidden bg-slate-100">
                  <img
                    src={ev.bannerUrl}
                    alt={ev.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      e.target.src =
                        'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />

                  {/* Badges Overlay */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                    <span className="px-2.5 py-1 text-xs font-bold rounded-lg backdrop-blur-md bg-white/90 text-slate-800 shadow-sm">
                      {ev.category}
                    </span>

                    <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg backdrop-blur-md bg-emerald-600/90 text-white shadow-sm">
                      <CheckCircle className="w-3.5 h-3.5" /> Confirmed
                    </span>
                  </div>

                  {/* Date Tag over Banner */}
                  <div className="absolute bottom-3 left-3 text-white">
                    <p className="text-xs font-semibold tracking-wide flex items-center gap-1.5 drop-shadow-md">
                      <Calendar className="w-3.5 h-3.5 text-indigo-300" />
                      <span>{formattedDate}</span>
                    </p>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <Link to={`/events/${ev._id || ev.id}`}>
                      <h3 className="font-bold text-base text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1 mb-1.5">
                        {ev.title}
                      </h3>
                    </Link>

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-3">
                      {ev.summary}
                    </p>

                    <p className="text-xs text-slate-500 flex items-center gap-1.5">
                      {ev.format === 'online' ? (
                        <Video className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      ) : (
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      )}
                      <span className="truncate">{ev.venue}</span>
                    </p>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => setShareEvent(ev)}
                      className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                      title="Share event link"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>

                    <div className="flex items-center gap-2">
                      <Link
                        to={`/events/${ev._id || ev.id}`}
                        className="px-3 py-1.5 text-xs font-bold text-slate-700 hover:text-indigo-600 hover:bg-slate-50 rounded-lg transition"
                      >
                        Details
                      </Link>

                      {/* Cancel Booking Button */}
                      <button
                        type="button"
                        onClick={() => promptCancelBooking(ev)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Cancel Booking
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Confirmation Modal for Booking Cancellation */}
      <ConfirmationModal
        isOpen={cancelModal.isOpen}
        onClose={() => setCancelModal({ isOpen: false, event: null, loading: false })}
        onConfirm={handleConfirmCancel}
        loading={cancelModal.loading}
        title="Cancel Seat Reservation?"
        message="Are you sure you want to cancel your seat for this event? Your spot will be released immediately."
        details={
          cancelModal.event ? (
            <div className="space-y-1">
              <p className="font-bold">{cancelModal.event.title}</p>
              <p className="text-[11px] opacity-80">
                {cancelModal.event.format === 'online' ? 'Virtual Event' : 'In-Person Event'} • {cancelModal.event.category}
              </p>
            </div>
          ) : null
        }
        confirmText="Yes, Cancel Booking"
        cancelText="Keep My Seat"
        variant="danger"
        iconType="cancel"
      />

      {/* Share Modal */}
      {shareEvent && (
        <ShareModal
          isOpen={Boolean(shareEvent)}
          onClose={() => setShareEvent(null)}
          event={shareEvent}
        />
      )}
    </div>
  );
};

export default MyBookingsPage;
