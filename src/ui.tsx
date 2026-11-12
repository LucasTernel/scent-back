// Éléments partagés (= composants Figma) : icônes, lapin, logo, sceau, cartes.
import type { CSSProperties } from 'react'
import type { Rarity, Statue } from './lib/api'
import { LOGO_PATH } from './logo'

const paths = {
  plus: 'M12 5v14M5 12h14',
  boutique: 'M5 8h14l-1.2 11.2a2 2 0 0 1-2 1.8H8.2a2 2 0 0 1-2-1.8L5 8zM9 8V6.5a3 3 0 0 1 6 0V8',
  nfc: 'M6 8.3a6 6 0 0 1 0 7.4M9.5 6a10 10 0 0 1 0 12M13 4a14 14 0 0 1 0 16M17 2.5a18 18 0 0 1 0 19',
  collection: 'M7 3h10a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zM9 8h6M9 12h6',
  profil: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0',
  cadenas: 'M6 11h12v9H6zM8.5 11V8a3.5 3.5 0 0 1 7 0v3',
  retour: 'M15 5l-7 7 7 7',
  sortie: 'M15 4h5v16h-5M10 16l4-4-4-4M14 12H4',
  photo: 'M3 8h4l2-3h6l2 3h4v12H3zM12 17a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z',
  lieu: 'M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11zM12 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
  chevron: 'M9 6l6 6-6 6',
}
export type IconName = keyof typeof paths

export function Icon({ name, size = 22, className = '' }: { name: IconName; size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden className={className}>
      <path d={paths[name]} />
    </svg>
  )
}

export function Flamme({ size = 16 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden><path d="M12 2c3.5 4.5 7 7 7 12a7 7 0 0 1-14 0c0-2.5 1.2-4.3 2.5-5.5.4 2.3 1.6 3.5 3 3.5C10 8.5 11 5 12 2z" fill="#FF7722" /></svg>
}

export function Logo({ className = '', style }: { className?: string; style?: CSSProperties }) {
  return <svg viewBox="0 0 50 50" className={className} style={style} aria-hidden><path fill="currentColor" d={LOGO_PATH} /></svg>
}

/** Lapin à capuche (dessin original). */
export function Lapin({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 120" className={className} aria-hidden>
      <path d="M31 52C22 30 23 6 31 6s12 22 10 44zM69 52c9-22 8-46 0-46S57 28 59 50z" fill="#FFFCF4" stroke="#023341" strokeWidth="2.5" />
      <path d="M50 40c-25 0-35 18-35 40 0 25 15 37 35 37s35-12 35-37c0-22-10-40-35-40z" fill="#FFFCF4" stroke="#023341" strokeWidth="2.5" />
      <path d="M15 74c3-21 17-34 35-34s32 13 35 34c-10-8-22-12-35-12s-25 4-35 12z" fill="#023341" />
      <path d="M50 62l-7 13h14z" fill="#B3121B" />
      <ellipse cx="40" cy="86" rx="5" ry="7" fill="#023341" /><ellipse cx="60" cy="86" rx="5" ry="7" fill="#023341" />
      <path d="M38 101q12 8 24 0" stroke="#023341" strokeWidth="3" fill="none" strokeLinecap="round" />
      <rect x="45" y="101" width="4.5" height="7" rx="1" fill="#FFFCF4" stroke="#023341" strokeWidth="1.2" />
      <rect x="50.5" y="101" width="4.5" height="7" rx="1" fill="#FFFCF4" stroke="#023341" strokeWidth="1.2" />
    </svg>
  )
}

export const rarityLabel: Record<Rarity, string> = { commune: 'Commune', rare: 'Rare', superrare: 'Super rare', epique: 'Épique', legendaire: 'Légendaire' }
const glyph: Record<Rarity, string> = { commune: '●', rare: '◆', superrare: '◆◆', epique: '✦', legendaire: '★' }

/** Sceau de cire = rareté. */
export function Sceau({ rarity, size = 44, className = '' }: { rarity: Rarity; size?: number; className?: string }) {
  const leg = rarity === 'legendaire'
  return (
    <span role="img" aria-label={`Rareté ${rarityLabel[rarity]}`} className={`grid shrink-0 place-items-center rounded-full font-bold shadow-[0_3px_6px_rgba(28,23,20,.35)] ${className}`}
      style={{ width: size, height: size, fontSize: size * .4, background: `var(--color-${rarity})`, color: leg ? 'var(--color-or)' : 'var(--color-papier)', boxShadow: `inset 0 0 0 ${size > 30 ? 3 : 2}px ${leg ? 'var(--color-or)' : 'var(--color-papier)'}, 0 3px 6px rgba(28,23,20,.35)` }}>
      {glyph[rarity]}
    </span>
  )
}

/** Carte trouvée (arche). */
export function Carte({ statue, photo, className = '' }: { statue: Statue; photo?: string; className?: string }) {
  return (
    <article className={`arche cq relative flex flex-col gap-2 border-[1.5px] border-encre bg-papier p-2 pb-3 shadow-[0_4px_0_#023341] ${className}`}>
      <div className="relative grid aspect-[144/140] place-items-end justify-center overflow-hidden bg-creme-2" style={{ borderRadius: 'calc(50cqw - 8px) calc(50cqw - 8px) 10px 10px' }}>
        {photo ? <img src={photo} alt={`Photo de ${statue.name}`} loading="lazy" className="absolute inset-0 size-full object-cover" /> : <Lapin className="w-[56%]" />}
      </div>
      <Sceau rarity={statue.rarity} className="absolute right-1 top-[46%]" />
      <h3 className="px-1 font-serif text-[15px] leading-tight font-semibold">{statue.name}</h3>
      <p className="px-1 text-[10px] font-medium tracking-wide text-doux uppercase">{statue.district} · {statue.points} pts</p>
    </article>
  )
}

/** Carte verrouillée. */
export function CarteVerrouillee({ hint, numero }: { hint: string; numero: number }) {
  return (
    <article className="arche flex aspect-[160/236] flex-col items-center justify-center gap-2 border-[1.5px] border-dashed border-trait bg-creme-2 px-4 text-center">
      <Icon name="cadenas" size={22} className="text-doux" />
      <span className="text-[11px] font-bold text-doux">N° {String(numero).padStart(2, '0')}</span>
      <p className="font-serif text-[13px] leading-snug text-doux">« {hint} »</p>
    </article>
  )
}

/** Logo Scent Back : bleu en clair, blanc en sombre. */
export function LogoMarque({ className = '' }: { className?: string }) {
  return <>
    <img src="/logo-bleu.png" alt="Scent Back" className={`${className} dark:hidden`} />
    <img src="/logo-blanc.png" alt="Scent Back" className={`${className} hidden dark:block`} />
  </>
}
