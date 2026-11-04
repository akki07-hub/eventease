import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, 
  CalendarDays, 
  Users, 
  ClipboardCheck, 
  PlusCircle, 
  UserPlus, 
  ArrowRight, 
  RefreshCw, 
  Clock, 
  MapPin, 
  Tag 
} from 'lucide-react';
import { dashboardService } from '../services/api';
import StatCard from '../components/StatCard';
import LoadingSpinner from '../components/LoadingSpinner';
import Notification from '../components/Notification';
import EmptyState from '../components/EmptyState';

const categoryBadgeClass = {
  Technical: 'badge-blue',
  Cultural: 'badge-purple',
  Sports: 'badge-emerald',
  Workshop: 'badge-amber',
  Seminar: 'badge-cyan',
  Academic: 'badge-indigo',
  Other: 'badge-gray'
};

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await dashboardService.getStats();
      if (res.success) {
        setStats(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to connect to the backend server. Ensure backend and MongoDB are running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="page-content">
      {/* Top Banner / Welcome Header */}
      <div className="page-header-row">
        <div>
          <h1 className="page-title">College Event Dashboard</h1>
          <p className="page-subtitle">
            Welcome to EventEase. Monitor campus events, student registrations, and venue schedules.
          </p>
        </div>
        <div className="header-actions">
          <button
            onClick={fetchStats}
            className="btn btn-secondary btn-sm"
            title="Refresh statistics"
            disabled={loading}
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
          <Link to="/events/create" className="btn btn-primary btn-sm">
            <PlusCircle size={15} />
            <span>New Event</span>
          </Link>
        </div>
      </div>

      {/* Error alert */}
      {error && (
        <Notification
          type="error"
          message={error}
          onClose={() => setError(null)}
          autoClose={false}
        />
      )}

      {loading ? (
        <LoadingSpinner message="Loading dashboard metrics..." />
      ) : (
        <>
          {/* Key Metric Stats Cards */}
          <div className="stats-grid">
            <StatCard
              title="Total Events"
              value={stats?.totalEvents ?? 0}
              subtitle="All scheduled & past events"
              icon={Calendar}
              color="indigo"
            />
            <StatCard
              title="Upcoming Events"
              value={stats?.upcomingEvents ?? 0}
              subtitle="Events scheduled from today"
              icon={CalendarDays}
              color="blue"
            />
            <StatCard
              title="Registered Students"
              value={stats?.totalStudents ?? 0}
              subtitle="Unique student profiles"
              icon={Users}
              color="emerald"
            />
            <StatCard
              title="Total Registrations"
              value={stats?.totalRegistrations ?? 0}
              subtitle="Active event registrations"
              icon={ClipboardCheck}
              color="amber"
            />
          </div>

          {/* Quick Action Shortcuts */}
          <div className="quick-actions-bar">
            <span className="quick-actions-title">Quick Actions:</span>
            <div className="quick-actions-list">
              <Link to="/events/create" className="quick-action-pill">
                <PlusCircle size={16} />
                <span>Create New Event</span>
              </Link>
              <Link to="/register" className="quick-action-pill">
                <UserPlus size={16} />
                <span>Register Student</span>
              </Link>
              <Link to="/events" className="quick-action-pill">
                <Calendar size={16} />
                <span>Browse All Events</span>
              </Link>
              <Link to="/participants" className="quick-action-pill">
                <Users size={16} />
                <span>View Event Participants</span>
              </Link>
            </div>
          </div>

          {/* Two-Column Layout: Upcoming Events & Recent Registrations */}
          <div className="dashboard-columns-grid">
            {/* Upcoming Events Column */}
            <div className="card">
              <div className="card-header">
                <div>
                  <h2 className="card-title">Upcoming Events</h2>
                  <p className="card-subtitle">Next events happening on campus</p>
                </div>
                <Link to="/events" className="link-with-icon">
                  <span>View All</span>
                  <ArrowRight size={15} />
                </Link>
              </div>

              <div className="card-body">
                {stats?.upcomingEventsList && stats.upcomingEventsList.length > 0 ? (
                  <div className="dashboard-list">
                    {stats.upcomingEventsList.map((ev) => {
                      const dateStr = new Date(ev.eventDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric'
                      });
                      return (
                        <div key={ev._id} className="dashboard-event-item">
                          <div className="event-date-box">
                            <span className="event-date-day">
                              {new Date(ev.eventDate).getDate()}
                            </span>
                            <span className="event-date-month">
                              {new Date(ev.eventDate).toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}
                            </span>
                          </div>

                          <div className="event-info-box">
                            <div className="event-header-row">
                              <h4 className="event-item-title">{ev.title}</h4>
                              <span className={`badge ${categoryBadgeClass[ev.category] || 'badge-gray'}`}>
                                {ev.category}
                              </span>
                            </div>
                            <div className="event-sub-meta">
                              <span>
                                <Clock size={13} style={{ display: 'inline', marginRight: '3px' }} />
                                {ev.startTime}
                              </span>
                              <span>•</span>
                              <span>
                                <MapPin size={13} style={{ display: 'inline', marginRight: '3px' }} />
                                {ev.venue}
                              </span>
                            </div>
                          </div>

                          <div className="event-action-box">
                            <Link
                              to={`/register?eventId=${ev._id}`}
                              className="btn btn-secondary btn-xs"
                            >
                              Register
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <EmptyState
                    title="No upcoming events"
                    description="No events are currently scheduled. Click below to add the first event."
                    actionButton={
                      <Link to="/events/create" className="btn btn-primary btn-sm">
                        Create Event
                      </Link>
                    }
                  />
                )}
              </div>
            </div>

            {/* Recent Registrations Column */}
            <div className="card">
              <div className="card-header">
                <div>
                  <h2 className="card-title">Recent Registrations</h2>
                  <p className="card-subtitle">Latest student enrollments</p>
                </div>
                <Link to="/participants" className="link-with-icon">
                  <span>View All</span>
                  <ArrowRight size={15} />
                </Link>
              </div>

              <div className="card-body">
                {stats?.recentRegistrations && stats.recentRegistrations.length > 0 ? (
                  <div className="table-responsive">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Student</th>
                          <th>Event</th>
                          <th>Date</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats.recentRegistrations.map((reg) => (
                          <tr key={reg._id}>
                            <td>
                              <div className="table-cell-main">
                                {reg.studentId?.name || 'Unknown Student'}
                              </div>
                              <div className="table-cell-sub">
                                {reg.studentId?.rollNo || 'N/A'} • {reg.studentId?.branch || ''}
                              </div>
                            </td>
                            <td>
                              <div className="table-cell-main">
                                {reg.eventId?.title || 'Unknown Event'}
                              </div>
                              <div className="table-cell-sub">
                                {reg.eventId?.venue || ''}
                              </div>
                            </td>
                            <td>
                              {new Date(reg.registrationDate).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric'
                              })}
                            </td>
                            <td>
                              <span
                                className={`badge ${
                                  reg.status === 'Registered' ? 'badge-success' : 'badge-danger'
                                }`}
                              >
                                {reg.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <EmptyState
                    title="No registrations yet"
                    description="Once students register for college events, they will appear here in real-time."
                    actionButton={
                      <Link to="/register" className="btn btn-primary btn-sm">
                        Register a Student
                      </Link>
                    }
                  />
                )}
              </div>
            </div>
          </div>

          {/* Event Categories Summary */}
          {stats?.categories && stats.categories.length > 0 && (
            <div className="card" style={{ marginTop: '1.5rem' }}>
              <div className="card-header">
                <div>
                  <h2 className="card-title">Event Category Breakdown</h2>
                  <p className="card-subtitle">Distribution of scheduled events across campus departments</p>
                </div>
              </div>
              <div className="card-body">
                <div className="category-tags-grid">
                  {stats.categories.map((cat) => (
                    <div key={cat.category} className="category-stat-pill">
                      <Tag size={16} />
                      <span className="category-pill-name">{cat.category}</span>
                      <span className="category-pill-count">{cat.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Dashboard;
