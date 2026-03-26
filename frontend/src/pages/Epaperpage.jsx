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

function sortNewest(arts) {
  return [...arts].sort((a, b) =>
    new Date(b.published_at || b.created_at || 0) - new Date(a.published_at || a.created_at || 0))
}

// ─── shared CSS ───────────────────────────────────────────────────────────────
const PRINT_CSS = `
*{margin:0;padding:0;box-sizing:border-box;}
body{font-family:'Times New Roman',Times,serif;color:#000;font-size:9pt;background:#fff;}
img{display:block;width:100%;height:auto;max-height:150px;object-fit:contain;margin-bottom:3px;background:#f5f5f5;}
img.hero-img{max-height:220px;}
.ki{font-size:6pt;font-weight:700;letter-spacing:.18em;color:#b5121b;text-transform:uppercase;margin-bottom:1px;}
.hl{font-size:11pt;font-weight:900;line-height:1.1;margin-bottom:1px;}
.hl.big{font-size:16pt;}
.by{font-size:7pt;color:#555;font-style:italic;margin-bottom:2px;}
.bd{font-size:8.5pt;line-height:1.45;color:#111;text-align:justify;}
.hr{border-top:1px solid #ccc;margin:3px 0;}
.hr.dbl{border-top:2px double #000;margin:4px 0;}
.row{display:flex;align-items:flex-start;}
.col{flex:1;padding:0 5px;}
.col:first-child{padding-left:0;}
.col:last-child{padding-right:0;}
.col+.col{border-left:1px solid #bbb;}
.mh{text-align:center;border-bottom:3px solid #000;padding-bottom:3px;margin-bottom:2px;}
.mh-name{font-size:36pt;font-weight:900;letter-spacing:-1px;line-height:1;}
.mh-sub{font-size:7.5pt;font-style:italic;color:#444;}
.mh-meta{display:flex;justify-content:space-between;font-size:7pt;color:#555;border-top:1px solid #000;padding-top:2px;margin-top:2px;}
.cat-bar{display:flex;justify-content:space-between;align-items:baseline;border-bottom:2px solid #000;padding-bottom:2px;margin-bottom:2px;margin-top:8px;}
.cat-nm{font-size:12pt;font-weight:900;}
.cat-dt{font-size:6.5pt;color:#555;}
.sec{border-top:2px solid #000;border-bottom:1px solid #000;padding:1px 0;font-size:7pt;font-weight:700;letter-spacing:.18em;text-transform:uppercase;margin-bottom:3px;}
@page{size:A4;margin:7mm 9mm;}
@media print{body{padding:0;}}
`

function iSrc(url) {
  if (!url) return null
  return url.startsWith('http') ? url : `${API_BASE}${url}`
}

function artBlock(a, big = false) {
  const img  = iSrc(a.image_url || a.img)
  const cat  = (a.category || a.cat || 'Campus').toUpperCase()
  const hl   = a.title || a.hl || ''
  const auth = a.author_name || a.au || 'Staff'
  const dt   = a.dt || ''
  const body = a.content || a.body || a.sm || ''
  return `
    ${img ? `<img src="${img}"${big ? ' class="hero-img"' : ''} />` : ''}
    <div class="ki">${cat}</div>
    <div class="hl${big ? ' big' : ''}">${hl}</div>
    <div class="by">By <strong>${auth}</strong>${dt ? ' · ' + dt : ''}</div>
    <div class="bd">${big ? body : body.slice(0, 220) + (body.length > 220 ? '…' : '')}</div>`
}

function artBlockFull(a) {
  const img  = iSrc(a.image_url || a.img)
  const cat  = (a.category || a.cat || 'Campus').toUpperCase()
  const hl   = a.title || a.hl || ''
  const auth = a.author_name || a.au || 'Staff'
  const dt   = a.dt || ''
  const body = a.content || a.body || a.sm || ''
  return `
    ${img ? `<img src="${img}" class="hero-img" />` : ''}
    <div class="ki">${cat}</div>
    <div class="hl big">${hl}</div>
    <div class="by">By <strong>${auth}</strong>${dt ? ' · ' + dt : ''}</div>
    <div class="bd">${body}</div>`
}

