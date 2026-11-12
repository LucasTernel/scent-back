import { Fragment, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getCaptures, getCollections, getStatues, HEX_RARETE, rangRarete } from '../lib/api'
import { useData } from '../lib/useData'
import { Icon, Lapin, rarityLabel } from '../ui'

const Barre = ({ v, max }: { v: number; max: number }) => (
  <span className="block h-1.5 overflow-hidden rounded-full bg-creme/20"><span className="block h-full rounded-full bg-flamme transition-all duration-700" style={{ width: `${max ? (v / max) * 100 : 0}%` }} /></span>
)

/** 1. Liste des collections, avec la progression du joueur. */
export default function Gallery() {
  const statues = useData(getStatues) ?? []
  const captures = useData(getCaptures) ?? []
  const collections = useData(getCollections) ?? []
  const orphelines = statues.some((s) => !s.collectionId)
  const liste = [...collections, ...(orphelines ? [{ id: 'aucune', name: 'Hors collection', logo_url: undefined }] : [])]

  return (
    <div className="flex flex-col gap-5">
      <header className="monte">
        <p className="text-sm font-medium text-doux">{captures.length} lapins sur {statues.length}</p>
        <h1 className="titre text-[30px]">Collections</h1>
      </header>
      <ul className="flex flex-col gap-3">
        {liste.map((c, i) => {
          const siennes = statues.filter((s) => (s.collectionId ?? 'aucune') === c.id)
          const trouvees = siennes.filter((s) => captures.some((x) => x.statueId === s.id)).length
          const fini = siennes.length > 0 && trouvees === siennes.length
          return (
            <li key={c.id} className="monte" style={{ animationDelay: `${i * 60}ms` }}>
              <Link viewTransition to={`/galerie/c/${c.id}`} className="relative flex min-h-[150px] items-end overflow-hidden rounded-[24px] bg-encre p-4 text-creme active:scale-[.98] transition">
                {c.logo_url && <img src={c.logo_url} alt="" className="absolute inset-0 size-full object-cover" />}
                <span className="absolute inset-0 bg-gradient-to-t from-encre via-encre/75 to-encre/10" />
                {fini && <span className="absolute top-3 right-3 rounded-full bg-flamme px-3 py-1 text-[11px] font-bold text-encre">Complétée ✓</span>}
                <span className="relative flex w-full flex-col gap-2">
                  <span className="font-serif text-[17px] leading-snug font-bold">{c.name}</span>
                  <span className="flex items-center gap-3">
                    <span className="flex-1"><Barre v={trouvees} max={siennes.length} /></span>
                    <span className="text-sm font-bold"><span className="text-flamme">{trouvees}</span> / {siennes.length}</span>
                  </span>
                </span>
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

/** 2. Les statuettes d'une collection (couverture + recherche + grille). */
export function GalleryCollection() {
  const { id } = useParams()
  const statues = useData(getStatues) ?? []
  const captures = useData(getCaptures) ?? []
  const cols = useData(getCollections)
  const col = id === 'aucune' ? { name: 'Hors collection', description: '', image_url: undefined } : cols?.find((c) => c.id === id)
  const [q, setQ] = useState('')
  const trouve = (sid: string) => captures.find((c) => c.statueId === sid)
  const siennes = statues.filter((s) => (s.collectionId ?? 'aucune') === id)
  const nb = siennes.filter((s) => trouve(s.id)).length
  const liste = siennes
    .filter((s) => !q || (trouve(s.id) && s.name.toLowerCase().includes(q.toLowerCase())))
    .sort((a, b) => rangRarete(a.rarity) - rangRarete(b.rarity) || Number(!!trouve(b.id)) - Number(!!trouve(a.id)))

  return (
    <div className="flex flex-col gap-4">
      {col?.image_url ? (
        <div className="monte relative -mx-5 -mt-4 overflow-hidden rounded-b-[32px] border-b-[1.5px] border-trait bg-papier px-4 pt-16 pb-5">
          <img src={col.image_url} alt="" className="mx-auto max-h-56 w-full object-contain" />
          <Link viewTransition data-dir="arriere" to="/galerie" aria-label="Retour aux collections" className="absolute top-4 left-4 grid size-11 place-items-center rounded-full bg-creme-2 text-encre"><Icon name="retour" size={20} /></Link>
        </div>
      ) : (
        <Link viewTransition data-dir="arriere" to="/galerie" className="-ml-1 inline-flex min-h-11 items-center gap-1 text-sm font-bold text-doux"><Icon name="retour" size={18} />Collections</Link>
      )}

      <header className="monte flex flex-col gap-1.5">
        <h1 className="titre text-[24px] leading-[1.15] [text-wrap:balance]">{col?.name ?? '…'}</h1>
        {col?.description && <p className="text-[15px] leading-relaxed text-doux">{col.description}</p>}
        <p className="mt-1 inline-flex w-fit rounded-full bg-encre px-3.5 py-1.5 text-xs font-bold text-creme"><span className="text-flamme">{nb}</span>&nbsp;/ {siennes.length} trouvés</p>
      </header>

      <label className="monte flex min-h-12 items-center gap-2.5 rounded-full border-[1.5px] border-trait bg-papier px-4">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-doux" aria-hidden><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Chercher un lapin…" aria-label="Chercher un lapin" className="min-w-0 flex-1 bg-transparent text-[15px] outline-none placeholder:text-doux" />
      </label>

      <ul className="grid grid-cols-2 gap-3">
        {liste.map((s, i) => {
          const c = trouve(s.id)
          const img = c?.photo ?? s.image
          return (<Fragment key={s.id}>
              {(i === 0 || liste[i - 1].rarity !== s.rarity) && (
                <li className="col-span-2 mt-2 flex items-center gap-2 first:mt-0">
                  <span aria-hidden className="size-3 rounded-full" style={{ background: HEX_RARETE[s.rarity] }} />
                  <h2 className="font-serif text-sm font-bold">{rarityLabel[s.rarity]}</h2>
                  <span className="text-xs text-doux">{liste.filter((x) => x.rarity === s.rarity).length}</span>
                  <span aria-hidden className="h-px flex-1 bg-trait" />
                </li>
              )}
            <li className="monte" style={{ animationDelay: `${Math.min(i, 8) * 45}ms` }}>
              <Link viewTransition data-vt="zoom" to={`/galerie/${s.id}`} className={`flex flex-col gap-2 rounded-[22px] border-[1.5px] p-2 pb-3 transition active:scale-[.98] ${c ? 'border-trait bg-papier' : 'border-dashed border-trait bg-creme-2/60'}`}>
                <span style={{ viewTransitionName: `c-${s.id}` }} className={`relative grid aspect-square place-items-center overflow-hidden rounded-[16px] ${c ? 'bg-creme-2' : 'bg-creme-2/70'}`}>
                  {c
                    ? img ? <img src={img} alt="" loading="lazy" className="absolute inset-0 size-full object-cover" /> : <Lapin className="w-[64%]" />
                    : <Icon name="cadenas" size={26} className="text-doux" />}
                  {c && <span className="absolute top-2 left-2 size-3 rounded-full ring-2 ring-papier" style={{ background: `var(--color-${s.rarity})` }} />}
                </span>
                <span className={`line-clamp-2 px-1 font-serif text-[13px] leading-snug font-bold ${c ? '' : 'text-doux'}`}>{c ? s.name : '? ? ?'}</span>
                <span className="px-1 text-[11px] text-doux">{s.district} · {s.points} pts</span>
              </Link>
            </li>
          </Fragment>)
        })}
      </ul>
      {liste.length === 0 && <p className="text-center text-sm text-doux">Aucun lapin trouvé.</p>}
    </div>
  )
}
