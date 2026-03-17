import { useState, useEffect } from 'react'
import Masthead from '../components/Masthead'
import Badge from '../components/Badge'
import SecRule from '../components/SecRule'
import { CATEGORIES } from '../utils/constants'
import { fetchArticles, fetchArticleById } from '../utils/api'
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

function getJsPDF() {
  if (window.jspdf?.jsPDF) return window.jspdf.jsPDF
  if (window.jsPDF) return window.jsPDF
  throw new Error('jsPDF not loaded. Add the CDN <script> to public/index.html.')
}

/** Draws masthead at top of doc; returns y position after it */
function drawMasthead(doc, W, margin, articleCount) {
  doc.setFont('times', 'bold')
  doc.setFontSize(30)
  doc.setTextColor(26, 16, 8)
  doc.text('Campus Chronicle', W / 2, 20, { align: 'center' })

  doc.setFont('times', 'italic')
  doc.setFontSize(9)
  doc.setTextColor(107, 92, 78)
  doc.text('The Voice of the Campus · Est. 2021', W / 2, 26, { align: 'center' })

  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
  doc.setFont('times', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(107, 92, 78)
  doc.text(`${today}  ·  ${articleCount} Article${articleCount !== 1 ? 's' : ''}`, W / 2, 31, { align: 'center' })

  doc.setDrawColor(26, 16, 8)
  doc.setLineWidth(0.8)
  doc.line(margin, 34, W - margin, 34)
  doc.setLineWidth(0.25)
  doc.line(margin, 36, W - margin, 36)

  return 43
}

// ─── Image → base64 helper ────────────────────────────────────────────────────
// Loads an image URL through a canvas so jsPDF can embed it.
// Returns null if the image fails to load (we just skip it gracefully).
function loadImageAsBase64(url) {
  return new Promise((resolve) => {
    if (!url) return resolve(null)
    // If the URL is relative (e.g. /uploads/img.jpg) make it absolute
    const fullUrl = url.startsWith('http') ? url : `${API_BASE}${url}`
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas')
        canvas.width  = img.naturalWidth
        canvas.height = img.naturalHeight
        canvas.getContext('2d').drawImage(img, 0, 0)
        resolve(canvas.toDataURL('image/jpeg', 0.85))
      } catch { resolve(null) }
    }
    img.onerror = () => resolve(null)
    img.src = fullUrl
  })
}

