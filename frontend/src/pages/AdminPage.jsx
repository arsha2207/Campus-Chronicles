// AdminPage.jsx — editorial dashboard with responsive layout

import { useState, useEffect } from 'react'
import Ticker from '../components/Ticker'
import Badge from '../components/Badge'
import { Btn, TbBtn } from '../components/Buttons'
import { CATEGORY_COLORS } from '../utils/constants'
import { fetchPending, fetchApproved, approveArticle, rejectArticle, fetchUsers, fetchStats } from '../utils/api'

export default function AdminPage({ onBack, onArticleClick }) {
  const [tab,      setTab]      = useState('pending')
  const [pending,  setPending]  = useState([])
  const [approved, setApproved] = useState([])
  const [summary,  setSummary]  = useState(null)
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    Promise.all([fetchPending(), fetchApproved(), fetchStats()])
      .then(([p, a, s]) => {
        setPending(p.articles   || [])
        setApproved(a.articles  || [])
        setSummary(s.summary    || null)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const approve = async (id) => {
    await approveArticle(id)
    const art = pending.find(a => a.id === id)
    if (art) { setApproved(p => [art, ...p]); setPending(p => p.filter(a => a.id !== id)) }
  }

  const reject = async (id, remark = '') => {
    await rejectArticle(id, remark)
    setPending(p => p.filter(a => a.id !== id))
  }

  const TABS = [
    { id: 'pending',  label: '📋 Pending Review', badge: pending.length,  badgeColor: '#b5121b' },
    { id: 'approved', label: '✓ Approved',        badge: approved.length, badgeColor: '#1a7a4a' },
    { id: 'stats',    label: '📊 Statistics',      badge: null },
    { id: 'users',    label: '👥 Users',            badge: null },
  ]

  return (
    <div>
      {/* Topbar */}
      <div style={{ background: '#1a1008', color: '#e8dcc8', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 22px', fontFamily: "'Source Sans 3',sans-serif", fontSize: 11, borderBottom: '2px solid #c8960c', flexWrap: 'wrap', gap: 6 }}>
        <span>📍 Admin · RIT Edition</span>
        <TbBtn onClick={onBack}>← Home</TbBtn>
      </div>

      {/* Mini masthead */}
      <div style={{ background: '#fdf6e3', padding: '10px 22px 0', borderBottom: '4px double #1a1008' }}>
        <div style={{ textAlign: 'center', padding: '6px 0 2px' }}>
          <div style={{ fontFamily: "'Source Sans 3',sans-serif", fontSize: 10, letterSpacing: '.28em', textTransform: 'uppercase', color: '#6b5c4e', marginBottom: 2 }}>Editorial Dashboard</div>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(26px,6vw,54px)', lineHeight: 1, color: '#1a1008' }}>Campus Chronicle</div>
        </div>
        <Ticker />
      </div>

      <div style={{ maxWidth: 1280, margin: '0 auto', background: '#fdf6e3', boxShadow: '0 0 50px rgba(0,0,0,.28)' }}>

        {/* Stats row */}
        <div className="stats-row">
          {[
            { n: pending.length,                  l: 'Pending',         c: '#c8960c' },
            { n: approved.length,                 l: 'Approved',        c: '#1a7a4a' },
            { n: summary?.total_articles ?? '…',  l: 'Total Published', c: '#1a5c8a' },
            { n: summary?.total_students  ?? '…', l: 'Contributors',    c: '#7a4a1a' },
          ].map(s => (
            <div key={s.l} style={{ background: '#fffef7', border: '1px solid #e8dcc8', padding: 16, textAlign: 'center' }}>
              <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 30, fontWeight: 900, color: s.c }}>{s.n}</div>
              <div style={{ fontFamily: "'Source Sans 3',sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: '#6b5c4e', marginTop: 3 }}>{s.l}</div>
            </div>
          ))}
        </div>

        {/* Shell: sidebar + content */}
        <div className="admin-shell" style={{ marginTop: 14 }}>

          {/* Sidebar */}
          <div className="admin-sb" style={{ background: '#1a1008' }}>
            <div style={{ padding: '18px 18px 12px', borderBottom: '1px solid rgba(255,255,255,.1)' }}>
              <div style={{ fontFamily: "'Source Sans 3',sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: '.18em', textTransform: 'uppercase', color: '#a09080' }}>Admin Panel</div>
              <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 17, color: '#fdf6e3', marginTop: 3 }}>Editorial Desk</div>
            </div>
            {TABS.map(t => (
              <div key={t.id} onClick={() => setTab(t.id)} style={{
                padding: '11px 18px', cursor: 'pointer',
                fontFamily: "'Source Sans 3',sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase',
                color: tab === t.id ? '#fdf6e3' : '#a09080',
                borderLeft: `3px solid ${tab === t.id ? '#b5121b' : 'transparent'}`,
                background: tab === t.id ? 'rgba(255,255,255,.07)' : 'none',
                transition: 'all .2s',
              }}>
                {t.label}
                {t.badge != null && (
                  <span style={{ background: t.badgeColor || '#b5121b', color: '#fff', borderRadius: 10, padding: '0 6px', fontSize: 9, marginLeft: 6 }}>{t.badge}</span>
                )}
              </div>
            ))}
          </div>

          {/* Content */}
          <div style={{ flex: 1, padding: '22px 26px', overflowX: 'auto' }}>
            {tab === 'pending'  && <PendingTab  articles={pending}  onApprove={approve} onReject={reject} onRead={onArticleClick} />}
            {tab === 'approved' && <ApprovedTab articles={approved} onRead={onArticleClick} />}
            {tab === 'stats'    && <StatsTab />}
            {tab === 'users'    && <UsersTab />}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Section header ─────────────────────────────────────────────────────────
function SH({ children }) {
  return (
    <div style={{ borderBottom: '3px double #1a1008', paddingBottom: 8, marginBottom: 16 }}>
      <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 21, fontWeight: 700 }}>{children}</h2>
    </div>
  )
}

// ── Pending tab ────────────────────────────────────────────────────────────
function PendingTab({ articles, onApprove, onReject, onRead }) {
  return (
    <>
      <SH>Articles Pending Review</SH>
      {articles.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#6b5c4e', fontFamily: "'Source Sans 3',sans-serif" }}>All caught up! No articles pending. ✓</div>
      ) : articles.map(a => <PendingCard key={a.id} article={a} onApprove={onApprove} onReject={onReject} onRead={onRead} />)}
    </>
  )
}

function PendingCard({ article: a, onApprove, onReject, onRead }) {
  const [open, setOpen]         = useState(false)
  const [feedback, setFeedback] = useState('')
  return (
    <div style={{ background: '#fffef7', border: '1px solid #e8dcc8', borderLeft: `4px solid ${CATEGORY_COLORS[a.cat] || '#1a1008'}`, padding: 16, marginBottom: 12 }}>
      <Badge cat={a.cat} />
      <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, fontWeight: 700, color: '#1a1008', marginBottom: 5 }}>{a.hl}</div>
      <div style={{ fontFamily: "'Source Sans 3',sans-serif", fontSize: 11, color: '#6b5c4e', marginBottom: 8 }}>
        By <strong>{a.au}</strong> — {a.dept} — {a.dt}
      </div>
      <div style={{ fontFamily: "'Libre Baskerville',serif", fontSize: 12, color: '#4a3a2a', lineHeight: 1.65 }}>{a.sm}…</div>
      <div style={{ display: 'flex', gap: 8, marginTop: 13, flexWrap: 'wrap' }}>
        <Btn green onClick={() => onApprove(a.id)}>✓ Approve</Btn>
        <Btn red   onClick={() => onReject(a.id, feedback)}>✗ Reject</Btn>
        <Btn dark  onClick={() => setOpen(x => !x)}>View / Feedback</Btn>
        {onRead && <Btn gray onClick={() => onRead(a)}>Read Full</Btn>}
      </div>
      {open && (
        <div style={{ marginTop: 13, padding: 14, background: '#f5ead0', border: '1px solid #c8960c' }}>
          <p style={{ fontFamily: "'Libre Baskerville',serif", fontSize: 13, lineHeight: 1.75, marginBottom: 12 }}>{a.body}</p>
          <label style={{ display: 'block', fontFamily: "'Source Sans 3',sans-serif", fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.12em', color: '#1a1008', marginBottom: 5 }}>Editorial Feedback</label>
          <textarea value={feedback} onChange={e => setFeedback(e.target.value)} placeholder="Write feedback for the author…"
            style={{ width: '100%', padding: 9, border: '1px solid #1a1008', background: '#fffef7', fontFamily: "'Libre Baskerville',serif", fontSize: 12, resize: 'vertical', minHeight: 70, outline: 'none' }} />
        </div>
      )}
    </div>
  )
}

// ── Approved tab ───────────────────────────────────────────────────────────
function ApprovedTab({ articles, onRead }) {
  return (
    <>
      <SH>Approved & Published</SH>
      {articles.map(a => (
        <div key={a.id} style={{ background: '#fffef7', border: '1px solid #e8dcc8', borderLeft: '4px solid #1a7a4a', padding: 16, marginBottom: 12 }}>
          <Badge cat={a.cat} />
          <span style={{ background: '#1a7a4a', color: '#fff', fontFamily: "'Source Sans 3',sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', padding: '2px 8px', marginLeft: 8 }}>PUBLISHED</span>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, fontWeight: 700, color: '#1a1008', marginTop: 8, marginBottom: 4 }}>{a.title}</div>
          <div style={{ fontFamily: "'Source Sans 3',sans-serif", fontSize: 11, color: '#6b5c4e', marginBottom: onRead ? 10 : 0 }}>By {a.au} — {a.dt}</div>
          {onRead && <Btn dark style={{ padding: '6px 14px' }} onClick={() => onRead(a)}>Read Full</Btn>}        </div>
      ))}
    </>
  )
}

// ── Stats tab ──────────────────────────────────────────────────────────────
function StatsTab() {
  const [stats,   setStats]   = useState([])
  const [summary, setSummary] = useState(null)

  useEffect(() => {
    fetchStats()
      .then(data => { setStats(data.stats || []); setSummary(data.summary || null) })
      .catch(console.error)
  }, [])

  return (
    <>
      <SH>Publication Statistics</SH>
      {summary && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px,1fr))', gap: 10, marginBottom: 20 }}>
          {[
            { l: 'Total',    n: summary.total_articles },
            { l: 'Approved', n: summary.approved },
            { l: 'Pending',  n: summary.pending },
            { l: 'Rejected', n: summary.rejected },
            { l: 'Users',    n: summary.total_users },
          ].map(s => (
            <div key={s.l} style={{ background: '#fffef7', border: '1px solid #e8dcc8', padding: 12, textAlign: 'center' }}>
              <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 26, fontWeight: 900 }}>{s.n}</div>
              <div style={{ fontFamily: "'Source Sans 3',sans-serif", fontSize: 10, textTransform: 'uppercase', letterSpacing: '.1em', color: '#6b5c4e' }}>{s.l}</div>
            </div>
          ))}
        </div>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14 }}>
        {stats.map(s => (
          <div key={s.category} style={{ background: '#fffef7', border: '1px solid #e8dcc8', padding: 15 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 }}>
              <span style={{ fontFamily: "'Source Sans 3',sans-serif", fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.1em' }}>{s.category}</span>
              <span style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 900, color: CATEGORY_COLORS[s.category] || '#1a1008' }}>{s.count}</span>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

// ── Users tab ──────────────────────────────────────────────────────────────
function UsersTab() {
  const [users, setUsers] = useState([])

  useEffect(() => {
    fetchUsers()
      .then(data => setUsers(data.users || []))
      .catch(console.error)
  }, [])

  return (
    <>
      <SH>Registered Contributors</SH>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: "'Source Sans 3',sans-serif", fontSize: 12, minWidth: 480 }}>
          <thead>
            <tr>
              {['Name','Email','Department','Year','Role'].map(h => (
                <th key={h} style={{ background: '#1a1008', color: '#fdf6e3', padding: '10px 13px', textAlign: 'left', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', fontSize: 10 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td style={{ padding: '10px 13px', borderBottom: '1px solid #e8dcc8' }}><strong>{u.name}</strong></td>
                <td style={{ padding: '10px 13px', borderBottom: '1px solid #e8dcc8', color: '#6b5c4e' }}>{u.email}</td>
                <td style={{ padding: '10px 13px', borderBottom: '1px solid #e8dcc8' }}>{u.dept}</td>
                <td style={{ padding: '10px 13px', borderBottom: '1px solid #e8dcc8' }}>{u.year}</td>
                <td style={{ padding: '10px 13px', borderBottom: '1px solid #e8dcc8' }}>
                  <span style={{ background: u.role === 'admin' ? '#b5121b' : '#6b5c4e', color: '#fff', padding: '2px 8px', fontSize: 10, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase' }}>{u.role}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
