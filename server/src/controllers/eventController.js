const Event = require('../models/Event');

/**
 * @desc    Create a new event
 * @route   POST /api/events
 * @access  Private (Admin only)
 */
const createEvent = async (req, res, next) => {
  try {
    const eventData = {
      ...req.body,
      createdBy: req.user._id,
    };

    const event = await Event.create(eventData);
    await event.populate('createdBy', 'name email role');

    res.status(201).json({
      success: true,
      message: 'Event published successfully',
      data: event,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all events with search, filters, and pagination
 * @route   GET /api/events
 * @access  Public (Accessible to everyone, logged in or guest)
 */
const getEvents = async (req, res, next) => {
  try {
    const {
      search,
      category,
      format,
      tag,
      startDate,
      endDate,
      page = 1,
      limit = 9,
      sort = 'upcoming',
      includeDisabled = 'false',
    } = req.query;

    const query = {};

    // Standard public visitors & users only see active and published events.
    // Only authenticated admin can view disabled/drafts if requested.
    const isAdmin = req.user && req.user.role === 'admin';
    if (!isAdmin || includeDisabled !== 'true') {
      query.isActive = true;
      query.status = 'published';
    }

    // Category filter
    if (category && category !== 'All') {
      query.category = category;
    }

    // Format filter ('online' | 'in-person')
    if (format && format !== 'all') {
      query.format = format;
    }

    // Tag filter
    if (tag) {
      query.tags = { $in: [tag] };
    }

    // Date range filter
    if (startDate || endDate) {
      query.startDate = {};
      if (startDate) {
        query.startDate.$gte = new Date(startDate);
      }
      if (endDate) {
        query.startDate.$lte = new Date(endDate);
      }
    }

    // Free text / keyword search
    if (search && search.trim() !== '') {
      const term = search.trim();
      query.$or = [
        { title: { $regex: term, $options: 'i' } },
        { summary: { $regex: term, $options: 'i' } },
        { tags: { $regex: term, $options: 'i' } },
        { venue: { $regex: term, $options: 'i' } },
      ];
    }

    // Sorting
    let sortOptions = { startDate: 1 };
    if (sort === 'newest') {
      sortOptions = { createdAt: -1 };
    } else if (sort === 'title') {
      sortOptions = { title: 1 };
    }

    // Pagination
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, Math.min(50, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [events, total] = await Promise.all([
      Event.find(query)
        .populate('createdBy', 'name email')
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Event.countDocuments(query),
    ]);

    // Annotate whether current logged-in user has booked each event
    const eventsWithBookingStatus = events.map((ev) => {
      const isBooked = req.user
        ? ev.bookings?.some(
          (b) => b.user?.toString() === req.user._id.toString()
        )
        : false;

      return {
        ...ev,
        isBookedByCurrentUser: !!isBooked,
        totalBookings: ev.bookings?.length || 0,
      };
    });

    const totalPages = Math.ceil(total / limitNum);

    res.status(200).json({
      success: true,
      data: eventsWithBookingStatus,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single event by ID
 * @route   GET /api/events/:id
 * @access  Public (Accessible to everyone, logged in or guest)
 */
const getEventById = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('createdBy', 'name email role')
      .populate('bookings.user', 'name email');

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    const isAdmin = req.user && req.user.role === 'admin';
    if ((!event.isActive || event.status === 'draft') && !isAdmin) {
      return res.status(404).json({
        success: false,
        message: 'This event is currently unavailable or disabled by administrator',
      });
    }

    const isBooked = req.user
      ? event.bookings?.some(
        (b) =>
          b.user?._id?.toString() === req.user._id.toString() ||
          b.user?.toString() === req.user._id.toString()
      )
      : false;

    res.status(200).json({
      success: true,
      data: {
        ...event.toObject(),
        isBookedByCurrentUser: !!isBooked,
        totalBookings: event.bookings?.length || 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Book / Register for an event
 * @route   POST /api/events/:id/book
 * @access  Private (User only - Authenticated user required, Admins strictly prohibited)
 */
const bookEvent = async (req, res, next) => {
  try {
    // Role guard: Ensure admin cannot book the event
    if (req.user.role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Administrators cannot book events. Only users can book events.',
      });
    }

    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    if (!event.isActive || event.status === 'draft') {
      return res.status(400).json({
        success: false,
        message: 'Cannot book an inactive or unpublished event',
      });
    }

    // Check if already booked by this user
    const alreadyBooked = event.bookings.some(
      (b) => b.user.toString() === req.user._id.toString()
    );

    if (alreadyBooked) {
      return res.status(400).json({
        success: false,
        message: 'You have already booked a seat for this event',
      });
    }

    // Add booking record
    event.bookings.push({
      user: req.user._id,
      bookedAt: new Date(),
    });

    await event.save();

    res.status(200).json({
      success: true,
      message: 'Event registration confirmed! Your seat is reserved.',
      data: {
        eventId: event._id,
        title: event.title,
        bookedAt: new Date(),
        totalBookings: event.bookings.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Cancel an event booking
 * @route   DELETE /api/events/:id/book
 * @access  Private (User only)
 */
const cancelBooking = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    const bookingIndex = event.bookings.findIndex(
      (b) => b.user.toString() === req.user._id.toString()
    );

    if (bookingIndex === -1) {
      return res.status(400).json({
        success: false,
        message: 'You do not have an active booking for this event',
      });
    }

    // Remove the booking
    event.bookings.splice(bookingIndex, 1);
    await event.save();

    res.status(200).json({
      success: true,
      message: 'Event booking cancelled successfully',
      data: {
        eventId: event._id,
        title: event.title,
        totalBookings: event.bookings.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Edit / Update event details
 * @route   PUT /api/events/:id
 * @access  Private (Admin only)
 */
const updateEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email role');

    res.status(200).json({
      success: true,
      message: 'Event updated successfully',
      data: updatedEvent,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete an event
 * @route   DELETE /api/events/:id
 * @access  Private (Admin only)
 */
const deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    await Event.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Event deleted successfully by administrator',
      data: { id: req.params.id },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Enable or Disable an event
 * @route   PATCH /api/events/:id/status
 * @access  Private (Admin only)
 */
const toggleEventStatus = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    const targetStatus =
      typeof req.body.isActive === 'boolean'
        ? req.body.isActive
        : !event.isActive;

    event.isActive = targetStatus;
    await event.save();

    res.status(200).json({
      success: true,
      message: `Event has been ${targetStatus ? 'enabled' : 'disabled'} successfully`,
      data: {
        id: event._id,
        title: event.title,
        isActive: event.isActive,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all events with pagination & search (Admin view including disabled/drafts)
 * @route   GET /api/events/admin/all
 * @access  Private (Admin only)
 */
const getAdminEvents = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.max(1, parseInt(req.query.limit, 10) || 10);
    const skip = (page - 1) * limit;
    const search = req.query.search;

    const query = {};
    if (search && search.trim() !== '') {
      const term = search.trim();
      query.$or = [
        { title: { $regex: term, $options: 'i' } },
        { summary: { $regex: term, $options: 'i' } },
        { category: { $regex: term, $options: 'i' } },
        { venue: { $regex: term, $options: 'i' } },
      ];
    }

    const total = await Event.countDocuments(query);
    const events = await Event.find(query)
      .populate('createdBy', 'name email')
      .populate('bookings.user', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      data: events,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get events booked by logged-in user
 * @route   GET /api/events/user/my-bookings
 * @access  Private (User only)
 */
const getMyBookings = async (req, res, next) => {
  try {
    const events = await Event.find({
      'bookings.user': req.user._id,
    })
      .populate('createdBy', 'name email')
      .sort({ startDate: 1 });

    res.status(200).json({
      success: true,
      data: events,
      total: events.length,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createEvent,
  getEvents,
  getEventById,
  bookEvent,
  cancelBooking,
  updateEvent,
  deleteEvent,
  toggleEventStatus,
  getAdminEvents,
  getMyBookings,
};
