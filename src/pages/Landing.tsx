import { useEffect, useRef, useState } from 'react'
import { getLots, type Lot } from '../lib/api'
import { useData } from '../lib/useData'
import { Icon, LogoMarque } from '../ui'
import SceneBougie from '../components/SceneBougie'
import { PRODUITS, euros } from './BoutiqueSite'
import { choisirTaille, choisirTheme, lireTaille, lireTheme, type Choix } from '../lib/theme'

const ADRESSE = 'scent-back.lucasternel.com'
const LEGAL = [['mentions', 'Mentions légales'], ['conditions', 'Conditions d\'utilisation'], ['confidentialite', 'Confidentialité'], ['cookies', 'Cookies']]

const ETAPES_OS: [string, string, string[]][] = [
  ['iPhone', 'Safari', ['Scanne le QR code ou ouvre ' + ADRESSE + ' dans Safari', 'Touche le bouton Partager (le carré avec une flèche)', 'Choisis « Sur l\'écran d\'accueil », puis « Ajouter »']],
  ['Android', 'Chrome', ['Scanne le QR code ou ouvre ' + ADRESSE + ' dans Chrome', 'Touche le menu ⋮ en haut à droite', 'Choisis « Installer l\'application », puis confirme']],
]
export const ouvrirTuto = () => dispatchEvent(new Event('tuto-installation'))

