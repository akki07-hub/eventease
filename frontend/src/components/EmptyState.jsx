import React from 'react';
import { Inbox } from 'lucide-react';

const EmptyState = ({
  title = 'No records found',
  description = 'There are no items matching your criteria at this moment.',
  icon: Icon = Inbox,
  actionButton
}) => {
  return (
    <div className="empty-state-card">
      <div className="empty-state-icon-box">
        <Icon size={44} className="empty-state-icon" />
      </div>
      <h3 className="empty-state-title">{title}</h3>
      <p className="empty-state-desc">{description}</p>
      {actionButton && <div className="empty-state-action">{actionButton}</div>}
    </div>
  );
};

export default EmptyState;
