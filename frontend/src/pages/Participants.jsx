import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  Users, 
  Search, 
  Filter, 
  RefreshCw, 
  UserPlus, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  Calendar, 
  MapPin, 
  AlertTriangle 
} from 'lucide-react';
import { eventService, registrationService } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import Notification from '../components/Notification';
import Modal from '../components/Modal';
import EmptyState from '../components/EmptyState';

const Participants = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlEventId = searchParams.get('eventId') || '';

  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState(urlEventId);
  const [eventData, setEventData] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [loadingParticipants, setLoadingParticipants] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Notifications & Modals
  const [apiError, setApiError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [registrationToDelete, setRegistrationToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  // Fetch all events for the selector
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoadingEvents(true);
        const res = await eventService.getAll();
        if (res.success && res.data) {
          setEvents(res.data);
          if (urlEventId) {
            setSelectedEventId(urlEventId);
          } else if (res.data.length > 0) {
            setSelectedEventId(res.data[0]._id);
          }
        }
      } catch (err) {
        setApiError(err.message || 'Failed to load events list');
      } finally {
        setLoadingEvents(false);
      }
    };
    fetchEvents();
  }, [urlEventId]);

  // Fetch participants when selected event, search, or status filter changes
  const fetchParticipants = async () => {
    if (!selectedEventId) return;
    try {
      setLoadingParticipants(true);
      setApiError(null);
      const params = {};
      if (statusFilter && statusFilter !== 'All') {
        params.status = statusFilter;
      }
      if (searchTerm.trim()) {
        params.search = searchTerm.trim();
      }

      const res = await registrationService.getByEvent(selectedEventId, params);
      if (res.success) {
        setEventData(res.event);
        setParticipants(res.data);
      }
    } catch (err) {
      setApiError(err.message || 'Failed to fetch event participants');
    } finally {
      setLoadingParticipants(false);
    }
  };

  useEffect(() => {
    fetchParticipants();
  }, [selectedEventId, statusFilter]);

  const handleEventChange = (newId) => {
    setSelectedEventId(newId);
    setSearchParams({ eventId: newId });
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchParticipants();
  };

  // Toggle status between Registered and Cancelled
  const handleToggleStatus = async (reg) => {
    const newStatus = reg.status === 'Registered' ? 'Cancelled' : 'Registered';
    try {
      setUpdatingId(reg._id);
      const res = await registrationService.update(reg._id, { status: newStatus });
      if (res.success) {
        setSuccessMsg(`Status updated to '${newStatus}' for ${reg.studentId?.name}`);
        fetchParticipants();
      }
    } catch (err) {
      setApiError(err.message || 'Failed to update registration status');
    } finally {
      setUpdatingId(null);
    }
  };

  // Delete registration record
  const handleDeleteConfirm = async () => {
    if (!registrationToDelete) return;
    try {
      setDeleting(true);
      const res = await registrationService.delete(registrationToDelete._id);
      if (res.success) {
        setSuccessMsg('Registration removed successfully');
        setRegistrationToDelete(null);
        fetchParticipants();
      }
    } catch (err) {
      setApiError(err.message || 'Failed to remove registration');
    } finally {
      setDeleting(false);
    }
  };

  if (loadingEvents) {
    return <LoadingSpinner message="Loading events..." fullPage />;
  }

  return (
    <div className="page-content">
      {/* Header Row */}
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Event Participants</h1>
          <p className="page-subtitle">
            Inspect participant rosters, check attendance status, and manage student enrollments.
          </p>
        </div>
        <div className="header-actions">
          <button
            onClick={fetchParticipants}
            className="btn btn-secondary btn-sm"
            title="Reload participants"
            disabled={loadingParticipants}
          >
            <RefreshCw size={15} className={loadingParticipants ? 'animate-spin' : ''} />
            <span>Reload</span>
          </button>
          {selectedEventId && (
            <Link
              to={`/register?eventId=${selectedEventId}`}
              className="btn btn-primary btn-sm"
            >
              <UserPlus size={15} />
              <span>Register Student</span>
            </Link>
          )}
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
      {successMsg && (
        <Notification
          type="success"
          message={successMsg}
          onClose={() => setSuccessMsg(null)}
          duration={3500}
        />
      )}

      {/* Event Selector & Overview Card */}
      <div className="card">
        <div className="card-body">
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label htmlFor="eventPicker" className="form-label">
              Select Event to View Participants
            </label>
            <select
              id="eventPicker"
              value={selectedEventId}
              onChange={(e) => handleEventChange(e.target.value)}
              className="form-input form-select"
            >
              {events.map((ev) => (
                <option key={ev._id} value={ev._id}>
                  {ev.title} — {new Date(ev.eventDate).toLocaleDateString()} ({ev.category})
                </option>
              ))}
            </select>
          </div>

          {eventData && (
            <div className="participant-event-summary">
              <div className="summary-col">
                <span className="summary-label">Category</span>
                <span className="badge badge-indigo">{eventData.category}</span>
              </div>
              <div className="summary-col">
                <span className="summary-label">Date & Time</span>
                <span className="summary-val">
                  {new Date(eventData.eventDate).toLocaleDateString()} ({eventData.startTime} - {eventData.endTime})
                </span>
              </div>
              <div className="summary-col">
                <span className="summary-label">Venue</span>
                <span className="summary-val">{eventData.venue}</span>
              </div>
              <div className="summary-col">
                <span className="summary-label">Capacity & Enrollment</span>
                <span className="summary-val">
                  <strong>{eventData.activeCount}</strong> / {eventData.capacity} enrolled ({eventData.seatsLeft} spots left)
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card filter-card" style={{ marginTop: '1.25rem' }}>
        <form onSubmit={handleSearchSubmit} className="search-filter-grid">
          <div className="search-input-wrapper">
            <Search className="search-icon" size={18} />
            <input
              type="text"
              placeholder="Search participants by name, roll no, branch, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filter-select-wrapper">
            <Filter size={16} className="select-icon" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="filter-select"
            >
              <option value="All">All Statuses</option>
              <option value="Registered">Registered Only</option>
              <option value="Cancelled">Cancelled Only</option>
            </select>
          </div>

          <button type="submit" className="btn btn-primary btn-sm search-btn">
            Filter
          </button>
        </form>
      </div>

      {/* Participants Table */}
      <div className="card" style={{ marginTop: '1.25rem' }}>
        <div className="card-header">
          <div>
            <h2 className="card-title">Participant Roster</h2>
            <p className="card-subtitle">
              {participants.length} record(s) found for this event
            </p>
          </div>
        </div>

        <div className="card-body">
          {loadingParticipants ? (
            <LoadingSpinner message="Loading participant list..." />
          ) : participants.length > 0 ? (
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Roll Number</th>
                    <th>Student Name</th>
                    <th>Branch & Year</th>
                    <th>Contact Info</th>
                    <th>Registered On</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {participants.map((reg, idx) => {
                    const student = reg.studentId;
                    const isRegistered = reg.status === 'Registered';
                    return (
                      <tr key={reg._id}>
                        <td>{idx + 1}</td>
                        <td>
                          <span className="badge badge-gray font-mono">
                            {student?.rollNo || 'N/A'}
                          </span>
                        </td>
                        <td>
                          <div className="table-cell-main font-semibold">
                            {student?.name || 'Unknown Student'}
                          </div>
                        </td>
                        <td>
                          <div className="table-cell-main">{student?.branch || 'N/A'}</div>
                          <div className="table-cell-sub">{student?.year || ''}</div>
                        </td>
                        <td>
                          <div className="table-cell-sub">{student?.email || 'N/A'}</div>
                          <div className="table-cell-sub">{student?.phone || ''}</div>
                        </td>
                        <td>
                          {new Date(reg.registrationDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </td>
                        <td>
                          <span
                            className={`badge ${
                              isRegistered ? 'badge-success' : 'badge-danger'
                            }`}
                          >
                            {reg.status}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div className="row-actions-group">
                            {/* Toggle Status Button */}
                            <button
                              onClick={() => handleToggleStatus(reg)}
                              className={`btn btn-xs ${
                                isRegistered ? 'btn-outline' : 'btn-secondary'
                              }`}
                              title={isRegistered ? 'Cancel Registration' : 'Re-activate Registration'}
                              disabled={updatingId === reg._id}
                            >
                              {isRegistered ? (
                                <>
                                  <XCircle size={14} color="#ef4444" />
                                  <span>Cancel</span>
                                </>
                              ) : (
                                <>
                                  <CheckCircle size={14} color="#10b981" />
                                  <span>Re-activate</span>
                                </>
                              )}
                            </button>

                            {/* Delete Registration Button */}
                            <button
                              onClick={() => setRegistrationToDelete(reg)}
                              className="icon-action-btn delete-btn"
                              title="Delete Registration Record"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              title="No participants found"
              description={
                searchTerm || statusFilter !== 'All'
                  ? 'No participants match the specified search or filter criteria.'
                  : 'No students have registered for this event yet.'
              }
              actionButton={
                <Link
                  to={`/register?eventId=${selectedEventId}`}
                  className="btn btn-primary btn-sm"
                >
                  <UserPlus size={16} />
                  <span>Register First Student</span>
                </Link>
              }
            />
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {registrationToDelete && (
        <Modal
          isOpen={!!registrationToDelete}
          onClose={() => !deleting && setRegistrationToDelete(null)}
          title="Delete Registration"
          footer={
            <div className="modal-right-actions">
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setRegistrationToDelete(null)}
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
                {deleting ? 'Removing...' : 'Delete Registration'}
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
                Are you sure you want to remove the registration of{' '}
                <strong>
                  {registrationToDelete.studentId?.name} (
                  {registrationToDelete.studentId?.rollNo})
                </strong>
                ?
              </p>
              <p className="delete-confirm-sub">
                This will release their seat in the event. This action cannot be undone.
              </p>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Participants;
