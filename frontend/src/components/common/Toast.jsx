// src/components/common/Toast.js
import React, { createContext, useContext, useState } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = 'info', title = '') => {
    const id = Date.now().toString();
    const toast = { id, message, type, title };
    
    setToasts(prev => [...prev, toast]);
    
    setTimeout(() => {
      removeToast(id);
    }, 5000);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {createPortal(
        <ToastContainer toasts={toasts} onRemove={removeToast} />,
        document.body
      )}
    </ToastContext.Provider>
  );
};

const ToastContainer = ({ toasts, onRemove }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map(toast => (
        <Toast key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
};

const Toast = ({ toast, onRemove }) => {
  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle size={20} className="text-success" />;
      case 'error':
        return <XCircle size={20} className="text-error" />;
      case 'warning':
        return <AlertTriangle size={20} className="text-warning" />;
      default:
        return <Info size={20} className="text-info" />;
    }
  };

  return (
    <div className={`toast ${toast.type}`}>
      <div className="toast-icon">
        {getIcon()}
      </div>
      <div className="toast-content">
        {toast.title && <div className="toast-title">{toast.title}</div>}
        <div className="toast-message">{toast.message}</div>
      </div>
      <button
        className="toast-close"
        onClick={() => onRemove(toast.id)}
      >
        <X size={16} />
      </button>
    </div>
  );
};