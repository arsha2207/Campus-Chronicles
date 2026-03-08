// ─────────────────────────────────────────────────────────────────────────────
//  Buttons.jsx
//  All button variants used across the app.
//
//  Exports:
//    Btn     — general purpose button (dark | red | green | gray variants)
//    TbBtn   — topbar small button (gold or red border)
//    Sbtn    — full-width submit button (login/register pages)
//    RdBtn   — "Read" outline button on article cards
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react'

// ── General-purpose button ─────────────────────────────────────────────────
// Props: dark | red | green | gray (pick one), onClick, disabled, children
export function Btn({ children, onClick, dark, red, green, gray, disabled, style = {} }) {
  const bgMap = {
    dark:  '#1a1008',
    red:   '#b5121b',
    green: '#1a7a4a',
    gray:  '#6b5c4e',
  }
  const which = dark ? 'dark' : red ? 'red' : green ? 'green' : gray ? 'gray' : 'dark'
  const bg = bgMap[which]

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: '10px 22px',
        border: 'none',
        fontFamily: "'Source Sans 3', sans-serif",
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: '.12em',
        textTransform: 'uppercase',
        cursor: disabled ? 'not-allowed' : 'pointer',
        background: bg,
        color: '#fff',
        opacity: disabled ? 0.7 : 1,
        transition: 'all .2s',
        ...style,
      }}
    >
      {children}
    </button>
  )
}

// ── Topbar small button ────────────────────────────────────────────────────
// Props: red (bool), onClick, children
export function TbBtn({ children, red, onClick }) {
  const [hov, setHov] = useState(false)
  const border = red ? '#b5121b' : '#c8960c'
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? border : 'none',
        border: `1px solid ${border}`,
        color: hov ? (red ? '#fff' : '#1a1008') : border,
        padding: '3px 11px',
        cursor: 'pointer',
        fontFamily: "'Source Sans 3', sans-serif",
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: '.1em',
        textTransform: 'uppercase',
        transition: 'all .2s',
      }}
    >
      {children}
    </button>
  )
}

// ── Full-width submit button (auth pages) ──────────────────────────────────
export function Sbtn({ children, onClick }) {
  const [hov, setHov] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        width: '100%',
        padding: 12,
        background: hov ? '#b5121b' : '#1a1008',
        color: '#fdf6e3',
        border: 'none',
        fontFamily: "'Source Sans 3', sans-serif",
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: '.15em',
        textTransform: 'uppercase',
        cursor: 'pointer',
        transition: 'background .2s',
      }}
    >
      {children}
    </button>
  )
}

// ── "Read" outline button on article / search cards ───────────────────────
export function RdBtn({ children, onClick }) {
  const [hov, setHov] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        padding: '6px 14px',
        background: hov ? '#1a1008' : 'transparent',
        border: '1px solid #1a1008',
        color: hov ? '#fff' : '#1a1008',
        fontFamily: "'Source Sans 3', sans-serif",
        fontSize: 10,
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '.08em',
        cursor: 'pointer',
        transition: 'all .2s',
        flexShrink: 0,
      }}
    >
      {children}
    </button>
  )
}