// ─── shared category content builder ─────────────────────────────────────────
function buildCatContent(arts) {
  const s = sortNewest(arts)
  if (s.length === 1) {
    return artBlockFull(s[0])
  }
  if (s.length === 2) {
    return `<div class="row">
      <div class="col">${artBlockFull(s[0])}</div>
      <div class="col">${artBlockFull(s[1])}</div>
    </div>`
  }
  // 3+ — first full width, rest in 2-col rows
  const [first, ...rest] = s
  const rows = []
  for (let i = 0; i < rest.length; i += 2) rows.push(rest.slice(i, i + 2))
  return artBlockFull(first) + rows.map(row => `
    <div class="hr"></div>
    <div class="row">
      ${row.map(a => `<div class="col">${artBlockFull(a)}</div>`).join('')}
    </div>`).join('')
}

// ─── Front page HTML ──────────────────────────────────────────────────────────
function buildFront(arts, today, count) {
  const s = sortNewest(arts)
  const [hero, ...rest] = s
  const rows = []
  for (let i = 0; i < rest.length; i += 3) rows.push(rest.slice(i, i + 3))

  return `
    <div class="mh">
      <div class="mh-name">Campus Chronicles</div>
      <div class="mh-sub">The Voice of the Campus · Est. 2021</div>
      <div class="mh-meta"><span>${today}</span><span>Vol. 1 · ${count} Articles</span><span>RIT, Kottayam</span></div>
    </div>
    <div class="sec">Front Page</div>
    ${artBlock(hero, true)}
    ${rows.map(row => `
      <div class="hr dbl"></div>
      <div class="row">
        ${row.map(a => `<div class="col">${artBlock(a, false)}</div>`).join('')}
      </div>`).join('')}`
}

// ─── Category page HTML (used by printSectionOnly) ────────────────────────────
function buildCat(label, arts, today, isFirst = false) {
  return `
    <div style="margin-top:6px;">
      <div class="cat-bar">
        <span class="cat-nm">Campus Chronicles · ${label}</span>
        <span class="cat-dt">${today} · RIT, Kottayam</span>
      </div>
      ${buildCatContent(arts)}
    </div>
    <div class="hr dbl"></div>`
}

