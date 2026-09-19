import { lazy, Suspense, useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router'
import { Shell } from './components/Shell'

const Home = lazy(() => import('./pages/Home'))
const Worlds = lazy(() => import('./pages/Worlds'))
const NewWorld = lazy(() => import('./pages/NewWorld'))
const WorldDetail = lazy(() => import('./pages/WorldDetail'))
const WriteScene = lazy(() => import('./pages/WriteScene'))
const Outcome = lazy(() => import('./pages/Outcome'))
const Account = lazy(() => import('./pages/Account'))
const Help = lazy(() => import('./pages/Help'))

export function App() {
  const location = useLocation()
  useEffect(() => {
    const heading = document.querySelector<HTMLElement>('main h1')
    heading?.focus()
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [location.pathname])

  return <Shell>
    <Suspense fallback={<div className="page-loading" role="status">Opening the next page…</div>}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/worlds" element={<Worlds />} />
        <Route path="/worlds/new" element={<NewWorld />} />
        <Route path="/worlds/:id" element={<WorldDetail />} />
        <Route path="/worlds/:id/write" element={<WriteScene />} />
        <Route path="/worlds/:id/outcome" element={<Outcome />} />
        <Route path="/account" element={<Account />} />
        <Route path="/help" element={<Help />} />
        <Route path="*" element={<div className="container empty-state"><h1 tabIndex={-1}>This page has gone astray.</h1><p>Choose a destination from the navigation to return to the story.</p></div>} />
      </Routes>
    </Suspense>
  </Shell>
}
