import { useState, useEffect } from 'react'
import Masthead from '../components/Masthead'
import Badge from '../components/Badge'
import SecRule from '../components/SecRule'
import { CATEGORIES } from '../utils/constants'
import { fetchArticles } from '../utils/api'

const ANNOUNCEMENTS = [
  'Exam timetable released — check portal',
  'Sports day registrations open till March 10',
  'Library hours extended: 7am–10pm',
  'Alumni meet on March 22 — RSVP now',
]

export default function HomePage({ onNav, onArticleClick }) {
  const [cat, setCat]         = useState('All')
  const [articles, setArticles] = useState([])
  const [loading, setLoading]   = useState(true)
  const click = onArticleClick || (() => {})

  // Fetch articles from Flask whenever category changes
  useEffect(() => {
    setLoading(true)
    fetchArticles(cat)
      .then(data => setArticles(data.articles || []))
      .catch(() => setArticles([]))
      .finally(() => setLoading(false))
  }, [cat])

  const [hero, ...rest] = articles
  const secondary = rest.slice(0, 2)
  const latest    = rest.slice(2, 4)
  const bottom    = rest.slice(0, 8)

  const navItems = [
    { label: 'Home', id: 'All' },
    ...CATEGORIES.map(c => ({ label: c, id: c })),
    { label: '+ Submit Article', id: 'submit', special: true },
    { label: '🔔', id: 'notifications', icon: '🔔' },
    { label: '🔍', id: 'search', icon: '🔍' },
  ]

  const handleNav = id => {
    if (['submit','notifications','search'].includes(id)) { onNav(id) } else { setCat(id) }
  }

  return (
    <div>
      <style>{`
        .main-grid { display: grid; grid-template-columns: 2fr 1px 1fr 1px 1fr; gap: 0 20px; padding: 18px 22px; }
        .btm-grid  { display: grid; grid-template-columns: repeat(4,1fr); gap: 18px; padding: 0 22px 22px; }
        @media (max-width: 900px) {
          .main-grid { grid-template-columns: 1fr !important; }
          .main-grid .vrule { display: none !important; }
          .btm-grid  { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 520px) {
          .btm-grid  { grid-template-columns: 1fr !important; }
          .main-grid { padding: 12px !important; }
        }
        .art-card-hover:hover { opacity: .88; }
        .hl-hover:hover { color: #b5121b !important; }
      `}</style>

      <Masthead navItems={navItems} activeNav={cat} onNav={handleNav} />

      <div style={{ maxWidth: 1280, margin: '0 auto', background: '#fdf6e3', boxShadow: '0 0 50px rgba(0,0,0,.28)' }}>
        <div style={{ padding: '14px 22px 0' }}>
          <div style={{ borderTop: '1px solid #1a1008', borderBottom: '1px solid #1a1008', padding: '4px 0', textAlign: 'center', fontFamily: "'Source Sans 3',sans-serif", fontSize: 10, letterSpacing: '.2em', textTransform: 'uppercase', color: '#6b5c4e' }}>
            Wednesday, March 4, 2025 · Campus Edition
          </div>
        </div>

        {loading ? (
          <div style={{ padding: 60, textAlign: 'center', color: '#6b5c4e', fontFamily: "'Source Sans 3',sans-serif" }}>Loading articles…</div>
        ) : !hero ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#6b5c4e', fontFamily: "'Source Sans 3',sans-serif" }}>No articles in this category yet.</div>
        ) : (
          <>
            <div className="main-grid">
              {/* Hero */}
              <div>
                <SecRule>Top Story</SecRule>
                <div className="art-card-hover" onClick={() => click(hero)} style={{ overflow: 'hidden', marginBottom: 12, cursor: 'pointer' }}>
                  <img src={hero.img} alt="" style={{ width: '100%', height: 310, objectFit: 'cover', display: 'block', transition: 'transform .4s' }} onError={e => e.target.hidden = true} />
                </div>
                <Badge cat={hero.cat} />
                <div className="hl-hover" onClick={() => click(hero)} style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(18px,3vw,27px)', fontWeight: 900, lineHeight: 1.2, color: '#1a1008', marginBottom: 9, cursor: 'pointer', transition: 'color .2s' }}>{hero.hl}</div>
                <p style={{ fontFamily: "'Libre Baskerville',serif", fontSize: 13, color: '#4a3a2a', lineHeight: 1.7, marginBottom: 8 }}>{hero.sm}</p>
                <div style={{ fontFamily: "'Source Sans 3',sans-serif", fontSize: 11, color: '#6b5c4e' }}>By <strong>{hero.au}</strong> — {hero.dt}</div>
              </div>

              <div className="vrule" style={{ background: '#1a1008', width: 1 }} />

              {/* Secondary */}
              <div style={{ padding: '0 4px' }}>
                <SecRule>Campus News</SecRule>
                {secondary.map(a => (
                  <div key={a.id} onClick={() => click(a)} style={{ paddingBottom: 13, borderBottom: '1px solid #e8dcc8', marginBottom: 13, cursor: 'pointer' }}>
                    <img src={a.img} alt="" className="art-card-hover" style={{ width: '100%', height: 148, objectFit: 'cover', marginBottom: 8 }} onError={e => e.target.hidden = true} />
                    <Badge cat={a.cat} />
                    <div className="hl-hover" style={{ fontFamily: "'Playfair Display',serif", fontSize: 15, fontWeight: 700, lineHeight: 1.3, color: '#1a1008', marginBottom: 5, transition: 'color .2s' }}>{a.hl}</div>
                    <p style={{ fontFamily: "'Libre Baskerville',serif", fontSize: 11.5, color: '#4a3a2a', lineHeight: 1.6 }}>{a.sm.slice(0, 120)}...</p>
                    <div style={{ fontFamily: "'Source Sans 3',sans-serif", fontSize: 10, color: '#6b5c4e', marginTop: 6 }}>By <strong>{a.au}</strong> — {a.dt}</div>
                  </div>
                ))}
              </div>

              <div className="vrule" style={{ background: '#1a1008', width: 1 }} />

              {/* Latest + Announcements */}
              <div style={{ padding: '0 4px' }}>
                <SecRule>Latest</SecRule>
                {latest.map(a => (
                  <div key={a.id} onClick={() => click(a)} style={{ display: 'flex', gap: 10, paddingBottom: 10, borderBottom: '1px solid #e8dcc8', marginBottom: 10, cursor: 'pointer' }}>
                    <img src={a.img} alt="" style={{ width: 76, height: 60, objectFit: 'cover', flexShrink: 0 }} onError={e => e.target.hidden = true} />
                    <div>
                      <Badge cat={a.cat} />
                      <div className="hl-hover" style={{ fontFamily: "'Playfair Display',serif", fontSize: 13, fontWeight: 700, lineHeight: 1.3, color: '#1a1008', transition: 'color .2s' }}>{a.hl}</div>
                      <div style={{ fontFamily: "'Source Sans 3',sans-serif", fontSize: 10, color: '#6b5c4e', marginTop: 4 }}>{a.au} — {a.dt}</div>
                    </div>
                  </div>
                ))}
                <div style={{ border: '2px solid #1a1008', padding: 13, background: '#fffef7' }}>
                  <div style={{ fontFamily: "'Source Sans 3',sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: '.15em', textTransform: 'uppercase', color: '#b5121b', marginBottom: 10, borderBottom: '1px solid #e8dcc8', paddingBottom: 5 }}>📌 Announcements</div>
                  {ANNOUNCEMENTS.map((a, i) => (
                    <div key={i} style={{ fontFamily: "'Source Sans 3',sans-serif", fontSize: 11, color: '#1a1008', padding: '5px 0', borderBottom: i < ANNOUNCEMENTS.length - 1 ? '1px solid #e8dcc8' : 'none', cursor: 'pointer' }}>› {a}</div>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ borderTop: '3px double #1a1008', margin: '0 22px 16px' }} />
            <div style={{ padding: '0 22px' }}><SecRule>More Stories</SecRule></div>
            <div className="btm-grid">
              {bottom.map(a => (
                <div key={a.id} onClick={() => click(a)} style={{ cursor: 'pointer' }}>
                  <img src={a.img} alt="" className="art-card-hover" style={{ width: '100%', height: 148, objectFit: 'cover', marginBottom: 8, transition: 'opacity .25s' }} onError={e => e.target.hidden = true} />
                  <Badge cat={a.cat} />
                  <div className="hl-hover" style={{ fontFamily: "'Playfair Display',serif", fontSize: 15, fontWeight: 700, lineHeight: 1.3, color: '#1a1008', marginBottom: 5, transition: 'color .2s' }}>{a.hl}</div>
                  <p style={{ fontFamily: "'Libre Baskerville',serif", fontSize: 11.5, color: '#4a3a2a', lineHeight: 1.6 }}>{a.sm.slice(0, 100)}...</p>
                  <div style={{ fontFamily: "'Source Sans 3',sans-serif", fontSize: 10, color: '#6b5c4e', marginTop: 6 }}>By <strong>{a.au}</strong> — {a.dt}</div>
                </div>
              ))}
            </div>
          </>
        )}

        <footer style={{ background: '#1a1008', color: '#e8dcc8', padding: '20px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
            <div>
              <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 28, color: '#fdf6e3' }}>Campus Chronicle</div>
              <div style={{ fontFamily: "'Source Sans 3',sans-serif", fontSize: 11, color: '#a09080' }}>The Voice of the Campus · Est. 2021</div>
            </div>
            <div style={{ fontFamily: "'Source Sans 3',sans-serif", fontSize: 11, color: '#a09080', textAlign: 'right', lineHeight: 1.8 }}>
              © 2025 Campus Chronicle. All rights reserved.<br />Published by the Dept. of Journalism & Media Studies
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
