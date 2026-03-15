// ─────────────────────────────────────────────────────────────────────────────
//  api.js
//  Every call to your Flask backend lives here.
//  Import the function you need in any page/component.
//
//  HOW IT WORKS:
//  1. getToken() reads the JWT stored after login.
//  2. Each function builds the fetch() request and returns parsed JSON.
//  3. If Flask returns a non-OK status, an error is thrown with the
//     message from Flask so you can show it in the UI.
//
//  FLASK CORS:
//  Install flask-cors and add to your Flask app:
//    from flask_cors import CORS
//    CORS(app)
// ─────────────────────────────────────────────────────────────────────────────

import { API_BASE } from './constants'

// ── Token helpers ──────────────────────────────────────────────────────────
export const getToken  = ()      => localStorage.getItem('cc_token')
export const saveToken = (token) => localStorage.setItem('cc_token', token)
export const clearToken = ()     => localStorage.removeItem('cc_token')

// ── Base fetch wrapper ─────────────────────────────────────────────────────
async function request(path, options = {}) {
  const token = getToken()
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  }
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Request failed')
  return data
}

// ══════════════════════════════════════════════════════════════════════════
//  AUTH
// ══════════════════════════════════════════════════════════════════════════

/**
 * Login
 * POST /api/login
 * Body: { email, password }
 * Returns: { user: { id, name, role, dept }, token }
 */
export const login = (email, password) =>
  request('/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })

/**
 * Register
 * POST /api/register
 * Body: { name, email, password, role, dept, year }
 * Returns: { user: {...}, token }
 */
export const register = (formData) =>
  request('/register', {
    method: 'POST',
    body: JSON.stringify(formData),
  })

// ══════════════════════════════════════════════════════════════════════════
//  ARTICLES
// ══════════════════════════════════════════════════════════════════════════

/**
 * Fetch published articles (home feed)
 * GET /api/articles?cat=All&page=1
 * Returns: { articles: [...], total: 42 }
 */
export const fetchArticles = (cat = 'All', page = 1) => {
  const params = new URLSearchParams({ cat, page })
  return request(`/articles/approved?${params}`)
}

export const fetchArticleById = (id) => request(`/articles/${id}`)

/**
 * Search articles (archive page)
 * GET /api/articles/search?q=...&cat=...&month=...
 * Returns: { results: [...] }
 */
export const searchArticles = (q, cat, date) => {
  const params = new URLSearchParams()
  if (q)    params.set('q',    q)
  if (cat)  params.set('cat',  cat)
  if (date) params.set('date', date)   // ← sends as "2025-03-04"
  return request(`/articles/search?${params}`)
}

/**
 * Submit a new article (with optional image)
 * POST /api/articles  (multipart/form-data)
 * Returns: { article: { id, ... }, message: 'Submitted for review' }
 *
 * NOTE: uses FormData so we skip the JSON Content-Type header
 */
export const submitArticle = async (formData) => {
  const token = getToken()
  const res = await fetch(`${API_BASE}/articles/submit`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData, // FormData handles multipart automatically
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Submit failed')
  return data
}

// ══════════════════════════════════════════════════════════════════════════
//  ADMIN
// ══════════════════════════════════════════════════════════════════════════

/**
 * Get pending articles
 * GET /api/admin/pending
 * Returns: { articles: [...] }
 */
export const fetchPending = () => request('/admin/pending')

/**
 * Get approved/published articles
 * GET /api/admin/approved
 * Returns: { articles: [...] }
 */
export const fetchApproved = () => request('/admin/approved')

/**
 * Approve an article
 * POST /api/admin/approve/:id
 * Returns: { message: 'Approved' }
 */
export const approveArticle = (id) =>
  request(`/admin/approve/${id}`, { method: 'POST' })

/**
 * Reject an article
 * POST /api/admin/reject/:id
 * Body: { feedback: "..." }  (optional)
 * Returns: { message: 'Rejected' }
 */
export const rejectArticle = (id, remark = '') =>
  request(`/admin/reject/${id}`, {
    method: 'POST',
    body: JSON.stringify({ remark }),
  })

/**
 * Get all registered users (admin only)
 * GET /api/admin/users
 * Returns: { users: [...] }
 */
export const fetchUsers = () => request('/admin/users')

/**
 * Get publication statistics
 * GET /api/admin/stats
 * Returns: { stats: [{ category, count }] }
 */
export const fetchStats = () => request('/admin/stats')

// ══════════════════════════════════════════════════════════════════════════
//  NOTIFICATIONS
// ══════════════════════════════════════════════════════════════════════════

/**
 * Get notifications for logged-in user
 * GET /api/notifications
 * Returns: { notifications: [...] }
 */
export const fetchNotifications = () => request('/notifications')

/**
 * Mark a notification as read
 * PATCH /api/notifications/:id/read
 */
export const markNotifRead = (id) =>
  request(`/notifications/${id}/read`, { method: 'PATCH' })

/**
 * Mark all notifications as read
 * PATCH /api/notifications/read-all
 */
export const markAllNotifsRead = () =>
  request('/notifications/read-all', { method: 'PATCH' })

/**
 * Dismiss (delete) a notification
 * DELETE /api/notifications/:id
 */
export const dismissNotif = (id) =>
  request(`/notifications/${id}`, { method: 'DELETE' })

// ══════════════════════════════════════════════════════════════════════════
//  AI FORMATTER  (can be proxied through Flask to keep your key secure)
// ══════════════════════════════════════════════════════════════════════════

/**
 * Format article with AI via Flask proxy
 * POST /api/ai/format
 * Body: { title, content }
 * Returns: { formatted: "..." }
 *
 * Your Flask route should call Anthropic and return the result.
 * This keeps your Anthropic API key on the server, not the browser.
 */
export const formatWithAI = (title, content) =>
  request('/ai/format', {
    method: 'POST',
    body: JSON.stringify({ title, content }),
  })
