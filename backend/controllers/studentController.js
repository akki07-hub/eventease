const Student = require('../models/Student');
const Registration = require('../models/Registration');

/**
 * @desc    Create a new student
 * @route   POST /api/students
 */
const createStudent = async (req, res, next) => {
  try {
    const { name, rollNo, branch, year, email, phone } = req.body;

    // Check for existing rollNo or email for explicit helpful error message
    const existingRoll = await Student.findOne({ rollNo: rollNo ? rollNo.trim().toUpperCase() : '' });
    if (existingRoll) {
      return res.status(409).json({
        success: false,
        message: `A student with roll number '${rollNo}' already exists.`
      });
    }

    const existingEmail = await Student.findOne({ email: email ? email.trim().toLowerCase() : '' });
    if (existingEmail) {
      return res.status(409).json({
        success: false,
        message: `A student with email '${email}' already exists.`
      });
    }

    const student = await Student.create({
      name,
      rollNo,
      branch,
      year,
      email,
      phone
    });

    res.status(201).json({
      success: true,
      message: 'Student registered successfully',
      data: student
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all students with optional search
 * @route   GET /api/students
 */
const getStudents = async (req, res, next) => {
  try {
    const { search, branch, year } = req.query;

    const query = {};

    if (branch) query.branch = branch;
    if (year) query.year = year;

    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { name: searchRegex },
        { rollNo: searchRegex },
        { email: searchRegex },
        { branch: searchRegex },
        { phone: searchRegex }
      ];
    }

    const students = await Student.find(query).sort({ rollNo: 1 }).lean();

    // Attach registered events count for each student
    const studentsWithCounts = await Promise.all(
      students.map(async (student) => {
        const registrationCount = await Registration.countDocuments({
          studentId: student._id,
          status: 'Registered'
        });
        return {
          ...student,
          registrationCount
        };
      })
    );

    res.status(200).json({
      success: true,
      count: studentsWithCounts.length,
      data: studentsWithCounts
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get a single student by ID
 * @route   GET /api/students/:id
 */
const getStudentById = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id).lean();

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Fetch this student's registrations
    const registrations = await Registration.find({ studentId: student._id })
      .populate('eventId', 'title category venue eventDate startTime endTime')
      .sort({ registrationDate: -1 });

    res.status(200).json({
      success: true,
      data: {
        ...student,
        registrations
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a student
 * @route   PUT /api/students/:id
 */
const updateStudent = async (req, res, next) => {
  try {
    const { name, rollNo, branch, year, email, phone } = req.body;

    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Check duplicate rollNo if changing
    if (rollNo && rollNo.toUpperCase() !== student.rollNo) {
      const duplicateRoll = await Student.findOne({ rollNo: rollNo.toUpperCase() });
      if (duplicateRoll) {
        return res.status(409).json({
          success: false,
          message: `Roll number '${rollNo}' is already taken by another student.`
        });
      }
      student.rollNo = rollNo.toUpperCase();
    }

    // Check duplicate email if changing
    if (email && email.toLowerCase() !== student.email) {
      const duplicateEmail = await Student.findOne({ email: email.toLowerCase() });
      if (duplicateEmail) {
        return res.status(409).json({
          success: false,
          message: `Email '${email}' is already taken by another student.`
        });
      }
      student.email = email.toLowerCase();
    }

    if (name) student.name = name;
    if (branch) student.branch = branch;
    if (year) student.year = year;
    if (phone) student.phone = phone;

    const updatedStudent = await student.save();

    res.status(200).json({
      success: true,
      message: 'Student updated successfully',
      data: updatedStudent
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a student safely
 * @route   DELETE /api/students/:id
 */
const deleteStudent = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Remove registrations associated with this student
    const deletedRegistrations = await Registration.deleteMany({ studentId: student._id });

    await student.deleteOne();

    res.status(200).json({
      success: true,
      message: `Student and ${deletedRegistrations.deletedCount} associated registration(s) deleted successfully`
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createStudent,
  getStudents,
  getStudentById,
  updateStudent,
  deleteStudent
};
