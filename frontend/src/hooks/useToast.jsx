// ─────────────────────────────────────────────────────────────────────────────
//  useToast.jsx
//  Custom hook that returns:
//    show(message, type)  — call this to trigger a toast
//    Toast                — JSX element to place at the bottom of your component
//
//  Usage:
//    const { show, Toast } = useToast()
//    show('Article submitted!', 'success')
//    show('Something went wrong', 'error')
//    return <div> ... {Toast} </div>
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useCallback } from 'react'

export default function useToast() {
  const [toast, setToast] = useState(null) // { msg, type }

  const show = useCallback((msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }, [])

  const Toast = toast ? (
    <div
      style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 9999,
        padding: '12px 20px',
        fontFamily: "'Source Sans 3', sans-serif",
        fontSize: 13,
        fontWeight: 700,
        color: '#fff',
        boxShadow: '0 4px 20px rgba(0,0,0,.3)',
        animation: 'fadeUp .3s ease',
        background: toast.type === 'error' ? '#b5121b' : '#1a7a4a',
      }}
    >
      {toast.msg}
    </div>
  ) : null

  return { show, Toast }
}
