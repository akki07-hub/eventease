import React from 'react';

const StatCard = ({ title, value, subtitle, icon: Icon, color = 'indigo', onClick }) => {
  return (
    <div 
      className={`stat-card stat-card-${color} ${onClick ? 'stat-card-clickable' : ''}`}
      onClick={onClick}
    >
      <div className="stat-card-content">
        <div className="stat-header">
          <span className="stat-title">{title}</span>
          {Icon && (
            <div className={`stat-icon-wrapper stat-icon-${color}`}>
              <Icon size={22} />
            </div>
          )}
        </div>
        <div className="stat-value">{value !== undefined && value !== null ? value : '-'}</div>
        {subtitle && <div className="stat-subtitle">{subtitle}</div>}
      </div>
    </div>
  );
};

export default StatCard;
