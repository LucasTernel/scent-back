import { getBoutiqueOuverte } from './lib/api'
import Amis, { ProfilAmi } from './pages/Amis'
import { useData } from './lib/useData'
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
import { AdminAccueil, AdminCollection, AdminCollections, AdminFormCollection, AdminFormStatue, AdminBoutique, AdminStatue } from './pages/Admin'
import Claim from './pages/Claim'
import Login from './pages/Login'
import Landing, { SiteDesktop } from './pages/Landing'
import BoutiqueSite from './pages/BoutiqueSite'
import Boutique from './pages/Boutique'
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
  useEffect(() => { if (type !== 'POP') window.scrollTo(0, 0) }, [pathname, type])
  // Rotation du téléphone : petit effet de pivot pendant que la mise en page s'adapte
  useEffect(() => {
    const m = matchMedia('(orientation: landscape)')
    const pivot = () => { if (!matchMedia('(prefers-reduced-motion: reduce)').matches) document.querySelector('main')?.animate([{ transform: `rotate(${m.matches ? 8 : -8}deg) scale(.92)`, opacity: .4 }, { transform: 'none', opacity: 1 }], { duration: 500, easing: 'cubic-bezier(.2,.8,.2,1)' }) }
    m.addEventListener('change', pivot); return () => m.removeEventListener('change', pivot)
  }, []) // la carte de chasse prend tout l'écran
  return (
    <div className="mx-auto min-h-dvh max-w-md lg:max-w-3xl max-lg:landscape:max-w-none">
      {/* Barre du haut floutée + rappel du logo : la zone de l'encoche/heure reste lisible */}
      {carte
        ? <LogoMarque className="pointer-events-none fixed top-[calc(env(safe-area-inset-top)_-_14px)] left-1/2 z-30 h-[92px] w-auto -translate-x-1/2" />
        : <header className="sticky top-0 z-30 flex justify-center bg-creme pt-[env(safe-area-inset-top)]">
            <LogoMarque className="-my-5 h-[92px] w-auto max-lg:landscape:-my-3 max-lg:landscape:h-[60px]" />
          </header>}
      <main className="px-5 pt-4 pb-36 landscape:px-[max(1.25rem,env(safe-area-inset-left),env(safe-area-inset-right))]"><Outlet /></main>
      <TabBar tabs={admin ? tabsAdmin : undefined} fondu={!carte} />
    </div>
  )
}

const ADMIN_PATH = (import.meta.env.VITE_ADMIN_PATH as string | undefined) || '/coulisses-de-la-confrerie'

export default function App() {
  const { session, username, role, refresh, loading } = useAuth()
  const [shown, setShown] = useState(false)
  const [intro, setIntro] = useState(true)
  const reveal = useCallback(() => setShown(true), [])
  const done = useCallback(() => setIntro(false), [])

  // Ordinateur (grand écran + souris, hors appli installée) → landing uniquement, aucune connexion possible.
  // Seule exception : l'aperçu de l'appli affiché DANS la landing (iframe ?mobile=1, non cliquable).
  const apercu = window.self !== window.top && new URLSearchParams(location.search).has('mobile')
  // Admin sur ordinateur : uniquement via l'adresse secrète (VITE_ADMIN_PATH), mémorisée pour la session.
  // La vraie protection reste le rôle admin vérifié par la base (RLS) : un joueur retombe sur le site.
  if (location.pathname === ADMIN_PATH) { try { sessionStorage.setItem('ordi-admin', '1') } catch { /* rien */ } history.replaceState(null, '', '/') }
  let entreeAdmin = false
  try { entreeAdmin = sessionStorage.getItem('ordi-admin') === '1' } catch { /* rien */ }
  if (entreeAdmin && session && role && role !== 'admin') { try { sessionStorage.removeItem('ordi-admin') } catch { /* rien */ } entreeAdmin = false }
  const bureau = !apercu && !entreeAdmin && matchMedia('(min-width: 1024px) and (pointer: fine)').matches && !matchMedia('(display-mode: standalone)').matches
  const boutique = useData(getBoutiqueOuverte) // undefined tant que ça charge

  // Connexion (ou déconnexion) : on repart toujours de l'accueil, pas de la dernière page visitée
  const navigate = useNavigate()
  const avant = useRef(session)
  useEffect(() => {
    if (avant.current !== undefined && !!avant.current !== !!session) navigate('/', { replace: true })
    avant.current = session
  }, [session, navigate])

  if (bureau && location.pathname === '/boutique') return boutique === false ? <Navigate to="/" replace /> : <SiteDesktop>{boutique && <BoutiqueSite />}</SiteDesktop>
  if (bureau) return location.pathname.startsWith('/legal')
    ? <div className="bg-creme"><SiteDesktop><main id="contenu" className="mx-auto max-w-6xl px-5 py-12 md:px-8 md:py-16"><Routes><Route path="legal/:page" element={<Legal />} /></Routes></main></SiteDesktop></div>
    : <Landing />

  return (
    <>
      {shown && (apercu ? (
        // aperçu dans la landing : la carte de chasse, sans compte
        <Routes><Route element={<Layout />}><Route path="*" element={<Scan />} /></Route></Routes>
      ) : !MOCK && !session ? (
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
            <Route path="collections/:id/ajouter" element={<AdminFormStatue />} />
            <Route path="statuette/:sid/modifier" element={<AdminFormStatue />} />
            <Route path="boutique" element={<AdminBoutique />} />
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
            <Route path="boutique" element={<Boutique />} />
            <Route path="classement" element={<Classement />} />
            <Route path="amis" element={<Amis />} />
            <Route path="amis/:pseudo" element={<ProfilAmi />} />
            <Route path="legal/:page" element={<Legal />} />
            <Route path="galerie/c/:id" element={<GalleryCollection />} />
            <Route path="galerie/:id" element={<Detail />} />
          </Route>
          <Route path="s/:code" element={<Claim />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      ))}
      {intro && <Intro ready={!loading} onReveal={reveal} onDone={done} />}
      {!intro && !apercu && <Consentement />}
    </>
  )
}
