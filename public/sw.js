// QCOM Delivery Partner Service Worker
const CACHE_NAME = 'qcom-rider-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Handle Background Push & System Notifications
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const taskId = event.notification.data?.taskId;
  const urlToOpen = new URL('/', self.location.origin).href;

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url === urlToOpen && 'focus' in client) {
          if (taskId) {
            client.postMessage({ type: 'OPEN_TASK_MODAL', taskId });
          }
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(urlToOpen);
      }
    })
  );
});

// Background notification push event handler
self.addEventListener('push', (event) => {
  if (!event.data) return;

  try {
    const data = event.data.json();
    const title = data.title || '⚡ New QCOM Order Available!';
    const options = {
      body: data.body || 'Tap to open and accept immediate dispatch task.',
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      vibrate: [200, 100, 200, 100, 400],
      tag: 'qcom-order-dispatch',
      renotify: true,
      requireInteraction: true,
      data: data.data || {},
      actions: [
        { action: 'accept', title: '🚀 View & Accept' },
        { action: 'dismiss', title: 'Dismiss' },
      ],
    };

    event.waitUntil(self.registration.showNotification(title, options));
  } catch (err) {
    console.error('Push handling error:', err);
  }
});
