/**
 * Partner Notification Service
 */

import { PartnerNotification } from '../types/delivery';
import { INITIAL_NOTIFICATIONS } from './mockData';

class NotificationService {
  private notifications: PartnerNotification[] = [...INITIAL_NOTIFICATIONS];

  public getNotifications(): PartnerNotification[] {
    return this.notifications;
  }

  public getUnreadCount(): number {
    return this.notifications.filter((n) => !n.isRead).length;
  }

  public markAsRead(id: string): void {
    const notif = this.notifications.find((n) => n.id === id);
    if (notif) {
      notif.isRead = true;
    }
  }

  public markAllAsRead(): void {
    this.notifications.forEach((n) => {
      n.isRead = true;
    });
  }
}

export const notificationService = new NotificationService();
