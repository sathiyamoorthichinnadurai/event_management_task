const express = require('express');
const {
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
} = require('../controllers/eventController');
const {
  protect,
  optionalAuth,
  allowedRoles,
} = require('../middleware/authMiddleware');
const validate = require('../middleware/validateMiddleware');
const {
  createEventSchema,
  updateEventSchema,
} = require('../validations/eventValidation');

const router = express.Router();

/**
 * Public Discovery Routes (Accessible to EVERY user, even guests without login)
 * optionalAuth automatically annotates isBookedByCurrentUser if logged in.
 */
router.get('/', optionalAuth, getEvents);
router.get('/:id', optionalAuth, getEventById);

/**
 * Protected Routes - Require valid JWT Bearer Token
 */
router.use(protect);

/**
 * User-Only Booking Routes (Admins strictly prohibited from booking)
 */
router.post('/:id/book', allowedRoles('user'), bookEvent);
router.delete('/:id/book', allowedRoles('user'), cancelBooking);
router.get('/user/my-bookings', allowedRoles('user'), getMyBookings);

/**
 * Admin-Only Management Routes (Users strictly prohibited from mutating events)
 */
router.get('/admin/all', allowedRoles('admin'), getAdminEvents);
router.post('/', allowedRoles('admin'), validate(createEventSchema), createEvent);
router.put('/:id', allowedRoles('admin'), validate(updateEventSchema), updateEvent);
router.delete('/:id', allowedRoles('admin'), deleteEvent);
router.patch('/:id/status', allowedRoles('admin'), toggleEventStatus);

module.exports = router;
