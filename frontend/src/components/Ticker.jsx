// ─────────────────────────────────────────────────────────────────────────────
//  Ticker.jsx
//  Scrolling breaking-news bar at the bottom of every masthead.
//  Duplicates the TICKER_ITEMS array to create a seamless infinite loop.
// ─────────────────────────────────────────────────────────────────────────────

import { TICKER_ITEMS } from '../utils/constants'

export default function Ticker() {
  // Duplicate items so the animation can loop seamlessly
  const doubled = [...TICKER_ITEMS, ...TICKER_ITEMS]

  return (
    <div
      style={{
        background: '#1a1008',
        display: 'flex',
        alignItems: 'center',
        height: 28,
        overflow: 'hidden',
      }}
    >
      {/* "Breaking" label badge */}
      <div
        style={{
          background: '#b5121b',
          color: '#fff',
          fontFamily: "'Source Sans 3', sans-serif",
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: '.15em',
          textTransform: 'uppercase',
          padding: '0 14px',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          flexShrink: 0,
        }}
      >
        Breaking
      </div>

      {/* Scrolling track */}
      <div style={{ overflow: 'hidden', flex: 1 }}>
        <div
          style={{
            display: 'flex',
            animation: 'ticker 38s linear infinite',
            whiteSpace: 'nowrap',
          }}
        >
          {doubled.map((item, i) => (
            <span
              key={i}
              style={{
                fontFamily: "'Source Sans 3', sans-serif",
                fontSize: 11,
                color: '#e0d0b0',
                padding: '0 26px',
                borderRight: '1px solid #444',
              }}
            >
              {item}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