function openPrint(body, title) {
  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"/>
<title>${title}</title><style>${PRINT_CSS}</style></head>
<body>${body}<script>window.onload=function(){window.print();}<\/script></body></html>`
  const w = window.open('', '_blank', 'width=900,height=700')
  w.document.write(html)
  w.document.close()
}

// ─── Full newspaper — smart page breaks ───────────────────────────────────────
function printFullNewspaper(allArts, catMap) {
  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  const front = buildFront(allArts, today, allArts.length)

  const catEntries = Object.entries(catMap).filter(([, a]) => a.length)

  const catsHTML = catEntries.map(([label, arts], idx) => {
    const prevArts = idx > 0 ? catEntries[idx - 1][1] : []
    // Count prev category size: article with image = 3 units, without = 2
    const prevSize = prevArts.reduce((sum, a) => sum + (a.image_url || a.img ? 3 : 2), 0)
    // If prev category was large (> 4 units = more than half page), force new page
    const needsNewPage = idx > 0 && prevSize > 8

    const s2 = sortNewest(arts)
    let catContent = ''
    if (s2.length === 1) {
      catContent = artBlockFull(s2[0])
    } else if (s2.length === 2) {
      catContent = `<div class="row">
        <div class="col">${artBlockFull(s2[0])}</div>
        <div class="col">${artBlockFull(s2[1])}</div>
      </div>`
    } else {
      const [first2, ...rest2] = s2
      const rows2 = []
      for (let i = 0; i < rest2.length; i += 2) rows2.push(rest2.slice(i, i + 2))
      catContent = artBlockFull(first2) + rows2.map(row => `
        <div class="hr"></div>
        <div class="row">${row.map(a => `<div class="col">${artBlockFull(a)}</div>`).join('')}</div>`).join('')
    }

    return `
      <div style="margin-top:6px;${needsNewPage ? 'page-break-before:always;' : ''}">
        <div class="cat-bar">
          <span class="cat-nm">Campus Chronicles · ${label}</span>
          <span class="cat-dt">${today} · RIT, Kottayam</span>
        </div>
        ${catContent}
      </div>
      <div class="hr dbl"></div>`
  }).join('')

  openPrint(front + catsHTML, 'Campus Chronicles — Full Edition')
}

function printSectionOnly(arts, label) {
  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  openPrint(buildCat(label, arts, today, true), `Campus Chronicles — ${label}`)
}

function printFrontOnly(arts) {
  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  openPrint(buildFront(arts, today, arts.length), 'Campus Chronicles — Front Page')
}

// ─── Screen components ────────────────────────────────────────────────────────
function ArticleBlock({ art, isHero, onClick }) {
  const [hl, setHl] = useState(false)
  const title    = art.hl || art.title || 'Untitled'
  const author   = art.au || art.author_name || 'Staff Reporter'
  const category = art.cat || art.category || 'Campus'
  const body     = art.sm || art.content || ''
  const img      = art.img || art.image_url || null
  const date     = art.dt || (art.published_at
    ? new Date(art.published_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
    : '')
  return (
    <div style={{ cursor: 'pointer' }} onClick={onClick}>
      {img && <img src={img} alt="" style={{ width: '100%', height: 'auto', objectFit: 'contain', display: 'block', marginBottom: 8, border: '1px solid #e8e8e8', background: '#f5f5f5' }} onError={e => e.target.hidden = true} />}
      <div style={{ fontFamily: "'Times New Roman',serif", fontSize: 9.5, fontWeight: 700, letterSpacing: '.22em', textTransform: 'uppercase', color: '#b5121b', marginBottom: 4 }}>{category}</div>
      <div onMouseEnter={() => setHl(true)} onMouseLeave={() => setHl(false)} style={{ fontFamily: "'Times New Roman',Georgia,serif", fontSize: isHero ? 30 : 18, fontWeight: 900, lineHeight: 1.13, color: hl ? '#b5121b' : '#000', marginBottom: 6, transition: 'color .18s' }}>{title}</div>
      <p style={{ fontFamily: "'Times New Roman',Georgia,serif", fontSize: isHero ? 13.5 : 12.5, color: '#222', lineHeight: 1.65, marginBottom: 6 }}>{body}</p>
      <div style={{ fontFamily: "'Times New Roman',serif", fontSize: 10, color: '#666', fontStyle: 'italic', borderTop: '1px solid #e8e8e8', paddingTop: 5 }}>
        By <strong style={{ fontStyle: 'normal', color: '#333' }}>{author}</strong>
        {date && <span> &nbsp;·&nbsp; {date}</span>}
      </div>
    </div>
  )
}

const SectionRule = ({ label, action }) => (
  <div style={{ borderTop: '4px solid #000', borderBottom: '1px solid #000', padding: '3px 0', marginBottom: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
    <span style={{ fontFamily: "'Times New Roman',serif", fontSize: 11, fontWeight: 700, letterSpacing: '.2em', textTransform: 'uppercase' }}>{label}</span>
    {action}
  </div>
)

function ArticleRows({ articles, onArticleClick }) {
  const click = onArticleClick || (() => {})
  const rows = []
  for (let i = 0; i < articles.length; i += 3) rows.push(articles.slice(i, i + 3))
  return rows.map((row, ri) => (
    <div key={ri}>
      {ri > 0 && <div style={{ borderTop: '1px solid #ddd', margin: '14px 0' }} />}
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${row.length}, 1fr)`, alignItems: 'start' }}>
        {row.map((a, ci) => (
          <div key={a.id} style={{ display: 'flex' }}>
            {ci > 0 && <div style={{ width: 1, background: '#ccc', flexShrink: 0, marginRight: 14, alignSelf: 'stretch' }} />}
            <div style={{ flex: 1 }}><ArticleBlock art={a} isHero={false} onClick={() => click(a)} /></div>
          </div>
        ))}
      </div>
    </div>
  ))
}

