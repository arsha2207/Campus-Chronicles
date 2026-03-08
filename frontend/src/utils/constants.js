// ─────────────────────────────────────────────────────────────────────────────
//  constants.js
//  Central place for colours, labels and config used across the whole app.
//  When you deploy, change API_BASE to your live Flask URL.
// ─────────────────────────────────────────────────────────────────────────────

/** Base URL for the Flask backend.
 *  During development Vite proxies /api → http://localhost:5000 (see vite.config.js)
 *  so you can leave this as an empty string while developing locally.
 *  For production set it to your deployed Flask URL, e.g. "https://myapp.onrender.com"
 */
export const API_BASE = ''

/** Colours for each news category — used by Badge and article cards */
export const CATEGORY_COLORS = {
  Events:        '#b5121b',
  Academics:     '#1a5c8a',
  Sports:        '#1a7a4a',
  'Campus News': '#7a4a1a',
  Culture:       '#6b1a7a',
  Opinion:       '#4a4a1a',
  Tech:          '#1a4a7a',
}

/** All available categories (used in dropdowns and nav) */
export const CATEGORIES = [
  'Campus News', 'Academics', 'Sports', 'Events', 'Opinion', 'Tech', 'Culture',
]

/** Colours for notification types */
export const NOTIF_COLORS = {
  approval:     '#1a7a4a',
  comment:      '#1a5c8a',
  announcement: '#c8960c',
  deadline:     '#b5121b',
  rejection:    '#b5121b',
}

/** Breaking news ticker items */
export const TICKER_ITEMS = [
  'Convocation scheduled for March 15 — All final year students must register',
  'Campus Chronicle wins Best College Newspaper Award 2025',
  'Semester exams timetable released — Check notice board for full schedule',
  'New eco-campus initiative launched — 500 trees to be planted this month',
  'AI and ML workshop open for all students — Register by this Friday',
  'Football team advances to state semifinals after thrilling win',
]
