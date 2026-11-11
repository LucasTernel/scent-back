import { LogoMarque } from './ui'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Navigate, Outlet, Route, Routes, useLocation, useNavigate, useNavigationType } from 'react-router-dom'
import Scan from './pages/Scan'
import Gallery, { GalleryCollection } from './pages/Gallery'
import Account from './pages/Account'
import Classement from './pages/Classement'
import Legal from './pages/Legal'
import Consentement from './components/Consentement'
import Detail from './pages/Detail'
import { AdminAccueil, AdminCollection, AdminCollections, AdminFormCollection, AdminNouvelleStatue, AdminStatue } from './pages/Admin'
import Claim from './pages/Claim'
import Login from './pages/Login'
import NomDeCode from './pages/NomDeCode'
import TabBar, { tabsAdmin } from './components/TabBar'
import Intro from './components/Intro'
import { MOCK } from './lib/api'
import { useAuth } from './lib/useAuth'

function Layout({ admin }: { admin?: boolean }) {
  const { pathname } = useLocation()
  const carte = !admin && pathname === '/'
  // Nouvelle page → on repart en haut (sauf retour arrière, où le navigateur garde la position)
  const type = useNavigationType()
  useEffect(() => { if (type !== 'POP') window.scrollTo(0, 0) }, [pathname, type]) // la carte de chasse prend tout l'écran
  return (
    <div className="mx-auto min-h-dvh max-w-md">
      {/* Barre du haut floutée + rappel du logo : la zone de l'encoche/heure reste lisible */}
      {carte
        ? <LogoMarque className="pointer-events-none fixed top-[calc(env(safe-area-inset-top)_-_14px)] left-1/2 z-30 h-[92px] w-auto -translate-x-1/2" />
        : <header className="sticky top-0 z-30 flex justify-center bg-creme pt-[env(safe-area-inset-top)]">
            <LogoMarque className="-my-5 h-[92px] w-auto" />
          </header>}
      <main className="px-5 pt-4 pb-36"><Outlet /></main>
      <TabBar tabs={admin ? tabsAdmin : undefined} fondu={!carte} />
    </div>
  )
}

export default function App() {
  const { session, username, role, refresh, loading } = useAuth()
  const [shown, setShown] = useState(false)
  const [intro, setIntro] = useState(true)
  const reveal = useCallback(() => setShown(true), [])
  const done = useCallback(() => setIntro(false), [])

  // Connexion (ou déconnexion) : on repart toujours de l'accueil, pas de la dernière page visitée
  const navigate = useNavigate()
  const avant = useRef(session)
  useEffect(() => {
    if (avant.current !== undefined && !!avant.current !== !!session) navigate('/', { replace: true })
    avant.current = session
  }, [session, navigate])

  return (
    <>
      {shown && (!MOCK && !session ? (
        <Routes>
          <Route path="legal/:page" element={<div className="mx-auto min-h-dvh max-w-md px-5 pt-[max(1.25rem,env(safe-area-inset-top))] pb-10"><Legal /></div>} />
          <Route path="*" element={<Login />} />
        </Routes>
      ) : !MOCK && session && username === undefined ? null : !MOCK && session && username === null ? <NomDeCode userId={session.user.id} onDone={refresh} /> : role === 'admin' ? (
        // Admin : même interface que le joueur, mais avec ses propres onglets (pas de chasse ni de scan)
        <Routes>
          <Route element={<Layout admin />}>
            <Route index element={<AdminAccueil />} />
            <Route path="collections" element={<AdminCollections />} />
            <Route path="collections/nouvelle" element={<AdminFormCollection />} />
            <Route path="collections/:id/modifier" element={<AdminFormCollection />} />
            <Route path="collections/:id" element={<AdminCollection />} />
            <Route path="collections/:id/ajouter" element={<AdminNouvelleStatue />} />
            <Route path="statuette/:id" element={<AdminStatue />} />
            <Route path="compte" element={<Account />} />
            <Route path="legal/:page" element={<Legal />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      ) : (
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Scan />} />
            <Route path="galerie" element={<Gallery />} />
            <Route path="compte" element={<Account />} />
            <Route path="classement" element={<Classement />} />
            <Route path="legal/:page" element={<Legal />} />
            <Route path="galerie/c/:id" element={<GalleryCollection />} />
            <Route path="galerie/:id" element={<Detail />} />
          </Route>
          <Route path="s/:code" element={<Claim />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      ))}
      {intro && <Intro ready={!loading} onReveal={reveal} onDone={done} />}
      {!intro && <Consentement />}
    </>
  )
}
