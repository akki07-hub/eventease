import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Calendar, Save, ArrowLeft, RefreshCw } from 'lucide-react';
import { eventService } from '../services/api';
import FormField from '../components/FormField';
import LoadingSpinner from '../components/LoadingSpinner';
import Notification from '../components/Notification';

const CATEGORY_OPTIONS = [
  'Technical',
  'Cultural',
  'Sports',
  'Workshop',
  'Seminar',
  'Academic',
  'Other'
];

const EventForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Technical',
    venue: '',
    eventDate: '',
    startTime: '10:00 AM',
    endTime: '01:00 PM',
    capacity: 50,
    organizer: ''
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [loadingEvent, setLoadingEvent] = useState(isEditMode);
  const [apiError, setApiError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // If in edit mode, fetch existing event data
  useEffect(() => {
    if (isEditMode) {
      const fetchEvent = async () => {
        try {
          setLoadingEvent(true);
          const res = await eventService.getById(id);
          if (res.success && res.data) {
            const ev = res.data;
            // Format eventDate to YYYY-MM-DD for date input
            const dateObj = new Date(ev.eventDate);
            const dateStr = !isNaN(dateObj.getTime())
              ? dateObj.toISOString().split('T')[0]
              : '';

            setFormData({
              title: ev.title || '',
              description: ev.description || '',
              category: ev.category || 'Technical',
              venue: ev.venue || '',
              eventDate: dateStr,
              startTime: ev.startTime || '',
              endTime: ev.endTime || '',
              capacity: ev.capacity || 50,
              organizer: ev.organizer || ''
            });
          }
        } catch (err) {
          setApiError(err.message || 'Failed to fetch event details for editing');
        } finally {
          setLoadingEvent(false);
        }
      };
      fetchEvent();
    }
  }, [id, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));

    // Clear field-specific error as user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Event title is required';
    } else if (formData.title.trim().length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Event description is required';
    }

    if (!formData.category) {
      newErrors.category = 'Please select a category';
    }

    if (!formData.venue.trim()) {
      newErrors.venue = 'Venue or location is required';
    }

    if (!formData.eventDate) {
      newErrors.eventDate = 'Event date is required';
    }

    if (!formData.startTime.trim()) {
      newErrors.startTime = 'Start time is required';
    }

    if (!formData.endTime.trim()) {
      newErrors.endTime = 'End time is required';
    }

    if (!formData.capacity || Number(formData.capacity) < 1) {
      newErrors.capacity = 'Capacity must be at least 1 student';
    }

    if (!formData.organizer.trim()) {
      newErrors.organizer = 'Organizer name or department is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      setSubmitting(true);
      setApiError(null);

      const payload = {
        ...formData,
        capacity: Number(formData.capacity)
      };

      let res;
      if (isEditMode) {
        res = await eventService.update(id, payload);
      } else {
        res = await eventService.create(payload);
      }

      if (res.success) {
        setSuccessMessage(
          isEditMode ? 'Event updated successfully!' : 'Event created successfully!'
        );
        setTimeout(() => {
          navigate('/events');
        }, 1500);
      }
    } catch (err) {
      setApiError(err.message || 'Failed to save event');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingEvent) {
    return <LoadingSpinner message="Loading event details..." fullPage />;
  }

  return (
    <div className="page-content" style={{ maxWidth: '850px', margin: '0 auto' }}>
      {/* Back button & Page title */}
      <div className="page-header-row">
        <div>
          <Link to="/events" className="back-link">
            <ArrowLeft size={16} />
            <span>Back to Events</span>
          </Link>
          <h1 className="page-title" style={{ marginTop: '0.5rem' }}>
            {isEditMode ? 'Edit College Event' : 'Create New College Event'}
          </h1>
          <p className="page-subtitle">
            {isEditMode
              ? 'Update scheduling, venue, organizer or seat capacity.'
              : 'Fill in event details, venue, category, and student capacity.'}
          </p>
        </div>
      </div>

      {apiError && (
        <Notification
          type="error"
          message={apiError}
          onClose={() => setApiError(null)}
          autoClose={false}
        />
      )}

      {successMessage && (
        <Notification
          type="success"
          message={successMessage}
          onClose={() => setSuccessMessage(null)}
          autoClose={false}
        />
      )}

      {/* Main Event Form Card */}
      <div className="card">
        <form onSubmit={handleSubmit} className="form-layout">
          {/* Title */}
          <FormField
            label="Event Title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g. Annual Tech Symposium & Hackathon"
            required
            error={errors.title}
          />

          {/* Category & Capacity in one row */}
          <div className="form-row-2">
            <FormField
              label="Event Category"
              name="category"
              type="select"
              value={formData.category}
              onChange={handleChange}
              options={CATEGORY_OPTIONS}
              required
              error={errors.category}
            />

            <FormField
              label="Student Capacity"
              name="capacity"
              type="number"
              min="1"
              value={formData.capacity}
              onChange={handleChange}
              placeholder="e.g. 100"
              required
              error={errors.capacity}
              helperText="Maximum allowed registered students"
            />
          </div>

          {/* Description */}
          <FormField
            label="Event Description"
            name="description"
            type="textarea"
            rows={4}
            value={formData.description}
            onChange={handleChange}
            placeholder="Provide a detailed overview of the event, eligibility, agenda, and guidelines..."
            required
            error={errors.description}
          />

          {/* Venue & Organizer */}
          <div className="form-row-2">
            <FormField
              label="Venue / Location"
              name="venue"
              value={formData.venue}
              onChange={handleChange}
              placeholder="e.g. Main Auditorium, Block C"
              required
              error={errors.venue}
            />

            <FormField
              label="Organizer / Department"
              name="organizer"
              value={formData.organizer}
              onChange={handleChange}
              placeholder="e.g. Dept. of Computer Science"
              required
              error={errors.organizer}
            />
          </div>

          {/* Date & Timings */}
          <div className="form-row-3">
            <FormField
              label="Event Date"
              name="eventDate"
              type="date"
              value={formData.eventDate}
              onChange={handleChange}
              required
              error={errors.eventDate}
            />

            <FormField
              label="Start Time"
              name="startTime"
              value={formData.startTime}
              onChange={handleChange}
              placeholder="e.g. 10:00 AM"
              required
              error={errors.startTime}
            />

            <FormField
              label="End Time"
              name="endTime"
              value={formData.endTime}
              onChange={handleChange}
              placeholder="e.g. 01:00 PM"
              required
              error={errors.endTime}
            />
          </div>

          {/* Submit & Cancel Buttons */}
          <div className="form-footer-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/events')}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              <Save size={18} />
              <span>{submitting ? 'Saving Event...' : isEditMode ? 'Update Event' : 'Create Event'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventForm;
