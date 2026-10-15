import React from 'react';
import { NotificationItem } from '../types/wedding';
import { Bell, Check, X, Clock, AlertCircle } from 'lucide-react';

interface NotificationCenterModalProps {
  notifications: NotificationItem[];
  onMarkAllAsRead: () => void;
  onClose: () => void;
  onTriggerTestAlert: () => void;
}

export const NotificationCenterModal: React.FC<NotificationCenterModalProps> = ({
  notifications,
  onMarkAllAsRead,
  onClose,
  onTriggerTestAlert,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200 relative animate-in fade-in duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-stone-400 hover:text-stone-600 p-1 cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center justify-between mb-4 pb-2 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-rose-900" />
            <h2 className="text-lg font-serif font-bold text-stone-900">
              Notification & Deadline Center
            </h2>
          </div>
        </div>

        <p className="text-xs text-stone-500 mb-4">
          Automated alerts for catering headcount deadlines, supplier payments, and guest updates.
        </p>

        <div className="space-y-3 max-h-72 overflow-y-auto pr-1 mb-4">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`p-3 rounded-xl border text-xs transition-colors ${
                n.read
                  ? 'bg-stone-50 border-stone-200 text-stone-600'
                  : 'bg-rose-50/60 border-rose-200 text-stone-900 font-medium'
              }`}
            >
              <div className="flex items-center justify-between text-[10px] text-stone-400 mb-1">
                <span className="uppercase tracking-wider font-semibold text-rose-800">
                  {n.type} alert
                </span>
                <span className="tabular-nums flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {n.timestamp}
                </span>
              </div>
              <h3 className="font-semibold text-stone-900 text-xs mb-1">
                {n.title}
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed font-normal">
                {n.message}
              </p>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-stone-100">
          <button
            onClick={onTriggerTestAlert}
            className="text-xs text-rose-800 hover:text-rose-950 font-medium cursor-pointer"
          >
            Trigger New Test Alert
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onMarkAllAsRead}
              className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-medium rounded cursor-pointer"
            >
              Mark All Read
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-medium rounded cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
