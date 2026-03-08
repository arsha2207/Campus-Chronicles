// ─────────────────────────────────────────────────────────────────────────────
//  SecRule.jsx
//  Decorative section-divider rule used above each article column.
//  Usage: <SecRule>Top Story</SecRule>
// ─────────────────────────────────────────────────────────────────────────────

export default function SecRule({ children }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        borderTop: '3px double #1a1008',
        borderBottom: '1px solid #1a1008',
        padding: '4px 0',
        marginBottom: 14,
      }}
    >
      <span
        style={{
          fontFamily: "'Source Sans 3', sans-serif",
          fontSize: 10,
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '.15em',
          color: '#b5121b',
        }}
      >
        {children}
      </span>
    </div>
  )
}
