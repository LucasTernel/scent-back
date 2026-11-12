import { useEffect, useRef, useState } from 'react'
import { getLots } from '../lib/api'
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
        className="flex items-center gap-2 rounded-full border-[1.5px] border-trait px-4 py-2.5 text-sm font-bold transition hover:border-encre">
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
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 pt-6 md:px-8">
        <a href="/" aria-label="Accueil Scent Back"><LogoMarque className="-my-6 -ml-4 h-24 w-auto md:h-28" /></a>
        <div className="flex items-center gap-2">
        <Accessibilite />
        <button onClick={() => setTuto(true)} className="flex items-center gap-2 rounded-full bg-[#023341] px-4 py-2.5 text-sm font-bold text-[#FCF5E3] shadow-md transition hover:bg-[#0E4D61] md:px-5 dark:bg-flamme dark:text-[#023341] dark:hover:bg-flamme"><Icon name="nfc" size={18} />Installer l'appli</button>
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

/** Accueil sur ordinateur : Scent Back se joue dans la rue, donc on invite à passer sur mobile. */
export default function Landing() {
  const lots = useData(getLots) ?? []
  const etapes = [
    ['01', 'Traque', 'Un radar suit ta position et fait vibrer ton téléphone de plus en plus vite quand une statuette est proche.'],
    ['02', 'Scanne', 'Approche ton téléphone de la puce NFC cachée sous la statuette : elle apparaît dans un flash.'],
    ['03', 'Collectionne', 'Chaque capture devient une carte. Complète les collections et gagne des points pour le pop-up store.'],
  ]

  return (
    <SiteDesktop>

      {/* Héros : texte + QR à gauche, aperçu réel de l'appli à droite */}
      <main id="contenu" className="mx-auto grid max-w-6xl items-center gap-12 px-5 pt-8 pb-16 md:gap-16 md:px-8 md:pt-10 md:pb-20 lg:grid-cols-[1.1fr_.9fr]">
        <section className="monte flex flex-col gap-6">
          <p className="w-fit rounded-full bg-encre px-4 py-1.5 text-xs font-bold tracking-[.16em] text-creme">UBISOFT × LA BELLE MÈCHE · POP-UP PARIS</p>
          <h1 className="titre text-[clamp(2.6rem,5vw,4.4rem)] leading-[1.02]">La chasse est ouverte.<br /><span className="text-flamme">Sur ton téléphone.</span></h1>
          <p className="max-w-xl text-lg leading-relaxed text-doux">
            Des lapins encapuchonnés se cachent dans Paris. Scent Back se joue dans la rue : radar, vibrations, puces NFC et appareil photo. Tout ce qu'un ordinateur n'a pas.
          </p>

          <div className="mt-2 flex flex-col items-start gap-5 rounded-[28px] border-[1.5px] border-trait bg-papier p-5 sm:flex-row sm:items-center sm:gap-6 sm:pr-8 shadow-[0_6px_0_var(--color-trait)]">
            <img src="/qr-app.svg" alt={`QR code qui ouvre ${ADRESSE} sur ton téléphone`} className="size-36 shrink-0 rounded-2xl bg-[#FCF5E3] p-2" />
            <div className="flex flex-col gap-2">
              <p className="font-serif text-xl font-bold">Scanne pour jouer</p>
              <p className="text-sm leading-relaxed text-doux">Ouvre l'appareil photo de ton téléphone et vise le code. Ou tape l'adresse :</p>
              <p className="w-fit rounded-full bg-creme-2 px-3 py-1 font-mono text-sm font-bold">{ADRESSE}</p>
            </div>
          </div>

          <a href="#boutique" className="flex w-fit items-center gap-2 font-bold text-encre underline-offset-4 hover:underline"><Icon name="boutique" size={20} />Voir la boutique et ses lots ↓</a>
        </section>

        <div className="monte relative mx-auto hidden lg:block" style={{ animationDelay: '.15s' }} aria-hidden>
          <div className="absolute -inset-10 -z-10 rounded-full bg-flamme/20 blur-3xl" />
          <div className="rounded-[54px] bg-encre p-3 shadow-2xl ring-1 ring-trait">
            <div className="relative h-[675px] w-[312px] overflow-hidden rounded-[44px] bg-creme">
              {/* l'appli elle-même, à taille de téléphone */}
              <iframe src="/?mobile=1" title="Aperçu de Scent Back" tabIndex={-1} className="pointer-events-none absolute top-0 left-0 h-[844px] w-[390px] origin-top-left scale-[.8] border-0" />
            </div>
          </div>
        </div>
      </main>

      {/* Comment ça marche */}
      <section className="bg-[#023341] py-20 text-[#FCF5E3] dark:bg-[#073D4F]">
        <div className="mx-auto max-w-6xl px-5 md:px-8">
          <h2 className="titre text-4xl">Comment on joue</h2>
          <ol className="mt-10 grid gap-5 md:grid-cols-3">
            {etapes.map(([n, t, d]) => (
              <li key={n} className="flex flex-col gap-3 rounded-[28px] bg-[#FCF5E3]/8 p-7 ring-1 ring-[#FCF5E3]/10">
                <span className="titre text-5xl text-flamme">{n}</span>
                <h3 className="font-serif text-xl font-bold">{t}</h3>
                <p className="leading-relaxed text-[#FCF5E3]/75">{d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Boutique mise en avant */}
      <section id="boutique" className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-20" aria-labelledby="titre-boutique">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="w-fit rounded-full bg-flamme px-3 py-1 text-xs font-bold tracking-[.14em] text-[#023341]">LA BOUTIQUE</p>
            <h2 id="titre-boutique" className="titre mt-3 text-4xl">Tes points valent de vrais lots</h2>
            <p className="mt-3 max-w-2xl text-lg text-doux">Chaque lapin capturé rapporte des points. Échange-les dans l'appli, puis récupère ton lot au pop-up store Ubisoft × La Belle Mèche avec ton bon.</p>
          </div>
          <button onClick={ouvrirTuto} className="btn btn-encre !w-auto shrink-0 px-7">Commencer la chasse</button>
        </div>
        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {lots.map((l) => (
            <li key={l.id} className="flex flex-col gap-3 rounded-[26px] border-[1.5px] border-trait bg-papier p-3 pb-5">
              <div className="relative grid aspect-square place-items-center overflow-hidden rounded-[20px] bg-creme-2">
                {l.image_url ? <img src={l.image_url} alt="" className="absolute inset-0 size-full object-cover" /> : <Icon name="boutique" size={56} className="text-doux" />}
                <span className="absolute top-3 right-3 rounded-full bg-[#023341] px-3 py-1.5 text-sm font-bold text-[#FCF5E3]">{l.cost} pts</span>
              </div>
              <p className="px-1 font-serif text-base leading-snug font-bold">{l.name}</p>
            </li>
          ))}
        </ul>
      </section>

    </SiteDesktop>
  )
}
