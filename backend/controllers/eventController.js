const Event = require('../models/Event');
const Registration = require('../models/Registration');

/**
 * @desc    Create a new event
 * @route   POST /api/events
 */
const createEvent = async (req, res, next) => {
  try {
    const {
      title,
      description,
      category,
      venue,
      eventDate,
      startTime,
      endTime,
      capacity,
      organizer
    } = req.body;

    const event = await Event.create({
      title,
      description,
      category,
      venue,
      eventDate,
      startTime,
      endTime,
      capacity: Number(capacity),
      organizer
    });

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: event
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all events with search, category filtering, and registration counts
 * @route   GET /api/events
 */
const getEvents = async (req, res, next) => {
  try {
    const { search, category, sortBy } = req.query;

    const query = {};

    // Category filter
    if (category && category !== 'All') {
      query.category = category;
    }

    // Search query on title, venue, or organizer
    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { title: searchRegex },
        { venue: searchRegex },
        { organizer: searchRegex },
        { description: searchRegex }
      ];
    }

    // Sort order (default to upcoming events first)
    let sort = { eventDate: 1 };
    if (sortBy === 'newest') sort = { createdAt: -1 };
    if (sortBy === 'oldest') sort = { createdAt: 1 };
    if (sortBy === 'title') sort = { title: 1 };

    const events = await Event.find(query).sort(sort).lean();

    // Attach active registration count and seats left for each event
    const eventsWithCounts = await Promise.all(
      events.map(async (event) => {
        const registeredCount = await Registration.countDocuments({
          eventId: event._id,
          status: 'Registered'
        });
        const seatsLeft = Math.max(0, event.capacity - registeredCount);
        return {
          ...event,
          registeredCount,
          seatsLeft,
          isFull: registeredCount >= event.capacity
        };
      })
    );

    res.status(200).json({
      success: true,
      count: eventsWithCounts.length,
      data: eventsWithCounts
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get a single event by ID with registration statistics
 * @route   GET /api/events/:id
 */
const getEventById = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id).lean();

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    const registeredCount = await Registration.countDocuments({
      eventId: event._id,
      status: 'Registered'
    });
    const cancelledCount = await Registration.countDocuments({
      eventId: event._id,
      status: 'Cancelled'
    });
    const seatsLeft = Math.max(0, event.capacity - registeredCount);

    res.status(200).json({
      success: true,
      data: {
        ...event,
        registeredCount,
        cancelledCount,
        seatsLeft,
        isFull: registeredCount >= event.capacity
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update an event
 * @route   PUT /api/events/:id
 */
const updateEvent = async (req, res, next) => {
  try {
    const {
      title,
      description,
      category,
      venue,
      eventDate,
      startTime,
      endTime,
      capacity,
      organizer
    } = req.body;

    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // If capacity is reduced, check that it's not below active registrations
    if (capacity !== undefined) {
      const activeCount = await Registration.countDocuments({
        eventId: event._id,
        status: 'Registered'
      });
      if (Number(capacity) < activeCount) {
        return res.status(400).json({
          success: false,
          message: `Cannot reduce capacity to ${capacity}. There are already ${activeCount} active registered students.`
        });
      }
      event.capacity = Number(capacity);
    }

    if (title) event.title = title;
    if (description) event.description = description;
    if (category) event.category = category;
    if (venue) event.venue = venue;
    if (eventDate) event.eventDate = eventDate;
    if (startTime) event.startTime = startTime;
    if (endTime) event.endTime = endTime;
    if (organizer) event.organizer = organizer;

    const updatedEvent = await event.save();

    res.status(200).json({
      success: true,
      message: 'Event updated successfully',
      data: updatedEvent
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete an event safely
 * @route   DELETE /api/events/:id
 */
const deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Delete associated registrations to keep database clean and consistent
    const deletedRegistrations = await Registration.deleteMany({ eventId: event._id });

    await event.deleteOne();

    res.status(200).json({
      success: true,
      message: `Event and ${deletedRegistrations.deletedCount} related registration(s) deleted successfully`
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent
};
