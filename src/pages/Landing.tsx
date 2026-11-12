import { useEffect, useRef, useState } from 'react'
import { getLots, type Lot } from '../lib/api'
import { useData } from '../lib/useData'
import { Icon, LogoMarque } from '../ui'
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
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between border-b-2 border-encre px-5 py-3 md:px-8">
        <a href="/" aria-label="Accueil Scent Back" className="block h-16 w-36 overflow-hidden"><LogoMarque className="h-full w-full scale-[2] object-contain" /></a>
        <div className="flex items-center gap-2">
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
function useProgression() {
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
      {!eteinte && <g transform={`translate(110 ${300 - h})`}>
        <line x1="0" y1="0" x2="0" y2="-14" stroke="#2A1D12" strokeWidth="3" strokeLinecap="round" />
        <path className="flamme-vive" d="M0 -12 C 14 -30, 10 -52, 0 -72 C -10 -52, -14 -30, 0 -12 Z" fill="url(#flamme)" />
      </g>}
      {eteinte && <path d={`M110 ${286} q 6 -20 -2 -40 q -8 -18 4 -36`} stroke="#ffffff55" strokeWidth="3" fill="none" strokeLinecap="round" />}
      <rect x="34" y="96" width="152" height="208" rx="18" fill="url(#verre)" stroke="#ffffff40" strokeWidth="2" />
      <rect x="62" y="170" width="96" height="86" rx="10" fill="#FCF5E3" stroke="#023341" strokeWidth="4" />
      <text x="110" y="205" textAnchor="middle" fontFamily="Outfit, sans-serif" fontSize="15" fill="#023341">RHUM</text>
      <text x="110" y="225" textAnchor="middle" fontFamily="Outfit, sans-serif" fontSize="15" fill="#023341">MARIN</text>
      <rect x="96" y="236" width="28" height="3" rx="1.5" fill="#023341" />
    </svg>
  )
}

