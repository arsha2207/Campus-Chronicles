// ArticlePage.jsx
// Full newspaper-style article detail view.
//
// Props:
//   article        — { id, hl, sm, cat, au, dt, img, body? }
//   allArticles    — full article list (for related sidebar)
//   onBack         — go back to previous page
//   onArticleClick — open another article (related sidebar)
//
// Download options:
//   PDF  — opens a styled print-preview window; user saves as PDF
//   TXT  — instant blob download
//   Share — Web Share API on mobile, clipboard copy on desktop
//
// Flask connection:
//   import { fetchArticleById } from '../utils/api'
//   useEffect(() => { fetchArticleById(article.id).then(d => setFull(d)) }, [])
//   Flask: GET /api/articles/:id  →  { article: { ...full fields... } }

import { useState, useEffect } from 'react'
import Badge from '../components/Badge'
import { TbBtn } from '../components/Buttons'
import Ticker from '../components/Ticker'
import { CATEGORY_COLORS } from '../utils/constants'
import { fetchArticleById } from '../utils/api'

export default function ArticlePage({ article, allArticles = [], onBack, onArticleClick }) {
  const [copied,   setCopied]   = useState(false)
  const [pdfOpen,  setPdfOpen]  = useState(false)
  const [fullData, setFullData] = useState(null)   // full article from Flask

  // Fetch full article content from Flask
  useEffect(() => {
    fetchArticleById(article.id)
      .then(data => setFullData(data.article))
      .catch(() => setFullData(article))   // fallback to what we already have
  }, [article.id])

  const data     = fullData || article                // use Flask data once loaded
  const fullBody = data.body || data.sm || ''
  const related  = allArticles.filter(a => a.cat === article.cat && a.id !== article.id).slice(0, 3)
  const accent   = CATEGORY_COLORS[article.cat] || '#1a1008'

  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }) }, [article.id])

  // ── TXT download ────────────────────────────────────────────────────────
  const downloadTXT = () => {
    const lines = [
      'CAMPUS CHRONICLE',
      '═'.repeat(60),
      '',
      article.hl,
      '─'.repeat(60),
      `Category : ${article.cat}`,
      `Author   : ${article.au}`,
      `Date     : ${article.dt}`,
      '─'.repeat(60),
      '',
      fullBody,
      '',
      '─'.repeat(60),
      '© 2026 Campus Chronicle · The Voice of the Campus',
    ]
    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = article.hl.slice(0, 50).replace(/[^a-z0-9]/gi, '_') + '.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  // ── PDF download — opens styled print window ─────────────────────────────
  const downloadPDF = () => {
    setPdfOpen(true)
    const win = window.open('', '_blank', 'width=820,height=920')
    if (!win) { setPdfOpen(false); return }

    const bodyHTML = fullBody.split('\n\n')
      .filter(p => p.trim())
      .map((p, i) => {
        if (i === 0) {
          const first = p.trim()[0]
          const rest  = p.trim().slice(1)
          return `<p><span class="dropcap">${first}</span>${rest}</p>`
        }
        return `<p>${p.trim()}</p>`
      }).join('')

    win.document.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${article.hl}</title>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Source+Sans+3:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'Libre Baskerville',Georgia,serif;color:#1a1008;background:#fff;padding:44px 52px;max-width:740px;margin:0 auto}
    .masthead{text-align:center;border-bottom:4px double #1a1008;padding-bottom:12px;margin-bottom:18px}
    .masthead-title{font-family:'Playfair Display',serif;font-size:40px;font-weight:900;line-height:1}
    .masthead-sub{font-family:'Source Sans 3',sans-serif;font-size:9px;letter-spacing:.22em;text-transform:uppercase;color:#6b5c4e;margin-top:4px}
    .cat-badge{display:inline-block;background:${accent};color:#fff;font-family:'Source Sans 3',sans-serif;font-size:8px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;padding:2px 8px;margin-bottom:10px}
    h1{font-family:'Playfair Display',serif;font-size:26px;font-weight:900;line-height:1.2;margin-bottom:12px;color:#1a1008}
    .meta{font-family:'Source Sans 3',sans-serif;font-size:10px;color:#6b5c4e;border-top:1px solid #ccc;border-bottom:1px solid #ccc;padding:7px 0;margin-bottom:18px}
    .cover{width:100%;max-height:300px;object-fit:cover;margin-bottom:18px;border:1px solid #ddd}
    .body{font-size:13.5px;line-height:1.85;column-count:2;column-gap:24px;text-align:justify}
    .body p{margin-bottom:12px}
    .dropcap{float:left;font-family:'Playfair Display',serif;font-size:58px;font-weight:900;line-height:.75;color:${accent};margin-right:6px;margin-top:5px}
    .footer{margin-top:32px;padding-top:10px;border-top:3px double #1a1008;font-family:'Source Sans 3',sans-serif;font-size:9px;color:#6b5c4e;text-align:center}
    @media print{body{padding:0}@page{margin:18mm}}
  </style>
</head>
<body>
  <div class="masthead">
    <div class="masthead-title">Campus Chronicle</div>
    <div class="masthead-sub">Reporting Truth · Inspiring Minds · Building Tomorrow</div>
  </div>
  <div class="cat-badge">${article.cat}</div>
  <h1>${article.hl}</h1>
  <div class="meta">By <strong>${article.au}</strong> &nbsp;|&nbsp; ${article.dt} &nbsp;|&nbsp; ${article.cat}</div>
  ${article.img ? `<img class="cover" src="${article.img}" alt="">` : ''}
  <div class="body">${bodyHTML}</div>
  <div class="footer">© 2025 Campus Chronicle · The Voice of the Campus · Est. 2021</div>
  <script>window.onload=function(){window.print();setTimeout(window.close,1200)}<\/script>
</body>
</html>`)
    win.document.close()
    setTimeout(() => setPdfOpen(false), 2500)
  }

  // ── Share ────────────────────────────────────────────────────────────────
  const handleShare = async () => {
    if (navigator.share) {
      try { await navigator.share({ title: article.hl, text: article.sm, url: window.location.href }) } catch {}
    } else {
      await navigator.clipboard.writeText(window.location.href).catch(() => {})
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    }
  }

  return (
    <div style={{ background: '#cfc4aa', minHeight: '100vh' }}>

      {/* ── Topbar ── */}
      <div style={{
        background: '#1a1008', color: '#e8dcc8', display: 'flex',
        justifyContent: 'space-between', alignItems: 'center',
        padding: '5px 22px', fontFamily: "'Source Sans 3', sans-serif",
        fontSize: 11, borderBottom: '2px solid #c8960c', flexWrap: 'wrap', gap: 8,
      }}>
        <span style={{ fontSize: 11 }}>📍 RIT Campus Edition</span>
        <TbBtn onClick={onBack}>← Back</TbBtn>
      </div>

      {/* ── Masthead ── */}
      <div style={{ background: '#fdf6e3', padding: '10px 22px 0', borderBottom: '4px double #1a1008' }}>
        {/* title row */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
          borderBottom: '1px solid #1a1008', paddingBottom: 7, marginBottom: 7,
          flexWrap: 'wrap', gap: 8,
        }}>
          <div className="mast-meta" style={{ fontFamily: "'Source Sans 3',sans-serif", fontSize: 11, color: '#6b5c4e', lineHeight: 1.9 }}>
            Vol. IV | No. 42<br />Est. 2021
          </div>
          <div style={{ textAlign: 'center', flex: 1, minWidth: 180 }}>
            <div style={{ fontFamily: "'Source Sans 3',sans-serif", fontSize: 10, letterSpacing: '.28em', textTransform: 'uppercase', color: '#6b5c4e', marginBottom: 2 }}>
              The Voice of the Campus
            </div>
            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(26px,6vw,64px)', lineHeight: 1, color: '#1a1008' }}>
              Campus Chronicle
            </div>
          </div>
          <div className="mast-meta" style={{ fontFamily: "'Source Sans 3',sans-serif", fontSize: 11, color: '#6b5c4e', lineHeight: 1.9, textAlign: 'right' }}>
            Wednesday, March 4, 2025<br /><strong style={{ color: '#b5121b' }}>FREE</strong>
          </div>
        </div>
        {/* breadcrumb nav */}
        <nav style={{ display: 'flex', flexWrap: 'wrap', borderTop: '1px solid #1a1008', background: '#fdf6e3' }}>
          {[
            { label: 'Home',      action: onBack,  active: false },
            { label: article.cat, action: onBack,  active: false },
            { label: 'Article',   action: null,    active: true  },
          ].map(({ label, action, active }, i) => (
            <span key={i} onClick={action || undefined} style={{
              fontFamily: "'Source Sans 3',sans-serif", fontSize: 11, fontWeight: 700,
              textTransform: 'uppercase', letterSpacing: '.1em',
              color: active ? '#fff' : '#1a1008',
              padding: '9px 13px', borderRight: '1px solid #e8dcc8',
              cursor: active ? 'default' : 'pointer',
              background: active ? accent : 'transparent',
            }}>{label}</span>
          ))}
        </nav>
        <Ticker />
      </div>

      {/* ── Paper wrapper ── */}
      <div style={{ maxWidth: 1280, margin: '0 auto', background: '#fdf6e3', boxShadow: '0 0 50px rgba(0,0,0,.28)' }}>
        <div className="page-inner" style={{ padding: '28px 24px 48px' }}>

          {/* ── Article meta header ── */}
          <div style={{ maxWidth: 900, margin: '0 auto 28px' }}>
            {/* badge + download row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 10 }}>
              <Badge cat={article.cat} />
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <ActionBtn icon="⬇" label={pdfOpen ? 'Opening…' : 'PDF'} color={accent} onClick={downloadPDF} />
                <ActionBtn icon="📄" label="TXT" color="#6b5c4e" onClick={downloadTXT} />
                <ActionBtn icon={copied ? '✓' : '🔗'} label={copied ? 'Copied!' : 'Share'} color="#1a5c8a" onClick={handleShare} />
              </div>
            </div>

            {/* headline */}
            <h1 style={{
              fontFamily: "'Playfair Display',serif",
              fontSize: 'clamp(20px, 4vw, 36px)',
              fontWeight: 900, lineHeight: 1.15, color: '#1a1008',
              marginBottom: 16, paddingBottom: 16,
              borderBottom: `3px solid ${accent}`,
            }}>{article.hl}</h1>

            {/* byline */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', padding: '10px 0', borderBottom: '1px solid #e8dcc8', marginBottom: 0 }}>
              <div style={{
                width: 38, height: 38, borderRadius: '50%', background: accent, color: '#fff',
                flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: "'Playfair Display',serif", fontSize: 16, fontWeight: 900,
              }}>{article.au.charAt(0)}</div>
              <div>
                <div style={{ fontFamily: "'Source Sans 3',sans-serif", fontSize: 12, fontWeight: 700, color: '#1a1008' }}>{article.au}</div>
                <div style={{ fontFamily: "'Source Sans 3',sans-serif", fontSize: 11, color: '#6b5c4e' }}>{article.dt}</div>
              </div>
              <div style={{ marginLeft: 'auto', display: 'flex', gap: 16, flexWrap: 'wrap', fontFamily: "'Source Sans 3',sans-serif", fontSize: 10, color: '#6b5c4e', letterSpacing: '.08em', textTransform: 'uppercase' }}>
                <span>📖 5 min read</span>
                <span>👁 1.2k views</span>
              </div>
            </div>
          </div>

          {/* ── Two-column: body + sidebar ── */}
          <div className="article-layout">

            {/* ── Left: article body ── */}
            <article>
              {/* Cover image */}
              {article.img && (
                <div style={{ marginBottom: 28, position: 'relative' }}>
                  <img src={article.img} alt={article.hl} style={{ width: '100%', maxHeight: 420, objectFit: 'cover', border: '1px solid #e8dcc8' }} onError={e => e.target.hidden = true} />
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent,rgba(26,16,8,.6))', padding: '20px 16px 10px', fontFamily: "'Source Sans 3',sans-serif", fontSize: 10, color: 'rgba(255,255,255,.8)', letterSpacing: '.1em', textTransform: 'uppercase' }}>
                    {article.cat} · Campus Chronicle
                  </div>
                </div>
              )}

              {/* Body paragraphs with drop-cap */}
              <div style={{ marginBottom: 28 }}>
                {fullBody.split('\n\n').map((para, i) => {
                  if (!para.trim()) return null
                  if (i === 0) {
                    const first = para.trim()[0]
                    const rest  = para.trim().slice(1)
                    return (
                      <p key={i} style={{ fontFamily: "'Libre Baskerville',serif", fontSize: 14.5, lineHeight: 1.9, color: '#2c1a0e', marginBottom: 18, textAlign: 'justify' }}>
                        <span style={{ float: 'left', fontFamily: "'Playfair Display',serif", fontSize: 62, fontWeight: 900, lineHeight: .76, color: accent, marginRight: 8, marginTop: 5 }}>{first}</span>
                        {rest}
                      </p>
                    )
                  }
                  return (
                    <p key={i} style={{ fontFamily: "'Libre Baskerville',serif", fontSize: 14.5, lineHeight: 1.9, color: '#2c1a0e', marginBottom: 18, textAlign: 'justify' }}>
                      {para.trim()}
                    </p>
                  )
                })}
              </div>

              {/* Pull quote
              <blockquote style={{ margin: '28px 0', padding: '18px 24px', borderLeft: `5px solid ${accent}`, background: '#f5ead0', fontFamily: "'Playfair Display',serif", fontSize: 18, fontStyle: 'italic', lineHeight: 1.55, color: '#1a1008' }}>
                "This represents exactly the kind of progress we've been working toward. Our students deserve the best."
                <cite style={{ display: 'block', marginTop: 10, fontFamily: "'Source Sans 3',sans-serif", fontSize: 11, fontStyle: 'normal', fontWeight: 700, color: '#6b5c4e', letterSpacing: '.05em' }}>
                  — Senior Official, RIT Administration
                </cite>
              </blockquote> */}

              {/* Download banner */}
              <div style={{ marginTop: 36, padding: '20px 24px', background: '#1a1008', color: '#e8dcc8', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
                <div>
                  <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, fontWeight: 700, color: '#fdf6e3', marginBottom: 3 }}>Save this article</div>
                  <div style={{ fontFamily: "'Source Sans 3',sans-serif", fontSize: 11, color: '#a09080' }}>Download a copy to read offline</div>
                </div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <DarkOutlineBtn label={pdfOpen ? 'Opening…' : '⬇ Download PDF'} onClick={downloadPDF} />
                  <DarkOutlineBtn label="📄 Download TXT" onClick={downloadTXT} />
                </div>
              </div>
            </article>

            {/* ── Right: sidebar ── */}
            <aside>
              {/* Author card */}
              <div style={{ border: '2px solid #1a1008', marginBottom: 24, background: '#fffef7', overflow: 'hidden' }}>
                <div style={{ background: '#1a1008', color: '#fdf6e3', padding: '8px 14px', fontFamily: "'Source Sans 3',sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: '.15em', textTransform: 'uppercase' }}>
                  About the Author
                </div>
                <div style={{ padding: 16 }}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 10 }}>
                    <div style={{ width: 48, height: 48, borderRadius: '50%', background: accent, color: '#fff', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 900 }}>
                      {article.au.charAt(0)}
                    </div>
                    <div>
                      <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 14, fontWeight: 700, color: '#1a1008' }}>{article.au}</div>
                      <div style={{ fontFamily: "'Source Sans 3',sans-serif", fontSize: 11, color: '#6b5c4e' }}>Staff Reporter</div>
                    </div>
                  </div>
                  <p style={{ fontFamily: "'Libre Baskerville',serif", fontSize: 12, color: '#4a3a2a', lineHeight: 1.65 }}>
                    Contributing writer for Campus Chronicle covering {article.cat.toLowerCase()} and campus life at RIT.
                  </p>
                </div>
              </div>

              {/* Related articles */}
              {related.length > 0 && (
                <div style={{ border: '2px solid #1a1008', background: '#fffef7', overflow: 'hidden', marginBottom: 24 }}>
                  <div style={{ background: '#1a1008', color: '#fdf6e3', padding: '8px 14px', fontFamily: "'Source Sans 3',sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: '.15em', textTransform: 'uppercase' }}>
                    More in {article.cat}
                  </div>
                  {related.map((a, i) => (
                    <RelatedCard
                      key={a.id}
                      article={a}
                      isLast={i === related.length - 1}
                      onClick={() => onArticleClick && onArticleClick(a)}
                    />
                  ))}
                </div>
              )}

              {/* Newsletter */}
              <div style={{ padding: '18px 16px', background: '#f5ead0', border: '1px dashed #c8960c' }}>
                <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 15, fontWeight: 700, color: '#1a1008', marginBottom: 6 }}>📬 Stay Updated</div>
                <p style={{ fontFamily: "'Source Sans 3',sans-serif", fontSize: 11, color: '#6b5c4e', lineHeight: 1.6, marginBottom: 12 }}>
                  Get the latest campus news delivered to your inbox.
                </p>
                <input type="email" placeholder="your@campus.edu" style={{ width: '100%', padding: '8px 10px', border: '1.5px solid #1a1008', background: '#fffef7', fontFamily: "'Libre Baskerville',serif", fontSize: 12, color: '#1a1008', outline: 'none', marginBottom: 8 }} />
                <button style={{ width: '100%', padding: 8, background: '#c8960c', color: '#fff', border: 'none', fontFamily: "'Source Sans 3',sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', cursor: 'pointer' }}>
                  Subscribe
                </button>
              </div>
            </aside>
          </div>
        </div>

        {/* Footer */}
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

// ── Related article card ───────────────────────────────────────────────────
function RelatedCard({ article: a, isLast, onClick }) {
  const [hov, setHov] = useState(false)
  return (
    <div onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ padding: '12px 14px', borderBottom: isLast ? 'none' : '1px solid #e8dcc8', cursor: 'pointer', background: hov ? '#f5ead0' : 'transparent', transition: 'background .2s' }}>
      {a.img && <img src={a.img} alt="" style={{ width: '100%', height: 90, objectFit: 'cover', marginBottom: 8 }} onError={e => e.target.hidden = true} />}
      <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 13, fontWeight: 700, color: '#1a1008', lineHeight: 1.3, marginBottom: 5 }}>{a.hl}</div>
      <div style={{ fontFamily: "'Source Sans 3',sans-serif", fontSize: 10, color: '#6b5c4e' }}>{a.au} · {a.dt}</div>
    </div>
  )
}

// ── Top action button (PDF / TXT / Share) ─────────────────────────────────
function ActionBtn({ icon, label, color, onClick }) {
  const [hov, setHov] = useState(false)
  return (
    <button onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 12px', background: hov ? color : 'transparent', border: `1.5px solid ${color}`, color: hov ? '#fff' : color, fontFamily: "'Source Sans 3',sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', cursor: 'pointer', transition: 'all .2s', whiteSpace: 'nowrap' }}>
      {icon} {label}
    </button>
  )
}

// ── Bottom dark-bg outline button ─────────────────────────────────────────
function DarkOutlineBtn({ label, onClick }) {
  const [hov, setHov] = useState(false)
  return (
    <button onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ padding: '8px 16px', background: hov ? '#c8960c' : 'transparent', border: '1px solid #c8960c', color: hov ? '#1a1008' : '#c8960c', fontFamily: "'Source Sans 3',sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', cursor: 'pointer', transition: 'all .2s', whiteSpace: 'nowrap' }}>
      {label}
    </button>
  )
}