function TutoInstallation({ fermer }: { fermer: () => void }) {
  const bouton = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    bouton.current?.focus()
    const echap = (e: KeyboardEvent) => e.key === 'Escape' && fermer()
    addEventListener('keydown', echap); return () => removeEventListener('keydown', echap)
  }, [fermer])
  return (
    <div role="dialog" aria-modal="true" aria-labelledby="tuto-titre" className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-[#023341]/70 p-5 backdrop-blur-sm" onClick={fermer}>
      <div className="pop relative w-full max-w-3xl rounded-[32px] bg-papier p-6 shadow-2xl md:p-9" onClick={(e) => e.stopPropagation()}>
        <button ref={bouton} onClick={fermer} aria-label="Fermer le tutoriel" className="absolute top-4 right-4 grid size-11 place-items-center rounded-full bg-creme-2 text-xl font-bold">×</button>
        <h2 id="tuto-titre" className="titre pr-12 text-3xl">Installer Scent Back</h2>
        <p className="mt-2 max-w-xl text-doux">Pas besoin de store : l'appli s'installe depuis le navigateur de ton téléphone et s'ouvre ensuite en plein écran, comme une vraie appli.</p>
        <div className="mt-6 grid gap-6 md:grid-cols-[auto_1fr] md:items-start">
          <div className="flex flex-col items-center gap-2 rounded-[24px] bg-creme-2 p-4">
            <img src="/qr-app.svg" alt={`QR code qui ouvre ${ADRESSE}`} className="size-40 rounded-2xl bg-[#FCF5E3] p-2" />
            <p className="font-mono text-xs font-bold">{ADRESSE}</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {ETAPES_OS.map(([os, nav, pas]) => (
              <div key={os} className="rounded-[22px] border-[1.5px] border-trait p-5">
                <p className="font-serif text-xl font-bold">{os} <span className="text-sm font-medium text-doux">· {nav}</span></p>
                <ol className="mt-4 flex flex-col gap-3 text-sm">
                  {pas.map((p, i) => <li key={p} className="flex gap-3"><span className="grid size-7 shrink-0 place-items-center rounded-full bg-flamme text-xs font-bold text-[#023341]">{i + 1}</span><span className="pt-1">{p}</span></li>)}
                </ol>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

/** Bouton Accessibilité : thème (auto / clair / sombre) + taille du texte (A à A+++), mémorisés. */
function Accessibilite() {
  const [ouvert, setOuvert] = useState(false)
  const [theme, setTheme] = useState(lireTheme)
  const [taille, setTaille] = useState(lireTaille)
  const zone = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!ouvert) return
    const dehors = (e: MouseEvent) => { if (!zone.current?.contains(e.target as Node)) setOuvert(false) }
    const echap = (e: KeyboardEvent) => e.key === 'Escape' && setOuvert(false)
    addEventListener('mousedown', dehors); addEventListener('keydown', echap)
    return () => { removeEventListener('mousedown', dehors); removeEventListener('keydown', echap) }
  }, [ouvert])
  const choix = (actif: boolean) => `min-h-11 rounded-full px-3 text-sm font-bold transition ${actif ? 'bg-[#023341] text-[#FCF5E3] dark:bg-[#FCF5E3] dark:text-[#023341]' : 'text-doux hover:text-encre'}`

  return (
    <div ref={zone} className="relative">
      <button onClick={() => setOuvert(!ouvert)} aria-expanded={ouvert} aria-controls="panneau-a11y"
        className="flex min-h-11 items-center gap-2 rounded-[10px] border-2 border-trait px-4 text-sm font-bold transition hover:border-encre">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden><circle cx="12" cy="4.5" r="1.8" /><path d="M5 8.5l7 1.5 7-1.5M12 10v5m0 0l-3.5 6M12 15l3.5 6" /></svg>
        Accessibilité
      </button>
      {ouvert && (
        <div id="panneau-a11y" role="group" aria-label="Réglages d'accessibilité" className="pop absolute top-full right-0 z-40 mt-2 flex w-80 flex-col gap-5 rounded-[24px] border-[1.5px] border-trait bg-papier p-5 shadow-2xl">
          <fieldset>
            <legend className="mb-2 font-serif text-sm font-bold">Thème</legend>
            <div className="grid grid-cols-3 gap-1 rounded-full bg-creme-2 p-1">
              {([['auto', 'Auto'], ['clair', 'Clair'], ['sombre', 'Sombre']] as [Choix, string][]).map(([k, l]) => (
                <button key={k} role="radio" aria-checked={theme === k} onClick={() => { choisirTheme(k); setTheme(k) }} className={choix(theme === k)}>{l}</button>
              ))}
            </div>
            <p className="mt-1.5 text-xs text-doux">Auto suit le réglage de ton ordinateur.</p>
          </fieldset>
          <fieldset>
            <legend className="mb-2 font-serif text-sm font-bold">Taille du texte</legend>
            <div className="grid grid-cols-4 gap-1 rounded-full bg-creme-2 p-1">
              {['A', 'A+', 'A++', 'A+++'].map((l, n) => (
                <button key={l} role="radio" aria-checked={taille === n} aria-label={n ? `Texte agrandi ${n} fois` : 'Texte normal'}
                  onClick={() => { choisirTaille(n); setTaille(n) }} className={choix(taille === n)} style={{ fontSize: `${14 + n * 2}px` }}>{l}</button>
              ))}
            </div>
          </fieldset>
        </div>
      )}
    </div>
  )
}

/** Habillage des pages vues sur ordinateur (landing, pages légales) : en-tête + pied, responsive. */
export function SiteDesktop({ children }: { children: React.ReactNode }) {
  const [tuto, setTuto] = useState(false)
  useEffect(() => { const f = () => setTuto(true); addEventListener('tuto-installation', f); return () => removeEventListener('tuto-installation', f) }, [])
  return (
    <div className="flex min-h-dvh flex-col bg-creme text-encre">
      <a href="#contenu" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-full focus:bg-encre focus:px-5 focus:py-3 focus:text-creme">Aller au contenu</a>
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between border-b border-trait px-5 py-3 md:px-8">
        <a href="/" aria-label="Accueil Scent Back" className="block h-16 w-36 overflow-hidden"><LogoMarque className="h-full w-full scale-[2] object-contain" /></a>
        <div className="flex items-center gap-2">
        <a href="/boutique" className="flex min-h-11 items-center gap-2 rounded-[10px] border-2 border-encre px-4 text-sm font-bold transition hover:bg-[#023341] hover:text-[#FCF5E3]"><Icon name="boutique" size={18} />Boutique</a>
        <Accessibilite />
        <button onClick={() => setTuto(true)} className="flex min-h-11 items-center gap-2 rounded-[10px] bg-[#023341] px-4 text-sm font-bold text-[#FCF5E3] transition hover:bg-[#0E4D61] md:px-5 dark:bg-flamme dark:text-[#023341] dark:hover:bg-flamme"><Icon name="nfc" size={18} />Installer l'appli</button>
        </div>
      </header>
      <div className="flex-1">{children}</div>
      <footer className="border-t border-trait">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-5 py-8 text-sm text-doux md:flex-row md:items-center md:justify-between md:px-8">
          <p>Scent Back · projet étudiant BUT MMI</p>
          <nav aria-label="Informations légales" className="flex flex-wrap gap-x-5 gap-y-2">
            {LEGAL.map(([k, l]) => <a key={k} href={`/legal/${k}`} className="inline-flex min-h-10 items-center hover:text-encre hover:underline">{l}</a>)}
          </nav>
        </div>
      </footer>
      {tuto && <TutoInstallation fermer={() => setTuto(false)} />}
    </div>
  )
}

/* ---------- Effets ---------- */
/** Ajoute data-vu aux éléments .apparait quand ils entrent à l'écran. */
function useApparition() {
  useEffect(() => {
    const els = document.querySelectorAll('.apparait')
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.setAttribute('data-vu', ''); io.unobserve(e.target) } }), { threshold: .15 })
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  })
}
/** Progression (0 → 1) du défilement à travers un élément. */
export function useProgression() {
  const ref = useRef<HTMLDivElement>(null)
  const [p, setP] = useState(0)
  useEffect(() => {
    let raf = 0
    const calc = () => { raf = 0; const r = ref.current?.getBoundingClientRect(); if (!r) return; setP(Math.min(1, Math.max(0, -r.top / (r.height - innerHeight)))) }
    const surDefil = () => { if (!raf) raf = requestAnimationFrame(calc) }
    calc(); addEventListener('scroll', surDefil, { passive: true }); addEventListener('resize', surDefil)
    return () => { removeEventListener('scroll', surDefil); removeEventListener('resize', surDefil); cancelAnimationFrame(raf) }
  }, [])
  return [ref, p] as const
}

