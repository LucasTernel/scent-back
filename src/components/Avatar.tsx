import { useEffect, useRef } from 'react'

/** Catalogue d'avatars : têtes de Lapins Crétins (rendus des modèles 3D) et jeux Ubisoft. L'id est stocké dans profiles.avatar_url. */
const LAPINS = ['revolutionnaire', 'ultimate', 'opera', 'louvre', 'eiffel', 'ndame', 'marais', 'montm', 'arc', 'canal', 'luxem', 'panth', 'pneuf']
// Logos officiels (Wikimedia Commons) dans public/avatars/jeux/<id>.png, posés sur un fond qui les fait ressortir
const JEUX: [id: string, nom: string, fond: string][] = [
  ['ac', 'Assassin\'s Creed IV Black Flag', '#FFFFFF'],
  ['farcry', 'Far Cry', '#E8501C'],
  ['rayman', 'Rayman', '#3B2A7A'],
  ['pop', 'Prince of Persia', '#E9C46A'],
  ['watchdogs', 'Watch Dogs', '#21D07A'],
  ['r6', 'Rainbow Six', '#EDF2F4'],
  ['justdance', 'Just Dance', '#FF4FA3'],
  ['splinter', 'Splinter Cell', '#4A4A4A'],
  ['crew', 'The Crew', '#F2C14E'],
  ['bge', 'Beyond Good & Evil', '#1B2A1B'],
  ['ubisoft', 'Ubisoft', '#FFFFFF'],
]
export const AVATARS = [...LAPINS.map((l) => `lapin:${l}`), ...JEUX.map((j) => `jeu:${j[0]}`)]

/** Avatar par défaut : un jeu Ubisoft tiré au hasard mais stable pour un même joueur. */
export const avatarParDefaut = (graine: string) => `jeu:${JEUX[[...graine].reduce((s, c) => s + c.charCodeAt(0), 0) % JEUX.length][0]}`

export function Avatar({ id, className = 'size-16' }: { id: string; className?: string }) {
  const [type, cle] = id.split(':')
  if (type === 'lapin') return <span className={`block overflow-hidden rounded-[22%] bg-[radial-gradient(circle_at_50%_35%,#0E5A70,#023341)] ${className}`}><img src={`/avatars/lapin-${cle}.png`} alt="" className="size-full object-cover" /></span>
  const j = JEUX.find((x) => x[0] === cle) ?? JEUX[0]
  return <span className={`grid place-items-center overflow-hidden rounded-[22%] ${className}`} style={{ background: j[2] }}><img src={`/avatars/jeux/${j[0]}.png`} alt="" className="size-[76%] object-contain" /></span>
}
const nomDe = (id: string) => { const [t, c] = id.split(':'); return t === 'lapin' ? `Lapin ${c}` : JEUX.find((x) => x[0] === c)?.[1] ?? c }

/** Choix « à la Netflix » : grille plein écran par familles. */
export function ChoixAvatar({ actuel, choisir, fermer }: { actuel: string; choisir: (id: string) => void; fermer: () => void }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    ref.current?.querySelector<HTMLButtonElement>('[aria-pressed=true]')?.focus()
    const echap = (e: KeyboardEvent) => e.key === 'Escape' && fermer()
    addEventListener('keydown', echap); return () => removeEventListener('keydown', echap)
  }, [fermer])
  const groupe = (titre: string, ids: string[]) => (
    <section className="flex flex-col gap-3">
      <h3 className="font-serif text-lg font-bold">{titre}</h3>
      <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {ids.map((id) => (
          <li key={id}>
            <button onClick={() => choisir(id)} aria-pressed={id === actuel} aria-label={nomDe(id)}
              className={`block w-full rounded-[24%] p-1 transition hover:scale-105 focus-visible:scale-105 ${id === actuel ? 'ring-4 ring-flamme' : ''}`}>
              <Avatar id={id} className="aspect-square w-full" />
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
  return (
    <div role="dialog" aria-modal="true" aria-labelledby="titre-avatar" className="fixed inset-0 z-50 overflow-y-auto bg-creme p-5 pt-[calc(env(safe-area-inset-top)+20px)]" ref={ref}>
      <div className="mx-auto flex max-w-xl flex-col gap-6 pb-10">
        <header className="flex items-center justify-between">
          <h2 id="titre-avatar" className="titre text-2xl">Choisis ton avatar</h2>
          <button onClick={fermer} className="grid size-11 place-items-center rounded-full bg-creme-2 text-xl font-bold" aria-label="Fermer">×</button>
        </header>
        {groupe('Les Lapins Crétins', AVATARS.filter((a) => a.startsWith('lapin:')))}
        {groupe('Jeux Ubisoft', AVATARS.filter((a) => a.startsWith('jeu:')))}
      </div>
    </div>
  )
}
