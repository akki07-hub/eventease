import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { 
  Calendar, 
  LayoutDashboard, 
  CalendarCheck, 
  UserPlus, 
  Users, 
  PlusCircle, 
  Menu, 
  X 
} from 'lucide-react';

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/events', label: 'Events', icon: CalendarCheck },
    { to: '/register', label: 'Register', icon: UserPlus },
    { to: '/participants', label: 'Participants', icon: Users },
  ];

  return (
    <header className="navbar-container">
      <div className="navbar-inner">
        {/* Brand / Logo */}
        <Link to="/" className="brand-logo" onClick={() => setMobileMenuOpen(false)}>
          <div className="brand-icon-box">
            <Calendar className="brand-icon" size={24} />
          </div>
          <div className="brand-text-group">
            <span className="brand-name">EventEase</span>
            <span className="brand-tagline">College Events</span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="nav-menu-desktop">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `nav-link ${isActive ? 'nav-link-active' : ''}`
                }
                end={link.to === '/'}
              >
                <Icon size={18} />
                <span>{link.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Header Right Action */}
        <div className="nav-actions-desktop">
          <Link to="/events/create" className="btn btn-primary btn-sm">
            <PlusCircle size={16} />
            <span>Create Event</span>
          </Link>
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          className="mobile-menu-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="mobile-nav-drawer">
          <nav className="mobile-nav-links">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `mobile-nav-link ${isActive ? 'mobile-nav-link-active' : ''}`
                  }
                  end={link.to === '/'}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Icon size={20} />
                  <span>{link.label}</span>
                </NavLink>
              );
            })}
            <Link
              to="/events/create"
              className="btn btn-primary"
              style={{ marginTop: '0.75rem', justifyContent: 'center' }}
              onClick={() => setMobileMenuOpen(false)}
            >
              <PlusCircle size={18} />
              <span>Create Event</span>
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
