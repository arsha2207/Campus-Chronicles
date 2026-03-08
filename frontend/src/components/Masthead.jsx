// Masthead.jsx — responsive newspaper header used on every main page

import { useState } from 'react'
import Ticker from './Ticker'

export default function Masthead({ navItems, activeNav, onNav }) {
  return (
    <div style={{ background: '#fdf6e3', padding: '10px 22px 0', borderBottom: '4px double #1a1008' }}>

      {/* ── Title row ── */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
        borderBottom: '1px solid #1a1008', paddingBottom: 7, marginBottom: 7,
      }}>
        <div className="mast-meta" style={{
          fontFamily: "'Source Sans 3', sans-serif", fontSize: 11,
          color: '#6b5c4e', lineHeight: 1.9, flexShrink: 0,
        }}>
          Vol. IV | No. 42<br />Est. 2021
        </div>

        <div style={{ textAlign: 'center', flex: 1, padding: '0 12px' }}>
          <div style={{
            fontFamily: "'Source Sans 3', sans-serif", fontSize: 10,
            letterSpacing: '.28em', textTransform: 'uppercase', color: '#6b5c4e', marginBottom: 2,
          }}>
            The Voice of the Campus
          </div>
          <div className="mast-title" style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 'clamp(28px, 7vw, 72px)',
            lineHeight: 1, color: '#1a1008',
          }}>
            Campus Chronicle
          </div>
          <div style={{
            fontFamily: "'Playfair Display', serif", fontStyle: 'italic',
            fontSize: 'clamp(10px, 1.5vw, 13px)', color: '#6b5c4e', marginTop: 2,
          }}>
            Reporting Truth · Inspiring Minds · Building Tomorrow
          </div>
        </div>

        <div className="mast-meta" style={{
          fontFamily: "'Source Sans 3', sans-serif", fontSize: 11,
          color: '#6b5c4e', lineHeight: 1.9, textAlign: 'right', flexShrink: 0,
        }}>
          Wednesday, March 4, 2025<br />
          <strong style={{ color: '#b5121b' }}>FREE</strong>
        </div>
      </div>

      {/* ── Navigation bar ── */}
      <nav style={{ display: 'flex', flexWrap: 'wrap', borderTop: '1px solid #1a1008', background: '#fdf6e3' }}>
        {navItems.map(({ label, id, special, icon }) => (
          <NavLink key={id} active={activeNav === id} special={special} onClick={() => onNav(id)}>
            {icon || label}
          </NavLink>
        ))}
      </nav>

      <Ticker />
    </div>
  )
}

function NavLink({ children, active, special, onClick }) {
  const [hov, setHov] = useState(false)
  let bg, color
  if (special)        { bg = hov ? '#b5121b' : '#1a1008'; color = '#fff' }
  else if (active || hov) { bg = '#b5121b'; color = '#fff' }
  else                { bg = 'transparent'; color = '#1a1008' }

  return (
    <span onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        fontFamily: "'Source Sans 3', sans-serif", fontSize: 11, fontWeight: 700,
        textTransform: 'uppercase', letterSpacing: '.1em', color,
        padding: '9px 13px', borderRight: '1px solid #e8dcc8',
        cursor: 'pointer', background: bg, transition: 'all .2s', userSelect: 'none',
        ...(special ? { marginLeft: 'auto' } : {}),
      }}
    >{children}</span>
  )
}