/** Bougie dessinée : pot en verre, cire qui baisse avec `cire` (1 → 0), flamme vivante. */
function Bougie({ cire = 1, className = '' }: { cire?: number; className?: string }) {
  const h = 30 + cire * 150 // hauteur de cire dans le pot
  const eteinte = cire <= 0.02
  return (
    <svg viewBox="0 0 220 330" className={className} role="img" aria-label={eteinte ? 'Bougie consumée' : `Bougie, ${Math.round(cire * 100)} % de cire restante`}>
      <defs>
        <linearGradient id="verre" x1="0" x2="1"><stop offset="0" stopColor="#ffffff" stopOpacity=".25" /><stop offset=".5" stopColor="#ffffff" stopOpacity=".06" /><stop offset="1" stopColor="#ffffff" stopOpacity=".22" /></linearGradient>
        <linearGradient id="cire" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#FFF6E0" /><stop offset="1" stopColor="#E9DCC0" /></linearGradient>
        <radialGradient id="flamme" cx=".5" cy=".75" r=".7"><stop offset="0" stopColor="#FFF4C2" /><stop offset=".45" stopColor="#FFC24A" /><stop offset="1" stopColor="#FF7722" /></radialGradient>
      </defs>
      <rect x="30" y="300 " width="160" height="6" rx="3" fill="#000" opacity=".25" />
      <rect x="40" y={300 - h} width="140" height={h} fill="url(#cire)" />
      <rect x="34" y="96" width="152" height="208" rx="18" fill="url(#verre)" stroke="#ffffff40" strokeWidth="2" />
      <rect x="62" y="170" width="96" height="86" rx="10" fill="#FCF5E3" stroke="#023341" strokeWidth="4" />
      <text x="110" y="205" textAnchor="middle" fontFamily="Outfit, sans-serif" fontSize="15" fill="#023341">RHUM</text>
      <text x="110" y="225" textAnchor="middle" fontFamily="Outfit, sans-serif" fontSize="15" fill="#023341">MARIN</text>
      <rect x="96" y="236" width="28" height="3" rx="1.5" fill="#023341" />
      {!eteinte && <g transform={`translate(110 ${300 - h})`}>
        <line x1="0" y1="0" x2="0" y2="-14" stroke="#2A1D12" strokeWidth="3" strokeLinecap="round" />
        <path className="flamme-vive" d="M0 -12 C 14 -30, 10 -52, 0 -72 C -10 -52, -14 -30, 0 -12 Z" fill="url(#flamme)" />
      </g>}
      {eteinte && <path d={`M110 ${286} q 6 -20 -2 -40 q -8 -18 4 -36`} stroke="#ffffff55" strokeWidth="3" fill="none" strokeLinecap="round" />}
    </svg>
  )
}

