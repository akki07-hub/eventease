const Registration = require('../models/Registration');
const Event = require('../models/Event');
const Student = require('../models/Student');
const mongoose = require('mongoose');

/**
 * @desc    Register a student for an event
 * @route   POST /api/registrations
 */
const createRegistration = async (req, res, next) => {
  try {
    const { eventId, studentId, status } = req.body;

    if (!eventId || !studentId) {
      return res.status(400).json({
        success: false,
        message: 'Both eventId and studentId are required for registration'
      });
    }

    if (!mongoose.Types.ObjectId.isValid(eventId) || !mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid eventId or studentId format'
      });
    }

    // 1. Verify Event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // 2. Verify Student exists
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // 3. Check for existing registration record for this student and event
    const existingRegistration = await Registration.findOne({ eventId, studentId });

    if (existingRegistration) {
      // If already registered actively
      if (existingRegistration.status === 'Registered') {
        return res.status(400).json({
          success: false,
          message: `Student '${student.name}' (${student.rollNo}) is already registered for '${event.title}'.`
        });
      }

      // If existing registration was Cancelled, we can re-activate if capacity allows!
      const currentActiveCount = await Registration.countDocuments({
        eventId,
        status: 'Registered'
      });

      if (currentActiveCount >= event.capacity) {
        return res.status(400).json({
          success: false,
          message: `Cannot re-activate registration. Event '${event.title}' is currently at full capacity (${event.capacity}/${event.capacity} seats).`
        });
      }

      existingRegistration.status = 'Registered';
      existingRegistration.registrationDate = new Date();
      await existingRegistration.save();

      const populatedReg = await Registration.findById(existingRegistration._id)
        .populate('eventId', 'title category venue eventDate startTime endTime capacity')
        .populate('studentId', 'name rollNo branch year email phone');

      return res.status(200).json({
        success: true,
        message: `Registration re-activated successfully for ${student.name}`,
        data: populatedReg
      });
    }

    // 4. Check Event Capacity before creating a new active registration
    const activeRegistrations = await Registration.countDocuments({
      eventId,
      status: 'Registered'
    });

    if (activeRegistrations >= event.capacity) {
      return res.status(400).json({
        success: false,
        message: `Event '${event.title}' has reached maximum capacity of ${event.capacity} participant(s). No more seats available.`
      });
    }

    // 5. Create new Registration
    const registration = await Registration.create({
      eventId,
      studentId,
      status: status || 'Registered',
      registrationDate: new Date()
    });

    const populatedRegistration = await Registration.findById(registration._id)
      .populate('eventId', 'title category venue eventDate startTime endTime capacity')
      .populate('studentId', 'name rollNo branch year email phone');

    res.status(201).json({
      success: true,
      message: `Student registered successfully for ${event.title}`,
      data: populatedRegistration
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all registrations with optional event or status filtering
 * @route   GET /api/registrations
 */
const getRegistrations = async (req, res, next) => {
  try {
    const { eventId, status, studentId, search } = req.query;

    const query = {};

    if (eventId && mongoose.Types.ObjectId.isValid(eventId)) {
      query.eventId = eventId;
    }

    if (studentId && mongoose.Types.ObjectId.isValid(studentId)) {
      query.studentId = studentId;
    }

    if (status && status !== 'All') {
      query.status = status;
    }

    let registrations = await Registration.find(query)
      .populate('eventId', 'title category venue eventDate startTime endTime capacity organizer')
      .populate('studentId', 'name rollNo branch year email phone')
      .sort({ registrationDate: -1 })
      .lean();

    // In-memory search if student/event keyword provided
    if (search && search.trim() !== '') {
      const regex = new RegExp(search.trim(), 'i');
      registrations = registrations.filter((reg) => {
        const student = reg.studentId;
        const event = reg.eventId;
        return (
          (student && (regex.test(student.name) || regex.test(student.rollNo) || regex.test(student.branch))) ||
          (event && (regex.test(event.title) || regex.test(event.category) || regex.test(event.venue)))
        );
      });
    }

    res.status(200).json({
      success: true,
      count: registrations.length,
      data: registrations
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single registration by ID
 * @route   GET /api/registrations/:id
 */
const getRegistrationById = async (req, res, next) => {
  try {
    const registration = await Registration.findById(req.params.id)
      .populate('eventId', 'title category venue eventDate startTime endTime capacity organizer')
      .populate('studentId', 'name rollNo branch year email phone');

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Registration record not found'
      });
    }

    res.status(200).json({
      success: true,
      data: registration
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update registration status (e.g., Registered or Cancelled)
 * @route   PUT /api/registrations/:id
 */
const updateRegistration = async (req, res, next) => {
  try {
    const { status } = req.body;

    const registration = await Registration.findById(req.params.id);

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Registration record not found'
      });
    }

    // If changing from Cancelled to Registered, verify capacity!
    if (status === 'Registered' && registration.status !== 'Registered') {
      const event = await Event.findById(registration.eventId);
      if (event) {
        const currentActive = await Registration.countDocuments({
          eventId: event._id,
          status: 'Registered'
        });
        if (currentActive >= event.capacity) {
          return res.status(400).json({
            success: false,
            message: `Cannot activate registration. Event '${event.title}' is currently full (${event.capacity}/${event.capacity}).`
          });
        }
      }
    }

    if (status) {
      registration.status = status;
    }

    await registration.save();

    const updated = await Registration.findById(registration._id)
      .populate('eventId', 'title category venue eventDate startTime endTime capacity')
      .populate('studentId', 'name rollNo branch year email phone');

    res.status(200).json({
      success: true,
      message: `Registration status updated to '${registration.status}'`,
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a registration record
 * @route   DELETE /api/registrations/:id
 */
const deleteRegistration = async (req, res, next) => {
  try {
    const registration = await Registration.findById(req.params.id);

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Registration record not found'
      });
    }

    await registration.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Registration removed successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all participants for a specific event
 * @route   GET /api/registrations/event/:eventId
 */
const getParticipantsByEvent = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const { status, search } = req.query;

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid eventId format'
      });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    const query = { eventId };

    if (status && status !== 'All') {
      query.status = status;
    }

    let participants = await Registration.find(query)
      .populate('studentId', 'name rollNo branch year email phone')
      .sort({ registrationDate: -1 })
      .lean();

    // In-memory filter by student search term if provided
    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      participants = participants.filter((p) => {
        const student = p.studentId;
        return (
          student &&
          (searchRegex.test(student.name) ||
            searchRegex.test(student.rollNo) ||
            searchRegex.test(student.branch) ||
            searchRegex.test(student.email))
        );
      });
    }

    const activeCount = await Registration.countDocuments({
      eventId,
      status: 'Registered'
    });

    res.status(200).json({
      success: true,
      event: {
        _id: event._id,
        title: event.title,
        category: event.category,
        venue: event.venue,
        eventDate: event.eventDate,
        startTime: event.startTime,
        endTime: event.endTime,
        capacity: event.capacity,
        organizer: event.organizer,
        activeCount,
        seatsLeft: Math.max(0, event.capacity - activeCount),
        isFull: activeCount >= event.capacity
      },
      count: participants.length,
      data: participants
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createRegistration,
  getRegistrations,
  getRegistrationById,
  updateRegistration,
  deleteRegistration,
  getParticipantsByEvent
};
