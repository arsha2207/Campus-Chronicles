// ─────────────────────────────────────────────────────────────────────────────
//  EpaperPage.jsx
//  Front tab  → ALL articles, newest first, no pagination, full scroll
//  Other tabs → category-filtered articles, paginated (5 per page)
//  Pages modal → shows ALL sections with all their articles
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from 'react'
import { fetchArticles } from '../utils/api'
import { API_BASE } from '../utils/constants'

const SECTIONS = [
  { label: 'Front',       cats: ['All'],          front: true  },
  { label: 'Campus News', cats: ['Campus News'],  front: false },
  { label: 'Academics',   cats: ['Academics'],    front: false },
  { label: 'Sports',      cats: ['Sports'],       front: false },
  { label: 'Events',      cats: ['Events'],       front: false },
  { label: 'Opinion',     cats: ['Opinion'],      front: false },
  { label: 'Tech',        cats: ['Tech'],         front: false },
  { label: 'Culture',     cats: ['Culture'],      front: false },
]

const CAT_PER_PAGE = 5

// ─── jsPDF ────────────────────────────────────────────────────────────────────
function getJsPDF() {
  if (window.jspdf?.jsPDF) return window.jspdf.jsPDF
  if (window.jsPDF) return window.jsPDF
  throw new Error('jsPDF not loaded.')
}

function loadImageAsBase64(url) {
  return new Promise((resolve) => {
    if (!url) return resolve(null)
    const fullUrl = url.startsWith('http') ? url : `${API_BASE}${url}`
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas')
        canvas.width = img.naturalWidth
        canvas.height = img.naturalHeight
        canvas.getContext('2d').drawImage(img, 0, 0)
        resolve(canvas.toDataURL('image/jpeg', 0.85))
      } catch { resolve(null) }
    }
    img.onerror = () => resolve(null)
    img.src = fullUrl
  })
}

async function generatePDF(articles, sectionLabel = 'Full Edition') {
  const jsPDF = getJsPDF()
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const W = 210, margin = 14, colW = (W - margin * 2 - 8) / 2

  doc.setFont('times', 'bold'); doc.setFontSize(32); doc.setTextColor(0, 0, 0)
  doc.text('Campus Chronicles', W / 2, 20, { align: 'center' })
  doc.setFont('times', 'italic'); doc.setFontSize(8); doc.setTextColor(80, 80, 80)
  doc.text('The Voice of the Campus · Est. 2021', W / 2, 26, { align: 'center' })
  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  doc.setFont('times', 'normal'); doc.setFontSize(7.5)
  doc.text(`${today}  ·  ${sectionLabel}  ·  ${articles.length} Articles`, W / 2, 31, { align: 'center' })
  doc.setDrawColor(0); doc.setLineWidth(1.2); doc.line(margin, 34, W - margin, 34)
  doc.setLineWidth(0.3); doc.line(margin, 36, W - margin, 36)

  let y = 43
  const checkY = (need = 20) => { if (y + need > 280) { doc.addPage(); y = margin } }

  for (let i = 0; i < articles.length; i++) {
    const art = articles[i]
    const title    = art.title    || art.hl  || 'Untitled'
    const author   = art.author_name || art.au || 'Staff Reporter'
    const category = art.category || art.cat || 'Campus'
    const body     = art.content  || art.body || art.sm || ''
    const imgUrl   = art.image_url || art.img || null

    if (imgUrl) {
      const b64 = await loadImageAsBase64(imgUrl)
      if (b64) {
        checkY(55)
        const imgH = Math.min(70, (W - margin * 2) * 0.45)
        doc.addImage(b64, 'JPEG', margin, y, W - margin * 2, imgH)
        y += imgH + 4
      }
    }
    checkY(8); doc.setFont('times', 'bold'); doc.setFontSize(7); doc.setTextColor(180, 0, 0)
    doc.text(category.toUpperCase(), margin, y); y += 4.5
    doc.setFont('times', 'bold'); doc.setFontSize(14); doc.setTextColor(0, 0, 0)
    doc.splitTextToSize(title, W - margin * 2).forEach(l => { checkY(8); doc.text(l, margin, y); y += 6 })
    doc.setFont('times', 'italic'); doc.setFontSize(7.5); doc.setTextColor(80, 80, 80)
    doc.text(`By ${author}`, margin, y); y += 4.5
    doc.setDrawColor(180); doc.setLineWidth(0.2); doc.line(margin, y, W - margin, y); y += 4
    doc.setFont('times', 'normal'); doc.setFontSize(9); doc.setTextColor(30, 30, 30)
    const lines = doc.splitTextToSize(body, colW)
    let col = 0, colY = y, maxH = 80
    lines.forEach(l => {
      if (col === 0 && colY - y > maxH) { col = 1; colY = y }
      else if (col === 1 && colY - y > maxH) { doc.addPage(); y = margin; col = 0; colY = y }
      doc.text(l, margin + col * (colW + 8), colY); colY += 4
    })
    y = Math.max(y + 8, colY + 6)
    if (i < articles.length - 1) {
      checkY(10); doc.setDrawColor(0); doc.setLineWidth(0.4)
      doc.line(margin, y, W - margin, y); y += 8
    }
  }
  doc.save(
    sectionLabel === 'Full Edition'
      ? 'CampusChronicles_FullEdition.pdf'
      : `CampusChronicles_${sectionLabel.replace(/\s+/g, '_')}.pdf`
  )
}

