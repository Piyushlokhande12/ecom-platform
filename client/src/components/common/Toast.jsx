import React from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({ toasts, onDismiss }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((toast) => {
        let Icon = CheckCircle;
        let className = 'toast toast-success';

        if (toast.type === 'error') {
          Icon = AlertCircle;
          className = 'toast toast-error';
        } else if (toast.type === 'info') {
          Icon = Info;
          className = 'toast toast-info';
        }

        return (
          <div key={toast.id} className={className}>
            <Icon size={18} />
            <div style={{ flex: 1, lineHeight: 1.3 }}>{toast.message}</div>
            <button
              onClick={() => onDismiss(toast.id)}
              style={{ color: 'var(--text-muted)', display: 'flex' }}
              title="Close"
            >
              <X size={15} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
