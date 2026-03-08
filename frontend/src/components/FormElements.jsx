// ─────────────────────────────────────────────────────────────────────────────
//  FormElements.jsx
//  Shared form field components used on login, register and submit pages.
//
//  Exports:
//    FLabel  — uppercase small label
//    FInput  — standard text/email/password input
//    FSel    — styled <select> dropdown
//    FTextarea — styled <textarea>
// ─────────────────────────────────────────────────────────────────────────────

// ── Label ─────────────────────────────────────────────────────────────────
export function FLabel({ children }) {
  return (
    <label
      style={{
        display: 'block',
        fontFamily: "'Source Sans 3', sans-serif",
        fontSize: 10,
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '.12em',
        color: '#1a1008',
        marginBottom: 5,
      }}
    >
      {children}
    </label>
  )
}

// ── Text / Email / Password input ─────────────────────────────────────────
export function FInput({ style = {}, ...props }) {
  return (
    <input
      {...props}
      style={{
        width: '100%',
        padding: '10px 12px',
        border: '1.5px solid #1a1008',
        background: '#fffef7',
        fontFamily: "'Libre Baskerville', serif",
        fontSize: 13,
        color: '#1a1008',
        outline: 'none',
        marginBottom: 14,
        transition: 'border-color .2s',
        ...style,
      }}
    />
  )
}

// ── Select / dropdown ─────────────────────────────────────────────────────
export function FSel({ children, style = {}, ...props }) {
  return (
    <select
      {...props}
      style={{
        width: '100%',
        padding: '9px 12px',
        border: '1.5px solid #1a1008',
        background: '#fffef7',
        fontFamily: "'Source Sans 3', sans-serif",
        fontSize: 13,
        color: '#1a1008',
        outline: 'none',
        marginBottom: 14,
        cursor: 'pointer',
        ...style,
      }}
    >
      {children}
    </select>
  )
}

// ── Textarea ──────────────────────────────────────────────────────────────
export function FTextarea({ style = {}, ...props }) {
  return (
    <textarea
      {...props}
      style={{
        width: '100%',
        padding: '11px 13px',
        border: '1.5px solid #1a1008',
        background: '#fffef7',
        fontFamily: "'Libre Baskerville', serif",
        fontSize: 13,
        color: '#1a1008',
        outline: 'none',
        resize: 'vertical',
        lineHeight: 1.75,
        minHeight: 220,
        marginBottom: 18,
        transition: 'border-color .2s',
        ...style,
      }}
    />
  )
}
