// SubmitPage.jsx — 3-step article submission with responsive layout

import { useState } from 'react'
import Masthead from '../components/Masthead'
import { FLabel, FInput, FSel, FTextarea } from '../components/FormElements'
import { Btn } from '../components/Buttons'
import useToast from '../hooks/useToast'
import { CATEGORIES } from '../utils/constants'
import { submitArticle, formatWithAI } from '../utils/api'

export default function SubmitPage({ user, onBack }) {
  const [step,    setStep]    = useState(1)
  const [title,   setTitle]   = useState('')
  const [cat,     setCat]     = useState('Campus News')
  const [tags,    setTags]    = useState('')
  const [content, setContent] = useState('')
  const [imgData, setImgData] = useState(null)   // base64 for preview
  const [imgFile, setImgFile] = useState(null)   // actual File for upload
  const [imgName, setImgName] = useState('')
  const [aiText,  setAiText]  = useState('')
  const [aiLoad,  setAiLoad]  = useState(false)
  const [done,    setDone]    = useState(false)
  const { show, Toast } = useToast()

  const handleImg = file => {
    if (!file || !file.type.startsWith('image/')) { show('Select an image file.', 'error'); return }
    if (file.size > 5 * 1024 * 1024) { show('Image must be under 5MB.', 'error'); return }
    setImgFile(file)                              // ✅ save actual File object
    const r = new FileReader()
    r.onload = e => { setImgData(e.target.result); setImgName(file.name) }
    r.readAsDataURL(file)
  }

const runAI = async () => {
  if (!content.trim()) { show('Write your article content first.', 'error'); return }
  setAiLoad(true)
  try {
    const data = await formatWithAI(title, content)
    console.log('AI response:', data)
    if (data.formatted) {
      setAiText(data.formatted)
    } else if (data.message) {
      // Backend returned an error message
      show('AI error: ' + data.message, 'error')
      setAiText('')
    } else {
      show('AI returned empty response.', 'error')
      setAiText('')
    }
  } catch (e) {
    console.error('AI error:', e.message)
    show('AI formatting failed: ' + e.message, 'error')
    setAiText('')
  }
  setAiLoad(false)
}

  const applyAI = () => {
  // Parse the structured response from Gemini
  const headlineMatch = aiText.match(/HEADLINE:\s*(.+)/i)
  const subheadMatch  = aiText.match(/SUBHEADING:\s*(.+)/i)
  const contentMatch  = aiText.match(/CONTENT:\s*([\s\S]+)/i)

  if (headlineMatch) setTitle(headlineMatch[1].trim())
  if (contentMatch)  setContent(contentMatch[1].trim())
  // If parsing fails completely, keep original content — don't wipe it
  if (!headlineMatch && !contentMatch) {
    show('Could not parse AI response. Your original content is kept.', 'error')
  }
  setAiText('')
}

  const handleSubmit = async () => {
    try {
      const formData = new FormData()
      formData.append('title',    title)
      formData.append('content',  content)
      formData.append('category', cat)
      formData.append('tags',     tags)
      if (imgFile) formData.append('image', imgFile)

      console.log('Submitting:', { title, content, cat })  // ← check values
      const result = await submitArticle(formData)
      console.log('Submit result:', result)
      setDone(true)
    } catch (e) {
      console.error('Submit error:', e.message)  // ← shows exact error
      show(e.message || 'Submission failed. Please try again.', 'error')
    }
  }
  
  const navItems = [
    { label: 'Home', id: 'home' },
    { label: 'Submit Article', id: 'submit' },
    { label: '🔔', id: 'notif', icon: '🔔' },
    { label: '🔍', id: 'search', icon: '🔍' },
  ]

  if (done) return (
    <div>
      <Masthead navItems={navItems} activeNav="submit" onNav={id => id === 'home' && onBack()} />
      <div style={{ maxWidth: 1280, margin: '0 auto', background: '#fdf6e3', boxShadow: '0 0 50px rgba(0,0,0,.28)', padding: 22 }}>
        <div style={{ maxWidth: 880, margin: '0 auto', padding: '60px 20px', textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📰</div>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 24, fontWeight: 900, color: '#1a7a4a', marginBottom: 10 }}>Article Submitted Successfully!</div>
          <div style={{ fontFamily: "'Source Sans 3',sans-serif", fontSize: 13, color: '#6b5c4e', marginBottom: 24 }}>Your article "{title}" has been sent to the editorial team for review.</div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Btn dark onClick={() => { setDone(false); setStep(1); setTitle(''); setContent(''); setTags(''); setImgData(null); setImgName(''); setAiText('') }}>Submit Another</Btn>
            <Btn gray onClick={onBack}>Back to Home</Btn>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div>
      <Masthead navItems={navItems} activeNav="submit" onNav={id => id === 'home' && onBack()} />
      <div style={{ maxWidth: 1280, margin: '0 auto', background: '#fdf6e3', boxShadow: '0 0 50px rgba(0,0,0,.28)', padding: 22 }}>
        <div className="page-inner" style={{ maxWidth: 880, margin: '0 auto', padding: '28px 32px 42px' }}>

          {/* Header */}
          <div style={{ borderBottom: '3px double #1a1008', paddingBottom: 11, marginBottom: 22 }}>
            <div style={{ fontFamily: "'Source Sans 3',sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: '.2em', textTransform: 'uppercase', color: '#b5121b', marginBottom: 4 }}>Newsroom Submission</div>
            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 28, fontWeight: 900 }}>Submit Your Article</div>
            <div style={{ fontFamily: "'Source Sans 3',sans-serif", fontSize: 12, color: '#6b5c4e', marginTop: 4 }}>Contributing as: {user?.name} — {user?.dept}</div>
          </div>

          {/* Steps bar */}
          <div className="steps-bar">
            {[['1. Write Article', 1], ['2. AI Format', 2], ['3. Preview & Submit', 3]].map(([label, n]) => (
              <div key={n} style={{
                flex: 1, padding: 10, textAlign: 'center',
                fontFamily: "'Source Sans 3',sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase',
                borderRight: n < 3 ? '1px solid #1a1008' : 'none',
                background: step === n ? '#1a1008' : '#fdf6e3',
                color: step === n ? '#fff' : '#6b5c4e',
              }}>{label}</div>
            ))}
          </div>

          {/* ── Step 1: Write ── */}
          {step === 1 && (
            <div>
              <FLabel>Article Headline</FLabel>
              <FInput value={title} onChange={e => setTitle(e.target.value)} placeholder="Write a compelling headline…" />

              <div className="form-row-2">
                <div>
                  <FLabel>Category</FLabel>
                  <FSel value={cat} onChange={e => setCat(e.target.value)}>{CATEGORIES.map(c => <option key={c}>{c}</option>)}</FSel>
                </div>
                <div>
                  <FLabel>Tags (comma separated)</FLabel>
                  <FInput value={tags} onChange={e => setTags(e.target.value)} placeholder="e.g. sports, trophy" />
                </div>
              </div>

              <FLabel>Article Content</FLabel>
              <FTextarea value={content} onChange={e => setContent(e.target.value)} placeholder="Write your article here…" />

              <FLabel>Cover Image <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, color: '#6b5c4e' }}>(optional)</span></FLabel>
              <div onClick={() => document.getElementById('img-inp').click()}
                style={{ border: '2px dashed #e8dcc8', padding: 22, textAlign: 'center', cursor: 'pointer', background: '#fffef7', marginBottom: 18 }}>
                {imgData ? (
                  <div>
                    <img src={imgData} alt="" style={{ maxWidth: '100%', maxHeight: 200, objectFit: 'cover', marginBottom: 8, border: '1px solid #e8dcc8' }} />
                    <div style={{ fontFamily: "'Source Sans 3',sans-serif", fontSize: 11, color: '#6b5c4e' }}>{imgName}</div>
                    <button onClick={e => { e.stopPropagation(); setImgData(null); setImgName(''); setImgFile(null) }}
                      style={{ marginTop: 10, padding: '6px 14px', background: '#b5121b', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: "'Source Sans 3',sans-serif", fontSize: 10 }}>
                      ✕ Remove
                    </button>
                  </div>
                ) : (
                  <div style={{ fontFamily: "'Source Sans 3',sans-serif", fontSize: 12, color: '#6b5c4e' }}>
                    <div style={{ fontSize: 32, marginBottom: 8 }}>🖼</div>
                    <strong style={{ color: '#1a1008' }}>Click to upload</strong> or drag & drop<br />
                    <span style={{ fontSize: 11 }}>JPG, PNG — max 5MB</span>
                  </div>
                )}
              </div>
              <input id="img-inp" type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleImg(e.target.files[0])} />

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Btn dark onClick={() => {
                  if (!title.trim())   { show('Please enter a headline.', 'error'); return }
                  if (!content.trim()) { show('Please write article content.', 'error'); return }
                  setStep(2)
                }}>Next: AI Format →</Btn>
              </div>
            </div>
          )}

          {/* ── Step 2: AI Format ── */}
          {step === 2 && (
            <div>
              <div style={{ background: '#f5ead0', border: '2px solid #c8960c', padding: 18, marginBottom: 18 }}>
                <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 17, fontWeight: 700, marginBottom: 5 }}>🤖 AI Content Formatter</div>
                <div style={{ fontFamily: "'Source Sans 3',sans-serif", fontSize: 12, color: '#6b5c4e', marginBottom: 14, lineHeight: 1.6 }}>Our AI editor will polish your article for professional newspaper publication.</div>
                <button onClick={runAI} disabled={aiLoad} style={{ width: '100%', padding: 11, background: aiLoad ? '#a07008' : '#c8960c', color: '#fff', border: 'none', fontFamily: "'Source Sans 3',sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: '.15em', textTransform: 'uppercase', cursor: aiLoad ? 'not-allowed' : 'pointer' }}>
                  {aiLoad ? 'Formatting with AI…' : '✨ Format Article with AI'}
                </button>
                {aiText && (
                  <div>
                    <div style={{ background: '#fffef7', border: '1px solid #1a1008', padding: 16, marginTop: 12, fontFamily: "'Libre Baskerville',serif", fontSize: 13, lineHeight: 1.8, whiteSpace: 'pre-wrap', maxHeight: 260, overflowY: 'auto' }}>{aiText}</div>
                    <div style={{ display: 'flex', gap: 10, marginTop: 12, flexWrap: 'wrap' }}>
                      <Btn green onClick={applyAI}>✓ Apply AI Version</Btn>
                      <Btn gray  onClick={() => setAiText('')}>Keep Original</Btn>
                    </div>
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'space-between', flexWrap: 'wrap' }}>
                <Btn gray onClick={() => setStep(1)}>← Back</Btn>
                <Btn dark onClick={() => setStep(3)}>Next: Preview →</Btn>
              </div>
            </div>
          )}

          {/* ── Step 3: Preview ── */}
          {step === 3 && (
            <div>
              <div style={{ border: '2px solid #1a1008', padding: 22, marginBottom: 20, background: '#fffef7' }}>
                {imgData && <img src={imgData} alt="" style={{ width: '100%', maxHeight: 240, objectFit: 'cover', border: '1px solid #e8dcc8', marginBottom: 14 }} />}
                <div style={{ fontFamily: "'Source Sans 3',sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: '.2em', textTransform: 'uppercase', color: '#b5121b', marginBottom: 4 }}>{cat}</div>
                <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 900, color: '#1a1008', lineHeight: 1.2, marginBottom: 10 }}>{title || 'Your Headline Here'}</div>
                <div style={{ fontFamily: "'Source Sans 3',sans-serif", fontSize: 11, color: '#6b5c4e', borderBottom: '1px solid #e8dcc8', paddingBottom: 9, marginBottom: 14 }}>
                  By {user?.name || 'Student'} — {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
                <div style={{ fontFamily: "'Libre Baskerville',serif", fontSize: 13, lineHeight: 1.8, color: '#2c1a0e', whiteSpace: 'pre-wrap' }}>{content || 'Your content will appear here…'}</div>
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'space-between', flexWrap: 'wrap' }}>
                <Btn gray onClick={() => setStep(2)}>← Back</Btn>
                <Btn red  onClick={handleSubmit}>📨 Submit to Editorial Team</Btn>
              </div>
            </div>
          )}
        </div>
      </div>
      {Toast}
    </div>
  )
}
