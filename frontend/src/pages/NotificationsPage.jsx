// NotificationsPage.jsx — responsive notification center

import { useState } from 'react'
import Ticker from '../components/Ticker'
import { Btn, TbBtn } from '../components/Buttons'
import { NOTIF_COLORS } from '../utils/constants'
import { DEMO_NOTIFICATIONS } from '../data/demoData'

const FILTER_OPTIONS = ['all', 'unread', 'approval', 'comment', 'announcement']

export default function NotificationsPage({ onBack }) {
  const [notifs, setNotifs] = useState(DEMO_NOTIFICATIONS)
  const [filter, setFilter] = useState('all')

  const filtered =
    filter === 'all'    ? notifs :
    filter === 'unread' ? notifs.filter(n => !n.read) :
                          notifs.filter(n => n.type === filter)

  const unreadCount = notifs.filter(n => !n.read).length

  const markRead = id => setNotifs(p => p.map(n => n.id === id ? { ...n, read: true } : n))
  const markAll  = ()  => setNotifs(p => p.map(n => ({ ...n, read: true })))
  const dismiss  = id  => setNotifs(p => p.filter(n => n.id !== id))

  return (
    <div>
      {/* Topbar */}
      <div style={{ background: '#1a1008', color: '#e8dcc8', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 22px', fontFamily: "'Source Sans 3',sans-serif", fontSize: 11, borderBottom: '2px solid #c8960c', flexWrap: 'wrap', gap: 6 }}>
        <span>📍 Kerala Campus Edition</span>
        <TbBtn onClick={onBack}>← Home</TbBtn>
      </div>

      {/* Mini masthead */}
      <div style={{ background: '#fdf6e3', padding: '10px 22px 0', borderBottom: '4px double #1a1008' }}>
        <div style={{ textAlign: 'center', padding: '8px 0 4px' }}>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(26px,6vw,54px)', lineHeight: 1, color: '#1a1008' }}>Campus Chronicle</div>
        </div>
        <Ticker />
      </div>

      <div style={{ maxWidth: 1280, margin: '0 auto', background: '#fdf6e3', boxShadow: '0 0 50px rgba(0,0,0,.28)', padding: 22 }}>
        <div className="page-inner" style={{ maxWidth: 880, margin: '0 auto', padding: '28px 32px 42px' }}>

          {/* Header */}
          <div style={{ borderBottom: '3px double #1a1008', paddingBottom: 11, marginBottom: 22, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <div style={{ fontFamily: "'Source Sans 3',sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: '.2em', textTransform: 'uppercase', color: '#b5121b', marginBottom: 4 }}>Newsroom Updates</div>
              <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 28, fontWeight: 900, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                Notifications
                {unreadCount > 0 && (
                  <span style={{ background: '#b5121b', color: '#fff', fontFamily: "'Source Sans 3',sans-serif", fontSize: 14, padding: '2px 10px', borderRadius: 12 }}>{unreadCount}</span>
                )}
              </div>
            </div>
            <Btn dark onClick={markAll} style={{ padding: '8px 16px' }}>Mark All Read</Btn>
          </div>

          {/* Filter bar */}
          <div className="filter-bar" style={{ border: '1px solid #1a1008', marginBottom: 18 }}>
            {FILTER_OPTIONS.map((f, i) => (
              <button key={f} onClick={() => setFilter(f)} style={{
                flex: 1, padding: 9, border: 'none',
                borderRight: i < FILTER_OPTIONS.length - 1 ? '1px solid #1a1008' : 'none',
                background: filter === f ? '#1a1008' : '#fdf6e3',
                color: filter === f ? '#fff' : '#6b5c4e',
                fontFamily: "'Source Sans 3',sans-serif", fontSize: 10, fontWeight: 700,
                letterSpacing: '.1em', textTransform: 'uppercase', cursor: 'pointer', transition: 'all .2s',
              }}>{f}</button>
            ))}
          </div>

          {/* Notifications list */}
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#6b5c4e', fontFamily: "'Source Sans 3',sans-serif" }}>No notifications found.</div>
          ) : filtered.map(n => (
            <div key={n.id} onClick={() => markRead(n.id)} style={{
              display: 'flex', gap: 13, padding: 15, marginBottom: 9,
              border: `1px solid ${n.read ? '#e8dcc8' : '#c8960c'}`,
              borderLeft: `4px solid ${NOTIF_COLORS[n.type] || '#1a1008'}`,
              background: n.read ? '#fffef7' : '#fff8e8', cursor: 'pointer', transition: 'all .2s',
            }}>
              <div style={{ fontSize: 22, flexShrink: 0, marginTop: 2 }}>{n.icon}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 14, fontWeight: 700, color: '#1a1008', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  {n.title}
                  {!n.read && <span style={{ background: '#b5121b', color: '#fff', fontFamily: "'Source Sans 3',sans-serif", fontSize: 8, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', padding: '2px 6px' }}>NEW</span>}
                </div>
                <div style={{ fontFamily: "'Source Sans 3',sans-serif", fontSize: 12, color: '#4a3a2a', lineHeight: 1.6, marginBottom: 5 }}>{n.body}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
                  <div style={{ fontFamily: "'Source Sans 3',sans-serif", fontSize: 10, color: '#6b5c4e' }}>{n.time}</div>
                  <button onClick={e => { e.stopPropagation(); dismiss(n.id) }} style={{ background: 'none', border: 'none', color: '#b5121b', cursor: 'pointer', fontFamily: "'Source Sans 3',sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', padding: '2px 7px' }}>Dismiss</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
