// ─────────────────────────────────────────────────────────────────────────────
//  LoginPage.jsx
//
//  TO CONNECT TO FLASK:
//  Replace the demo auth block inside handleLogin() with:
//
//    import { login, saveToken } from '../utils/api'
//
//    const data = await login(email, password)
//    saveToken(data.token)
//    onLogin(data.user)
//
//  Flask endpoint needed:
//    POST /api/login
//    Body: { email, password }
//    Returns: { user: { id, name, role, dept }, token: "jwt..." }
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react'
import { FLabel, FInput } from '../components/FormElements'
import { Sbtn } from '../components/Buttons'
import { DEMO_USERS } from '../data/demoData'

export default function LoginPage({ onLogin, onRegister }) {
  const [email, setEmail] = useState('')
  const [pass, setPass]   = useState('')
  const [role, setRole]   = useState('student')
  const [err, setErr]     = useState('')

  const handleLogin = async () => {
    setErr('')

    // ── DEMO auth — replace this block with real API call ──────────────────
    const found = DEMO_USERS.find(
      (u) => u.email === email && u.password === pass
    )
    if (found) { onLogin(found); return; }
    // ── End demo block ─────────────────────────────────────────────────────

    // Real fetch example (uncomment when Flask is ready):
    // try {
    //   const data = await login(email, password)
    //   saveToken(data.token)
    //   onLogin(data.user)
    // } catch (e) {
    //   setErr(e.message || 'Login failed. Please try again.')
    // }

    setErr(
      'Invalid credentials. Try: student@campus.edu / student123  or  admin@campus.edu / admin123'
    )
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#cfc4aa',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}
    >
      <div
        style={{
          background: '#fdf6e3',
          width: '100%',
          maxWidth: 440, width: '100%',
          boxShadow: '0 8px 40px rgba(0,0,0,.25)',
          border: '1px solid #1a1008',
          animation: 'fadeUp .4s ease',
        }}
      >
        {/* Header band */}
        <div
          style={{
            background: '#1a1008',
            color: '#e8dcc8',
            textAlign: 'center',
            padding: 7,
            fontFamily: "'Source Sans 3', sans-serif",
            fontSize: 10,
            letterSpacing: '.2em',
            textTransform: 'uppercase',
          }}
        >
          The College Digital Newspaper · RIT Edition
        </div>

        {/* Title */}
        <div
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 55,
            textAlign: 'center',
            color: '#1a1008',
            lineHeight: 1,
            padding: '12px 24px 4px',
          }}
        >
          Campus Chronicle
        </div>
        <div
          style={{
            fontFamily: "'Playfair Display', serif",
            fontStyle: 'italic',
            fontSize: 12,
            textAlign: 'center',
            color: '#6b5c4e',
            paddingBottom: 12,
          }}
        >
          Reporting Truth · Inspiring Minds · Building Tomorrow
        </div>
        <div style={{ borderTop: '3px double #1a1008', margin: '0 24px' }} />

        {/* Form body */}
        <div style={{ padding: '22px 30px 26px' }}>
          <div
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 20,
              fontWeight: 700,
              textAlign: 'center',
              marginBottom: 4,
            }}
          >
            Sign In to Continue
          </div>
          <div
            style={{
              fontFamily: "'Source Sans 3', sans-serif",
              fontSize: 12,
              color: '#6b5c4e',
              textAlign: 'center',
              marginBottom: 18,
            }}
          >
            Access the campus newsroom
          </div>

          {/* Role toggle */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            {['student', 'admin'].map((r) => (
              <button
                key={r}
                onClick={() => setRole(r)}
                style={{
                  flex: 1,
                  padding: 9,
                  border: `2px solid ${role === r ? '#1a1008' : '#e8dcc8'}`,
                  background: role === r ? '#1a1008' : '#fdf6e3',
                  color: role === r ? '#fdf6e3' : '#6b5c4e',
                  fontFamily: "'Source Sans 3', sans-serif",
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: '.1em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  transition: 'all .2s',
                }}
              >
                {r}
              </button>
            ))}
          </div>

          {/* Error */}
          {err && (
            <div
              style={{
                background: '#fff0f0',
                border: '1px solid #b5121b',
                color: '#b5121b',
                padding: '8px 12px',
                marginBottom: 13,
                fontFamily: "'Source Sans 3', sans-serif",
                fontSize: 12,
              }}
            >
              {err}
            </div>
          )}

          <FLabel>Email Address</FLabel>
          <FInput
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="yourname@campus.edu"
          />

          <FLabel>Password</FLabel>
          <FInput
            type="password"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            placeholder="••••••••"
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
          />

          <div
            style={{
              textAlign: 'right',
              marginTop: -8,
              marginBottom: 16,
              fontFamily: "'Source Sans 3', sans-serif",
              fontSize: 11,
              color: '#b5121b',
              cursor: 'pointer',
            }}
          >
            Forgot Password?
          </div>

          <Sbtn onClick={handleLogin}>Sign In to Newsroom</Sbtn>

          {/* Demo credentials box */}
          <div
            style={{
              marginTop: 14,
              padding: 10,
              background: '#f5ead0',
              border: '1px dashed #c8960c',
              fontFamily: "'Source Sans 3', sans-serif",
              fontSize: 11,
              color: '#6b5c4e',
              lineHeight: 1.8,
            }}
          >
            <strong style={{ color: '#c8960c' }}>Demo Credentials:</strong>
            <br />
            Student: student@campus.edu / student123
            <br />
            Admin: admin@campus.edu / admin123
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            borderTop: '1px solid #e8dcc8',
            padding: '13px 30px',
            textAlign: 'center',
            fontFamily: "'Source Sans 3', sans-serif",
            fontSize: 11,
            color: '#6b5c4e',
          }}
        >
          New here?{' '}
          <span
            onClick={onRegister}
            style={{ color: '#b5121b', fontWeight: 700, cursor: 'pointer' }}
          >
            Create an Account
          </span>
        </div>
      </div>

      <div
        style={{
          marginTop: 14,
          fontFamily: "'Source Sans 3', sans-serif",
          fontSize: 11,
          color: '#6b5c4e',
        }}
      >
        © 2025 Campus Chronicle
      </div>
    </div>
  )
}
