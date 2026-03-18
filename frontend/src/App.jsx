// ─────────────────────────────────────────────────────────────────────────────
//  App.jsx  (updated — adds EpaperPage route)
//  CHANGES FROM ORIGINAL:
//    1. Import EpaperPage
//    2. Add {page === 'epaper' && ...} block
//    3. Pass onEpaper={() => nav('epaper')} to TopBar (optional — or use existing nav)
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from 'react'

import LoginPage         from './pages/LoginPage'
import RegisterPage      from './pages/RegisterPage'
import HomePage          from './pages/HomePage'
import ArticlePage       from './pages/ArticlePage'
import SubmitPage        from './pages/SubmitPage'
import AdminPage         from './pages/AdminPage'
import NotificationsPage from './pages/NotificationsPage'
import SearchPage        from './pages/SearchPage'
import EpaperPage        from './pages/EpaperPage'   // ← NEW

import TopBar from './components/TopBar'
import { clearToken } from './utils/api'
import { DEMO_ARTICLES } from './data/demoData'

export default function App() {
  const [page, setPage]                       = useState('login')
  const [user, setUser]                       = useState(null)
  const [selectedArticle, setSelectedArticle] = useState(null)
  const [articleReturnPage, setArticleReturnPage] = useState('home')

  useEffect(() => {
    const token = localStorage.getItem('cc_token')
    if (!token) { setPage('login'); return }
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      if (payload.exp * 1000 < Date.now()) {
        localStorage.removeItem('cc_token')
        localStorage.removeItem('cc_user')
        setUser(null)
        setPage('login')
      }
    } catch {
      setPage('login')
    }
  }, [])

  const handleLogin = (loggedInUser) => {
    setUser(loggedInUser)
    setPage('home')
  }

  const handleLogout = () => {
    clearToken()
    setUser(null)
    setPage('login')
  }

  const openArticle = (article, from = 'home') => {
    setSelectedArticle(article)
    setArticleReturnPage(from)
    setPage('article')
  }

  const nav = (id) => setPage(id)

  return (
    <>
      {page === 'login' && (
        <LoginPage onLogin={handleLogin} onRegister={() => setPage('register')} />
      )}

      {page === 'register' && (
        <RegisterPage onRegister={handleLogin} onBack={() => setPage('login')} />
      )}

      {page === 'home' && (
        <>
          <TopBar
            user={user}
            onAdmin={() => setPage('admin')}
            onLogout={handleLogout}
            onEpaper={() => setPage('epaper')}   /* ← pass this to TopBar */
          />
          <HomePage
            user={user}
            onNav={nav}
            onArticleClick={(article) => openArticle(article, 'home')}
          />
        </>
      )}

      {/* ── ePaper viewer — NEW ── */}
      {page === 'epaper' && (
        <EpaperPage
          user={user}
          onBack={() => setPage('home')}
          onArticleClick={(article) => openArticle(article, 'epaper')}
        />
      )}

      {page === 'article' && selectedArticle && (
        <ArticlePage
          article={selectedArticle}
          allArticles={DEMO_ARTICLES}
          onBack={() => setPage(articleReturnPage)}
          onArticleClick={(article) => openArticle(article, articleReturnPage)}
        />
      )}

      {page === 'submit' && (
        <SubmitPage user={user} onBack={() => setPage('home')} />
      )}

      {page === 'admin' && (
        <AdminPage
          onBack={() => setPage('home')}
          onArticleClick={(article) => openArticle(article, 'admin')}
        />
      )}

      {page === 'notifications' && (
        <NotificationsPage onBack={() => setPage('home')} />
      )}

      {page === 'search' && (
        <SearchPage
          onBack={() => setPage('home')}
          onArticleClick={(article) => openArticle(article, 'search')}
        />
      )}
    </>
  )
}