// ─── Sort helper ──────────────────────────────────────────────────────────────
function sortNewest(articles) {
  return [...articles].sort((a, b) =>
    new Date(b.published_at || b.created_at || 0) -
    new Date(a.published_at || a.created_at || 0)
  )
}

// ─── Single article block ─────────────────────────────────────────────────────
function ArticleBlock({ art, isHero, onClick }) {
  const [hl, setHl] = useState(false)
  const title    = art.hl   || art.title       || 'Untitled'
  const author   = art.au   || art.author_name || 'Staff Reporter'
  const category = art.cat  || art.category    || 'Campus'
  const body     = art.sm   || art.content     || ''
  const img      = art.img  || art.image_url   || null
  const date     = art.dt   || (art.published_at
    ? new Date(art.published_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
    : '')

  return (
    <div style={{ cursor: 'pointer' }} onClick={onClick}>
      {img && (
        <img src={img} alt=""
          style={{ width: '100%', height: 'auto', maxHeight: 500, objectFit: 'contain', display: 'block', marginBottom: 12, border: '1px solid #e8e8e8', background: '#f5f5f5' }}
          onError={e => e.target.hidden = true}
        />
      )}
      <div style={{ fontFamily: "'Times New Roman', serif", fontSize: 9.5, fontWeight: 700, letterSpacing: '.22em', textTransform: 'uppercase', color: '#b5121b', marginBottom: 7 }}>
        {category}
      </div>
      <div
        onMouseEnter={() => setHl(true)}
        onMouseLeave={() => setHl(false)}
        style={{ fontFamily: "'Times New Roman', Georgia, serif", fontSize: isHero ? 34 : 20, fontWeight: 900, lineHeight: 1.13, color: hl ? '#b5121b' : '#000', marginBottom: 10, transition: 'color .18s' }}
      >
        {title}
      </div>
      <p style={{ fontFamily: "'Times New Roman', Georgia, serif", fontSize: isHero ? 14.5 : 13, color: '#222', lineHeight: 1.78, marginBottom: 10 }}>
        {body}
      </p>
      <div style={{ fontFamily: "'Times New Roman', serif", fontSize: 10.5, color: '#666', fontStyle: 'italic', borderTop: '1px solid #e8e8e8', paddingTop: 7 }}>
        By <strong style={{ fontStyle: 'normal', color: '#333' }}>{author}</strong>
        {date && <span> &nbsp;·&nbsp; {date}</span>}
      </div>
    </div>
  )
}

// ─── Section label rule ───────────────────────────────────────────────────────
const SectionRule = ({ label }) => (
  <div style={{ borderTop: '4px solid #000', borderBottom: '1px solid #000', padding: '4px 0', marginBottom: 24, display: 'flex', justifyContent: 'space-between' }}>
    <span style={{ fontFamily: "'Times New Roman', serif", fontSize: 11, fontWeight: 700, letterSpacing: '.2em', textTransform: 'uppercase' }}>
      {label}
    </span>
  </div>
)

// ─── Rows of 3 helper — used by both FrontPage and CategoryPage ───────────────
function ArticleRows({ articles, onArticleClick }) {
  const click = onArticleClick || (() => {})
  const rows = []
  for (let i = 0; i < articles.length; i += 3) {
    rows.push(articles.slice(i, i + 3))
  }
  return rows.map((row, rowIdx) => (
    <div key={rowIdx}>
      {rowIdx > 0 && <div style={{ borderTop: '1px solid #ddd', margin: '32px 0' }} />}
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${row.length}, 1fr)`, gap: '0 0', alignItems: 'start' }}>
        {row.map((a, colIdx) => (
          <div key={a.id} style={{ display: 'flex' }}>
            {colIdx > 0 && (
              <div style={{ width: 1, background: '#ccc', flexShrink: 0, marginRight: 24, alignSelf: 'stretch' }} />
            )}
            <div style={{ flex: 1 }}>
              <ArticleBlock art={a} isHero={false} onClick={() => click(a)} />
            </div>
          </div>
        ))}
      </div>
    </div>
  ))
}

// ─── FRONT PAGE ───────────────────────────────────────────────────────────────
function FrontPage({ articles, onArticleClick }) {
  if (!articles.length) return null
  const click = onArticleClick || (() => {})
  const sorted = sortNewest(articles)
  const [first, ...rest] = sorted

  return (
    <div style={{ background: '#fff', border: '1px solid #ccc', padding: '28px 36px', boxShadow: '0 2px 20px rgba(0,0,0,.08)' }}>
      <SectionRule label="Front Page" />

      {/* Hero — article 1, full width */}
      <div style={{ borderBottom: '2px double #000', paddingBottom: 32, marginBottom: 32 }}>
        <ArticleBlock art={first} isHero={true} onClick={() => click(first)} />
      </div>

      {/* All remaining — rows of 3, dynamic, no gaps */}
      <ArticleRows articles={rest} onArticleClick={onArticleClick} />
    </div>
  )
}

// ─── CATEGORY PAGE ────────────────────────────────────────────────────────────
function CategoryPage({ articles, onArticleClick, sectionLabel, currentPage, setCurrentPage }) {
  if (!articles.length) return null
  const click  = onArticleClick || (() => {})
  const sorted = sortNewest(articles)
  const total  = Math.ceil(sorted.length / CAT_PER_PAGE)
  const paged  = sorted.slice(currentPage * CAT_PER_PAGE, (currentPage + 1) * CAT_PER_PAGE)

  // All articles equal — rows of 3, no hero
  const rows = []
  for (let i = 0; i < paged.length; i += 3) {
    rows.push(paged.slice(i, i + 3))
  }

  return (
    <div>
      <div style={{ background: '#fff', border: '1px solid #ccc', padding: '28px 36px', boxShadow: '0 2px 20px rgba(0,0,0,.08)' }}>
        <SectionRule label={sectionLabel} />

        {rows.map((row, rowIdx) => (
          <div key={rowIdx}>
            {rowIdx > 0 && <div style={{ borderTop: '1px solid #ddd', margin: '32px 0' }} />}
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${row.length}, 1fr)`, gap: '0 0', alignItems: 'start' }}>
              {row.map((a, colIdx) => (
                <div key={a.id} style={{ display: 'flex' }}>
                  {colIdx > 0 && (
                    <div style={{ width: 1, background: '#ccc', flexShrink: 0, marginRight: 24, alignSelf: 'stretch' }} />
                  )}
                  <div style={{ flex: 1 }}>
                    <ArticleBlock art={a} isHero={false} onClick={() => click(a)} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {total > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, padding: '24px 0 32px' }}>
          <button className="ep-page-arrow"
            disabled={currentPage === 0}
            onClick={() => { setCurrentPage(p => p - 1); window.scrollTo(0, 0) }}
          >
            ‹ Previous
          </button>
          <div style={{ display: 'flex', gap: 6 }}>
            {Array.from({ length: total }).map((_, idx) => (
              <button key={idx}
                onClick={() => { setCurrentPage(idx); window.scrollTo(0, 0) }}
                style={{
                  width: idx === currentPage ? 28 : 8, height: 8, borderRadius: 4,
                  background: idx === currentPage ? '#b5121b' : '#bbb',
                  border: 'none', cursor: 'pointer', padding: 0,
                  transition: 'width .2s, background .2s',
                }}
              />
            ))}
          </div>
          <button className="ep-page-arrow"
            disabled={currentPage >= total - 1}
            onClick={() => { setCurrentPage(p => p + 1); window.scrollTo(0, 0) }}
          >
            Next ›
          </button>
        </div>
      )}
    </div>
  )
}
// ─── Main EpaperPage ──────────────────────────────────────────────────────────
export default function EpaperPage({ user, onBack, onArticleClick }) {
  const [activeSection,     setActiveSection]     = useState(0)
  const [allArticles,       setAllArticles]       = useState([])
  const [currentPage,       setCurrentPage]       = useState(0)
  const [loading,           setLoading]           = useState(true)
  const [showThumbs,        setShowThumbs]        = useState(false)
  const [pdfLoading,        setPdfLoading]        = useState(false)
  const [allSectionData,    setAllSectionData]    = useState({})  // { label: [articles] }
  const [thumbsLoading,     setThumbsLoading]     = useState(false)

  const section = SECTIONS[activeSection]
  const isFront = section.front

  // Load current section articles
  useEffect(() => {
    setLoading(true)
    setCurrentPage(0)
    const cat = section.cats[0] === 'All' ? 'All' : section.cats[0]
    fetchArticles(cat)
      .then(data => setAllArticles(data.articles || []))
      .catch(() => setAllArticles([]))
      .finally(() => setLoading(false))
  }, [activeSection])

  const sorted = sortNewest(allArticles)
  const totalPages = isFront ? 1 : Math.ceil(sorted.length / CAT_PER_PAGE)

  // Open pages modal — fetch ALL sections
  const openThumbs = async () => {
    setShowThumbs(true)
    if (Object.keys(allSectionData).length > 0) return // already loaded
    setThumbsLoading(true)
    try {
      const results = await Promise.all(
        SECTIONS.map(sec =>
          fetchArticles(sec.cats[0] === 'All' ? 'All' : sec.cats[0])
            .then(data => ({ label: sec.label, articles: sortNewest(data.articles || []) }))
            .catch(() => ({ label: sec.label, articles: [] }))
        )
      )
      const map = {}
      results.forEach(r => { map[r.label] = r.articles })
      setAllSectionData(map)
    } catch (e) { console.error(e) }
    finally { setThumbsLoading(false) }
  }

  const handleDownload = async () => {
    if (!sorted.length) return
    setPdfLoading(true)
    try { await generatePDF(sorted, section.label) }
    catch (e) { alert('PDF error: ' + e.message) }
    finally { setPdfLoading(false) }
  }

  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <div style={{ background: '#e8e8e8', minHeight: '100vh' }}>

      <style>{`
        .ep-tab {
          padding: 10px 22px;
          font-family: 'Times New Roman', Georgia, serif;
          font-size: 13.5px; font-weight: 700;
          cursor: pointer; color: #444;
          border-bottom: 3px solid transparent;
          background: none; border-top: none; border-left: none; border-right: none;
          transition: color .15s, border-color .15s;
          white-space: nowrap; user-select: none;
        }
        .ep-tab:hover { color: #000; }
        .ep-tab.active { color: #000; border-bottom-color: #b5121b; font-style: italic; }

        .ep-btn {
          padding: 5px 14px;
          font-family: 'Times New Roman', serif;
          font-size: 11px; font-weight: 700;
          border: 1.5px solid #555; background: #fff;
          cursor: pointer; color: #333;
          transition: background .15s, color .15s;
          white-space: nowrap;
        }
        .ep-btn:hover:not(:disabled) { background: #111; color: #fff; border-color: #111; }
        .ep-btn:disabled { opacity: .35; cursor: default; }
        .ep-btn-red { background: #b5121b; color: #fff; border-color: #b5121b; }
        .ep-btn-red:hover:not(:disabled) { background: #8b0e15; }

        .ep-page-arrow {
          font-family: 'Times New Roman', serif;
          font-size: 14px; font-weight: 700;
          padding: 8px 18px;
          border: 1.5px solid #ccc; background: #fff;
          cursor: pointer; color: #333;
          transition: background .15s, color .15s;
          display: flex; align-items: center; gap: 6px;
        }
        .ep-page-arrow:hover:not(:disabled) { background: #000; color: #fff; border-color: #000; }
        .ep-page-arrow:disabled { opacity: .3; cursor: default; }

        .ep-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.5); display: flex; align-items: center; justify-content: center; z-index: 9999; }
        .ep-spinner { width: 28px; height: 28px; border: 3px solid #ddd; border-top-color: #b5121b; border-radius: 50%; animation: ep-spin .7s linear infinite; margin: 12px auto 0; }
        @keyframes ep-spin { to { transform: rotate(360deg); } }

        .ep-thumb-bg { position: fixed; inset: 0; background: rgba(0,0,0,.6); display: flex; align-items: flex-start; justify-content: center; z-index: 1000; overflow-y: auto; padding: 40px 16px; }
        .ep-thumb-box { background: #fff; border: 1px solid #ccc; width: 100%; max-width: 960px; padding: 28px; }

        .ep-art-thumb {
          cursor: pointer;
          border: 1.5px solid #ddd;
          background: #fff; padding: 5px;
          transition: border-color .15s, box-shadow .15s;
        }
        .ep-art-thumb:hover { border-color: #b5121b; box-shadow: 0 0 0 2px rgba(181,18,27,.12); }

        @media (max-width: 800px) {
          .ep-tab { font-size: 11px; padding: 8px 10px; }
        }
      `}</style>

      {/* PDF overlay */}
      {pdfLoading && (
        <div className="ep-overlay">
          <div style={{ background: '#fff', border: '2px solid #000', padding: '32px 52px', textAlign: 'center' }}>
            <div style={{ fontFamily: "'Times New Roman', serif", fontSize: 22, fontWeight: 900 }}>Composing Edition…</div>
            <div style={{ fontFamily: 'sans-serif', fontSize: 11, color: '#666', marginTop: 6 }}>Typesetting articles into print layout</div>
            <div className="ep-spinner" />
          </div>
        </div>
      )}

      {/* ══ ALL SECTIONS MODAL ══ */}
      {showThumbs && (
        <div className="ep-thumb-bg" onClick={() => setShowThumbs(false)}>
          <div className="ep-thumb-box" onClick={e => e.stopPropagation()}>

            {/* Modal header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '3px solid #000', paddingBottom: 14, marginBottom: 24 }}>
              <div>
                <div style={{ fontFamily: "'Times New Roman', serif", fontSize: 22, fontWeight: 900 }}>All Sections</div>
                <div style={{ fontFamily: 'sans-serif', fontSize: 11, color: '#777', marginTop: 3 }}>
                  {SECTIONS.length} sections · click any article to jump to that section
                </div>
              </div>
              <button className="ep-btn" onClick={() => setShowThumbs(false)}>✕ Close</button>
            </div>

            {/* Loading spinner */}
            {thumbsLoading ? (
              <div style={{ textAlign: 'center', padding: '48px 0' }}>
                <div className="ep-spinner" style={{ margin: '0 auto' }} />
                <div style={{ fontFamily: 'sans-serif', fontSize: 12, color: '#999', marginTop: 14 }}>Loading all sections…</div>
              </div>
            ) : (
              /* Each section block */
              SECTIONS.map((sec, secIdx) => {
                const arts = allSectionData[sec.label] || []
                return (
                  <div key={sec.label} style={{ marginBottom: 32 }}>

                    {/* Section heading */}
                    <div style={{
                      borderTop: secIdx === 0 ? '2px solid #000' : '1px solid #ddd',
                      paddingTop: 16, marginBottom: 14,
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    }}>
                      <span style={{
                        fontFamily: "'Times New Roman', serif",
                        fontSize: 14, fontWeight: 700,
                        letterSpacing: '.15em', textTransform: 'uppercase',
                        color: activeSection === secIdx ? '#b5121b' : '#000',
                      }}>
                        {sec.label}
                      </span>
                      <span style={{ fontFamily: 'sans-serif', fontSize: 10, color: '#999' }}>
                        {arts.length} article{arts.length !== 1 ? 's' : ''}
                      </span>
                    </div>

                    {/* Article thumbnails */}
                    {arts.length === 0 ? (
                      <div style={{ fontFamily: 'sans-serif', fontSize: 11, color: '#ccc', padding: '8px 0 4px' }}>
                        No articles yet
                      </div>
                    ) : (
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                        gap: 10,
                      }}>
                        {arts.map((a, artIdx) => (
                          <div
                            key={a.id || artIdx}
                            className="ep-art-thumb"
                            onClick={() => {
                              setActiveSection(secIdx)
                              setCurrentPage(0)
                              setShowThumbs(false)
                              window.scrollTo(0, 0)
                            }}
                          >
                            {/* Thumbnail image */}
                            <div style={{ height: 80, overflow: 'hidden', background: '#f0f0f0', marginBottom: 6, position: 'relative' }}>
                              {a.img || a.image_url
                                ? <img
                                    src={a.img || a.image_url} alt=""
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    onError={e => e.target.hidden = true}
                                  />
                                : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '0 6px', fontFamily: 'Times New Roman, serif', fontSize: 9, color: '#aaa', textAlign: 'center' }}>
                                    {a.hl || a.title || '—'}
                                  </div>
                              }
                              {/* Section badge */}
                              <div style={{ position: 'absolute', top: 3, left: 3, background: activeSection === secIdx ? '#b5121b' : '#000', color: '#fff', fontFamily: 'sans-serif', fontSize: 7, fontWeight: 700, padding: '1px 4px' }}>
                                {sec.label}
                              </div>
                            </div>
                            {/* Article title */}
                            <div style={{ fontFamily: 'Times New Roman, serif', fontSize: 10, color: '#222', lineHeight: 1.35, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                              {a.hl || a.title}
                            </div>
                            {/* Byline */}
                            <div style={{ fontFamily: 'sans-serif', fontSize: 8.5, color: '#888', marginTop: 3 }}>
                              {a.au || a.author_name || 'Staff'}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}

      {/* ══ UTILITY BAR ══ */}
      <div style={{ background: '#fff', borderBottom: '1px solid #ddd', padding: '6px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, position: 'sticky', top: 0, zIndex: 200, boxShadow: '0 1px 4px rgba(0,0,0,.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="ep-btn" onClick={onBack}>← Back to Home</button>
          <span style={{ fontFamily: 'sans-serif', fontSize: 10, color: '#aaa', letterSpacing: '.1em', textTransform: 'uppercase' }}>e-Paper</span>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button className="ep-btn" onClick={openThumbs}>☰ Pages</button>
          <button className="ep-btn ep-btn-red" onClick={handleDownload} disabled={pdfLoading || loading || !sorted.length}>⬇ Download PDF</button>
        </div>
      </div>

      {/* ══ MASTHEAD ══ */}
      <div style={{ background: '#fff', borderBottom: '1px solid #ccc' }}>
        <div style={{ maxWidth: 1240, margin: '0 auto', padding: '20px 36px 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
            <div style={{ fontFamily: 'sans-serif', fontSize: 10, color: '#555', lineHeight: 1.8 }}>
              <div style={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.12em', fontSize: 9 }}>
                {new Date().toLocaleDateString('en-IN', { weekday: 'long' })}
              </div>
              <div>{new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
              <div style={{ color: '#999', fontStyle: 'italic' }}>Campus Edition</div>
            </div>

            <div style={{ textAlign: 'center', flex: 1, minWidth: 240 }}>
              <div style={{ fontFamily: "'Times New Roman', 'Georgia', serif", fontSize: 'clamp(42px, 7vw, 82px)', fontWeight: 900, color: '#000', lineHeight: 1, letterSpacing: '-1px', marginBottom: 6 }}>
                Campus Chronicles
              </div>
              <div style={{ fontFamily: "'Times New Roman', Georgia, serif", fontSize: 12, color: '#555', fontStyle: 'italic', letterSpacing: '.1em' }}>
                The Voice of the Campus &nbsp;·&nbsp; Est. 2021
              </div>
            </div>

            <div style={{ fontFamily: 'sans-serif', fontSize: 10, color: '#555', lineHeight: 1.8, textAlign: 'right' }}>
              <div style={{ fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', fontSize: 9 }}>RIT, Kottayam</div>
              <div>{sorted.length} Article{sorted.length !== 1 ? 's' : ''}</div>
              <div style={{ color: '#999', fontStyle: 'italic' }}>Vol. 1</div>
            </div>
          </div>
          <div style={{ borderTop: '4px solid #000' }} />
          <div style={{ borderTop: '1px solid #000', marginTop: 3 }} />
        </div>
      </div>

      {/* ══ SECTION TABS ══ */}
      <div style={{ background: '#fff', borderBottom: '2px solid #000', overflowX: 'auto', position: 'sticky', top: 45, zIndex: 100, boxShadow: '0 2px 6px rgba(0,0,0,.06)' }}>
        <div style={{ display: 'flex', maxWidth: 1240, margin: '0 auto' }}>
          {SECTIONS.map((sec, idx) => (
            <button key={sec.label}
              className={`ep-tab${activeSection === idx ? ' active' : ''}`}
              onClick={() => setActiveSection(idx)}
            >
              {sec.label}
            </button>
          ))}
        </div>
      </div>

      {/* ══ CONTENT ══ */}
      <div style={{ maxWidth: 1240, margin: '0 auto', padding: '28px 16px 20px' }}>
        {loading ? (
          <div style={{ background: '#fff', border: '1px solid #ddd', padding: '100px 40px', textAlign: 'center' }}>
            <div className="ep-spinner" style={{ margin: '0 auto 16px' }} />
            <div style={{ fontFamily: 'sans-serif', fontSize: 13, color: '#999' }}>Loading articles…</div>
          </div>
        ) : !sorted.length ? (
          <div style={{ background: '#fff', border: '1px solid #ddd', padding: '100px 40px', textAlign: 'center' }}>
            <div style={{ fontFamily: "'Times New Roman', serif", fontSize: 24, color: '#999', marginBottom: 10, fontStyle: 'italic' }}>No articles in this section yet</div>
            <div style={{ fontFamily: 'sans-serif', fontSize: 13, color: '#bbb' }}>Check back later or browse another section</div>
          </div>
        ) : isFront ? (
          <FrontPage articles={sorted} onArticleClick={onArticleClick} />
        ) : (
          <CategoryPage
            articles={sorted}
            onArticleClick={onArticleClick}
            sectionLabel={section.label}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
          />
        )}
      </div>

      {/* Footer */}
      <div style={{ background: '#111', color: '#888', padding: '16px 28px', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, fontFamily: 'sans-serif', fontSize: 10 }}>
        <span>© 2025 Campus Chronicles · The Voice of the Campus · Est. 2021</span>
        <span>e-Paper Edition · {today}</span>
      </div>
    </div>
  )
}