/** Cadre en forme d'étiquette Scent Back (arche en haut, contour épais). */
export function Etiquette({ children, couleur = 'var(--color-encre)', fond = 'var(--color-papier)', larg = '38%', arche = '2.6rem', className = '', corps = '' }: {
  children: React.ReactNode; couleur?: string; fond?: string; larg?: string; arche?: string; className?: string; corps?: string
}) {
  return (
    <div className={`etiquette ${className}`} style={{ ['--etq' as string]: couleur, ['--fond' as string]: fond, ['--larg' as string]: larg, ['--arche' as string]: arche }}>
      <span aria-hidden className="etq-arche" />
      <div className={`etq-corps ${corps}`}>{children}</div>
    </div>
  )
}
/** En-tête de chapitre : numéro + filet + intitulé, façon magazine. */
const Chapitre = ({ n, titre, clair = false }: { n: string; titre: string; clair?: boolean }) => (
  <div className={`apparait flex items-center gap-4 text-xs font-bold tracking-[.22em] uppercase ${clair ? 'text-[#FCF5E3]/70' : 'text-doux'}`}>
    <span className="font-serif text-flamme">{n}</span><span aria-hidden className={`h-px flex-1 ${clair ? 'bg-[#FCF5E3]/25' : 'bg-trait'}`} /><span>{titre}</span>
  </div>
)
/** Loader : la vraie bougie 3D tourne, flamme allumée ; la barre suit le chargement réel du modèle.
 *  Se ferme quand c'est prêt (min 1,6 s), au plus tard après 5 s, au clic ou avec Échap. Une fois par session. */
function LoaderBougie() {
  // affiché à chaque arrivée sur le site (sauf si l'utilisateur réduit les animations)
  const [fini, setFini] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches)
  const [parti, setParti] = useState(fini)
  const [prog, setProg] = useState(0)
  const mv = useRef<HTMLElement>(null)
  const passer = useRef(() => {})
  passer.current = () => { setFini(true); try { sessionStorage.setItem('loader-vu', '1') } catch { /* rien */ } setTimeout(() => setParti(true), 800) }
  useEffect(() => {
    if (fini) return
    const debut = performance.now()
    const el = mv.current
    const surProg = (e: Event) => setProg((e as CustomEvent<{ totalProgress: number }>).detail.totalProgress)
    const surCharge = () => { setProg(1); setTimeout(() => passer.current(), Math.max(0, 1600 - (performance.now() - debut)) + 500) }
    el?.addEventListener('progress', surProg); el?.addEventListener('load', surCharge)
    const secours = setTimeout(() => passer.current(), 5000)
    const touche = (e: KeyboardEvent) => e.key === 'Escape' && passer.current()
    addEventListener('keydown', touche)
    return () => { el?.removeEventListener('progress', surProg); el?.removeEventListener('load', surCharge); clearTimeout(secours); removeEventListener('keydown', touche) }
  }, [fini])
  if (parti) return null
  return (
    <div role="status" aria-label="Chargement de Scent Back" onClick={() => passer.current()}
      className="fixed inset-0 z-[60] grid cursor-pointer place-items-center bg-[#011A22] transition-opacity duration-700" style={{ opacity: fini ? 0 : 1, pointerEvents: fini ? 'none' : undefined }}>
      <div aria-hidden className="absolute top-1/2 left-1/2 size-[480px] -translate-1/2 rounded-full bg-[radial-gradient(circle,#FF772233,transparent_65%)]" />
      <div className="relative flex flex-col items-center">
        <model-viewer ref={mv} src="/models/bougie-rhum-marin.glb" alt="" auto-rotate auto-rotate-delay="0" rotation-per-second="40deg" interaction-prompt="none"
          camera-orbit="0deg 74deg 165%" camera-target="0m 0.05m 0m" field-of-view="26deg" exposure="1.1" disable-zoom
          style={{ width: 300, height: 340, ['--poster-color' as string]: 'transparent' }}>
          <div slot="progress-bar" />
          <div slot="hotspot-flamme" data-position="0m 0.083m 0m" data-normal="0m 1m 0m" className="flamme-3d"><span /></div>
        </model-viewer>
        <img src="/logo-orange.png" alt="" className="-mt-10 -mb-6 w-44" />
        <div className="mt-2 h-[3px] w-48 overflow-hidden rounded-full bg-[#FCF5E3]/15"><div className="h-full bg-flamme transition-[width] duration-300" style={{ width: `${Math.round(prog * 100)}%` }} /></div>
        <p className="mt-3 font-mono text-xs text-[#FCF5E3]/50">Allumage… {Math.round(prog * 100)} %</p>
        <p className="mt-6 text-xs text-[#FCF5E3]/30">Cliquer pour passer</p>
      </div>
    </div>
  )
}

