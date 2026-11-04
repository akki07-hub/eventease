import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  PlusCircle, 
  Search, 
  Filter, 
  Calendar, 
  RefreshCw, 
  MapPin, 
  Clock, 
  User, 
  Users, 
  AlertTriangle 
} from 'lucide-react';
import { eventService } from '../services/api';
import EventCard from '../components/EventCard';
import LoadingSpinner from '../components/LoadingSpinner';
import Notification from '../components/Notification';
import Modal from '../components/Modal';
import EmptyState from '../components/EmptyState';

const CATEGORIES = ['All', 'Technical', 'Cultural', 'Sports', 'Workshop', 'Seminar', 'Academic', 'Other'];

const EventsList = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('upcoming');

  // Modals
  const [selectedEventForDetails, setSelectedEventForDetails] = useState(null);
  const [eventToDelete, setEventToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {};
      if (selectedCategory && selectedCategory !== 'All') {
        params.category = selectedCategory;
      }
      if (searchTerm.trim()) {
        params.search = searchTerm.trim();
      }
      if (sortBy) {
        params.sortBy = sortBy;
      }

      const res = await eventService.getAll(params);
      if (res.success) {
        setEvents(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch events from backend');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [selectedCategory, sortBy]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchEvents();
  };

  const handleEdit = (event) => {
    navigate(`/events/edit/${event._id}`);
  };

  const handleDeleteConfirm = async () => {
    if (!eventToDelete) return;
    try {
      setDeleting(true);
      const res = await eventService.delete(eventToDelete._id);
      if (res.success) {
        setSuccessMsg(res.message || 'Event deleted successfully');
        setEventToDelete(null);
        fetchEvents();
      }
    } catch (err) {
      setError(err.message || 'Failed to delete event');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="page-content">
      {/* Page Header */}
      <div className="page-header-row">
        <div>
          <h1 className="page-title">College Events</h1>
          <p className="page-subtitle">
            Explore, create, and manage upcoming academic and cultural activities.
          </p>
        </div>
        <div className="header-actions">
          <button
            onClick={fetchEvents}
            className="btn btn-secondary btn-sm"
            title="Reload events"
            disabled={loading}
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            <span>Reload</span>
          </button>
          <Link to="/events/create" className="btn btn-primary btn-sm">
            <PlusCircle size={15} />
            <span>Create Event</span>
          </Link>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <Notification
          type="error"
          message={error}
          onClose={() => setError(null)}
          autoClose={false}
        />
      )}
      {successMsg && (
        <Notification
          type="success"
          message={successMsg}
          onClose={() => setSuccessMsg(null)}
          duration={3500}
        />
      )}

      {/* Filter and Search Bar */}
      <div className="card filter-card">
        <form onSubmit={handleSearchSubmit} className="search-filter-grid">
          {/* Search Input */}
          <div className="search-input-wrapper">
            <Search className="search-icon" size={18} />
            <input
              type="text"
              placeholder="Search by title, venue, organizer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          {/* Category Dropdown */}
          <div className="filter-select-wrapper">
            <Filter size={16} className="select-icon" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="filter-select"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === 'All' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Dropdown */}
          <div className="filter-select-wrapper">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="filter-select"
            >
              <option value="upcoming">Upcoming First</option>
              <option value="newest">Recently Created</option>
              <option value="title">Alphabetical (A-Z)</option>
            </select>
          </div>

          {/* Submit Search Button */}
          <button type="submit" className="btn btn-primary btn-sm search-btn">
            Search
          </button>
        </form>
      </div>

      {/* Events Grid or States */}
      {loading ? (
        <LoadingSpinner message="Fetching campus events..." />
      ) : events.length > 0 ? (
        <>
          <div className="events-count-banner">
            <span>Showing <strong>{events.length}</strong> event(s)</span>
          </div>

          <div className="events-grid">
            {events.map((event) => (
              <EventCard
                key={event._id}
                event={event}
                onViewDetails={(ev) => setSelectedEventForDetails(ev)}
                onEdit={handleEdit}
                onDelete={(ev) => setEventToDelete(ev)}
              />
            ))}
          </div>
        </>
      ) : (
        <EmptyState
          title="No events found"
          description={
            searchTerm || selectedCategory !== 'All'
              ? 'No events match your search or filter. Try resetting filters or search terms.'
              : 'There are currently no events registered in the system.'
          }
          actionButton={
            searchTerm || selectedCategory !== 'All' ? (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('All');
                }}
                className="btn btn-secondary btn-sm"
              >
                Reset Filters
              </button>
            ) : (
              <Link to="/events/create" className="btn btn-primary btn-sm">
                Create First Event
              </Link>
            )
          }
        />
      )}

      {/* Event Details Modal */}
      {selectedEventForDetails && (
        <Modal
          isOpen={!!selectedEventForDetails}
          onClose={() => setSelectedEventForDetails(null)}
          title={selectedEventForDetails.title}
          maxWidth="600px"
          footer={
            <div className="modal-actions-space-between">
              <Link
                to={`/participants?eventId=${selectedEventForDetails._id}`}
                className="btn btn-secondary btn-sm"
                onClick={() => setSelectedEventForDetails(null)}
              >
                <Users size={15} />
                <span>View Participants ({selectedEventForDetails.registeredCount || 0})</span>
              </Link>

              <div className="modal-right-actions">
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setSelectedEventForDetails(null)}
                >
                  Close
                </button>
                {!selectedEventForDetails.isFull && (
                  <Link
                    to={`/register?eventId=${selectedEventForDetails._id}`}
                    className="btn btn-primary btn-sm"
                    onClick={() => setSelectedEventForDetails(null)}
                  >
                    <span>Register Student</span>
                  </Link>
                )}
              </div>
            </div>
          }
        >
          <div className="event-detail-modal-content">
            <div className="modal-badge-row">
              <span className="badge badge-indigo">{selectedEventForDetails.category}</span>
              {selectedEventForDetails.isFull ? (
                <span className="badge badge-danger">Capacity Full</span>
              ) : (
                <span className="badge badge-success">
                  {selectedEventForDetails.seatsLeft} seat(s) remaining
                </span>
              )}
            </div>

            <div className="detail-section">
              <h4 className="detail-section-title">Description</h4>
              <p className="detail-description-text">{selectedEventForDetails.description}</p>
            </div>

            <div className="detail-grid-info">
              <div className="detail-info-item">
                <Calendar size={18} className="detail-icon" />
                <div>
                  <div className="detail-label">Date</div>
                  <div className="detail-value">
                    {new Date(selectedEventForDetails.eventDate).toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </div>
                </div>
              </div>

              <div className="detail-info-item">
                <Clock size={18} className="detail-icon" />
                <div>
                  <div className="detail-label">Time</div>
                  <div className="detail-value">
                    {selectedEventForDetails.startTime} – {selectedEventForDetails.endTime}
                  </div>
                </div>
              </div>

              <div className="detail-info-item">
                <MapPin size={18} className="detail-icon" />
                <div>
                  <div className="detail-label">Venue</div>
                  <div className="detail-value">{selectedEventForDetails.venue}</div>
                </div>
              </div>

              <div className="detail-info-item">
                <User size={18} className="detail-icon" />
                <div>
                  <div className="detail-label">Organizer</div>
                  <div className="detail-value">{selectedEventForDetails.organizer}</div>
                </div>
              </div>
            </div>

            <div className="detail-capacity-box">
              <div className="capacity-summary-row">
                <span>Maximum Capacity: <strong>{selectedEventForDetails.capacity} students</strong></span>
                <span>Enrolled: <strong>{selectedEventForDetails.registeredCount || 0} students</strong></span>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {eventToDelete && (
        <Modal
          isOpen={!!eventToDelete}
          onClose={() => !deleting && setEventToDelete(null)}
          title="Confirm Delete Event"
          footer={
            <div className="modal-right-actions">
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setEventToDelete(null)}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger btn-sm"
                onClick={handleDeleteConfirm}
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Delete Event'}
              </button>
            </div>
          }
        >
          <div className="delete-confirm-box">
            <div className="delete-warning-icon">
              <AlertTriangle size={36} color="#ef4444" />
            </div>
            <div>
              <p className="delete-confirm-text">
                Are you sure you want to delete <strong>"{eventToDelete.title}"</strong>?
              </p>
              <p className="delete-confirm-sub">
                This action is permanent and will also remove all student registrations linked to this event.
              </p>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default EventsList;
