import { useEffect, useRef, useState } from 'react'

/** « Cliquez pour sentir » (réf. Adopt) : on ne peut pas transmettre une odeur, alors on la raconte —
 *  pyramide olfactive (tête / cœur / fond) qui se dévoile, avec des volutes de fumée animées. */
export type Notes = { ambiance: string; couleur: string; tete: string[]; coeur: string[]; fond: string[] }
// ponytail: notes proposées pour le prototype, à remplacer par la vraie fiche olfactive de La Belle Mèche
export const NOTES: Record<string, Notes> = {
  'rhum-marin': { ambiance: 'Le pont du Jackdaw au crépuscule : embruns, bois mouillé et un fond de rhum ambré.', couleur: '#C98A3E', tete: ['Embruns', 'Citron vert'], coeur: ['Rhum ambré', 'Bois de navire'], fond: ['Vanille', 'Cuir', 'Tabac blond'] },
  'box-ac4': { ambiance: 'La bougie Rhum Marin de la box : embruns, bois mouillé et rhum ambré.', couleur: '#C98A3E', tete: ['Embruns', 'Citron vert'], coeur: ['Rhum ambré', 'Bois de navire'], fond: ['Vanille', 'Cuir', 'Tabac blond'] },
  'figue-tabacee': { ambiance: 'Un salon feutré, une figue mûre posée près d\'un cendrier en laiton.', couleur: '#B5632E', tete: ['Feuille de figuier', 'Bergamote'], coeur: ['Figue mûre', 'Tabac'], fond: ['Santal', 'Fève tonka'] },
}

export function BoutonSentir({ id, nom, className = '' }: { id: string; nom: string; className?: string }) {
  const [ouvert, setOuvert] = useState(false)
  if (!NOTES[id]) return null
  return <>
    <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOuvert(true) }} aria-label={`Sentir ${nom}`}
      className={`grid size-24 place-items-center rounded-full bg-[#F6D6C8] p-2 text-center text-[#023341] shadow-lg ring-4 ring-white/70 transition hover:scale-105 ${className}`}>
      <span className="leading-tight"><span aria-hidden className="block text-lg">✺</span><span className="block text-[11px]">Cliquez pour</span><span className="titre block text-base">sentir</span></span>
    </button>
    {ouvert && <FicheOlfactive n={NOTES[id]} nom={nom} fermer={() => setOuvert(false)} />}
  </>
}

function FicheOlfactive({ n, nom, fermer }: { n: Notes; nom: string; fermer: () => void }) {
  const bouton = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    bouton.current?.focus()
    const echap = (e: KeyboardEvent) => e.key === 'Escape' && fermer()
    addEventListener('keydown', echap); return () => removeEventListener('keydown', echap)
  }, [fermer])
  const etages: [string, string, string[]][] = [['Notes de tête', 'Les premières secondes', n.tete], ['Notes de cœur', 'Quand la cire fond', n.coeur], ['Notes de fond', 'Ce qui reste dans la pièce', n.fond]]
  return (
    <div role="dialog" aria-modal="true" aria-labelledby="sentir-titre" onClick={fermer} className="fixed inset-0 z-[80] grid place-items-center bg-[#011A22]/80 p-4 backdrop-blur-sm">
      <div onClick={(e) => e.stopPropagation()} className="pop relative w-full max-w-lg overflow-hidden rounded-[28px] bg-[#011A22] p-7 text-[#FCF5E3] shadow-2xl">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          {[0, 1, 2, 3, 4].map((i) => <span key={i} className="volute" style={{ left: `${15 + i * 17}%`, animationDelay: `${i * .7}s`, ['--c' as string]: n.couleur }} />)}
        </div>
        <button ref={bouton} onClick={fermer} aria-label="Fermer" className="absolute top-4 right-4 z-10 grid size-11 place-items-center rounded-full bg-white/10 text-xl">×</button>
        <div className="relative">
          <p className="text-xs font-bold tracking-[.22em] text-flamme uppercase">Fiche olfactive</p>
          <h2 id="sentir-titre" className="titre mt-2 pr-12 text-3xl">{nom}</h2>
          <p className="mt-3 leading-relaxed text-[#FCF5E3]/80">{n.ambiance}</p>
          <ol className="mt-6 flex flex-col gap-3">
            {etages.map(([t, s, notes], i) => (
              <li key={t} className="monte rounded-[18px] bg-white/6 p-4 ring-1 ring-white/10" style={{ animationDelay: `${.2 + i * .25}s`, marginInline: `${i * 6}%` }}>
                <p className="flex items-baseline justify-between gap-3"><span className="titre text-base">{t}</span><span className="text-xs text-[#FCF5E3]/55">{s}</span></p>
                <p className="mt-2 flex flex-wrap gap-2">{notes.map((x) => <span key={x} className="rounded-full px-3 py-1 text-sm font-bold text-[#011A22]" style={{ background: n.couleur }}>{x}</span>)}</p>
              </li>
            ))}
          </ol>
          <p className="mt-5 text-center text-xs text-[#FCF5E3]/50">Fermez les yeux… et venez la sentir en vrai au pop-up store.</p>
        </div>
      </div>
    </div>
  )
}
