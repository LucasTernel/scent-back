import { NavLink, useLocation } from 'react-router-dom'
import { Icon, type IconName } from '../ui'

type Onglet = { to: string; label: string; icon: IconName }
export const tabsAdmin: Onglet[] = [
  { to: '/', label: 'Accueil', icon: 'lieu' },
  { to: '/collections', label: 'Collections', icon: 'collection' },
  { to: '/boutique', label: 'Boutique', icon: 'boutique' },
  { to: '/compte', label: 'Profil', icon: 'profil' },
]
const tabsJoueur: Onglet[] = [
  { to: '/', label: 'Chasse', icon: 'nfc' },
  { to: '/galerie', label: 'Collection', icon: 'collection' },
  { to: '/boutique', label: 'Boutique', icon: 'boutique' },
  { to: '/compte', label: 'Profil', icon: 'profil' },
]

/** Barre noire à encoche + bulle orange qui glisse vers l'onglet actif. */
export default function TabBar({ tabs = tabsJoueur, fondu = true }: { tabs?: Onglet[]; fondu?: boolean }) {
  const { pathname } = useLocation()
  const p = pathname === '/classement' || pathname.startsWith('/legal') ? '/compte' : pathname.startsWith('/galerie') ? '/galerie' : /^\/(collections|statuette)/.test(pathname) ? '/collections' : pathname
  const i = Math.max(0, tabs.findIndex((t) => t.to === p))
  return (
    <>
    {/* fondu crème derrière la barre : elle reste lisible au-dessus des cartes foncées */}
    {fondu && <div aria-hidden className="pointer-events-none fixed inset-x-0 bottom-0 z-30 h-36 bg-gradient-to-t from-creme via-creme/85 to-transparent" />}
    <nav aria-label="Navigation principale" style={{ viewTransitionName: 'tabbar' }} className="fixed inset-x-0 bottom-0 z-40 px-4 pb-[max(.75rem,calc(env(safe-area-inset-bottom)_-_10px))]">
      <div className="barre relative mx-auto mt-8 max-w-[380px]" style={{ ['--x' as string]: `${(i * 2 + 1) * 100 / (2 * tabs.length)}%` }}>
        <div className="barre-fond absolute inset-0 rounded-full bg-[#023341] shadow-lg dark:bg-[#0E4D61]" />
        <span aria-hidden className="bulle absolute -top-[38px] grid size-[60px] -translate-x-1/2 place-items-center rounded-full bg-flamme text-[#023341] shadow-[0_6px_14px_rgba(238,123,42,.45)]">
          {tabs.map((t, k) => (
            <span key={t.to} className={`absolute transition-all duration-300 ${k === i ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`}><Icon name={t.icon} size={26} /></span>
          ))}
        </span>
        <ul className="relative flex h-16">
          {tabs.map((t, k) => (
            <li key={t.to} className="flex-1">
              <NavLink viewTransition to={t.to} end aria-label={t.label} data-dir={k < i ? 'arriere' : 'avant'} className="flex h-full flex-col items-center justify-center text-[#F2E7CB]">
                <span className={`transition-all duration-300 ${k === i ? 'translate-y-2 opacity-0' : 'opacity-75'}`}><Icon name={t.icon} /></span>
                <span className={`absolute bottom-2.5 text-xs font-bold text-[#FCF5E3] transition-all duration-300 ${k === i ? 'opacity-100' : 'translate-y-1 opacity-0'}`}>{t.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </nav>
    </>
  )
}
