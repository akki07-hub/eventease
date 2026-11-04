import React from 'react';
import { Calendar, Clock, MapPin, User, Users, Edit3, Trash2, UserPlus, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';

const categoryColors = {
  Technical: 'badge-blue',
  Cultural: 'badge-purple',
  Sports: 'badge-emerald',
  Workshop: 'badge-amber',
  Seminar: 'badge-cyan',
  Academic: 'badge-indigo',
  Other: 'badge-gray'
};

const EventCard = ({
  event,
  onViewDetails,
  onEdit,
  onDelete
}) => {
  const {
    _id,
    title,
    description,
    category,
    venue,
    eventDate,
    startTime,
    endTime,
    capacity,
    organizer,
    registeredCount = 0,
    seatsLeft = 0,
    isFull = false
  } = event;

  // Format date nicely
  const formattedDate = new Date(eventDate).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const percentFilled = Math.min(100, Math.round((registeredCount / capacity) * 100));

  return (
    <div className="event-card">
      <div className="event-card-header">
        <span className={`badge ${categoryColors[category] || 'badge-gray'}`}>
          {category}
        </span>
        {isFull ? (
          <span className="badge badge-danger">Capacity Full</span>
        ) : (
          <span className="badge badge-success">{seatsLeft} {seatsLeft === 1 ? 'spot' : 'spots'} left</span>
        )}
      </div>

      <div className="event-card-body">
        <h3 className="event-card-title" title={title}>
          {title}
        </h3>
        
        <p className="event-card-desc">
          {description.length > 110 ? `${description.substring(0, 110)}...` : description}
        </p>

        <div className="event-meta-list">
          <div className="event-meta-item">
            <Calendar size={15} className="meta-icon" />
            <span>{formattedDate}</span>
          </div>
          <div className="event-meta-item">
            <Clock size={15} className="meta-icon" />
            <span>{startTime} – {endTime}</span>
          </div>
          <div className="event-meta-item">
            <MapPin size={15} className="meta-icon" />
            <span>{venue}</span>
          </div>
          <div className="event-meta-item">
            <User size={15} className="meta-icon" />
            <span>{organizer}</span>
          </div>
        </div>

        {/* Capacity Bar */}
        <div className="capacity-container">
          <div className="capacity-label-row">
            <span className="capacity-text">
              <Users size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: '-2px' }} />
              Registration Progress
            </span>
            <span className="capacity-count">
              <strong>{registeredCount}</strong> / {capacity}
            </span>
          </div>
          <div className="progress-bar-track">
            <div
              className={`progress-bar-fill ${isFull ? 'fill-danger' : percentFilled > 75 ? 'fill-warning' : 'fill-primary'}`}
              style={{ width: `${percentFilled}%` }}
            />
          </div>
        </div>
      </div>

      {/* Card Actions */}
      <div className="event-card-footer">
        <div className="action-buttons-group">
          <button
            onClick={() => onViewDetails(event)}
            className="btn btn-outline btn-xs"
            title="View Details"
          >
            <Eye size={14} />
            <span>Details</span>
          </button>
          
          <Link
            to={`/participants?eventId=${_id}`}
            className="btn btn-secondary btn-xs"
            title="View Registered Participants"
          >
            <Users size={14} />
            <span>Participants ({registeredCount})</span>
          </Link>
          
          {!isFull ? (
            <Link
              to={`/register?eventId=${_id}`}
              className="btn btn-primary btn-xs"
              title="Register a Student"
            >
              <UserPlus size={14} />
              <span>Register</span>
            </Link>
          ) : (
            <button className="btn btn-disabled btn-xs" disabled>
              Full
            </button>
          )}
        </div>

        <div className="manage-buttons-group">
          {onEdit && (
            <button
              onClick={() => onEdit(event)}
              className="icon-action-btn edit-btn"
              title="Edit Event"
            >
              <Edit3 size={15} />
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(event)}
              className="icon-action-btn delete-btn"
              title="Delete Event"
            >
              <Trash2 size={15} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventCard;