/** Site vitrine sur ordinateur : l'histoire de Scent Back, chapitre par chapitre. */
export default function Landing() {
  useApparition()
  useEffect(() => { if (location.hash) setTimeout(() => document.querySelector(location.hash)?.scrollIntoView(), 50) }, []) // liens /#boutique, /#box…
  const lots = useData(getLots) ?? []
  const [demo, setDemo] = useState<Lot>()
  const racine = useRef<HTMLElement>(null)
  useEffect(() => {
    import('@google/model-viewer')
    let stop = () => {}
    import('../lib/animations').then(({ lancerAnimations }) => racine.current && lancerAnimations(racine.current).then((s) => { stop = s }))
    return () => stop()
  }, [])

  return (
    <SiteDesktop>
      <LoaderBougie />
      <main id="contenu" ref={racine} data-curseur>
        {/* L'expérience : la bougie 3D dans le noir (canvas fixe), le récit défile par-dessus */}
        <SceneBougie />
        <div data-experience className="relative text-encre">
          <section className="relative z-10 flex min-h-dvh items-center justify-center px-[8vw] text-center"><div>
            <p className="text-xs font-bold tracking-[.22em] text-doux uppercase">Ubisoft × La Belle Mèche</p>
            <h1 className="titre mt-4 text-[clamp(4rem,10vw,10rem)] leading-[.85]">Fermez<br />les yeux<span className="text-flamme">.</span></h1>
          </div></section>
          <section className="relative z-10 flex min-h-dvh items-center px-[8vw]"><div className="max-w-xl">
            <p data-mots className="text-[clamp(1.6rem,2.6vw,2.6rem)] leading-snug font-medium">Ces mondes, vous les avez parcourus pendant des heures. Vous les connaissez par cœur… et pourtant, vous ne les avez jamais sentis.</p>
          </div></section>
          <section className="relative z-10 flex min-h-dvh items-center justify-end px-[8vw] text-right"><div className="max-w-xl">
            <p className="titre text-[clamp(3rem,6vw,6rem)] leading-[.95]">Voir.<br />Entendre.<br /><span className="text-flamme">Sentir.</span></p>
            <p className="mt-6 text-xl text-doux">Ubisoft fait voyager par l'image et le son. La Belle Mèche ajoute le sens qui manquait : l'odorat.</p>
          </div></section>
          <section className="relative z-10 flex min-h-dvh items-center px-[8vw]"><div className="max-w-xl">
            <p className="font-serif text-sm font-bold text-flamme">La mèche</p>
            <h2 className="titre mt-3 text-[clamp(2.6rem,5vw,5rem)] leading-[.95]">Elle compte le temps avec vous.</h2>
          </div></section>
          <section className="relative z-10 flex min-h-dvh items-center justify-end px-[8vw] text-right"><div className="max-w-xl">
            <p className="font-serif text-sm font-bold text-flamme">Rhum Marin</p>
            <h2 className="titre mt-3 text-[clamp(2.6rem,5vw,5rem)] leading-[.95]">140 g de cire végétale, coulée en France.</h2>
          </div></section>
          <section className="relative z-10 flex min-h-dvh items-center px-[8vw]"><div className="max-w-xl">
            <p className="font-serif text-sm font-bold text-flamme">Le défi</p>
            <h2 className="titre mt-3 text-[clamp(2.4rem,4.6vw,4.6rem)] leading-[.95]">Finirez-vous le jeu avant la dernière goutte ?</h2>
            <p className="titre mt-6 text-7xl tabular-nums"><span data-cire-g>140</span><span className="text-3xl text-flamme"> g</span></p>
          </div></section>
          <section className="relative z-10 flex min-h-dvh items-center justify-center px-[8vw] text-center"><div>
            <p className="chiffre-contour titre text-[clamp(5rem,12vw,11rem)] leading-none whitespace-nowrap">3–4h</p>
            <p className="mx-auto mt-6 max-w-xl text-xl text-doux">Jamais plus de 3 à 4 heures d'affilée. Éteignez-la, elle vous attend comme une sauvegarde.</p>
          </div></section>
        </div>

        {/* La box : photo plein cadre, titre posé dessus */}
        <section id="box" className="relative z-10 bg-encre text-creme">
          <img src="/site/box.webp" alt="La box Scent Back Assassin's Creed IV Black Flag : l'écrin en forme de logo, le jeu PS5 et la bougie Rhum Marin" loading="lazy" data-volet className="h-[92vh] w-full object-cover" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent pt-40 pb-12 text-[#FCF5E3]">
            <div className="mx-auto grid max-w-6xl items-end gap-8 px-8 md:grid-cols-[1.4fr_1fr]">
              <h2 className="titre text-[clamp(2.4rem,5vw,4.6rem)] leading-[.95]">Un jeu culte.<br />Une bougie qui a l'odeur<br />de son monde<span className="text-flamme">.</span></h2>
              <p className="text-lg leading-relaxed text-[#FCF5E3]/85">Assassin's Creed IV Black Flag + la bougie Rhum Marin, dans un écrin en forme de logo. Le premier pack de la collection All Stars.</p>
            </div>
          </div>
        </section>

        {/* Le pop-up store */}
        <section id="popup" className="relative z-10 bg-encre text-creme">
          <div className="mx-auto max-w-6xl px-8 pt-28">
            <Chapitre n="04" titre="Le pop-up store" clair />
            <h2 className="apparait titre mt-10 text-[clamp(3rem,8vw,7rem)] leading-[.88]">Paris.<br /><span className="text-flamme">En vrai.</span></h2>
          </div>
          <div className="mx-auto mt-16 grid max-w-6xl border-t border-creme/15 md:grid-cols-3">
            {[['Sentir', 'Toutes les bougies de la collection, à respirer avant de choisir. Le rhum marin, la figue tabacée… et les surprises à venir.'],
              ['Jouer', 'Les box Scent Back à manipuler, les jeux en démo, et les statuettes des lapins encapuchonnés à retrouver dans Paris.'],
              ['Récupérer', 'Vos commandes de la boutique et les lots gagnés dans l\'appli, avec votre bon. La communauté se retrouve ici.']].map(([t, d], i) => (
              <div key={t} className={`apparait p-10 ${i ? 'md:border-l border-creme/15' : ''}`} style={{ ['--d' as string]: `${i * .1}s` }}>
                <p className="font-serif text-sm font-bold text-flamme">0{i + 1}</p>
                <h3 className="titre mt-3 text-4xl">{t}</h3>
                <p className="mt-4 leading-relaxed text-creme/70">{d}</p>
              </div>
            ))}
          </div>
        </section>
        {/* L'appli */}
        <section id="chasse" className="relative z-10 bg-creme">
          <div className="mx-auto grid max-w-6xl items-center gap-14 px-8 py-28 lg:grid-cols-[1.1fr_.9fr]">
            <div className="flex flex-col gap-8">
              <Chapitre n="05" titre="L'application" />
              <h2 className="apparait titre text-[clamp(3rem,7vw,6rem)] leading-[.88]">La<br />chasse<span className="text-flamme">.</span></h2>
              <p className="apparait max-w-xl text-lg leading-relaxed text-doux">Des lapins encapuchonnés se cachent dans Paris. Un radar fait vibrer le téléphone quand on approche, on scanne la puce NFC sous la statuette, chaque capture devient une carte 3D et rapporte des points à échanger au pop-up store.</p>
              <ul className="apparait grid max-w-xl grid-cols-3 border-y-2 border-encre">
                {[['Radar', 'qui vibre'], ['NFC', 'à scanner'], ['Points', 'à échanger']].map(([a, b], i) => (
                  <li key={a} className={`py-5 ${i ? 'border-l border-trait pl-5' : ''}`}><p className="titre text-2xl">{a}</p><p className="text-sm text-doux">{b}</p></li>
                ))}
              </ul>
              <Etiquette className="apparait w-full max-w-md" corps="flex items-center gap-5 p-5" larg="30%" arche="1.9rem">
                <img src="/qr-app.svg" alt={`QR code qui ouvre ${ADRESSE} sur votre téléphone`} className="size-32 shrink-0" />
                <div className="flex flex-col gap-2">
                  <p className="titre text-xl">Scannez pour jouer</p>
                  <p className="font-mono text-sm">{ADRESSE}</p>
                  <button onClick={ouvrirTuto} className="w-fit text-sm font-bold text-flamme underline underline-offset-4">Comment installer l'appli →</button>
                </div>
              </Etiquette>
            </div>
            <div className="apparait relative mx-auto hidden lg:block" aria-hidden>
              <div className="rounded-[54px] border-4 border-encre bg-[#023341] p-2.5">
                <div className="relative h-[675px] w-[312px] overflow-hidden rounded-[44px] bg-creme">
                  <iframe src="/?mobile=1" title="Aperçu de l'appli Scent Back" tabIndex={-1} loading="lazy" className="pointer-events-none absolute top-0 left-0 h-[844px] w-[390px] origin-top-left scale-[.8] border-0" />
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* Shop (réf.) : rangée de produits + lots en points */}
        <section id="boutique" className="relative z-10 bg-encre py-28 text-creme">
          <div className="mx-auto max-w-6xl px-8">
            <div className="flex items-end justify-between gap-6 border-b border-creme/20 pb-6">
              <h2 className="titre text-[clamp(3rem,7vw,6rem)] leading-[.88]">Shop<span className="text-flamme">.</span></h2>
              <a href="/boutique" className="min-h-12 content-center rounded-[10px] bg-flamme px-6 font-bold text-[#023341]">Voir la boutique et commander →</a>
            </div>
            <ul className="mt-12 grid gap-6 md:grid-cols-3">
              {PRODUITS.map((pr, i) => (
                <li key={pr.id} className="apparait group" style={{ ['--d' as string]: `${i * .08}s` }}>
                  <a href="/boutique" className="block">
                    <div className="overflow-hidden rounded-[14px] bg-creme">
                      <img src={pr.image} alt={pr.nom} loading="lazy" className={`aspect-[4/5] w-full transition duration-700 group-hover:scale-105 ${pr.id === 'box-ac4' ? 'object-cover' : 'object-contain p-6'}`} />
                    </div>
                    <div className="mt-4 flex items-baseline justify-between gap-3"><p className="titre text-lg">{pr.nom}</p><p className="font-bold text-flamme">{pr.dispo ? euros(pr.prix) : 'Bientôt'}</p></div>
                  </a>
                </li>
              ))}
            </ul>
            <p className="mt-12 border-t border-creme/20 pt-6 text-sm text-creme/60">Et dans l'appli : les points de la chasse s'échangent contre des lots ({lots.map((l) => l.name).join(', ')}) à récupérer au pop-up.</p>
          </div>
        </section>
        {/* Fin : la phrase signature dans une grande étiquette */}
        <section className="relative z-10 bg-encre px-5 py-28">
          <Etiquette className="apparait mx-auto max-w-3xl" corps="flex flex-col items-center gap-6 px-8 py-14 text-center text-encre" larg="30%" arche="3.4rem">
            <Bougie className="w-20" />
            <p className="titre text-[clamp(2.4rem,5vw,4.4rem)] leading-none">Scent Back.</p>
            <span aria-hidden className="block h-[3px] w-12 bg-encre" />
            <p className="max-w-lg text-xl leading-relaxed">Le temps d'une bougie, retrouvez ce que vous ressentiez.</p>
            <div className="mt-2 flex flex-wrap justify-center gap-3">
              <a href="#box" className="min-h-12 content-center rounded-[10px] bg-encre px-7 font-bold text-creme">Voir la box</a>
              <button onClick={ouvrirTuto} className="min-h-12 rounded-[10px] border-2 border-encre px-7 font-bold">Installer l'appli</button>
            </div>
          </Etiquette>
        </section>      </main>
      {demo && <AchatDemo lot={demo} fermer={() => setDemo(undefined)} />}
    </SiteDesktop>
  )
}

