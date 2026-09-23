/**
 * Push Notification & System Notification Bar Service
 * Handles mobile system notifications, lock-screen alerts, sound triggers, and Service Worker integration.
 */

import { DeliveryTask } from '../types/delivery';
import { audioNotificationService } from './audioNotificationService';

class PushNotificationService {
  private swRegistration: ServiceWorkerRegistration | null = null;
  private wakeLock: any = null;
  private onTaskOpenCallback: ((taskId: string) => void) | null = null;

  constructor() {
    this.initServiceWorker();
    this.listenServiceWorkerMessages();
  }

  private async initServiceWorker() {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      try {
        const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
        this.swRegistration = reg;
        console.log('QCOM Delivery SW Registered successfully.');
      } catch (err) {
        console.warn('SW registration fallback:', err);
      }
    }
  }

  private listenServiceWorkerMessages() {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data?.type === 'OPEN_TASK_MODAL' && event.data.taskId) {
          if (this.onTaskOpenCallback) {
            this.onTaskOpenCallback(event.data.taskId);
          }
        }
      });
    }
  }

  public setOnTaskOpenCallback(cb: (taskId: string) => void) {
    this.onTaskOpenCallback = cb;
  }

  /**
   * Request system notification permission (Triggered when partner taps Go Online)
   */
  public async requestNotificationPermission(): Promise<NotificationPermission> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'denied';
    }

    if (Notification.permission === 'granted') {
      return 'granted';
    }

    try {
      const permission = await Notification.requestPermission();
      return permission;
    } catch (err) {
      console.warn('Notification permission error:', err);
      return 'denied';
    }
  }

  /**
   * Acquire screen wake lock while rider is online so screen doesn't sleep in traffic
   */
  public async enableOnlineWakeLock() {
    if (typeof navigator !== 'undefined' && 'wakeLock' in navigator) {
      try {
        this.wakeLock = await (navigator as any).wakeLock.request('screen');
      } catch (err) {
        // WakeLock may fail if device is low battery or background
      }
    }
  }

  public disableOnlineWakeLock() {
    if (this.wakeLock) {
      try {
        this.wakeLock.release();
        this.wakeLock = null;
      } catch {
        // Ignore
      }
    }
  }

  /**
   * Broadcast incoming order alert to mobile status/notification bar
   */
  public async showIncomingOrderNotification(task: DeliveryTask) {
    // 1. Play signature Swiggy/Zomato dispatch tone
    audioNotificationService.playNewOrderTone();

    // 2. Format mobile notification payload
    const dist = task.route?.distanceKm || (task.route?.distanceMeters ? (task.route.distanceMeters / 1000).toFixed(1) : '2.4');
    const title = `⚡ New Order: ₹${task.payoutBreakdown.totalPayout} Payout (${task.orderNumber})`;
    const body = `📍 ${task.pickup.storeName} (${dist} km) ➔ ${task.drop.customerName}. Tap to accept!`;
    const options: any = {
      body,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: `order-${task.id}`,
      renotify: true,
      requireInteraction: true,
      vibrate: [250, 100, 250, 100, 500],
      data: {
        taskId: task.id,
        url: '/',
      },
    };

    // 3. Dispatch via Service Worker or Native Notification API
    try {
      if (this.swRegistration && 'showNotification' in this.swRegistration) {
        await this.swRegistration.showNotification(title, options);
      } else if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        const notification = new Notification(title, options);
        notification.onclick = () => {
          window.focus();
          notification.close();
          if (this.onTaskOpenCallback) {
            this.onTaskOpenCallback(task.id);
          }
        };
      }
    } catch (err) {
      console.warn('Could not post system notification:', err);
    }
  }
}

export const pushNotificationService = new PushNotificationService();