// ─── Shared: write one article block into an open jsPDF doc ──────────────────
async function writeArticleBlock(doc, art, startY, W, margin, isFullPage = false) {
  const colW = (W - margin * 2 - 8) / 2
  let y = startY

  const checkY = (need = 20) => {
    if (y + need > 280) { doc.addPage(); y = margin }
  }

  // 1. Fetch full article data from Flask
  let full = art
  try {
    const res = await fetchArticleById(art.id)
    full = res.article || res || art
  } catch { /* fall back to card data */ }

  const title    = full.title    || full.hl  || art.hl  || 'Untitled'
  const author   = full.author_name || full.au || art.au || 'Staff Reporter'
  const date     = full.published_at || full.created_at || full.dt || art.dt || ''
  const category = full.category || full.cat || art.cat || 'Campus'
  const body     = full.content  || full.body || full.text || art.sm || ''
  const imgUrl   = full.image_url || full.img || art.img || null

  // 2. Embed image if present
  if (imgUrl) {
    const b64 = await loadImageAsBase64(imgUrl)
    if (b64) {
      checkY(60)
      // Scale image to fit page width, max 80mm tall
      const imgW = W - margin * 2
      const imgH = Math.min(80, imgW * 0.5)
      doc.addImage(b64, 'JPEG', margin, y, imgW, imgH)
      y += imgH + 4
    }
  }

  // 3. Category kicker
  checkY(8)
  doc.setFont('times', 'bold')
  doc.setFontSize(7.5)
  doc.setTextColor(181, 18, 27)
  doc.text(category.toUpperCase(), margin, y)
  y += 4.5

  // 4. Headline
  doc.setFont('times', 'bold')
  doc.setFontSize(isFullPage ? 18 : 14)
  doc.setTextColor(26, 16, 8)
  const headLines = doc.splitTextToSize(title, W - margin * 2)
  headLines.forEach(line => { checkY(9); doc.text(line, margin, y); y += isFullPage ? 8 : 6.5 })

  // 5. Byline + date
  doc.setFont('times', 'italic')
  doc.setFontSize(8)
  doc.setTextColor(107, 92, 78)
  const dateStr = date ? new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : ''
  doc.text(`By ${author}${dateStr ? '  ·  ' + dateStr : ''}`, margin, y)
  y += 4.5

  // 6. Rule under byline
  doc.setDrawColor(200, 188, 170)
  doc.setLineWidth(0.2)
  doc.line(margin, y, W - margin, y)
  y += 4

  // 7. Body — two columns for edition, single column for individual
  doc.setFont('times', 'normal')
  doc.setFontSize(isFullPage ? 11 : 9.5)
  doc.setTextColor(44, 42, 39)

  if (isFullPage) {
    // Single wide column for individual article PDF
    const lines = doc.splitTextToSize(body, W - margin * 2)
    lines.forEach(line => {
      checkY(6)
      doc.text(line, margin, y)
      y += 5.2
    })
  } else {
    // Two-column layout for edition PDF
    const allLines = doc.splitTextToSize(body, colW)
    let col = 0, colY = y
    const maxColH = 85
    allLines.forEach(line => {
      if (col === 0 && colY - y > maxColH) { col = 1; colY = y }
      else if (col === 1 && colY - y > maxColH) { doc.addPage(); y = margin; col = 0; colY = y }
      doc.text(line, margin + col * (colW + 8), colY)
      colY += 4.2
    })
    y = Math.max(y + 8, colY + 6)
  }

  return y
}

/** Download all articles as one full newspaper-style PDF (async — fetches full content) */
async function downloadEditionPDF(articles) {
  if (!articles.length) return
  const jsPDF = getJsPDF()
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const W = 210, margin = 16

  let y = drawMasthead(doc, W, margin, articles.length)

  for (let idx = 0; idx < articles.length; idx++) {
    const art = articles[idx]
    y = await writeArticleBlock(doc, art, y, W, margin, false)

    // Divider between articles
    if (idx < articles.length - 1) {
      if (y + 10 > 280) { doc.addPage(); y = margin }
      doc.setDrawColor(26, 16, 8)
      doc.setLineWidth(0.5)
      doc.line(margin, y, W - margin, y)
      y += 8
    }
  }

  doc.save('CampusChronicle_Edition.pdf')
}

/** Download a single article as its own full PDF (async — fetches full content) */
async function downloadArticlePDF(art) {
  const jsPDF = getJsPDF()
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const W = 210, margin = 20

  // Masthead strip
  doc.setFont('times', 'bold')
  doc.setFontSize(13)
  doc.setTextColor(26, 16, 8)
  doc.text('Campus Chronicle', W / 2, 12, { align: 'center' })
  doc.setDrawColor(26, 16, 8)
  doc.setLineWidth(0.6)
  doc.line(margin, 14.5, W - margin, 14.5)
  doc.setLineWidth(0.2)
  doc.line(margin, 16, W - margin, 16)

  await writeArticleBlock(doc, art, 22, W, margin, true)

  const slug = (art.hl || art.title || 'article').replace(/\s+/g, '_').slice(0, 40)
  doc.save(`${slug}.pdf`)
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

  const handleDownloadEdition = async () => {
    if (!articles.length || pdfLoading) return
    setPdfLoading(true)
    try { await downloadEditionPDF(articles) }
    catch (e) { alert('PDF error: ' + e.message) }
    finally { setPdfLoading(false) }
  }

  // Wrapper so per-article buttons also show the spinner
  const handleDownloadArticle = async (e, art) => {
    e.stopPropagation()
    setPdfLoading(true)
    try { await downloadArticlePDF(art) }
    catch (err) { alert('PDF error: ' + err.message) }
    finally { setPdfLoading(false) }
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
            Wednesday, March 4, 2025 · Campus Edition
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