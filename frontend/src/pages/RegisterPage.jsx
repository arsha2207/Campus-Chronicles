import { useState } from 'react'
import { FLabel, FInput, FSel } from '../components/FormElements'
import { Sbtn } from '../components/Buttons'
import { register, saveToken } from '../utils/api'

const DEPTS = ['CSE', 'ECE', 'Mechanical', 'Civil', 'EEE', 'Barch', 'MCA', 'RAI', 'Others']
const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'PG', 'Faculty']

export default function RegisterPage({ onRegister, onBack }) {
  const [form, setForm]       = useState({ name: '', email: '', password: '', role: 'student', dept: '', year: '' })
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)

  const set = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value })) 

  const handleRegister = async () => {
    setError('')

    // ── Validation ──────────────────────────────────────────────────────────
    if (!form.name || !form.email || !form.password || !form.dept || !form.year) {
      setError('Please fill in all fields.')
      return
    }
    if (!form.email.endsWith('@rit.ac.in')) {
      setError('Only @rit.ac.in email addresses are allowed.')
      return
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }

    // ── API call ────────────────────────────────────────────────────────────
    setLoading(true)
    try {
      const data = await register(form)
      saveToken(data.token)
      onRegister(data.user)
    } catch (e) {
      setError(e.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#cfc4aa', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: '#fdf6e3', width: '100%', maxWidth: 480, boxShadow: '0 8px 40px rgba(0,0,0,.25)', border: '1px solid #1a1008', animation: 'fadeUp .4s ease' }}>

        {/* Header bar */}
        <div style={{ background: '#1a1008', color: '#e8dcc8', textAlign: 'center', padding: 7, fontFamily: "'Source Sans 3', sans-serif", fontSize: 10, letterSpacing: '.2em', textTransform: 'uppercase' }}>
          Join the Campus Newsroom
        </div>

        {/* Title */}
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(32px,8vw,52px)', textAlign: 'center', color: '#1a1008', lineHeight: 1, padding: '12px 24px 4px' }}>
          Campus Chronicle
        </div>
        <div style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontSize: 12, textAlign: 'center', color: '#6b5c4e', paddingBottom: 12 }}>
          Reporting Truth · Inspiring Minds
        </div>
        <div style={{ borderTop: '3px double #1a1008', margin: '0 24px' }} />

        <div style={{ padding: '22px 30px 26px' }}>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, textAlign: 'center', marginBottom: 4 }}>
            Create Your Account
          </div>
          <div style={{ fontFamily: "'Source Sans 3', sans-serif", fontSize: 12, color: '#6b5c4e', textAlign: 'center', marginBottom: 18 }}>
            Become part of Campus Chronicle
          </div>

          {/* Error message */}
          {error && (
            <div style={{ background: '#fff0f0', border: '1px solid #b5121b', color: '#b5121b', fontFamily: "'Source Sans 3', sans-serif", fontSize: 12, padding: '10px 14px', marginBottom: 14 }}>
              ⚠ {error}
            </div>
          )}

          {/* Name + Role */}
          <div className="form-row-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
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

          {/* Email */}
          <FLabel>College Email</FLabel>
          <FInput type="email" value={form.email} onChange={set('email')} placeholder="23br15619@rit.ac.in" />
          <div style={{ fontFamily: "'Source Sans 3', sans-serif", fontSize: 10, color: '#6b5c4e', marginTop: -10, marginBottom: 14 }}>
            Must be your official @rit.ac.in address
          </div>

          {/* Password */}
          <FLabel>Password</FLabel>
          <FInput type="password" value={form.password} onChange={set('password')} placeholder="Min. 8 characters" />

          {/* Dept + Year */}
          <div className="form-row-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <FLabel>Department</FLabel>
              <FSel value={form.dept} onChange={set('dept')}>
                <option value="">Select Dept.</option>
                {DEPTS.map(d => <option key={d}>{d}</option>)}
              </FSel>
            </div>
            <div>
              <FLabel>Year</FLabel>
              <FSel value={form.year} onChange={set('year')}>
                <option value="">Year</option>
                {YEARS.map(y => <option key={y}>{y}</option>)}
              </FSel>
            </div>
          </div>

          {/* Submit button */}
          <Sbtn onClick={handleRegister} disabled={loading}>
            {loading ? 'Creating Account…' : 'Register & Join Newsroom'}
          </Sbtn>
        </div>

        {/* Footer */}
        <div style={{ borderTop: '1px solid #e8dcc8', padding: '13px 30px', textAlign: 'center', fontFamily: "'Source Sans 3', sans-serif", fontSize: 11, color: '#6b5c4e' }}>
          Already have an account?{' '}
          <span onClick={onBack} style={{ color: '#b5121b', fontWeight: 700, cursor: 'pointer' }}>Sign In</span>
        </div>
      </div>
    </div>
  )
}
