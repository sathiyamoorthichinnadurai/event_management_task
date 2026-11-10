import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { EventCard } from '../components/EventCard';
import { SkeletonCard } from '../components/SkeletonCard';
import {
  Search,
  SlidersHorizontal,
  Calendar,
  X,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Filter,
} from 'lucide-react';

const CATEGORIES = [
  'All',
  'Technology',
  'Design',
  'Business',
  'Marketing',
  'Workshop',
  'Conference',
  'Other',
];

export const HomePage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedFormat, setSelectedFormat] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [sortOrder, setSortOrder] = useState('upcoming');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(9);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });

  // Debounce search input (350ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1); // Reset to page 1 on new search
    }, 350);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = {
        page,
        limit,
        sort: sortOrder,
      };

      if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
      if (selectedCategory !== 'All') params.category = selectedCategory;
      if (selectedFormat !== 'all') params.format = selectedFormat;
      if (startDate) params.startDate = new Date(startDate).toISOString();

      const res = await api.get('/events', { params });
      setEvents(res.data.data || []);
      setPagination(res.data.pagination || { total: 0, totalPages: 1 });
    } catch (err) {
      setError(err.customMessage || 'Failed to load events. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, selectedCategory, selectedFormat, startDate, sortOrder, page, limit]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setDebouncedSearch('');
    setSelectedCategory('All');
    setSelectedFormat('all');
    setStartDate('');
    setSortOrder('upcoming');
    setPage(1);
  };

  const hasActiveFilters =
    debouncedSearch !== '' ||
    selectedCategory !== 'All' ||
    selectedFormat !== 'all' ||
    startDate !== '';

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-indigo-900 via-slate-900 to-slate-900 text-white pt-16 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#818cf8_1px,transparent_1px)] [background-size:16px_16px]" />
        
        <div className="relative max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            Empowering Organizers & Tech Communities
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
            Discover, Share & Attend <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-sky-300 to-teal-300">
              World-Class Events
            </span>
          </h1>

          <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Find cutting-edge tech conferences, design masterclasses, executive summits, and hands-on coding workshops worldwide.
          </p>

          {/* Search Input Bar */}
          <div className="pt-4 max-w-2xl mx-auto">
            <div className="relative flex items-center shadow-2xl rounded-2xl overflow-hidden border border-white/10 bg-white/10 backdrop-blur-xl focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-400/30 transition">
              <Search className="w-5 h-5 text-slate-400 ml-4 shrink-0" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by topic, speaker, keyword, or venue..."
                className="w-full py-4 pl-3 pr-10 bg-transparent text-white placeholder-slate-400 text-sm sm:text-base focus:outline-none"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="mr-3 p-1 rounded-full text-slate-400 hover:text-white transition"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content & Discovery Controls */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 -mt-6">
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 sm:p-6 mb-8 space-y-5">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat);
                  setPage(1);
                }}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Secondary Controls Bar: Format, Date, Sort */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-100">
            <div className="flex flex-wrap items-center gap-3">
              {/* Format Filter */}
              <div className="inline-flex rounded-xl bg-slate-100 p-1">
                {['all', 'in-person', 'online'].map((fmt) => (
                  <button
                    key={fmt}
                    onClick={() => {
                      setSelectedFormat(fmt);
                      setPage(1);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition ${
                      selectedFormat === fmt
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {fmt === 'all' ? 'All Formats' : fmt}
                  </button>
                ))}
              </div>

              {/* Start Date Picker */}
              <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-xl text-xs text-slate-700">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span className="font-semibold text-slate-500">From:</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setPage(1);
                  }}
                  className="bg-transparent text-xs font-semibold text-slate-800 focus:outline-none"
                />
              </div>

              {/* Clear Filters CTA */}
              {hasActiveFilters && (
                <button
                  onClick={handleResetFilters}
                  className="flex items-center gap-1 text-xs font-bold text-rose-600 hover:text-rose-700 hover:underline px-2"
                >
                  <X className="w-3.5 h-3.5" />
                  Reset all
                </button>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500 font-semibold">Sort by:</span>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="bg-slate-100 border-none font-bold text-slate-800 rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-indigo-500"
              >
                <option value="upcoming">Upcoming First</option>
                <option value="newest">Recently Published</option>
                <option value="title">Alphabetical (Title)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Counter */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm font-semibold text-slate-600">
            Showing <span className="text-slate-900 font-bold">{events.length}</span> of{' '}
            <span className="text-slate-900 font-bold">{pagination.total}</span> events
          </p>
        </div>

        {/* Loading Skeletons State */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="p-8 bg-rose-50 border border-rose-200 rounded-2xl text-center max-w-lg mx-auto space-y-4">
            <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-rose-900">Failed to load events</h3>
              <p className="text-xs text-rose-700 mt-1">{error}</p>
            </div>
            <button
              onClick={fetchEvents}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white transition shadow-sm"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Retry Query
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && events.length === 0 && (
          <div className="p-12 bg-white border border-slate-200 rounded-2xl text-center max-w-md mx-auto space-y-4 shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
              <Filter className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">No events matched your search</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                We couldn't find any events matching your selected filters. Try broadening your keywords or clearing criteria.
              </p>
            </div>
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition shadow-sm"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reset All Filters
            </button>
          </div>
        )}

        {/* Events Grid */}
        {!loading && !error && events.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <EventCard key={event._id || event.id} event={event} />
            ))}
          </div>
        )}

        {/* Enhanced Pagination Bar with Per-Page Limit */}
        {!loading && events.length > 0 && (
          <div className="mt-12 pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Range and Total */}
            <div className="text-xs text-slate-500 font-medium">
              Showing{' '}
              <span className="font-bold text-slate-900">
                {Math.min((page - 1) * limit + 1, pagination.total || 0)}
              </span>{' '}
              to{' '}
              <span className="font-bold text-slate-900">
                {Math.min(page * limit, pagination.total || 0)}
              </span>{' '}
              of <span className="font-bold text-slate-900">{pagination.total || 0}</span> events
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="flex items-center gap-1 px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-sm"
              >
                <ChevronLeft className="w-3.5 h-3.5" /> Prev
              </button>

              {/* Page Numbers */}
              {Array.from({ length: pagination.totalPages || 1 }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === pagination.totalPages || Math.abs(p - page) <= 1)
                .map((p, idx, arr) => (
                  <React.Fragment key={p}>
                    {idx > 0 && arr[idx - 1] !== p - 1 && (
                      <span className="px-1 text-slate-400 text-xs">...</span>
                    )}
                    <button
                      type="button"
                      onClick={() => setPage(p)}
                      className={`w-8 h-8 rounded-xl text-xs font-bold transition ${
                        p === page
                          ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {p}
                    </button>
                  </React.Fragment>
                ))}

              <button
                type="button"
                disabled={page >= (pagination.totalPages || 1)}
                onClick={() => setPage((p) => p + 1)}
                className="flex items-center gap-1 px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-sm"
              >
                Next <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Per-Page Limit Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Show:</span>
              <select
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPage(1);
                }}
                className="px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:border-indigo-500 shadow-sm"
              >
                <option value={6}>6 per page</option>
                <option value={9}>9 per page</option>
                <option value={12}>12 per page</option>
                <option value={18}>18 per page</option>
              </select>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

