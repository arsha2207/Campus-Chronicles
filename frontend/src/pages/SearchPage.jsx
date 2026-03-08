// SearchPage.jsx — archive search with responsive layout and article click

import { useState } from 'react'
import Ticker from '../components/Ticker'
import Badge from '../components/Badge'
import { RdBtn, TbBtn } from '../components/Buttons'
import { FLabel, FSel } from '../components/FormElements'
import { CATEGORIES, CATEGORY_COLORS } from '../utils/constants'
import { DEMO_ARTICLES } from '../data/demoData'

const ARCHIVE = DEMO_ARTICLES.map(a => ({ ...a, title: a.hl, mo: a.mo || 'March 2025' }))
const MONTHS  = ['March 2025', 'February 2025', 'January 2025']

export default function SearchPage({ onBack, onArticleClick }) {
  const [q,     setQ]     = useState('')
  const [cat,   setCat]   = useState('')
  const [month, setMonth] = useState('')

  const isFiltered = q || cat || month
  const results = ARCHIVE.filter(a => {
    const mq = !q     || a.title.toLowerCase().includes(q.toLowerCase()) || a.sm.toLowerCase().includes(q.toLowerCase()) || a.au.toLowerCase().includes(q.toLowerCase())
    const mc = !cat   || a.cat === cat
    const mm = !month || a.mo  === month
    return mq && mc && mm
  })

  const click = a => onArticleClick && onArticleClick(a)

  return (
    <div>
      {/* Topbar */}
      <div style={{ background: '#1a1008', color: '#e8dcc8', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 22px', fontFamily: "'Source Sans 3',sans-serif", fontSize: 11, borderBottom: '2px solid #c8960c', flexWrap: 'wrap', gap: 6 }}>
        <span>📍 Kerala Campus Edition</span>
        <TbBtn onClick={onBack}>← Home</TbBtn>
      </div>

      {/* Mini masthead */}
      <div style={{ background: '#fdf6e3', padding: '10px 22px 0', borderBottom: '4px double #1a1008' }}>
        <div style={{ textAlign: 'center', padding: '8px 0 4px' }}>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(26px,6vw,54px)', lineHeight: 1, color: '#1a1008' }}>Campus Chronicle</div>
        </div>
        <Ticker />
      </div>

      <div style={{ maxWidth: 1280, margin: '0 auto', background: '#fdf6e3', boxShadow: '0 0 50px rgba(0,0,0,.28)', padding: 22 }}>
        <div className="page-inner" style={{ maxWidth: 880, margin: '0 auto', padding: '28px 32px 42px' }}>

          {/* Header */}
          <div style={{ borderBottom: '3px double #1a1008', paddingBottom: 11, marginBottom: 22 }}>
            <div style={{ fontFamily: "'Source Sans 3',sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: '.2em', textTransform: 'uppercase', color: '#b5121b', marginBottom: 4 }}>Archive & Search</div>
            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 28, fontWeight: 900 }}>Search the Chronicle</div>
          </div>

          {/* Search form */}
          <div style={{ background: '#f5ead0', border: '1px solid #c8960c', padding: 18, marginBottom: 24 }}>
            <div className="search-form-grid">
              <div>
                <FLabel>Search Articles</FLabel>
                <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search by keyword, author, or topic…"
                  onKeyDown={e => e.key === 'Enter' && setQ(e.target.value)}
                  style={{ width: '100%', padding: '10px 13px', border: '1.5px solid #1a1008', background: '#fffef7', fontFamily: "'Libre Baskerville',serif", fontSize: 13, color: '#1a1008', outline: 'none' }} />
              </div>
              <div>
                <FLabel>Category</FLabel>
                <FSel value={cat} onChange={e => setCat(e.target.value)} style={{ marginBottom: 0 }}>
                  <option value="">All Categories</option>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </FSel>
              </div>
              <div>
                <FLabel>Month</FLabel>
                <FSel value={month} onChange={e => setMonth(e.target.value)} style={{ marginBottom: 0 }}>
                  <option value="">All Months</option>
                  {MONTHS.map(m => <option key={m}>{m}</option>)}
                </FSel>
              </div>
              <div className="search-btn-wrap" style={{ display: 'flex', alignItems: 'flex-end' }}>
                <button onClick={() => {}} style={{ width: '100%', height: 42, padding: '0 18px', background: '#1a1008', color: '#fdf6e3', border: 'none', fontFamily: "'Source Sans 3',sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', cursor: 'pointer' }}>
                  Search
                </button>
              </div>
            </div>
          </div>

          {/* Results */}
          {isFiltered ? (
            <>
              <div style={{ fontFamily: "'Source Sans 3',sans-serif", fontSize: 12, color: '#6b5c4e', marginBottom: 16, borderBottom: '1px solid #e8dcc8', paddingBottom: 10 }}>
                Found <strong style={{ color: '#1a1008' }}>{results.length}</strong> article{results.length !== 1 ? 's' : ''}{q ? ` matching "${q}"` : ''}
              </div>
              {results.length === 0
                ? <div style={{ textAlign: 'center', padding: 40, color: '#6b5c4e', fontFamily: "'Source Sans 3',sans-serif" }}>No articles found. Try different keywords.</div>
                : results.map(a => <ResultCard key={a.id} article={a} onClick={() => click(a)} />)
              }
            </>
          ) : (
            MONTHS.map(m => {
              const arts = ARCHIVE.filter(a => a.mo === m)
              return (
                <div key={m}>
                  <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 17, fontWeight: 700, color: '#1a1008', borderBottom: '2px solid #1a1008', paddingBottom: 5, marginBottom: 12, marginTop: 20 }}>
                    {m} <span style={{ fontFamily: "'Source Sans 3',sans-serif", fontSize: 11, color: '#6b5c4e', fontWeight: 400 }}>({arts.length} articles)</span>
                  </div>
                  {arts.map(a => <ResultCard key={a.id} article={a} compact onClick={() => click(a)} />)}
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}

function ResultCard({ article: a, compact, onClick }) {
  const [hov, setHov] = useState(false)
  return (
    <div onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ padding: 15, border: '1px solid #e8dcc8', borderLeft: `4px solid ${CATEGORY_COLORS[a.cat] || '#1a1008'}`, marginBottom: 10, background: hov ? '#f5ead0' : '#fffef7', cursor: 'pointer', transition: 'background .2s' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: compact ? 'center' : 'flex-start', gap: 14 }}>
        <div style={{ flex: 1 }}>
          <Badge cat={a.cat} />
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, fontWeight: 700, color: '#1a1008', marginBottom: compact ? 2 : 5, lineHeight: 1.3 }}>{a.title || a.hl}</div>
          {!compact && a.sm && <p style={{ fontFamily: "'Source Sans 3',sans-serif", fontSize: 12, color: '#4a3a2a', lineHeight: 1.6, marginTop: 4 }}>{a.sm}</p>}
          <div style={{ fontFamily: "'Source Sans 3',sans-serif", fontSize: 10, color: '#6b5c4e', marginTop: 6 }}>By <strong>{a.au}</strong></div>
        </div>
        <RdBtn onClick={e => { e.stopPropagation(); onClick() }}>Read</RdBtn>
      </div>
    </div>
  )
}
