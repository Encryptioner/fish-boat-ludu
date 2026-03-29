/**
 * Google Analytics 4 Integration
 * Privacy-first, typed analytics implementation for vanilla JavaScript.
 *
 * All player references use numeric index (1 or 2) — never player names.
 */

// ── Config ──────────────────────────────────────────────────

const GOOGLE_ANALYTICS_CONFIG = {
  /** GA4 Measurement ID */
  measurementId: 'G-7XCXMKV2S0',

  /** Master enable switch — set to false to silence all tracking */
  enabled: true,

  /** Set to true to also track on localhost during development */
  trackInDevelopment: false,

  get shouldTrack() {
    if (!this.enabled) return false;
    if (!this.measurementId || this.measurementId === 'G-XXXXXXXXXX') return false;
    const isLocalhost =
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1';
    if (isLocalhost && !this.trackInDevelopment) return false;
    return true;
  },
};

// ── Type definition ──────────────────────────────────────────

/**
 * @typedef {
 *   | { name: 'game_started' }
 *   | { name: 'game_won',          params: { winner_index: number, total_moves: number } }
 *   | { name: 'game_reset',        params: { moves_played: number } }
 *   | { name: 'game_duration',     params: { duration_seconds: number, total_moves: number } }
 *   | { name: 'dice_rolled',       params: { value: number, player_index: number } }
 *   | { name: 'fish_encountered',  params: { from_square: number, to_square: number } }
 *   | { name: 'boat_encountered',  params: { from_square: number, to_square: number } }
 *   | { name: 'sound_toggled',     params: { enabled: boolean } }
 *   | { name: 'mobile_menu_toggled', params: { opened: boolean } }
 *   | { name: 'pwa_installed' }
 *   | { name: 'error_occurred',    params: { category: string, action: string, error: string } }
 * } AnalyticsEvent
 */

// ── Helpers ──────────────────────────────────────────────────

const EMAIL_PATTERN = /[\w.+-]+@[\w.-]+\.\w+/g;

/**
 * Strip email addresses from error messages to prevent PII leakage.
 * @param {string} msg - Raw error message
 * @returns {string} Sanitized message, max 100 chars
 */
function sanitizeError(msg) {
  return msg.replace(EMAIL_PATTERN, '[email]').slice(0, 100);
}

// ── Core tracking function ────────────────────────────────────

/**
 * Send a typed analytics event to Google Analytics.
 * No-ops gracefully when gtag is unavailable (offline, ad blockers, dev).
 *
 * @param {AnalyticsEvent} event
 */
function trackEvent(event) {
  if (!GOOGLE_ANALYTICS_CONFIG.shouldTrack) return;
  if (typeof window === 'undefined' || !window.gtag) return;

  try {
    const { name, ...rest } = event;
    const params = 'params' in rest ? rest.params : undefined;
    window.gtag('event', name, params);
  } catch (error) {
    // Swallow — never let analytics throw into game code
    console.warn('[Analytics] trackEvent failed:', error);
  }
}

// ── GA initialisation ────────────────────────────────────────

/**
 * Inject the gtag.js script and configure GA4.
 * Called once on page load.
 */
function initializeGA() {
  if (!GOOGLE_ANALYTICS_CONFIG.shouldTrack) {
    console.log('[Analytics] Tracking disabled');
    return;
  }

  try {
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ANALYTICS_CONFIG.measurementId}`;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    window.gtag = function () {
      window.dataLayer.push(arguments);
    };

    window.gtag('js', new Date());
    window.gtag('config', GOOGLE_ANALYTICS_CONFIG.measurementId);

    console.log('[Analytics] Initialised with ID:', GOOGLE_ANALYTICS_CONFIG.measurementId);
  } catch (error) {
    console.error('[Analytics] Initialisation failed:', error);
  }
}

// Initialise on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeGA);
} else {
  initializeGA();
}