/** Cadre en forme d'étiquette Scent Back (arche en haut, contour épais). */
function Etiquette({ children, couleur = '#023341', fond = '#FCF5E3', larg = '38%', arche = '2.6rem', className = '', corps = '' }: {
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
const Bandeau = ({ mots }: { mots: string[] }) => (
  <div aria-hidden className="overflow-hidden border-y-2 border-[#023341] bg-flamme py-3 text-[#023341]">
    <div className="defile">{[0, 1].map((k) => <span key={k} className="flex shrink-0">{mots.map((m) => <span key={m} className="titre px-6 text-xl whitespace-nowrap">{m} <span className="pl-6">✦</span></span>)}</span>)}</div>
  </div>
)

/** Site vitrine sur ordinateur : l'histoire de Scent Back, chapitre par chapitre. */
export default function Landing() {
  useApparition()
  useEffect(() => { if (location.hash) setTimeout(() => document.querySelector(location.hash)?.scrollIntoView(), 50) }, []) // liens /#boutique, /#box…
  const lots = useData(getLots) ?? []
  const [demo, setDemo] = useState<Lot>()
  const [refDefi, p] = useProgression()
  const etapesDefi = [
    ['Allumez', 'Installez-vous dans une lumière douce, allumez la mèche et respirez : l\'ambiance revient avant même que l\'écran s\'allume.'],
    ['Jouez', 'Elle compte le temps avec vous. Plus la cire fond, plus la fin approche.'],
    ['Sauvegardez', 'Éteignez-la à la fin de chaque partie et rallumez-la à la suivante : elle vous attend comme une sauvegarde.'],
    ['Gagnez', 'Si vous finissez l\'aventure avant la dernière goutte de cire, c\'est gagné.'],
  ]
  const etape = Math.min(etapesDefi.length - 1, Math.floor(p * etapesDefi.length))
  const sommaire = [['01', 'Le sens manquant', '#sens'], ['02', 'La box', '#box'], ['03', 'Le défi', '#defi'], ['04', 'La chasse', '#chasse'], ['05', 'La boutique', '#boutique']]

  return (
    <SiteDesktop>
      <main id="contenu">
        {/* Ouverture : grand titre + sommaire à gauche, la box dans une arche à droite */}
        <section className="mx-auto grid max-w-6xl gap-12 px-5 pt-10 pb-20 md:px-8 lg:grid-cols-[1.05fr_.95fr] lg:items-end">
          <div className="flex flex-col gap-8">
            <p className="apparait text-sm font-bold tracking-[.22em] text-doux uppercase">Ubisoft <span className="text-flamme">×</span> La Belle Mèche</p>
            <h1 className="apparait titre text-[clamp(3.4rem,8vw,7.2rem)] leading-[.88] tracking-tight">Fermez<br />les yeux<span className="text-flamme">.</span></h1>
            <p className="apparait max-w-md text-xl leading-relaxed">Ces mondes, vous les avez parcourus pendant des heures. Vous les connaissez par cœur… <b>et pourtant, vous ne les avez jamais sentis.</b></p>
            <nav aria-label="Chapitres" className="apparait mt-2 border-t-2 border-encre">
              {sommaire.map(([n, l, h]) => (
                <a key={n} href={h} className="group flex items-center gap-5 border-b border-trait py-3.5 transition hover:pl-2">
                  <span className="font-serif text-sm font-bold text-flamme">{n}</span>
                  <span className="flex-1 text-lg font-medium">{l}</span>
                  <span aria-hidden className="text-doux transition group-hover:translate-x-1 group-hover:text-encre">→</span>
                </a>
              ))}
            </nav>
          </div>
          <div className="apparait relative" style={{ ['--d' as string]: '.15s' }}>
            <div className="overflow-hidden rounded-t-full border-4 border-encre bg-white">
              <img src="/site/bougie.webp" alt="La bougie Scent Back Rhum Marin, 140 g de cire 100 % végétale, avec son étiquette en arche" className="aspect-[4/5] w-full object-contain px-6 pt-16" />
            </div>
            <p className="mt-3 flex justify-between text-xs font-bold tracking-[.18em] text-doux uppercase"><span>Fig. 1 — Rhum Marin</span><span>140 g · cire végétale</span></p>
          </div>
        </section>

        <Bandeau mots={['Rhum Marin', 'Assassin\'s Creed IV', '140 g', 'Cire 100 % végétale', 'Coulée en France', 'Pop-up Paris']} />

        {/* 01 — Le sens manquant : un tableau, pas des cartes */}
        <section id="sens" className="mx-auto max-w-6xl px-5 py-28 md:px-8">
          <Chapitre n="01" titre="Le sens manquant" />
          <h2 className="apparait titre mt-10 max-w-4xl text-[clamp(2.2rem,4.6vw,4rem)] leading-[1.02]">Dans un jeu, on voit et on entend le monde. On ne le sent jamais.</h2>
          <dl className="mt-16 border-t-2 border-encre">
            {[['Voir', 'L\'image', 'Ubisoft', true], ['Entendre', 'Le son', 'Ubisoft', true], ['Sentir', 'L\'odeur', 'La Belle Mèche', false]].map(([verbe, sens, qui, deja], i) => (
              <div key={verbe as string} className={`apparait grid grid-cols-[1fr_auto] items-baseline gap-6 border-b border-trait py-7 md:grid-cols-[180px_1fr_auto] ${deja ? '' : 'bg-flamme/10 px-4 -mx-4'}`} style={{ ['--d' as string]: `${i * .12}s` }}>
                <dt className="titre text-4xl md:text-5xl">{verbe as string}</dt>
                <dd className="hidden text-lg text-doux md:block">{sens as string}</dd>
                <dd className={`text-right text-sm font-bold tracking-[.16em] uppercase ${deja ? 'text-doux' : 'text-flamme'}`}>{deja ? `✓ ${qui}` : `Le sens manquant — ${qui}`}</dd>
              </div>
            ))}
          </dl>
          <p className="apparait mt-12 ml-auto max-w-xl text-xl leading-relaxed">Ubisoft fait voyager par l'image et le son. La Belle Mèche, par l'odeur et la lumière. Scent Back réunit les deux et ajoute ce qui manquait : <b>l'odorat.</b></p>
        </section>

        {/* 02 — La box : photo pleine largeur + légendes en colonnes */}
        <section id="box" className="bg-[#011A22] text-[#FCF5E3]">
          <div className="mx-auto max-w-6xl px-5 pt-28 md:px-8">
            <Chapitre n="02" titre="La box" clair />
            <h2 className="apparait titre mt-10 max-w-3xl text-[clamp(2.2rem,4.6vw,4rem)] leading-[1.02]">Un jeu culte. Une bougie qui a l'odeur de son monde.</h2>
          </div>
          <div className="mx-auto max-w-6xl px-5 md:px-8">
            <img src="/site/box.webp" alt="La box Scent Back Assassin's Creed IV Black Flag : l'écrin en forme de logo, le jeu PS5 et la bougie Rhum Marin" loading="lazy" className="apparait mt-14 w-full rounded-[18px] border-4 border-[#FCF5E3]/15" />
          </div>
          <div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 md:grid-cols-3 md:px-8">
            {[['Le jeu', 'Assassin\'s Creed IV Black Flag. La piraterie, les Caraïbes, le pont du Jackdaw.'], ['La bougie', 'Rhum Marin. 140 g de cire 100 % végétale, coulée en France par La Belle Mèche.'], ['L\'écrin', 'Une box en forme de logo Assassin\'s Creed, faite pour rester sur le bureau.']].map(([k, v], i) => (
              <div key={k} className="apparait border-t-2 border-flamme pt-5" style={{ ['--d' as string]: `${i * .1}s` }}>
                <p className="text-xs font-bold tracking-[.2em] text-flamme uppercase">Fig. 2.{i + 1}</p>
                <p className="titre mt-2 text-2xl">{k}</p>
                <p className="mt-2 leading-relaxed text-[#FCF5E3]/70">{v}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 03 — Le défi : la cire fond au fil du défilement, règle graduée en heures */}
        <section id="defi" ref={refDefi} className="relative h-[300vh] bg-creme" aria-labelledby="titre-defi">
          <div className="sticky top-0 flex h-dvh flex-col justify-center overflow-hidden">
            <div className="mx-auto w-full max-w-6xl px-5 md:px-8">
              <Chapitre n="03" titre="Le défi" />
              <div className="mt-10 grid items-center gap-12 lg:grid-cols-[.8fr_1.2fr]">
                <Etiquette className="mx-auto w-full max-w-[300px]" corps="p-6 pt-4" larg="44%">
                  <Bougie cire={1 - p} className="mx-auto w-44" />
                  <p className="mt-3 text-center text-xs font-bold tracking-[.18em] text-doux uppercase">Rhum Marin — {Math.round((1 - p) * 140)} g</p>
                </Etiquette>
                <div>
                  <h2 id="titre-defi" className="titre text-[clamp(2rem,4vw,3.4rem)] leading-[1.02]">Finirez-vous le jeu avant la dernière goutte ?</h2>
                  <p className="mt-4 max-w-xl text-lg leading-relaxed text-doux">Le poids de la bougie est calculé au plus juste pour brûler pendant toute la durée du jeu.</p>
                  <ol className="mt-8 border-t-2 border-encre">
                    {etapesDefi.map(([t, d], i) => (
                      <li key={t} className={`border-b border-trait py-4 transition-opacity duration-500 ${i === etape ? '' : 'opacity-35'}`}>
                        <p className="flex items-baseline gap-4"><span className="font-serif text-sm font-bold text-flamme">0{i + 1}</span><span className="titre text-2xl">{t}</span></p>
                        <p className={`overflow-hidden pl-9 leading-relaxed text-doux transition-all duration-500 ${i === etape ? 'mt-2 max-h-24' : 'max-h-0'}`}>{d}</p>
                      </li>
                    ))}
                  </ol>
                  {/* règle graduée : heures de jeu */}
                  <div className="mt-8" aria-label={`Temps de jeu : ${Math.round(p * 30)} heures sur 30`}>
                    <div className="relative h-2 bg-creme-2"><div className="absolute inset-y-0 left-0 bg-flamme" style={{ width: `${p * 100}%` }} /></div>
                    <div className="mt-2 flex justify-between font-mono text-xs text-doux" aria-hidden>{[0, 5, 10, 15, 20, 25, 30].map((h) => <span key={h}>{h}h</span>)}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Règle d'or : chiffre géant en contour */}
        <section className="border-y-2 border-encre bg-papier">
          <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-20 md:px-8 lg:grid-cols-[1.3fr_1fr]">
            <p className="apparait chiffre-contour titre text-[clamp(6rem,16vw,13rem)] leading-[.85] text-encre">3–4h</p>
            <div className="apparait" style={{ ['--d' as string]: '.12s' }}>
              <p className="text-xs font-bold tracking-[.22em] text-flamme uppercase">La règle d'or</p>
              <p className="mt-4 text-xl leading-relaxed">Comme dans tout bon jeu, il y a une règle : ne laissez jamais votre bougie allumée plus de 3 à 4 heures d'affilée.</p>
              <p className="mt-3 leading-relaxed text-doux">Au-delà, la mèche s'abîme et la cire peut brûler. Faites des pauses, c'est bon pour la flamme et pour les yeux. Laissez-la refroidir, puis rallumez-la à la session suivante.</p>
            </div>
          </div>
        </section>

        {/* Valeurs : citation + deux colonnes séparées par un filet */}
        <section className="mx-auto max-w-6xl px-5 py-28 md:px-8">
          <blockquote className="apparait titre max-w-4xl text-[clamp(1.8rem,3.6vw,3rem)] leading-[1.1]">« Une odeur suffit à faire revenir un souvenir, et l'émotion qui va avec. »</blockquote>
          <div className="mt-16 grid gap-10 md:grid-cols-2 md:divide-x-2 md:divide-encre">
            {[['Nostalgie', 'C\'est l\'effet « madeleine de Proust » : un parfum de rhum et d\'embruns, et vous êtes de retour sur le pont du Jackdaw.'], ['Communauté', 'On partage ses souvenirs de jeu ensemble : en ligne, sur les réseaux et dans l\'appli, et en vrai, au pop-up store parisien.']].map(([t, d], i) => (
              <div key={t} className={`apparait ${i ? 'md:pl-10' : 'md:pr-10'}`} style={{ ['--d' as string]: `${i * .12}s` }}>
                <p className="text-xs font-bold tracking-[.22em] text-flamme uppercase">Valeur 0{i + 1}</p>
                <h3 className="titre mt-3 text-4xl">{t}</h3>
                <p className="mt-4 text-lg leading-relaxed text-doux">{d}</p>
              </div>
            ))}
          </div>
        </section>

        <Bandeau mots={['La chasse est ouverte', 'Radar', 'Puces NFC', 'Lapins encapuchonnés', 'Pop-up Paris']} />

        {/* 04 — La chasse : texte + QR dans une étiquette, aperçu de l'appli */}
        <section id="chasse" className="mx-auto max-w-6xl px-5 py-28 md:px-8">
          <Chapitre n="04" titre="La chasse" />
          <div className="mt-10 grid items-center gap-14 lg:grid-cols-[1.1fr_.9fr]">
            <div className="flex flex-col gap-8">
              <h2 className="apparait titre text-[clamp(2.2rem,4.6vw,4rem)] leading-[1.02]">La chasse est ouverte. Sur votre téléphone.</h2>
              <p className="apparait max-w-xl text-lg leading-relaxed text-doux">Des lapins encapuchonnés se cachent dans Paris. Un radar fait vibrer le téléphone quand on approche, on scanne la puce NFC cachée sous la statuette, et chaque capture rapporte des points à dépenser au pop-up store.</p>
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

        {/* 05 — La boutique : chaque lot dans une étiquette */}
        <section id="boutique" className="border-t-2 border-encre bg-creme-2/50 py-28" aria-labelledby="titre-boutique">
          <div className="mx-auto max-w-6xl px-5 md:px-8">
            <Chapitre n="05" titre="La boutique" />
            <div className="mt-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <h2 id="titre-boutique" className="apparait titre max-w-2xl text-[clamp(2.2rem,4.6vw,4rem)] leading-[1.02]">Vos points valent de vrais lots.</h2>
              <p className="apparait max-w-sm leading-relaxed text-doux">Échangez vos points dans l'appli, puis récupérez le lot au pop-up store avec votre bon.</p>
            </div>
            <ul className="mt-14 grid gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
              {lots.map((l, i) => (
                <li key={l.id} className="apparait" style={{ ['--d' as string]: `${i * .08}s` }}>
                  <Etiquette className="h-full" corps="flex h-full flex-col p-4" larg="34%" arche="1.6rem" fond="#FFFCF4">
                    <div className="relative grid aspect-square place-items-center overflow-hidden rounded-[10px] bg-creme-2">
                      {l.image_url ? <img src={l.image_url} alt="" className="absolute inset-0 size-full object-cover" /> : <Icon name="boutique" size={52} className="text-doux" />}
                    </div>
                    <p className="titre mt-4 min-h-[2.4em] text-center text-base leading-tight">{l.name}</p>
                    <span aria-hidden className="mx-auto my-3 block h-[3px] w-8 bg-encre" />
                    <p className="text-center text-sm font-bold">{l.cost} points</p>
                    <button onClick={() => setDemo(l)} disabled={l.stock === 0} className="mt-4 min-h-11 rounded-[10px] border-2 border-encre text-sm font-bold transition hover:bg-[#023341] hover:text-[#FCF5E3] disabled:opacity-40">
                      {l.stock === 0 ? 'Rupture de stock' : 'Réserver (démo)'}
                    </button>
                  </Etiquette>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* All Stars : les vraies étiquettes, puis des étiquettes vides */}
        <section className="mx-auto max-w-6xl px-5 py-28 md:px-8">
          <Chapitre n="06" titre="La suite" />
          <h2 className="apparait titre mt-10 max-w-3xl text-[clamp(2.2rem,4.6vw,4rem)] leading-[1.02]">La collection All Stars.</h2>
          <p className="apparait mt-4 max-w-2xl text-lg text-doux">Assassin's Creed ouvre le bal. Ensuite, chaque grande licence Ubisoft aura sa box et sa bougie, au parfum de son monde.</p>
          <div className="mt-14 grid grid-cols-2 gap-6 lg:grid-cols-4">
            {[['/site/etiquette-ac.webp', 'Rhum Marin', 'Assassin\'s Creed IV — disponible'], ['/site/etiquette-pop.webp', 'Figue Tabacée', 'Prochainement']].map(([img, nom, info], i) => (
              <figure key={nom} className="apparait" style={{ ['--d' as string]: `${i * .1}s` }}>
                <img src={img} alt={`Étiquette de la bougie ${nom}`} loading="lazy" className="w-full" />
                <figcaption className="mt-3 border-t border-trait pt-2 text-sm"><b>{nom}</b> · <span className="text-doux">{info}</span></figcaption>
              </figure>
            ))}
            {[0, 1].map((i) => (
              <div key={i} className="apparait" style={{ ['--d' as string]: `${(i + 2) * .1}s` }}>
                <Etiquette couleur="#DCD2BA" fond="transparent" className="aspect-[700/832]" corps="grid place-items-center border-dashed" larg="40%">
                  <span className="titre text-5xl text-trait">?</span>
                </Etiquette>
                <p className="mt-3 border-t border-trait pt-2 text-sm text-doux">Licence mystère</p>
              </div>
            ))}
          </div>
        </section>

        {/* Fin : la phrase signature dans une grande étiquette */}
        <section className="bg-[#011A22] px-5 py-28">
          <Etiquette className="apparait mx-auto max-w-3xl" corps="flex flex-col items-center gap-6 px-8 py-14 text-center text-[#023341]" larg="30%" arche="3.4rem">
            <Bougie className="w-20" />
            <p className="titre text-[clamp(2.4rem,5vw,4.4rem)] leading-none">Scent Back.</p>
            <span aria-hidden className="block h-[3px] w-12 bg-[#023341]" />
            <p className="max-w-lg text-xl leading-relaxed">Le temps d'une bougie, retrouvez ce que vous ressentiez.</p>
            <div className="mt-2 flex flex-wrap justify-center gap-3">
              <a href="#box" className="min-h-12 content-center rounded-[10px] bg-[#023341] px-7 font-bold text-[#FCF5E3]">Voir la box</a>
              <button onClick={ouvrirTuto} className="min-h-12 rounded-[10px] border-2 border-[#023341] px-7 font-bold">Installer l'appli</button>
            </div>
          </Etiquette>
        </section>
      </main>
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
