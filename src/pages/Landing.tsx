import { LogoMarque } from '../ui'

const ADRESSE = 'scent-back.lucasternel.com'
const LEGAL = [['mentions', 'Mentions légales'], ['conditions', 'Conditions d\'utilisation'], ['confidentialite', 'Confidentialité'], ['cookies', 'Cookies']]

/** Habillage des pages vues sur ordinateur (landing, pages légales) : en-tête + pied, responsive. */
export function SiteDesktop({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-creme text-encre">
      <a href="#contenu" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-full focus:bg-encre focus:px-5 focus:py-3 focus:text-creme">Aller au contenu</a>
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 pt-6 md:px-8">
        <a href="/" aria-label="Accueil Scent Back"><LogoMarque className="-my-6 -ml-4 h-24 w-auto md:h-28" /></a>
        <a href="/#installer" className="rounded-full border-[1.5px] border-trait px-4 py-2.5 text-sm font-bold transition hover:border-encre md:px-5">Installer l'appli</a>
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
    </div>
  )
}

/** Accueil sur ordinateur : Scent Back se joue dans la rue, donc on invite à passer sur mobile. */
export default function Landing() {
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

      {/* Installation */}
      <section id="installer" className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-20">
        <h2 className="titre text-4xl">Installe-la comme une vraie appli</h2>
        <p className="mt-3 max-w-2xl text-lg text-doux">Pas besoin de store : ouvre {ADRESSE} sur ton téléphone, puis ajoute-la à ton écran d'accueil. Elle s'ouvrira en plein écran.</p>
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {[
            ['iPhone', 'Safari', ['Ouvre le site dans Safari', 'Touche le bouton Partager', 'Choisis « Sur l\'écran d\'accueil »']],
            ['Android', 'Chrome', ['Ouvre le site dans Chrome', 'Touche le menu ⋮ en haut à droite', 'Choisis « Installer l\'application »']],
          ].map(([os, nav, pas]) => (
            <div key={os as string} className="rounded-[28px] border-[1.5px] border-trait bg-papier p-7">
              <p className="font-serif text-2xl font-bold">{os as string} <span className="text-base font-medium text-doux">· {nav as string}</span></p>
              <ol className="mt-5 flex flex-col gap-3">
                {(pas as string[]).map((p, i) => (
                  <li key={p} className="flex items-center gap-3"><span className="grid size-8 shrink-0 place-items-center rounded-full bg-flamme text-sm font-bold text-encre">{i + 1}</span>{p}</li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      </section>

    </SiteDesktop>
  )
}