/** Réservation fictive : aucun paiement, aucune donnée bancaire, juste un numéro de commande de démonstration. */
function AchatDemo({ lot, fermer }: { lot: Lot; fermer: () => void }) {
  const [etape, setEtape] = useState<'panier' | 'ok'>('panier')
  const [num] = useState(() => 'SB-' + Math.random().toString(36).slice(2, 7).toUpperCase())
  const bouton = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    bouton.current?.focus()
    const echap = (e: KeyboardEvent) => e.key === 'Escape' && fermer()
    addEventListener('keydown', echap); return () => removeEventListener('keydown', echap)
  }, [fermer, etape])
  return (
    <div role="dialog" aria-modal="true" aria-labelledby="demo-titre" className="fixed inset-0 z-50 grid place-items-center bg-[#023341]/70 p-5 backdrop-blur-sm" onClick={fermer}>
      <div className="pop relative flex w-full max-w-md flex-col gap-4 rounded-[32px] bg-papier p-7 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <p className="w-fit rounded-full bg-creme-2 px-3 py-1 text-xs font-bold text-doux">Mode démonstration · aucun paiement</p>
        {etape === 'panier' ? <>
          <h2 id="demo-titre" className="titre text-2xl">Réserver ce lot</h2>
          <div className="flex items-center gap-4 rounded-[20px] border-[1.5px] border-trait p-3">
            <span className="grid size-16 shrink-0 place-items-center overflow-hidden rounded-[14px] bg-creme-2">
              {lot.image_url ? <img src={lot.image_url} alt="" className="size-full object-cover" /> : <Icon name="boutique" size={28} className="text-doux" />}
            </span>
            <div className="min-w-0 flex-1"><p className="font-serif font-bold leading-snug">{lot.name}</p><p className="text-sm text-doux">Retrait au pop-up store</p></div>
            <p className="titre text-xl">{lot.cost}<span className="text-xs"> pts</span></p>
          </div>
          <p className="text-sm text-doux">Dans le vrai jeu, les points se gagnent en capturant des lapins dans l'appli mobile. Ici, la réservation est simulée.</p>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={fermer} className="btn-ligne">Annuler</button>
            <button ref={bouton} onClick={() => setEtape('ok')} className="btn btn-encre">Réserver</button>
          </div>
        </> : <>
          <span className="pop grid size-14 place-items-center rounded-full bg-flamme text-2xl text-[#023341]">✓</span>
          <h2 id="demo-titre" className="titre text-2xl">Réservation confirmée !</h2>
          <p className="text-doux"><b className="text-encre">{lot.name}</b> t'attend au pop-up store Ubisoft × La Belle Mèche.</p>
          <p className="rounded-2xl bg-creme-2 px-4 py-3 text-center"><span className="block text-xs text-doux">Numéro de commande (fictif)</span><span className="titre text-2xl tracking-widest">{num}</span></p>
          <button ref={bouton} onClick={fermer} className="btn btn-encre">Fermer</button>
        </>}
      </div>
    </div>
  )
}
