import { Link, useParams } from 'react-router-dom'
import { getCaptures, getCollections, getStatues } from '../lib/api'
import { useData } from '../lib/useData'
import { Icon, rarityLabel } from '../ui'
import Scene3D, { HEX } from '../components/Scene3D'

const NIVEAU = { commune: 1, rare: 2, legendaire: 3 } as const
const POINTS_MAX = 250

/** Fiche statuette façon fiche de héros : scène 3D sombre qui tourne, atouts, stats lumineuses. */
export default function Detail() {
  const { id } = useParams()
  const s = useData(getStatues)?.find((x) => x.id === id)
  const c = useData(getCaptures)?.find((x) => x.statueId === id)
  const col = useData(getCollections)?.find((x) => x.id === s?.collectionId)
  const ok = !!c
  if (!s) return null
  const hex = HEX[s.rarity]
  const visuel = ok ? (s.image ?? c.photo) : undefined

  const atouts: [string, string, string][] = [
    ['★', 'Rareté', rarityLabel[s.rarity]],
    ['◎', 'Quartier', s.district],
    ['✦', 'Valeur', `${s.points} pts`],
    ['▣', 'Collection', col?.name.split('—')[0].trim() ?? '—'],
  ]
  const stats: [string, number, string][] = [
    ['Valeur', s.points / POINTS_MAX, `${s.points} / ${POINTS_MAX}`],
    ['Rareté', NIVEAU[s.rarity] / 3, `${NIVEAU[s.rarity]} / 3`],
  ]

  return (
    <div className="-mx-5 -mt-4 flex flex-col">
      {/* Scène : fond sombre + halo de la couleur de rareté + socle lumineux */}
      <Scene3D rarity={s.rarity} nom={s.name} model={s.model} image={visuel} debloque={ok} vt={`c-${s.id}`} className="h-[min(62dvh,520px)]">
        <span aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-creme to-transparent" />
        <Link viewTransition data-vt="zoom" data-dir="arriere" to={`/galerie/c/${s.collectionId ?? 'aucune'}`} aria-label="Retour à la collection"
          className="absolute top-4 left-4 grid size-11 place-items-center rounded-full bg-white/15 text-white ring-1 ring-white/25 backdrop-blur-md"><Icon name="retour" size={20} /></Link>
        {s.model && <p className="absolute top-6 right-4 rounded-full bg-white/12 px-3 py-1.5 text-[11px] font-bold text-white/85 ring-1 ring-white/20">↻ Fais-le tourner</p>}
      </Scene3D>

      <div className="relative -mt-6 flex flex-col gap-6 px-5">
        <header className="monte">
          <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold text-white" style={{ background: hex }}>
            {rarityLabel[s.rarity]}{col && <> · {col.name.split('—')[0].trim()}</>}
          </span>
          <h1 className="titre mt-2 text-[34px] leading-[1.05] [text-wrap:balance]">{ok ? s.name : '? ? ?'}</h1>
          <span aria-hidden className="mt-3 block h-[3px] w-24 rounded-full" style={{ background: `linear-gradient(90deg, ${hex}, transparent)` }} />
        </header>

        {/* Atouts : pastilles rondes façon « compétences » */}
        <section className="monte" style={{ animationDelay: '.06s' }} aria-labelledby="atouts">
          <h2 id="atouts" className="font-serif text-sm font-bold text-flamme">Atouts</h2>
          <ul className="mt-3 grid grid-cols-4 gap-2">
            {atouts.map(([g, k, v]) => (
              <li key={k} className="flex flex-col items-center gap-1.5 text-center">
                <span aria-hidden className="grid size-14 place-items-center rounded-full text-xl text-white" style={{ background: `radial-gradient(circle at 35% 30%, ${hex}, #011A22)`, boxShadow: `0 6px 16px ${hex}55, inset 0 0 0 2px #ffffff22` }}>{g}</span>
                <span className="text-[10px] font-bold tracking-wide text-doux uppercase">{k}</span>
                <span className="line-clamp-2 text-xs leading-tight font-medium">{v}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Stats : barres lumineuses */}
        <section className="monte flex flex-col gap-3.5" style={{ animationDelay: '.12s' }} aria-labelledby="stats">
          <h2 id="stats" className="font-serif text-sm font-bold text-flamme">Stats</h2>
          {stats.map(([k, v, t]) => (
            <div key={k}>
              <p className="flex justify-between text-sm"><b>{k}</b><span className="text-doux">{t}</span></p>
              <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-creme-2" role="meter" aria-label={k} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(v * 100)}>
                <div className="relative h-full rounded-full transition-[width] duration-1000" style={{ width: `${Math.min(100, v * 100)}%`, background: `linear-gradient(90deg, #FF7722, ${hex})`, boxShadow: '0 0 12px #FF772299' }}>
                  <span className="absolute top-1/2 right-0 size-3 -translate-y-1/2 translate-x-1/2 rounded-full bg-white shadow-[0_0_10px_#fff]" />
                </div>
              </div>
            </div>
          ))}
        </section>

        <section className="monte flex flex-col gap-1.5" style={{ animationDelay: '.18s' }}>
          <h2 className="font-serif text-sm font-bold text-flamme">{ok ? 'Histoire' : 'Indice'}</h2>
          <p className="text-[15px] leading-relaxed text-doux">{ok ? s.description : `« ${s.hint} »`}</p>
        </section>

        {c ? (
          <section className="monte flex items-center gap-3 rounded-[22px] bg-encre p-3 pr-4 text-creme" style={{ animationDelay: '.24s' }}>
            {c.photo ? <img src={c.photo} alt="Ta photo de capture" className="size-16 rounded-[16px] object-cover" /> : <span className="grid size-16 place-items-center rounded-[16px] bg-creme/10"><Icon name="photo" size={24} /></span>}
            <div className="flex-1">
              <p className="font-serif font-bold">Capturé ✓</p>
              {c.createdAt && <p className="text-xs opacity-75">le {new Date(c.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}</p>}
            </div>
            <span className="rounded-full bg-flamme px-3 py-1.5 text-xs font-bold text-encre">+{s.points} pts</span>
          </section>
        ) : (
          <section className="monte flex items-center gap-3 rounded-[22px] border-[1.5px] border-dashed border-trait p-4" style={{ animationDelay: '.24s' }}>
            <Icon name="cadenas" size={22} className="shrink-0 text-doux" />
            <p className="text-sm text-doux">Trouve cette statuette dans Paris et scanne sa puce pour la débloquer.</p>
          </section>
        )}
      </div>
    </div>
  )
}
