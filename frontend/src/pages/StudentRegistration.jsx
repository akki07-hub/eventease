import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { 
  UserCheck, 
  UserPlus, 
  Calendar, 
  MapPin, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  Users, 
  ArrowRight,
  GraduationCap
} from 'lucide-react';
import { eventService, studentService, registrationService } from '../services/api';
import FormField from '../components/FormField';
import LoadingSpinner from '../components/LoadingSpinner';
import Notification from '../components/Notification';

const YEAR_OPTIONS = ['1st Year', '2nd Year', '3rd Year', '4th Year'];

const StudentRegistration = () => {
  const [searchParams] = useSearchParams();
  const preselectedEventId = searchParams.get('eventId') || '';
  const navigate = useNavigate();

  // State
  const [events, setEvents] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState(preselectedEventId);
  const [studentMode, setStudentMode] = useState('existing'); // 'existing' or 'new'
  const [selectedStudentId, setSelectedStudentId] = useState('');

  // New Student Form
  const [newStudent, setNewStudent] = useState({
    name: '',
    rollNo: '',
    branch: '',
    year: '1st Year',
    email: '',
    phone: ''
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [successData, setSuccessData] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  // Fetch all events and existing students
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setApiError(null);
        const [eventsRes, studentsRes] = await Promise.all([
          eventService.getAll(),
          studentService.getAll()
        ]);

        if (eventsRes.success) {
          setEvents(eventsRes.data);
          // If preselected event from query string
          if (preselectedEventId) {
            setSelectedEventId(preselectedEventId);
          } else if (eventsRes.data.length > 0) {
            setSelectedEventId(eventsRes.data[0]._id);
          }
        }

        if (studentsRes.success) {
          setStudents(studentsRes.data);
          if (studentsRes.data.length > 0) {
            setSelectedStudentId(studentsRes.data[0]._id);
          } else {
            // Default to 'new' student if no students exist yet
            setStudentMode('new');
          }
        }
      } catch (err) {
        setApiError(err.message || 'Failed to load events and students list');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [preselectedEventId]);

  // Selected Event Object
  const selectedEvent = events.find((e) => e._id === selectedEventId);

  const handleNewStudentChange = (e) => {
    const { name, value } = e.target;
    setNewStudent((prev) => ({ ...prev, [name]: value }));
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateNewStudent = () => {
    const errs = {};
    if (!newStudent.name.trim()) errs.name = 'Student name is required';
    if (!newStudent.rollNo.trim()) errs.rollNo = 'Roll number is required';
    if (!newStudent.branch.trim()) errs.branch = 'Branch is required';
    if (!newStudent.year) errs.year = 'Year is required';
    if (!newStudent.email.trim()) {
      errs.email = 'Email address is required';
    } else if (!/^\S+@\S+\.\S+$/.test(newStudent.email.trim())) {
      errs.email = 'Please enter a valid email format';
    }
    if (!newStudent.phone.trim()) {
      errs.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(newStudent.phone.trim())) {
      errs.phone = 'Phone number must be exactly 10 digits';
    }

    setValidationErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError(null);
    setSuccessData(null);

    if (!selectedEventId) {
      setApiError('Please choose an event to register for.');
      return;
    }

    if (selectedEvent?.isFull) {
      setApiError('This event is already at maximum capacity. Cannot accept further registrations.');
      return;
    }

    try {
      setSubmitting(true);
      let targetStudentId = selectedStudentId;

      // If user is adding a new student on the fly
      if (studentMode === 'new') {
        if (!validateNewStudent()) {
          setSubmitting(false);
          return;
        }

        const studentRes = await studentService.create({
          ...newStudent,
          rollNo: newStudent.rollNo.toUpperCase().trim(),
          email: newStudent.email.toLowerCase().trim()
        });

        if (studentRes.success && studentRes.data) {
          targetStudentId = studentRes.data._id;
          // Refresh student list
          setStudents((prev) => [...prev, studentRes.data]);
        } else {
          throw new Error('Failed to create student profile');
        }
      }

      if (!targetStudentId) {
        setApiError('Please select or create a student.');
        setSubmitting(false);
        return;
      }

      // Register the student
      const regRes = await registrationService.create({
        eventId: selectedEventId,
        studentId: targetStudentId,
        status: 'Registered'
      });

      if (regRes.success) {
        setSuccessData({
          registration: regRes.data,
          message: regRes.message || 'Registration successful!'
        });

        // Refresh event details to update capacity counts
        const updatedEvents = await eventService.getAll();
        if (updatedEvents.success) {
          setEvents(updatedEvents.data);
        }

        // Reset new student form
        setNewStudent({
          name: '',
          rollNo: '',
          branch: '',
          year: '1st Year',
          email: '',
          phone: ''
        });
      }
    } catch (err) {
      setApiError(err.message || 'Failed to register student');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Preparing registration portal..." fullPage />;
  }

  return (
    <div className="page-content" style={{ maxWidth: '850px', margin: '0 auto' }}>
      {/* Header */}
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Event Registration</h1>
          <p className="page-subtitle">
            Register students for upcoming college workshops, fests, and seminars.
          </p>
        </div>
      </div>

      {/* Notifications */}
      {apiError && (
        <Notification
          type="error"
          message={apiError}
          onClose={() => setApiError(null)}
          autoClose={false}
        />
      )}

      {/* Success banner with action buttons */}
      {successData && (
        <div className="card registration-success-card">
          <div className="success-header">
            <CheckCircle2 size={32} color="#10b981" />
            <div>
              <h3 className="success-title">Registration Confirmed!</h3>
              <p className="success-desc">{successData.message}</p>
            </div>
          </div>
          <div className="success-details-box">
            <div>
              <strong>Student:</strong>{' '}
              {successData.registration.studentId?.name} (
              {successData.registration.studentId?.rollNo})
            </div>
            <div>
              <strong>Event:</strong> {successData.registration.eventId?.title}
            </div>
            <div>
              <strong>Date:</strong>{' '}
              {new Date(successData.registration.eventId?.eventDate).toLocaleDateString()}
            </div>
          </div>
          <div className="success-actions-row">
            <button
              onClick={() => setSuccessData(null)}
              className="btn btn-secondary btn-sm"
            >
              Register Another Student
            </button>
            <Link
              to={`/participants?eventId=${selectedEventId}`}
              className="btn btn-primary btn-sm"
            >
              <Users size={16} />
              <span>View Event Participants</span>
            </Link>
          </div>
        </div>
      )}

      {/* Event Selection and Summary Card */}
      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">1. Select Event</h2>
            <p className="card-subtitle">Choose the campus event for enrollment</p>
          </div>
        </div>

        <div className="card-body">
          {events.length === 0 ? (
            <div className="alert-box alert-warning">
              <AlertCircle size={20} />
              <span>No events are currently scheduled. Please create an event first.</span>
              <Link to="/events/create" className="btn btn-primary btn-xs" style={{ marginLeft: 'auto' }}>
                Create Event
              </Link>
            </div>
          ) : (
            <div className="form-group">
              <label htmlFor="eventSelect" className="form-label">
                Event <span className="required-star">*</span>
              </label>
              <select
                id="eventSelect"
                value={selectedEventId}
                onChange={(e) => {
                  setSelectedEventId(e.target.value);
                  setSuccessData(null);
                  setApiError(null);
                }}
                className="form-input form-select"
              >
                {events.map((ev) => (
                  <option key={ev._id} value={ev._id}>
                    {ev.title} — {new Date(ev.eventDate).toLocaleDateString()} ({ev.category}) [
                    {ev.seatsLeft} spots left]
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Active Event Preview Summary */}
          {selectedEvent && (
            <div className="event-preview-banner">
              <div className="preview-top-row">
                <span className="badge badge-indigo">{selectedEvent.category}</span>
                {selectedEvent.isFull ? (
                  <span className="badge badge-danger">Capacity Full</span>
                ) : (
                  <span className="badge badge-success">
                    {selectedEvent.seatsLeft} of {selectedEvent.capacity} seats remaining
                  </span>
                )}
              </div>
              <h3 className="preview-title">{selectedEvent.title}</h3>
              <div className="preview-meta-row">
                <span>
                  <Calendar size={14} style={{ display: 'inline', marginRight: '4px' }} />
                  {new Date(selectedEvent.eventDate).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric'
                  })}
                </span>
                <span>
                  <Clock size={14} style={{ display: 'inline', marginRight: '4px' }} />
                  {selectedEvent.startTime} – {selectedEvent.endTime}
                </span>
                <span>
                  <MapPin size={14} style={{ display: 'inline', marginRight: '4px' }} />
                  {selectedEvent.venue}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Student Details Section */}
      <div className="card" style={{ marginTop: '1.5rem' }}>
        <div className="card-header">
          <div>
            <h2 className="card-title">2. Student Information</h2>
            <p className="card-subtitle">
              Select an existing student profile or register a new student
            </p>
          </div>
          {/* Tabs to switch between existing student or quick create */}
          <div className="tab-pill-group">
            <button
              type="button"
              className={`tab-pill ${studentMode === 'existing' ? 'tab-pill-active' : ''}`}
              onClick={() => {
                setStudentMode('existing');
                setValidationErrors({});
              }}
              disabled={students.length === 0}
            >
              <UserCheck size={15} />
              <span>Existing Student ({students.length})</span>
            </button>
            <button
              type="button"
              className={`tab-pill ${studentMode === 'new' ? 'tab-pill-active' : ''}`}
              onClick={() => {
                setStudentMode('new');
                setValidationErrors({});
              }}
            >
              <UserPlus size={15} />
              <span>New Student</span>
            </button>
          </div>
        </div>

        <div className="card-body">
          <form onSubmit={handleSubmit}>
            {studentMode === 'existing' ? (
              <div className="form-group">
                <label htmlFor="studentSelect" className="form-label">
                  Choose Student <span className="required-star">*</span>
                </label>
                <select
                  id="studentSelect"
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="form-input form-select"
                  required
                >
                  {students.map((st) => (
                    <option key={st._id} value={st._id}>
                      {st.rollNo} — {st.name} ({st.branch}, {st.year})
                    </option>
                  ))}
                </select>
                <span className="form-helper-text">
                  Don't see the student? Switch to "New Student" tab above to add them instantly.
                </span>
              </div>
            ) : (
              <div className="new-student-form-grid">
                <div className="form-row-2">
                  <FormField
                    label="Full Name"
                    name="name"
                    value={newStudent.name}
                    onChange={handleNewStudentChange}
                    placeholder="e.g. Rahul Sharma"
                    required
                    error={validationErrors.name}
                  />

                  <FormField
                    label="Roll Number"
                    name="rollNo"
                    value={newStudent.rollNo}
                    onChange={handleNewStudentChange}
                    placeholder="e.g. 21CS104"
                    required
                    error={validationErrors.rollNo}
                    helperText="Unique institutional roll / registration ID"
                  />
                </div>

                <div className="form-row-2">
                  <FormField
                    label="Branch / Department"
                    name="branch"
                    value={newStudent.branch}
                    onChange={handleNewStudentChange}
                    placeholder="e.g. Computer Science"
                    required
                    error={validationErrors.branch}
                  />

                  <FormField
                    label="Academic Year"
                    name="year"
                    type="select"
                    value={newStudent.year}
                    onChange={handleNewStudentChange}
                    options={YEAR_OPTIONS}
                    required
                    error={validationErrors.year}
                  />
                </div>

                <div className="form-row-2">
                  <FormField
                    label="Email Address"
                    name="email"
                    type="email"
                    value={newStudent.email}
                    onChange={handleNewStudentChange}
                    placeholder="e.g. rahul.sharma@college.edu"
                    required
                    error={validationErrors.email}
                  />

                  <FormField
                    label="Phone Number"
                    name="phone"
                    value={newStudent.phone}
                    onChange={handleNewStudentChange}
                    placeholder="e.g. 9876543210 (10 digits)"
                    required
                    error={validationErrors.phone}
                  />
                </div>
              </div>
            )}

            {/* Submission Action */}
            <div className="form-footer-actions" style={{ marginTop: '2rem' }}>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting || selectedEvent?.isFull || events.length === 0}
              >
                <UserCheck size={18} />
                <span>
                  {submitting
                    ? 'Processing Registration...'
                    : selectedEvent?.isFull
                    ? 'Event Full (Registration Closed)'
                    : 'Confirm & Register Student'}
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default StudentRegistration;
