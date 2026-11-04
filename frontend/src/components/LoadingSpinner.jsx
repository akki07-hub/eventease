import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({ message = 'Loading...', size = 32, fullPage = false }) => {
  const content = (
    <div className="loading-container">
      <Loader2 className="loading-spinner" size={size} />
      {message && <p className="loading-message">{message}</p>}
    </div>
  );

  if (fullPage) {
    return <div className="loading-full-page">{content}</div>;
  }

  return content;
};

export default LoadingSpinner;
