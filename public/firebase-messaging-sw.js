// Firebase Cloud Messaging Service Worker
// Handles background push notifications for Yollr Bell

importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Initialize Firebase with actual project config
firebase.initializeApp({
  apiKey: "AIzaSyBxVkJNM_eAc_RaD2RjHpp0o2lPfpwYrQk",
  authDomain: "viralmust-2890a.firebaseapp.com",
  projectId: "viralmust-2890a",
  storageBucket: "viralmust-2890a.firebasestorage.app",
  messagingSenderId: "214039677330",
  appId: "1:214039677330:web:c6728e16f989229a17594b"
});

const messaging = firebase.messaging();

// Handle background messages (when app is not in foreground)
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message:', payload);

  const notificationTitle = payload.notification?.title || 'Yollr Bell! 🔔';
  const notificationOptions = {
    body: payload.notification?.body || 'Time to capture campus right now!',
    icon: '/icons/bell-notification.png',
    badge: '/icons/badge.png',
    tag: 'yollr-bell', // Replace previous Bell notifications
    requireInteraction: true, // Keep notification until user interacts
    vibrate: [200, 100, 200], // Vibration pattern
    data: {
      url: payload.data?.deep_link || '/bell',
      ...payload.data
    },
    actions: [
      {
        action: 'capture',
        title: '📸 Capture Now',
        icon: '/icons/camera.png'
      },
      {
        action: 'dismiss',
        title: 'Later'
      }
    ]
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] Notification click:', event.action);

  event.notification.close();

  if (event.action === 'capture') {
    // Open Bell page directly
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true })
        .then((clientList) => {
          // Check if there's already a window open
          for (const client of clientList) {
            if ('focus' in client) {
              client.postMessage({
                type: 'NAVIGATE_TO_BELL',
                url: '/bell'
              });
              return client.focus();
            }
          }
          // No window open, open new one
          if (clients.openWindow) {
            return clients.openWindow('/bell');
          }
        })
    );
  } else if (event.action === 'dismiss') {
    // Just close the notification
    return;
  } else {
    // Default action (tap notification body) - open Bell page
    const urlToOpen = event.notification.data?.url || '/bell';
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true })
        .then((clientList) => {
          for (const client of clientList) {
            if (client.url.includes(urlToOpen) && 'focus' in client) {
              return client.focus();
            }
          }
          if (clients.openWindow) {
            return clients.openWindow(urlToOpen);
          }
        })
    );
  }
});

// Handle push events (for additional control)
self.addEventListener('push', (event) => {
  console.log('[firebase-messaging-sw.js] Push received:', event);
  // Firebase Messaging will handle this, but we log for debugging
});
