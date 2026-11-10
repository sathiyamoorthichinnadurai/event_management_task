import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ConfirmationModal } from '../components/ConfirmationModal';
import {
  Calendar,
  PlusCircle,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  Video,
  MapPin,
  Shield,
  RefreshCw,
  Users,
  ChevronLeft,
  ChevronRight,
  Search,
} from 'lucide-react';

export const AdminDashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });

  // Confirmation modal state
  // modalConfig: { isOpen, type: 'delete' | 'edit' | 'toggle', event, loading }
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    type: null,
    event: null,
    loading: false,
  });

  const fetchAdminEvents = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit };
      if (searchTerm.trim()) params.search = searchTerm.trim();

      const res = await api.get('/events/admin/all', { params });
      setEvents(res.data.data || []);
      setPagination(
        res.data.pagination || {
          total: res.data.data?.length || 0,
          totalPages: 1,
          page: 1,
          limit: 10,
        }
      );
    } catch (err) {
      toastError(err.customMessage || 'Failed to load events');
    } finally {
      setLoading(false);
    }
  }, [page, limit, searchTerm, toastError]);

  useEffect(() => {
    fetchAdminEvents();
  }, [fetchAdminEvents]);

  // Open Delete confirmation
  const promptDelete = (ev) => {
    setModalConfig({
      isOpen: true,
      type: 'delete',
      event: ev,
      loading: false,
    });
  };

  // Open Edit confirmation
  const promptEdit = (ev) => {
    setModalConfig({
      isOpen: true,
      type: 'edit',
      event: ev,
      loading: false,
    });
  };

  // Open Toggle status confirmation
  const promptToggle = (ev) => {
    setModalConfig({
      isOpen: true,
      type: 'toggle',
      event: ev,
      loading: false,
    });
  };

  const closeModal = () => {
    setModalConfig({ isOpen: false, type: null, event: null, loading: false });
  };

  // Execute confirmed action
  const handleConfirmAction = async () => {
    const { type, event } = modalConfig;
    if (!event) return;

    setModalConfig((prev) => ({ ...prev, loading: true }));

    try {
      if (type === 'delete') {
        await api.delete(`/events/${event._id}`);
        success('Event permanently deleted by administrator');
        closeModal();
        fetchAdminEvents();
      } else if (type === 'edit') {
        closeModal();
        navigate(`/events/${event._id}/edit`);
      } else if (type === 'toggle') {
        const targetActive = !event.isActive;
        const res = await api.patch(`/events/${event._id}/status`, {
          isActive: targetActive,
        });

        setEvents((prev) =>
          prev.map((ev) =>
            ev._id === event._id ? { ...ev, isActive: targetActive } : ev
          )
        );

        success(
          res.data.message ||
            `Event ${targetActive ? 'enabled' : 'disabled'} successfully`
        );
        closeModal();
      }
    } catch (err) {
      toastError(err.customMessage || 'Action failed. Please try again.');
      setModalConfig((prev) => ({ ...prev, loading: false }));
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Dashboard Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
              <Shield className="w-3 h-3 text-amber-600" />
              Administrator Control Panel
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            Global Event Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Full administrative authority: Create, edit, delete, enable/disable events, and monitor user bookings.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchAdminEvents}
            className="p-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition"
            title="Refresh events list"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <Link
            to="/events/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200 transition"
          >
            <PlusCircle className="w-4 h-4" />
            Create New Event
          </Link>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            placeholder="Search events by title, venue..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:outline-none focus:border-indigo-500 transition"
          />
        </div>

        {/* Per-Page Limit */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <span className="text-xs text-slate-500 font-medium">Show:</span>
          <select
            value={limit}
            onChange={(e) => {
              setLimit(Number(e.target.value));
              setPage(1);
            }}
            className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
          >
            <option value={5}>5 per page</option>
            <option value={10}>10 per page</option>
            <option value={20}>20 per page</option>
          </select>
        </div>
      </div>

      {/* Events Table / List View */}
      {loading ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-semibold mt-3">Loading administrative catalog...</p>
        </div>
      ) : events.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-md mx-auto space-y-4 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
            <Calendar className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No events found</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            {searchTerm
              ? `No events matched "${searchTerm}". Try a different search term.`
              : 'There are currently no events in the database. Publish your first event to make it discoverable.'}
          </p>
          <Link
            to="/events/new"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm transition"
          >
            <PlusCircle className="w-3.5 h-3.5" /> Publish Event
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-4 px-6">Event</th>
                  <th className="py-4 px-4">Date & Format</th>
                  <th className="py-4 px-4">Category</th>
                  <th className="py-4 px-4">Bookings</th>
                  <th className="py-4 px-4">Status / Visibility</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {events.map((ev) => {
                  const sDate = new Date(ev.startDate);
                  const formattedDate = !isNaN(sDate)
                    ? sDate.toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : 'TBA';

                  return (
                    <tr
                      key={ev._id}
                      className="hover:bg-slate-50/70 transition-colors"
                    >
                      {/* Event Banner & Title */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3.5">
                          <img
                            src={ev.bannerUrl}
                            alt=""
                            className="w-12 h-12 rounded-xl object-cover bg-slate-100 shrink-0 border border-slate-200"
                            onError={(e) => {
                              e.target.src =
                                'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80';
                            }}
                          />
                          <div className="max-w-xs sm:max-w-sm">
                            <Link
                              to={`/events/${ev._id}`}
                              className="font-bold text-slate-900 hover:text-indigo-600 line-clamp-1 transition"
                            >
                              {ev.title}
                            </Link>
                            <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                              {ev.summary}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Date & Format */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <p className="font-semibold text-slate-800">{formattedDate}</p>
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold capitalize text-slate-500 mt-0.5">
                          {ev.format === 'online' ? (
                            <>
                              <Video className="w-2.5 h-2.5 text-emerald-600" /> Virtual
                            </>
                          ) : (
                            <>
                              <MapPin className="w-2.5 h-2.5 text-indigo-600" /> In-person
                            </>
                          )}
                        </span>
                      </td>

                      {/* Category */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-slate-100 text-slate-700">
                          {ev.category}
                        </span>
                      </td>

                      {/* Bookings Count */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-100">
                          <Users className="w-3 h-3 text-indigo-600" />
                          {ev.bookings?.length || 0} user{ev.bookings?.length === 1 ? '' : 's'}
                        </span>
                      </td>

                      {/* Enable / Disable Status Toggle */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => promptToggle(ev)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition shadow-sm ${
                            ev.isActive
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                              : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                          }`}
                          title={`Click to ${ev.isActive ? 'disable' : 'enable'} this event`}
                        >
                          {ev.isActive ? (
                            <>
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Active (Visible)</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3.5 h-3.5 text-rose-600" />
                              <span>Disabled</span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            to={`/events/${ev._id}`}
                            className="p-2 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition"
                            title="View public details"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>

                          {/* Edit with confirmation */}
                          <button
                            type="button"
                            onClick={() => promptEdit(ev)}
                            className="p-2 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition"
                            title="Edit event"
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          {/* Delete with confirmation */}
                          <button
                            type="button"
                            onClick={() => promptDelete(ev)}
                            className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                            title="Delete event"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Admin Table Pagination Footer */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-500 font-medium">
              Showing{' '}
              <span className="font-bold text-slate-900">
                {Math.min((page - 1) * limit + 1, pagination.total || 0)}
              </span>{' '}
              to{' '}
              <span className="font-bold text-slate-900">
                {Math.min(page * limit, pagination.total || 0)}
              </span>{' '}
              of <span className="font-bold text-slate-900">{pagination.total || 0}</span> events
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-sm"
              >
                <ChevronLeft className="w-3.5 h-3.5" /> Prev
              </button>

              <span className="text-xs font-semibold text-slate-600 px-2">
                Page <span className="font-bold text-slate-900">{page}</span> of{' '}
                <span className="font-bold text-slate-900">{pagination.totalPages || 1}</span>
              </span>

              <button
                type="button"
                disabled={page >= (pagination.totalPages || 1)}
                onClick={() => setPage((p) => p + 1)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-sm"
              >
                Next <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Delete, Edit, and Status Toggle */}
      <ConfirmationModal
        isOpen={modalConfig.isOpen}
        onClose={closeModal}
        onConfirm={handleConfirmAction}
        loading={modalConfig.loading}
        title={
          modalConfig.type === 'delete'
            ? 'Delete Event Permanently?'
            : modalConfig.type === 'edit'
            ? 'Edit Event Configuration?'
            : modalConfig.event?.isActive
            ? 'Disable Event Listing?'
            : 'Enable Event Listing?'
        }
        message={
          modalConfig.type === 'delete'
            ? 'Are you sure you want to delete this event? All attendee booking records associated with this event will be permanently removed. This action cannot be reversed.'
            : modalConfig.type === 'edit'
            ? 'You are about to enter the event editor. Any updates will take effect across public discovery immediately upon publishing.'
            : modalConfig.event?.isActive
            ? 'Disabling this event will hide it from the public discovery catalog immediately. Users will no longer be able to discover or book this event.'
            : 'Enabling this event will publish it back to the public discovery feed. Visitors and registered attendees will be able to discover and book seats.'
        }
        details={
          modalConfig.event ? (
            <div className="space-y-1">
              <p className="font-bold">{modalConfig.event.title}</p>
              <p className="text-[11px] opacity-80">
                {modalConfig.event.format === 'online' ? 'Virtual Event' : 'In-Person Event'} • {modalConfig.event.category}
              </p>
            </div>
          ) : null
        }
        confirmText={
          modalConfig.type === 'delete'
            ? 'Yes, Delete Event'
            : modalConfig.type === 'edit'
            ? 'Proceed to Edit'
            : modalConfig.event?.isActive
            ? 'Yes, Disable Event'
            : 'Yes, Enable Event'
        }
        variant={
          modalConfig.type === 'delete'
            ? 'danger'
            : modalConfig.type === 'toggle' && modalConfig.event?.isActive
            ? 'warning'
            : 'primary'
        }
        iconType={
          modalConfig.type === 'delete'
            ? 'delete'
            : modalConfig.type === 'toggle'
            ? 'warning'
            : 'warning'
        }
      />
    </div>
  );
};
