// =============================================================================
// AyatBits – Push Notification Handler (Service Worker Custom Code)
// =============================================================================
// This file is automatically injected into the generated sw.js by next-pwa.
// It handles structured push payloads and smart notification-click routing.
// =============================================================================

// ---------------------------------------------------------------------------
// 1. Notification Type Configuration Map
// ---------------------------------------------------------------------------
// Each key corresponds to a `type` value sent from the backend.
// Properties:
//   icon     – path to the notification icon (relative to /public)
//   badge    – small monochrome badge icon shown on Android status bar
//   tag      – used to collapse/replace duplicate notifications of same type
//   vibrate  – vibration pattern in ms  [vibrate, pause, vibrate, …]
//   actions  – optional action buttons shown on the notification
//   requireInteraction – if true the notification stays until the user acts
//   urgency  – purely internal; not used by the browser, useful for logging

const NOTIFICATION_CONFIG = {
  // ── Learning & Progress Milestones ──────────────────────────────────────
  surah_completed: {
    icon: '/icon-512.png',
    badge: '/icon-192.png',
    tag: 'surah-completed',
    vibrate: [100, 50, 100, 50, 200],
    requireInteraction: false,
  },
  juz_completed: {
    icon: '/icon-512.png',
    badge: '/icon-192.png',
    tag: 'juz-completed',
    vibrate: [100, 50, 100, 50, 200],
    requireInteraction: false,
  },
  streak_warning: {
    icon: '/icon-512.png',
    badge: '/icon-192.png',
    tag: 'streak-warning',
    vibrate: [200, 100, 200],
    requireInteraction: true,
  },
  streak_record: {
    icon: '/icon-512.png',
    badge: '/icon-192.png',
    tag: 'streak-record',
    vibrate: [100, 50, 100, 50, 200],
    requireInteraction: false,
  },

  // ── Account & Security ──────────────────────────────────────────────────
  welcome_user: {
    icon: '/icon-512.png',
    badge: '/icon-192.png',
    tag: 'welcome',
    vibrate: [100, 50, 100],
    requireInteraction: false,
  },
  login_success: {
    icon: '/icon-512.png',
    badge: '/icon-192.png',
    tag: 'login-success',
    vibrate: [100],
    requireInteraction: false,
  },
  security_alert: {
    icon: '/icon-512.png',
    badge: '/icon-192.png',
    tag: 'security-alert',
    vibrate: [300, 100, 300, 100, 300],
    requireInteraction: true,
    actions: [
      { action: 'review', title: '🔒 Review Activity' },
    ],
  },

  // ── Billing & Subscriptions ─────────────────────────────────────────────
  trial_ending: {
    icon: '/icon-512.png',
    badge: '/icon-192.png',
    tag: 'trial-ending',
    vibrate: [200, 100, 200],
    requireInteraction: true,
    actions: [
      { action: 'upgrade', title: '⭐ Upgrade Now' },
      { action: 'dismiss', title: 'Later' },
    ],
  },
  subscription_ending: {
    icon: '/icon-512.png',
    badge: '/icon-192.png',
    tag: 'subscription-ending',
    vibrate: [200, 100, 200],
    requireInteraction: true,
    actions: [
      { action: 'manage', title: '💳 Manage Billing' },
      { action: 'dismiss', title: 'Later' },
    ],
  },
};

// Fallback for unknown / future notification types
const DEFAULT_CONFIG = {
  icon: '/icon-512.png',
  badge: '/icon-192.png',
  tag: 'general',
  vibrate: [100],
  requireInteraction: false,
};

// ---------------------------------------------------------------------------
// 2. Action → URL mapping (for action buttons within notifications)
// ---------------------------------------------------------------------------
const ACTION_URL_MAP = {
  upgrade: '/pricing',
  manage: '/dashboard/billing',
  review: '/dashboard/profile',
};

// ---------------------------------------------------------------------------
// 3. Push Event – Parse payload & display notification
// ---------------------------------------------------------------------------
self.addEventListener('push', (event) => {
  /** @type {{ type: string, title: string, body: string, data?: { url?: string } }} */
  let payload;

  try {
    payload = event.data?.json();
  } catch (_err) {
    // Graceful fallback for malformed / non-JSON payloads
    const text = event.data?.text() ?? '';
    payload = {
      type: 'general',
      title: 'AyatBits',
      body: text || 'You have a new notification.',
      data: { url: '/dashboard' },
    };
  }

  // Guard: if json() returned null/undefined for some reason
  if (!payload) {
    payload = {
      type: 'general',
      title: 'AyatBits',
      body: 'You have a new notification.',
      data: { url: '/dashboard' },
    };
  }

  const { type = 'general', title = 'AyatBits', body = '', data = {} } = payload;
  const config = NOTIFICATION_CONFIG[type] || DEFAULT_CONFIG;

  const options = {
    body,
    icon: config.icon,
    badge: config.badge,
    tag: config.tag,
    vibrate: config.vibrate,
    requireInteraction: config.requireInteraction,
    data: {
      url: data.url || '/dashboard',
      type,
      timestamp: Date.now(),
    },
  };

  // Attach action buttons if configured for this type
  if (config.actions) {
    options.actions = config.actions;
  }

  // waitUntil keeps the worker alive until showNotification resolves
  event.waitUntil(self.registration.showNotification(title, options));
});

// ---------------------------------------------------------------------------
// 4. Notification Click – Smart, optimised tab routing
// ---------------------------------------------------------------------------
self.addEventListener('notificationclick', (event) => {
  // Always close the notification itself
  event.notification.close();

  // Determine target URL:
  //   - If the user tapped an action button, map it to a URL.
  //   - Otherwise fall back to the notification's data.url.
  const targetUrl =
    (event.action && ACTION_URL_MAP[event.action]) ||
    event.notification.data?.url ||
    '/dashboard';

  event.waitUntil(
    clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((windowClients) => {
        // Strategy 1 – Exact match: focus the tab already on this URL
        for (const client of windowClients) {
          const clientUrl = new URL(client.url);
          if (clientUrl.pathname === targetUrl) {
            return client.focus();
          }
        }

        // Strategy 2 – Reuse an existing tab on a different route
        if (windowClients.length > 0) {
          const client = windowClients[0];
          return client.navigate(targetUrl).then((navigatedClient) => {
            if (navigatedClient) {
              return navigatedClient.focus();
            }
          });
        }

        // Strategy 3 – No existing windows → open a new one
        return clients.openWindow(targetUrl);
      })
  );
});

