const express = require('express');
const router = express.Router();
const {
  createRegistration,
  getRegistrations,
  getRegistrationById,
  updateRegistration,
  deleteRegistration,
  getParticipantsByEvent
} = require('../controllers/registrationController');
const { validateObjectId } = require('../middleware/validate');

// Root /api/registrations
router.route('/')
  .post(createRegistration)
  .get(getRegistrations);

// Specific event participants /api/registrations/event/:eventId
router.route('/event/:eventId')
  .get(validateObjectId('eventId'), getParticipantsByEvent);

// /api/registrations/:id
router.route('/:id')
  .get(validateObjectId('id'), getRegistrationById)
  .put(validateObjectId('id'), updateRegistration)
  .delete(validateObjectId('id'), deleteRegistration);

module.exports = router;
