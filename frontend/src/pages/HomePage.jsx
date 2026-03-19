import { useState, useEffect } from 'react'
import Masthead from '../components/Masthead'
import Badge from '../components/Badge'
import SecRule from '../components/SecRule'
import { CATEGORIES } from '../utils/constants'
import { fetchArticles} from '../utils/api'
import { API_BASE } from '../utils/constants'

// ─── NOTE ─────────────────────────────────────────────────────────────────────
// Add this ONE line inside <head> of your public/index.html (no npm install):
// <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
// ──────────────────────────────────────────────────────────────────────────────

const ANNOUNCEMENTS = [
  'Exam timetable released — check portal',
  'Sports day registrations open till March 10',
  'Library hours extended: 7am–10pm',
  'Alumni meet on March 22 — RSVP now',
]

// ─── PDF helpers ──────────────────────────────────────────────────────────────

function printNewspaper(articles, sectionLabel = 'Full Edition') {
  if (!articles.length) return
  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
  const BASE = 'http://127.0.0.1:5000'
  const src = url => !url ? null : url.startsWith('http') ? url : BASE + url

  const [hero, ...rest] = articles
  const heroImg = src(hero.image_url || hero.img)
  const heroBody = (hero.content || hero.body || hero.sm || '').slice(0, 300)

  const rows = []
  for (let i = 0; i < rest.length; i += 3) rows.push(rest.slice(i, i + 3))

  const html = `<!DOCTYPE html><html><head>
  <meta charset="UTF-8"/>
  <title>Campus Chronicles</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box;}
    body{font-family:'Times New Roman',Times,serif;background:#fff;color:#000;}
    .masthead{text-align:center;padding-bottom:8px;margin-bottom:4px;}
    .masthead-name{font-size:48pt;font-weight:900;letter-spacing:-2px;line-height:1;}
    .masthead-sub{font-size:8.5pt;font-style:italic;color:#444;margin-top:3px;letter-spacing:.1em;}
    .masthead-rule1{border-top:4px solid #000;margin-top:8px;}
    .masthead-rule2{border-top:1px solid #000;margin-top:2px;margin-bottom:4px;}
    .masthead-meta{display:flex;justify-content:space-between;font-size:7.5pt;color:#555;padding:3px 0;}
    .front-rule{border-top:3px solid #000;border-bottom:1px solid #000;padding:3px 0;font-size:7.5pt;font-weight:700;letter-spacing:.2em;text-transform:uppercase;margin-bottom:10px;}
    .front-hero{margin-bottom:10px;padding-bottom:10px;border-bottom:2px double #000;}
    .front-hero-img{width:100%;max-height:260px;object-fit:cover;display:block;margin-bottom:8px;}
    .front-hero-hl{font-size:20pt;font-weight:900;line-height:1.12;margin-bottom:4px;}
    .col-row{display:flex;gap:0;margin-bottom:8px;}
    .front-col{flex:1;padding:0 10px;}
    .front-col:first-child{padding-left:0;}
    .front-col:last-child{padding-right:0;}
    .col-border{border-left:1px solid #ccc;}
    .front-col-img{width:100%;max-height:130px;object-fit:cover;display:block;margin-bottom:6px;}
    .front-col-hl{font-size:11pt;font-weight:900;line-height:1.15;margin-bottom:3px;}
    .kicker{font-size:6.5pt;font-weight:700;letter-spacing:.22em;color:#b5121b;margin-bottom:4px;text-transform:uppercase;}
    .byline{font-size:7.5pt;color:#555;font-style:italic;border-top:1px solid #ddd;padding-top:3px;margin-bottom:5px;margin-top:2px;}
    .body{font-size:9pt;line-height:1.55;color:#222;text-align:justify;}
    .art-rule{border-top:1px solid #ccc;margin:8px 0;}
    @page{size:A4;margin:12mm 14mm;}
    @media print{body{padding:0;}}
  </style>
  </head><body>
  <div class="masthead">
    <div class="masthead-name">Campus Chronicles</div>
    <div class="masthead-sub">The Voice of the Campus · Est. 2021</div>
    <div class="masthead-rule1"></div>
    <div class="masthead-rule2"></div>
    <div class="masthead-meta">
      <span>${today}</span>
      <span>${sectionLabel} · ${articles.length} Article${articles.length !== 1 ? 's' : ''}</span>
      <span>RIT, Kottayam</span>
    </div>
  </div>
  <div class="front-rule">${sectionLabel}</div>

  <div class="front-hero">
    ${heroImg ? `<img class="front-hero-img" src="${heroImg}"/>` : ''}
    <div class="kicker">${(hero.category || hero.cat || 'Campus').toUpperCase()}</div>
    <div class="front-hero-hl">${hero.title || hero.hl || ''}</div>
    <div class="byline">By <strong>${hero.author_name || hero.au || 'Staff'}</strong>${hero.dt ? ' · ' + hero.dt : ''}</div>
    <div class="body">${heroBody}${heroBody.length >= 300 ? '…' : ''}</div>
  </div>

  ${rows.map(row => `
    <div class="col-row">
      ${row.map((a, ci) => {
        const aImg = src(a.image_url || a.img)
        const aBody = (a.content || a.body || a.sm || '').slice(0, 180)
        return `<div class="front-col${ci > 0 ? ' col-border' : ''}">
          ${aImg ? `<img class="front-col-img" src="${aImg}"/>` : ''}
          <div class="kicker">${(a.category || a.cat || 'Campus').toUpperCase()}</div>
          <div class="front-col-hl">${a.title || a.hl || ''}</div>
          <div class="byline">By <strong>${a.author_name || a.au || 'Staff'}</strong></div>
          <div class="body">${aBody}${aBody.length >= 180 ? '…' : ''}</div>
        </div>`
      }).join('')}
    </div>
    <div class="art-rule"></div>`).join('')}

  <script>window.onload=function(){window.print();}</script>
  </body></html>`

  const w = window.open('', '_blank', 'width=900,height=700')
  w.document.write(html)
  w.document.close()
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function HomePage({ onNav, onArticleClick }) {
  const [cat, setCat]               = useState('All')
  const [articles, setArticles]     = useState([])
  const [loading, setLoading]       = useState(true)
  const [pdfLoading, setPdfLoading] = useState(false)
  const click = onArticleClick || (() => {})

  useEffect(() => {
    setLoading(true)
    fetchArticles(cat)
      .then(data => setArticles(data.articles || []))
      .catch(() => setArticles([]))
      .finally(() => setLoading(false))
  }, [cat])

  const [hero, ...rest] = articles
  const secondary = rest.slice(0, 2)
  const latest    = rest.slice(0, 2)
  const bottom    = rest.slice(0, 8)

  const navItems = [
    { label: 'Home', id: 'All' },
    ...CATEGORIES.map(c => ({ label: c, id: c })),
    { label: '+ Submit Article', id: 'submit', special: true },
    { label: '🔔', id: 'notifications', icon: '🔔' },
    { label: '🔍', id: 'search', icon: '🔍' },
  ]

  const handleNav = id => {
    if (['submit', 'notifications', 'search'].includes(id)) { onNav(id) } else { setCat(id) }
  }

  const handleDownloadEdition = () => {
  printNewspaper(articles, cat === 'All' ? 'Full Edition' : cat)
}

const handleDownloadArticle = (e, art) => {
  e.stopPropagation()
  printNewspaper([art], art.hl || art.title || 'Article')
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

        /* ── PDF download bar (new) ── */
        .pdf-bar {
          display: flex; align-items: center; justify-content: space-between;
          padding: 7px 22px;
          border-bottom: 1px solid #e8dcc8;
          background: #fffef7;
          flex-wrap: wrap; gap: 8px;
        }
        .pdf-bar-label {
          font-family: 'Source Sans 3', sans-serif;
          font-size: 10px; letter-spacing: .16em;
          text-transform: uppercase; color: #6b5c4e;
        }
        .pdf-btn {
          display: inline-flex; align-items: center; gap: 5px;
          border: 1.5px solid #1a1008; background: #fdf6e3;
          padding: 4px 13px;
          font-family: 'Source Sans 3', sans-serif;
          font-size: 10px; font-weight: 700;
          letter-spacing: .1em; text-transform: uppercase;
          cursor: pointer; color: #1a1008;
          transition: background .15s, color .15s;
        }
        .pdf-btn:hover:not(:disabled) { background: #1a1008; color: #fdf6e3; }
        .pdf-btn:disabled { opacity: .5; cursor: default; }
        .pdf-btn-red { background: #b5121b; color: #fff; border-color: #b5121b; }
        .pdf-btn-red:hover:not(:disabled) { background: #8b0e15; border-color: #8b0e15; color: #fff; }

        /* ── Per-article download button (new) ── */
        .art-dl-btn {
          display: inline-flex; align-items: center; gap: 4px;
          margin-top: 7px;
          border: 1px solid #c8baa8; background: transparent;
          padding: 3px 9px;
          font-family: 'Source Sans 3', sans-serif;
          font-size: 9.5px; font-weight: 700;
          letter-spacing: .09em; text-transform: uppercase;
          cursor: pointer; color: #6b5c4e;
          transition: background .15s, color .15s, border-color .15s;
        }
        .art-dl-btn:hover { background: #1a1008; color: #fdf6e3; border-color: #1a1008; }

        /* ── Generating overlay (new) ── */
        .pdf-overlay {
          position: fixed; inset: 0;
          background: rgba(26,16,8,.65);
          display: flex; align-items: center; justify-content: center;
          z-index: 9999;
        }
        .pdf-overlay-box {
          background: #fdf6e3; border: 2px solid #1a1008;
          padding: 28px 44px; text-align: center;
        }
        .pdf-overlay-title {
          font-family: 'Playfair Display', serif;
          font-size: 20px; font-weight: 900; color: #1a1008; margin-bottom: 6px;
        }
        .pdf-overlay-sub {
          font-family: 'Source Sans 3', sans-serif;
          font-size: 11px; color: #6b5c4e; letter-spacing: .1em;
        }
        .pdf-spinner {
          width: 28px; height: 28px;
          border: 3px solid #e8dcc8; border-top-color: #b5121b;
          border-radius: 50%; animation: cc-spin .7s linear infinite;
          margin: 10px auto 0;
        }
        @keyframes cc-spin { to { transform: rotate(360deg); } }
      `}</style>

      {/* Generating overlay */}
      {pdfLoading && (
        <div className="pdf-overlay">
          <div className="pdf-overlay-box">
            <div className="pdf-overlay-title">Composing Edition…</div>
            <div className="pdf-overlay-sub">Typesetting {articles.length} articles into print layout</div>
            <div className="pdf-spinner" />
          </div>
        </div>
      )}

      <Masthead navItems={navItems} activeNav={cat} onNav={handleNav} />

      <div style={{ maxWidth: 1280, margin: '0 auto', background: '#fdf6e3', boxShadow: '0 0 50px rgba(0,0,0,.28)' }}>
        <div style={{ padding: '14px 22px 0' }}>
          <div style={{ borderTop: '1px solid #1a1008', borderBottom: '1px solid #1a1008', padding: '4px 0', textAlign: 'center', fontFamily: "'Source Sans 3',sans-serif", fontSize: 10, letterSpacing: '.2em', textTransform: 'uppercase', color: '#6b5c4e' }}>
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} · Campus Edition
          </div>
        </div>

        {/* ── PDF download bar — shown once articles load ── */}
        {!loading && articles.length > 0 && (
          <div className="pdf-bar">
            <span className="pdf-bar-label">
              📰 {articles.length} article{articles.length !== 1 ? 's' : ''} in this edition
            </span>
            <button
              className="pdf-btn pdf-btn-red"
              onClick={handleDownloadEdition}
              disabled={pdfLoading}
              title="Download all articles as a single newspaper-style PDF"
            >
              ⬇ Download Full Edition PDF
            </button>
          </div>
        )}

        {loading ? (
          <div style={{ padding: 60, textAlign: 'center', color: '#6b5c4e', fontFamily: "'Source Sans 3',sans-serif" }}>Loading articles…</div>
        ) : !hero ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#6b5c4e', fontFamily: "'Source Sans 3',sans-serif" }}>No articles in this category yet.</div>
        ) : (
          <>
            <div className="main-grid">
              {/* ── Hero ── */}
              <div>
                <SecRule>Top Story</SecRule>
                <div className="art-card-hover" onClick={() => click(hero)} style={{ overflow: 'hidden', marginBottom: 12, cursor: 'pointer' }}>
                  <img src={hero.img} alt="" style={{ width: '100%', height: 310, objectFit: 'cover', display: 'block', transition: 'transform .4s' }} onError={e => e.target.hidden = true} />
                </div>
                <Badge cat={hero.cat} />
                <div className="hl-hover" onClick={() => click(hero)} style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(18px,3vw,27px)', fontWeight: 900, lineHeight: 1.2, color: '#1a1008', marginBottom: 9, cursor: 'pointer', transition: 'color .2s' }}>{hero.hl}</div>
                <p style={{ fontFamily: "'Libre Baskerville',serif", fontSize: 13, color: '#4a3a2a', lineHeight: 1.7, marginBottom: 8 }}>{hero.sm}</p>
                <div style={{ fontFamily: "'Source Sans 3',sans-serif", fontSize: 11, color: '#6b5c4e' }}>By <strong>{hero.au}</strong> — {hero.dt}</div>
                <button className="art-dl-btn" onClick={e => handleDownloadArticle(e, hero)}>
                  ⬇ Download Article PDF
                </button>
              </div>

              <div className="vrule" style={{ background: '#1a1008', width: 1 }} />

              {/* ── Secondary ── */}
              <div style={{ padding: '0 4px' }}>
                <SecRule>Campus News</SecRule>
                {secondary.map(a => (
                  <div key={a.id} onClick={() => click(a)} style={{ paddingBottom: 13, borderBottom: '1px solid #e8dcc8', marginBottom: 13, cursor: 'pointer' }}>
                    <img src={a.img} alt="" className="art-card-hover" style={{ width: '100%', height: 148, objectFit: 'cover', marginBottom: 8 }} onError={e => e.target.hidden = true} />
                    <Badge cat={a.cat} />
                    <div className="hl-hover" style={{ fontFamily: "'Playfair Display',serif", fontSize: 15, fontWeight: 700, lineHeight: 1.3, color: '#1a1008', marginBottom: 5, transition: 'color .2s' }}>{a.hl}</div>
                    <p style={{ fontFamily: "'Libre Baskerville',serif", fontSize: 11.5, color: '#4a3a2a', lineHeight: 1.6 }}>{a.sm.slice(0, 120)}...</p>
                    <div style={{ fontFamily: "'Source Sans 3',sans-serif", fontSize: 10, color: '#6b5c4e', marginTop: 6 }}>By <strong>{a.au}</strong> — {a.dt}</div>
                    <button className="art-dl-btn" onClick={e => handleDownloadArticle(e, a)}>
                      ⬇ Download PDF
                    </button>
                  </div>
                ))}
              </div>

              <div className="vrule" style={{ background: '#1a1008', width: 1 }} />

              {/* ── Latest + Announcements ── */}
              <div style={{ padding: '0 4px' }}>
                <SecRule>Latest</SecRule>
                {latest.map(a => (
                  <div key={a.id} onClick={() => click(a)} style={{ display: 'flex', gap: 10, paddingBottom: 10, borderBottom: '1px solid #e8dcc8', marginBottom: 10, cursor: 'pointer' }}>
                    <img src={a.img} alt="" style={{ width: 76, height: 60, objectFit: 'cover', flexShrink: 0 }} onError={e => e.target.hidden = true} />
                    <div>
                      <Badge cat={a.cat} />
                      <div className="hl-hover" style={{ fontFamily: "'Playfair Display',serif", fontSize: 13, fontWeight: 700, lineHeight: 1.3, color: '#1a1008', transition: 'color .2s' }}>{a.hl}</div>
                      <div style={{ fontFamily: "'Source Sans 3',sans-serif", fontSize: 10, color: '#6b5c4e', marginTop: 4 }}>{a.au} — {a.dt}</div>
                      <button className="art-dl-btn" onClick={e => handleDownloadArticle(e, a)}>
                        ⬇ PDF
                      </button>
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
                  <button className="art-dl-btn" onClick={e => handleDownloadArticle(e, a)}>
                    ⬇ Download PDF
                  </button>
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