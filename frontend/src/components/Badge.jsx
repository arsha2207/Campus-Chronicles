// ─────────────────────────────────────────────────────────────────────────────
//  Badge.jsx
//  Coloured category pill shown on every article card.
//  Usage: <Badge cat="Sports" />
// ─────────────────────────────────────────────────────────────────────────────

import { CATEGORY_COLORS } from '../utils/constants'

export default function Badge({ cat }) {
  return (
    <span
      style={{
        display: 'inline-block',
        background: CATEGORY_COLORS[cat] || '#1a1008',
        color: '#fff',
        fontFamily: "'Source Sans 3', sans-serif",
        fontSize: 9,
        fontWeight: 700,
        letterSpacing: '.12em',
        textTransform: 'uppercase',
        padding: '2px 7px',
        marginBottom: 6,
      }}
    >
      {cat}
    </span>
  )
}
