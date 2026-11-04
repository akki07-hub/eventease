const express = require('express');
const router = express.Router();
const {
  createStudent,
  getStudents,
  getStudentById,
  updateStudent,
  deleteStudent
} = require('../controllers/studentController');
const { validateObjectId } = require('../middleware/validate');

// Root /api/students
router.route('/')
  .post(createStudent)
  .get(getStudents);

// /api/students/:id
router.route('/:id')
  .get(validateObjectId('id'), getStudentById)
  .put(validateObjectId('id'), updateStudent)
  .delete(validateObjectId('id'), deleteStudent);

module.exports = router;
