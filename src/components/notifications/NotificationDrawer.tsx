import React, { useState } from 'react';
import { Bell, CheckCheck, Trash2, Clock } from 'lucide-react';
import { BottomSheet } from '../common/BottomSheet';
import { notificationService } from '../../services/notificationService';
import { PartnerNotification } from '../../types/delivery';
import { Button } from '../common/Button';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
}) => {
  const [notifications, setNotifications] = useState<PartnerNotification[]>(() =>
    notificationService.getNotifications()
  );

  const handleMarkAllRead = () => {
    notificationService.markAllAsRead();
    setNotifications([...notificationService.getNotifications()]);
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Operational Alerts & Dispatch Pings">
      <div className="space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
          <span className="text-xs text-neutral-500 font-medium">
            {notifications.filter((n) => !n.isRead).length} unread alerts
          </span>
          <button
            onClick={handleMarkAllRead}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            Mark all read
          </button>
        </div>

        <div className="space-y-2 max-h-[50vh] overflow-y-auto">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`p-3 rounded-xl border text-xs space-y-1 transition-colors ${
                !n.isRead ? 'bg-emerald-50/60 border-emerald-200' : 'bg-neutral-50 border-neutral-200/60'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-neutral-900">{n.title}</span>
                <span className="text-[10px] text-neutral-400">{n.timestamp}</span>
              </div>
              <p className="text-neutral-600">{n.message}</p>
            </div>
          ))}
        </div>

        <Button variant="outline" size="sm" fullWidth onClick={onClose}>
          Close Alerts
        </Button>
      </div>
    </BottomSheet>
  );
};
