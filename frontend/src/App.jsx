import React from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import EventsList from './pages/EventsList';
import EventForm from './pages/EventForm';
import StudentRegistration from './pages/StudentRegistration';
import Participants from './pages/Participants';
import { Calendar } from 'lucide-react';

function App() {
  return (
    <div className="app-layout">
      {/* Top Navigation Bar */}
      <Navbar />

      {/* Main Page Content */}
      <main className="main-content-area">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/events" element={<EventsList />} />
          <Route path="/events/create" element={<EventForm />} />
          <Route path="/events/edit/:id" element={<EventForm />} />
          <Route path="/register" element={<StudentRegistration />} />
          <Route path="/participants" element={<Participants />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* College Project Footer */}
      <footer className="footer-container">
        <div className="footer-inner">
          <div className="footer-left">
            <div className="footer-brand">
              <Calendar size={18} />
              <span>EventEase</span>
            </div>
            <p className="footer-copy">
              College Event Management System — Full Stack MERN Academic Project
            </p>
          </div>
          <div className="footer-right">
            <div className="footer-links">
              <Link to="/">Dashboard</Link>
              <span>•</span>
              <Link to="/events">Events</Link>
              <span>•</span>
              <Link to="/register">Register</Link>
              <span>•</span>
              <Link to="/participants">Participants</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
