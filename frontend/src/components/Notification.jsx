import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

const icons = {
  success: CheckCircle2,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info
};

const Notification = ({
  type = 'info',
  message,
  onClose,
  autoClose = true,
  duration = 4000
}) => {
  useEffect(() => {
    if (autoClose && onClose && message) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [autoClose, onClose, message, duration]);

  if (!message) return null;

  const IconComponent = icons[type] || icons.info;

  return (
    <div className={`notification-banner notification-${type}`} role="alert">
      <div className="notification-icon">
        <IconComponent size={20} />
      </div>
      <div className="notification-text">{message}</div>
      {onClose && (
        <button
          onClick={onClose}
          className="notification-close-btn"
          aria-label="Dismiss notification"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};

export default Notification;
