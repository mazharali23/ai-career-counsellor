import React, { useState, useEffect } from 'react';

export const Toaster = () => {
  const [toasts, setToasts] = useState([]);

  return (
    <div className="toast-container">
      {toasts.map((toast, index) => (
        <div key={index} className={`toast ${toast.type}`}>
          {toast.message}
        </div>
      ))}
    </div>
  );
};

// Simple toast function (you can enhance this)
export const showToast = (message, type = 'info') => {
  console.log(`Toast: ${message} (${type})`);
};
