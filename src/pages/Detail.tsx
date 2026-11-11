import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getCaptures, getStatues } from '../lib/api'
import { useData } from '../lib/useData'
import { Icon, Lapin, rarityLabel } from '../ui'

declare module 'react' {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX { interface IntrinsicElements { 'model-viewer': React.HTMLAttributes<HTMLElement> & Record<string, unknown> } }
}

export default function Detail() {
  const { id } = useParams()
  const s = useData(getStatues)?.find((x) => x.id === id)
  const c = useData(getCaptures)?.find((x) => x.statueId === id)
  const ok = !!c
  useEffect(() => { if (ok && s?.model) import('@google/model-viewer') }, [ok, s?.model])
  if (!s) return null
  const coul = `var(--color-${s.rarity})`

  return (
    <div className="-mx-5 -mt-[max(1.25rem,env(safe-area-inset-top))] flex flex-col">
      <div className="relative grid aspect-square place-items-center overflow-hidden rounded-b-[36px] bg-encre" style={{ viewTransitionName: `c-${s.id}` }}>
        {ok && s.model
          ? <model-viewer src={s.model} camera-controls auto-rotate alt={s.name} style={{ width: '100%', height: '100%' }} />
          : ok && (s.image ?? c.photo)
            ? <img src={s.image ?? c.photo} alt={s.name} className="absolute inset-0 size-full object-cover" />
            : ok ? <Lapin className="w-1/2" /> : <Icon name="cadenas" size={44} className="text-doux" />}
        <span className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-encre/80 to-transparent" />
        <Link viewTransition data-vt="zoom" data-dir="arriere" to={`/galerie/c/${s.collectionId ?? 'aucune'}`} aria-label="Retour à la collection" className="absolute top-[max(1rem,env(safe-area-inset-top))] left-4 grid size-11 place-items-center rounded-full bg-creme/90 text-encre">
          <Icon name="retour" size={20} />
        </Link>
      </div>

      <div className="flex flex-col gap-5 px-5 pt-5">
        <div className="monte">
          <span className="inline-block rounded-full px-3 py-1 text-[11px] font-bold text-creme" style={{ background: ok ? coul : 'var(--color-doux)' }}>
            {rarityLabel[s.rarity]} · {s.district}
          </span>
          <h1 className="titre mt-2 text-[28px] leading-tight">{ok ? s.name : 'Lapin inconnu'}</h1>
        </div>

        <section className="monte flex flex-col gap-2" style={{ animationDelay: '.06s' }}>
          <h2 className="font-serif text-sm font-bold text-flamme">{ok ? 'Histoire' : 'Indice'}</h2>
          <p className="text-[15px] leading-relaxed text-doux">{ok ? s.description : `« ${s.hint} »`}</p>
        </section>

        <section className="monte flex flex-col gap-2" style={{ animationDelay: '.12s' }}>
          <h2 className="font-serif text-sm font-bold text-flamme">Valeur</h2>
          <p className="text-sm"><b>{s.points}</b> pts <span className="text-doux">/ 150 max</span></p>
          <div className="h-2 overflow-hidden rounded-full bg-creme-2">
            <div className="h-full rounded-full bg-flamme" style={{ width: `${Math.min(100, (s.points / 150) * 100)}%` }} />
          </div>
        </section>

        {c && (
          <section className="monte flex items-center gap-3 rounded-[20px] border-[1.5px] border-trait bg-papier p-3" style={{ animationDelay: '.18s' }}>
            {c.photo && <img src={c.photo} alt="Ta photo de capture" className="size-16 rounded-[14px] object-cover" />}
            <div>
              <p className="font-bold">Capturé ✓</p>
              {c.createdAt && <p className="text-xs text-doux">le {new Date(c.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}</p>}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
