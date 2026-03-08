// TopBar.jsx — thin utility bar: location · time · user · admin · logout

import { useState, useEffect } from 'react'
import { TbBtn } from './Buttons'

export default function TopBar({ user, onAdmin, onLogout }) {
  const [time, setTime] = useState(
    new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
  )
  useEffect(() => {
    const id = setInterval(() => {
      setTime(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }))
    }, 60000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="topbar" style={{
      background: '#1a1008', color: '#e8dcc8', display: 'flex',
      justifyContent: 'space-between', alignItems: 'center',
      padding: '5px 22px', fontFamily: "'Source Sans 3', sans-serif",
      fontSize: 11, borderBottom: '2px solid #c8960c', gap: 8,
    }}>
      <div className="topbar-left" style={{ display: 'flex', gap: 18, alignItems: 'center' }}>
        <span>📍 RIT Campus Edition</span>
        <span style={{ color: '#c8960c' }}>☀ Sunny, 32°C</span>
        <span style={{ color: '#a09080' }}>{time}</span>
      </div>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        {user && (
          <span>Welcome, <strong style={{ color: '#c8960c' }}>{user.name}</strong></span>
        )}
        {user?.role === 'admin' && <TbBtn onClick={onAdmin}>Admin Panel</TbBtn>}
        <TbBtn red onClick={onLogout}>Sign Out</TbBtn>
      </div>
    </div>
  )
}