function FrontPage({ articles, onArticleClick }) {
  if (!articles.length) return null
  const click = onArticleClick || (() => {})
  const sorted = sortNewest(articles)
  const [first, ...rest] = sorted
  return (
    <div style={{ background: '#fff', border: '1px solid #ccc', padding: '20px 28px', boxShadow: '0 2px 20px rgba(0,0,0,.08)' }}>
      <SectionRule label="Front Page" />
      <div style={{ borderBottom: '2px double #000', paddingBottom: 16, marginBottom: 16 }}>
        <ArticleBlock art={first} isHero={true} onClick={() => click(first)} />
      </div>
      <ArticleRows articles={rest} onArticleClick={onArticleClick} />
    </div>
  )
}

function CategoryPage({ articles, onArticleClick, sectionLabel, currentPage, setCurrentPage, onDownload }) {
  if (!articles.length) return null
  const click  = onArticleClick || (() => {})
  const sorted = sortNewest(articles)
  const total  = Math.ceil(sorted.length / CAT_PER_PAGE)
  const paged  = sorted.slice(currentPage * CAT_PER_PAGE, (currentPage + 1) * CAT_PER_PAGE)
  const rows = []
  for (let i = 0; i < paged.length; i += 3) rows.push(paged.slice(i, i + 3))
  return (
    <div>
      <div style={{ background: '#fff', border: '1px solid #ccc', padding: '20px 28px', boxShadow: '0 2px 20px rgba(0,0,0,.08)' }}>
        <SectionRule label={sectionLabel} action={
          <button className="ep-btn ep-btn-red" style={{ fontSize: 10, padding: '3px 10px' }} onClick={onDownload}>
            ⬇ Download {sectionLabel} PDF
          </button>
        } />
        {rows.map((row, ri) => (
          <div key={ri}>
            {ri > 0 && <div style={{ borderTop: '1px solid #ddd', margin: '14px 0' }} />}
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${row.length}, 1fr)`, alignItems: 'start' }}>
              {row.map((a, ci) => (
                <div key={a.id} style={{ display: 'flex' }}>
                  {ci > 0 && <div style={{ width: 1, background: '#ccc', flexShrink: 0, marginRight: 14, alignSelf: 'stretch' }} />}
                  <div style={{ flex: 1 }}><ArticleBlock art={a} isHero={false} onClick={() => click(a)} /></div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      {total > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, padding: '16px 0 24px' }}>
          <button className="ep-page-arrow" disabled={currentPage === 0}
            onClick={() => { setCurrentPage(p => p - 1); window.scrollTo(0, 0) }}>‹ Previous</button>
          <div style={{ display: 'flex', gap: 6 }}>
            {Array.from({ length: total }).map((_, idx) => (
              <button key={idx} onClick={() => { setCurrentPage(idx); window.scrollTo(0, 0) }}
                style={{ width: idx === currentPage ? 28 : 8, height: 8, borderRadius: 4, background: idx === currentPage ? '#b5121b' : '#bbb', border: 'none', cursor: 'pointer', padding: 0, transition: 'width .2s,background .2s' }} />
            ))}
          </div>
          <button className="ep-page-arrow" disabled={currentPage >= total - 1}
            onClick={() => { setCurrentPage(p => p + 1); window.scrollTo(0, 0) }}>Next ›</button>
        </div>
      )}
    </div>
  )
}

export default function EpaperPage({ user, onBack, onArticleClick }) {
  const [activeSection,  setActiveSection]  = useState(0)
  const [allArticles,    setAllArticles]    = useState([])
  const [currentPage,    setCurrentPage]    = useState(0)
  const [loading,        setLoading]        = useState(true)
  const [showThumbs,     setShowThumbs]     = useState(false)
  const [allSectionData, setAllSectionData] = useState({})
  const [thumbsLoading,  setThumbsLoading]  = useState(false)
  const [dlLoading,      setDlLoading]      = useState(false)

  const section = SECTIONS[activeSection]
  const isFront = section.front

  useEffect(() => {
    setLoading(true)
    setCurrentPage(0)
    fetchArticles(section.cats[0] === 'All' ? 'All' : section.cats[0])
      .then(data => setAllArticles(data.articles || []))
      .catch(() => setAllArticles([]))
      .finally(() => setLoading(false))
  }, [activeSection])

  const sorted = sortNewest(allArticles)

  const openThumbs = async () => {
    setShowThumbs(true)
    if (Object.keys(allSectionData).length > 0) return
    setThumbsLoading(true)
    try {
      const results = await Promise.all(SECTIONS.map(sec =>
        fetchArticles(sec.cats[0] === 'All' ? 'All' : sec.cats[0])
          .then(data => ({ label: sec.label, articles: sortNewest(data.articles || []) }))
          .catch(() => ({ label: sec.label, articles: [] }))
      ))
      const map = {}
      results.forEach(r => { map[r.label] = r.articles })
      setAllSectionData(map)
    } catch (e) { console.error(e) }
    finally { setThumbsLoading(false) }
  }

  const handleDownloadFull = async () => {
    setDlLoading(true)
    try {
      const allData = await fetchArticles('All').then(d => d.articles || [])
      const catMap = {}
      await Promise.all(SECTIONS.filter(s => !s.front).map(async sec => {
        const data = await fetchArticles(sec.cats[0]).then(d => d.articles || []).catch(() => [])
        if (data.length) catMap[sec.label] = data
      }))
      printFullNewspaper(allData, catMap)
    } catch (e) { alert('Error: ' + e.message) }
    finally { setDlLoading(false) }
  }

  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <div style={{ background: '#e8e8e8', minHeight: '100vh' }}>
      <style>{`
        .ep-tab{padding:10px 22px;font-family:'Times New Roman',Georgia,serif;font-size:13.5px;font-weight:700;cursor:pointer;color:#444;border-bottom:3px solid transparent;background:none;border-top:none;border-left:none;border-right:none;transition:color .15s,border-color .15s;white-space:nowrap;user-select:none;}
        .ep-tab:hover{color:#000;}.ep-tab.active{color:#000;border-bottom-color:#b5121b;font-style:italic;}
        .ep-btn{padding:5px 14px;font-family:'Times New Roman',serif;font-size:11px;font-weight:700;border:1.5px solid #555;background:#fff;cursor:pointer;color:#333;transition:background .15s,color .15s;white-space:nowrap;}
        .ep-btn:hover:not(:disabled){background:#111;color:#fff;border-color:#111;}
        .ep-btn:disabled{opacity:.35;cursor:default;}
        .ep-btn-red{background:#b5121b;color:#fff;border-color:#b5121b;}
        .ep-btn-red:hover:not(:disabled){background:#8b0e15;}
        .ep-page-arrow{font-family:'Times New Roman',serif;font-size:14px;font-weight:700;padding:8px 18px;border:1.5px solid #ccc;background:#fff;cursor:pointer;color:#333;transition:background .15s,color .15s;display:flex;align-items:center;gap:6px;}
        .ep-page-arrow:hover:not(:disabled){background:#000;color:#fff;border-color:#000;}
        .ep-page-arrow:disabled{opacity:.3;cursor:default;}
        .ep-overlay{position:fixed;inset:0;background:rgba(0,0,0,.5);display:flex;align-items:center;justify-content:center;z-index:9999;}
        .ep-spinner{width:28px;height:28px;border:3px solid #ddd;border-top-color:#b5121b;border-radius:50%;animation:ep-spin .7s linear infinite;margin:12px auto 0;}
        @keyframes ep-spin{to{transform:rotate(360deg);}}
        .ep-thumb-bg{position:fixed;inset:0;background:rgba(0,0,0,.6);display:flex;align-items:flex-start;justify-content:center;z-index:1000;overflow-y:auto;padding:40px 16px;}
        .ep-thumb-box{background:#fff;border:1px solid #ccc;width:100%;max-width:960px;padding:28px;}
        .ep-art-thumb{cursor:pointer;border:1.5px solid #ddd;background:#fff;padding:5px;transition:border-color .15s,box-shadow .15s;}
        .ep-art-thumb:hover{border-color:#b5121b;box-shadow:0 0 0 2px rgba(181,18,27,.12);}
        @media(max-width:800px){.ep-tab{font-size:11px;padding:8px 10px;}}
      `}</style>

      {dlLoading && (
        <div className="ep-overlay">
          <div style={{ background: '#fff', border: '2px solid #000', padding: '32px 52px', textAlign: 'center' }}>
            <div style={{ fontFamily: "'Times New Roman',serif", fontSize: 22, fontWeight: 900 }}>Preparing Newspaper…</div>
            <div className="ep-spinner" />
          </div>
        </div>
      )}

      {showThumbs && (
        <div className="ep-thumb-bg" onClick={() => setShowThumbs(false)}>
          <div className="ep-thumb-box" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '3px solid #000', paddingBottom: 14, marginBottom: 24 }}>
              <div>
                <div style={{ fontFamily: "'Times New Roman',serif", fontSize: 22, fontWeight: 900 }}>All Sections</div>
                <div style={{ fontFamily: 'sans-serif', fontSize: 11, color: '#777', marginTop: 3 }}>{SECTIONS.length} sections · click any to jump there</div>
              </div>
              <button className="ep-btn" onClick={() => setShowThumbs(false)}>✕ Close</button>
            </div>
            {thumbsLoading ? (
              <div style={{ textAlign: 'center', padding: '48px 0' }}>
                <div className="ep-spinner" style={{ margin: '0 auto' }} />
              </div>
            ) : SECTIONS.map((sec, secIdx) => {
              const arts = allSectionData[sec.label] || []
              return (
                <div key={sec.label} style={{ marginBottom: 24 }}>
                  <div style={{ borderTop: secIdx === 0 ? '2px solid #000' : '1px solid #ddd', paddingTop: 12, marginBottom: 10, display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontFamily: "'Times New Roman',serif", fontSize: 14, fontWeight: 700, letterSpacing: '.15em', textTransform: 'uppercase', color: activeSection === secIdx ? '#b5121b' : '#000' }}>{sec.label}</span>
                    <span style={{ fontFamily: 'sans-serif', fontSize: 10, color: '#999' }}>{arts.length} article{arts.length !== 1 ? 's' : ''}</span>
                  </div>
                  {arts.length === 0 ? (
                    <div style={{ fontFamily: 'sans-serif', fontSize: 11, color: '#ccc' }}>No articles yet</div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 10 }}>
                      {arts.map((a, ai) => (
                        <div key={a.id || ai} className="ep-art-thumb"
                          onClick={() => { setActiveSection(secIdx); setCurrentPage(0); setShowThumbs(false); window.scrollTo(0, 0) }}>
                          <div style={{ height: 80, overflow: 'hidden', background: '#f0f0f0', marginBottom: 6, position: 'relative' }}>
                            {a.img || a.image_url
                              ? <img src={a.img || a.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => e.target.hidden = true} />
                              : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '0 6px', fontFamily: 'Times New Roman,serif', fontSize: 9, color: '#aaa', textAlign: 'center' }}>{a.hl || a.title || '—'}</div>
                            }
                            <div style={{ position: 'absolute', top: 3, left: 3, background: activeSection === secIdx ? '#b5121b' : '#000', color: '#fff', fontFamily: 'sans-serif', fontSize: 7, fontWeight: 700, padding: '1px 4px' }}>{sec.label}</div>
                          </div>
                          <div style={{ fontFamily: 'Times New Roman,serif', fontSize: 10, color: '#222', lineHeight: 1.35, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{a.hl || a.title}</div>
                          <div style={{ fontFamily: 'sans-serif', fontSize: 8.5, color: '#888', marginTop: 3 }}>{a.au || a.author_name || 'Staff'}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* UTILITY BAR */}
      <div style={{ background: '#fff', borderBottom: '1px solid #ddd', padding: '6px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, position: 'sticky', top: 0, zIndex: 200, boxShadow: '0 1px 4px rgba(0,0,0,.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="ep-btn" onClick={onBack}>← Back to Home</button>
          <span style={{ fontFamily: 'sans-serif', fontSize: 10, color: '#aaa', letterSpacing: '.1em', textTransform: 'uppercase' }}>e-Paper</span>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button className="ep-btn" onClick={openThumbs}>☰ Pages</button>
          {isFront && <button className="ep-btn" onClick={() => printFrontOnly(sorted)} disabled={!sorted.length}>⬇ Download Front Page</button>}
          <button className="ep-btn ep-btn-red" onClick={handleDownloadFull} disabled={dlLoading}>{dlLoading ? 'Preparing…' : '⬇ Download Full Newspaper'}</button>
        </div>
      </div>

      {/* MASTHEAD */}
      <div style={{ background: '#fff', borderBottom: '1px solid #ccc' }}>
        <div style={{ maxWidth: 1240, margin: '0 auto', padding: '20px 36px 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
            <div style={{ fontFamily: 'sans-serif', fontSize: 10, color: '#555', lineHeight: 1.8 }}>
              <div style={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.12em', fontSize: 9 }}>{new Date().toLocaleDateString('en-IN', { weekday: 'long' })}</div>
              <div>{new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
              <div style={{ color: '#999', fontStyle: 'italic' }}>Campus Edition</div>
            </div>
            <div style={{ textAlign: 'center', flex: 1, minWidth: 240 }}>
              <div style={{ fontFamily: "'Times New Roman','Georgia',serif", fontSize: 'clamp(42px,7vw,82px)', fontWeight: 900, color: '#000', lineHeight: 1, letterSpacing: '-1px', marginBottom: 6 }}>Campus Chronicles</div>
              <div style={{ fontFamily: "'Times New Roman',Georgia,serif", fontSize: 12, color: '#555', fontStyle: 'italic', letterSpacing: '.1em' }}>The Voice of the Campus &nbsp;·&nbsp; Est. 2021</div>
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

      {/* SECTION TABS */}
      <div style={{ background: '#fff', borderBottom: '2px solid #000', overflowX: 'auto', position: 'sticky', top: 45, zIndex: 100, boxShadow: '0 2px 6px rgba(0,0,0,.06)' }}>
        <div style={{ display: 'flex', maxWidth: 1240, margin: '0 auto' }}>
          {SECTIONS.map((sec, idx) => (
            <button key={sec.label} className={`ep-tab${activeSection === idx ? ' active' : ''}`} onClick={() => setActiveSection(idx)}>{sec.label}</button>
          ))}
        </div>
      </div>

      {/* CONTENT */}
      <div style={{ maxWidth: 1240, margin: '0 auto', padding: '20px 16px 20px' }}>
        {loading ? (
          <div style={{ background: '#fff', border: '1px solid #ddd', padding: '80px 40px', textAlign: 'center' }}>
            <div className="ep-spinner" style={{ margin: '0 auto 16px' }} />
            <div style={{ fontFamily: 'sans-serif', fontSize: 13, color: '#999' }}>Loading articles…</div>
          </div>
        ) : !sorted.length ? (
          <div style={{ background: '#fff', border: '1px solid #ddd', padding: '80px 40px', textAlign: 'center' }}>
            <div style={{ fontFamily: "'Times New Roman',serif", fontSize: 24, color: '#999', marginBottom: 10, fontStyle: 'italic' }}>No articles in this section yet</div>
            <div style={{ fontFamily: 'sans-serif', fontSize: 13, color: '#bbb' }}>Check back later or browse another section</div>
          </div>
        ) : isFront ? (
          <FrontPage articles={sorted} onArticleClick={onArticleClick} />
        ) : (
          <CategoryPage articles={sorted} onArticleClick={onArticleClick} sectionLabel={section.label}
            currentPage={currentPage} setCurrentPage={setCurrentPage}
            onDownload={() => printSectionOnly(sorted, section.label)} />
        )}
      </div>

      <div style={{ background: '#111', color: '#888', padding: '16px 28px', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, fontFamily: 'sans-serif', fontSize: 10 }}>
        <span>© 2025 Campus Chronicles · The Voice of the Campus · Est. 2021</span>
        <span>e-Paper Edition · {today}</span>
      </div>
    </div>
  )
}