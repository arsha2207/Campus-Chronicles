// ─────────────────────────────────────────────────────────────────────────────
//  RegisterPage.jsx
//
//  TO CONNECT TO FLASK:
//    import { register, saveToken } from '../utils/api'
//
//    const data = await register(form)
//    saveToken(data.token)
//    onRegister(data.user)
//
//  Flask endpoint needed:
//    POST /api/register
//    Body: { name, email, password, role, dept, year }
//    Returns: { user: { id, name, role, dept }, token: "jwt..." }
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react'
import { FLabel, FInput, FSel } from '../components/FormElements'
import { Sbtn } from '../components/Buttons'
import { CATEGORIES } from '../utils/constants'

const DEPTS = ['Computer Science', 'Electronics', 'Mechanical', 'Civil', 'Business Admin', 'Arts & Humanities']
const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'PG / Faculty']

export default function RegisterPage({ onRegister, onBack }) {
  const [form, setForm] = useState({
    name: '', email: '', password: '', role: 'student', dept: '', year: '',
  })
  const set = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))

  const handleRegister = async () => {
    if (!form.name || !form.email || !form.dept) {
      alert('Please fill all required fields.')
      return
    }

    // ── DEMO register — replace with real API call ─────────────────────────
    onRegister({ ...form, id: Date.now() })
    // ── End demo block ─────────────────────────────────────────────────────

    // Real fetch example:
    // try {
    //   const data = await register(form)
    //   saveToken(data.token)
    //   onRegister(data.user)
    // } catch (e) {
    //   alert(e.message || 'Registration failed.')
    // }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#cfc4aa',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}
    >
      <div
        style={{
          background: '#fdf6e3',
          width: '100%',
          maxWidth: 480,
          boxShadow: '0 8px 40px rgba(0,0,0,.25)',
          border: '1px solid #1a1008',
          animation: 'fadeUp .4s ease',
        }}
      >
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
          Join the Campus Newsroom
        </div>

        <div
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 52,
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
          Reporting Truth · Inspiring Minds
        </div>
        <div style={{ borderTop: '3px double #1a1008', margin: '0 24px' }} />

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
            Create Your Account
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
            Become part of Campus Chronicle
          </div>

          {/* Name + Role row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }} className="form-row-2">
            <div>
              <FLabel>Full Name</FLabel>
              <FInput value={form.name} onChange={set('name')} placeholder="Your full name" />
            </div>
            <div>
              <FLabel>Role</FLabel>
              <FSel value={form.role} onChange={set('role')}>
                <option value="student">Student Reporter</option>
                <option value="admin">Admin</option>
              </FSel>
            </div>
          </div>

          <FLabel>College Email</FLabel>
          <FInput
            type="email"
            value={form.email}
            onChange={set('email')}
            placeholder="yourname@campus.edu"
          />

          <FLabel>Password</FLabel>
          <FInput
            type="password"
            value={form.password}
            onChange={set('password')}
            placeholder="Min. 8 characters"
          />

          {/* Dept + Year row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }} className="form-row-2">
            <div>
              <FLabel>Department</FLabel>
              <FSel value={form.dept} onChange={set('dept')}>
                <option value="">Select Dept.</option>
                {DEPTS.map((d) => <option key={d}>{d}</option>)}
              </FSel>
            </div>
            <div>
              <FLabel>Year</FLabel>
              <FSel value={form.year} onChange={set('year')}>
                <option value="">Year</option>
                {YEARS.map((y) => <option key={y}>{y}</option>)}
              </FSel>
            </div>
          </div>

          <Sbtn onClick={handleRegister}>Register & Join Newsroom</Sbtn>
        </div>

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
          Already have an account?{' '}
          <span
            onClick={onBack}
            style={{ color: '#b5121b', fontWeight: 700, cursor: 'pointer' }}
          >
            Sign In
          </span>
        </div>
      </div>
    </div>
  )
}
