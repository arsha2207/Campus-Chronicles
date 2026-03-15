// ─────────────────────────────────────────────────────────────────────────────
//  App.jsx  (updated — includes ArticlePage routing)
//  Root component. Owns:
//    page            — which screen to show
//    user            — logged-in user object
//    selectedArticle — article object passed to ArticlePage
//    articleReturnPage — which page to go back to from ArticlePage
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

  // Decode JWT and check expiry
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    if (payload.exp * 1000 < Date.now()) {
      // Token expired — logout
      localStorage.removeItem('cc_token')
      localStorage.removeItem('cc_user')
      setUser(null)
      setPage('login')
    }
  } catch {
    setPage('login')
  }
}, [])

  // ── Auth ──────────────────────────────────────────────────────────────────
  const handleLogin = (loggedInUser) => {
    setUser(loggedInUser)
    setPage('home')
  }

  const handleLogout = () => {
    clearToken()
    setUser(null)
    setPage('login')
  }

  // ── Open article — callable from any page ─────────────────────────────────
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
          <TopBar user={user} onAdmin={() => setPage('admin')} onLogout={handleLogout} />
          <HomePage
            user={user}
            onNav={nav}
            onArticleClick={(article) => openArticle(article, 'home')}
          />
        </>
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
