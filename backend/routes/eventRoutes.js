const express = require('express');
const router = express.Router();
const {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent
} = require('../controllers/eventController');
const { validateObjectId } = require('../middleware/validate');

// Root /api/events
router.route('/')
  .post(createEvent)
  .get(getEvents);

// /api/events/:id
router.route('/:id')
  .get(validateObjectId('id'), getEventById)
  .put(validateObjectId('id'), updateEvent)
  .delete(validateObjectId('id'), deleteEvent);

module.exports = router;
