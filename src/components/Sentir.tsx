import { useEffect, useRef, useState } from 'react'
import { MOCK, supabase } from '../lib/api'

/** « Cliquez pour sentir » (réf. Adopt) : moodboard plein écran, mots + images d'ambiance, éditable en admin. */
export type Tuile = { mot: string; image?: string }
export type Senteur = { id: string; nom: string; couleur: string; tuiles: Tuile[] }
const DEMO: Senteur[] = [
  { id: 'rhum-marin', nom: 'Rhum Marin', couleur: '#C98A3E', tuiles: [{ mot: 'MARIN' }, { mot: 'AMBRÉ' }, { mot: 'BOISÉ' }, { mot: 'VANILLÉ' }, { mot: 'ÉPICÉ' }] },
  { id: 'figue-tabacee', nom: 'Figue Tabacée', couleur: '#B5632E', tuiles: [{ mot: 'FRUITÉ' }, { mot: 'TABAC' }, { mot: 'VERT' }, { mot: 'BOISÉ' }, { mot: 'DOUX' }] },
]
export async function getSenteurs(): Promise<Senteur[]> {
  if (MOCK) return DEMO
  const { data } = await supabase.from('senteurs').select('*')
  return data?.length ? data : DEMO // table pas encore créée → valeurs par défaut
}
export async function saveSenteur(s: Senteur) {
  const { error } = await supabase.from('senteurs').upsert(s)
  if (error) throw error
}
const IMAGES: Record<string, string> = { 'rhum-marin': '/site/bougie.webp', 'box-ac4': '/site/box.webp', 'figue-tabacee': '/site/etiquette-pop.webp' }

export function BoutonSentir({ id, nom, className = '' }: { id: string; nom: string; className?: string }) {
  const [s, setS] = useState<Senteur | null>()
  const ouvrir = async (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation()
    const l = await getSenteurs()
    setS(l.find((x) => x.id === id) ?? l.find((x) => x.id === 'rhum-marin') ?? null)
  }
  return <>
    <button onClick={ouvrir} aria-label={`Sentir ${nom}`}
      className={`grid size-24 place-items-center rounded-full bg-[#F6D6C8] p-2 text-center text-[#023341] shadow-lg ring-4 ring-white/70 transition hover:scale-105 ${className}`}>
      <span className="leading-tight"><span aria-hidden className="block text-lg">✺</span><span className="block text-[11px]">Cliquez pour</span><span className="titre block text-base">sentir</span></span>
    </button>
    {s && <Moodboard s={s} image={IMAGES[id]} fermer={() => setS(undefined)} />}
  </>
}

function Moodboard({ s, image, fermer }: { s: Senteur; image?: string; fermer: () => void }) {
  const b = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    b.current?.focus(); document.documentElement.style.overflow = 'hidden'
    const k = (e: KeyboardEvent) => e.key === 'Escape' && fermer()
    addEventListener('keydown', k); return () => { removeEventListener('keydown', k); document.documentElement.style.overflow = '' }
  }, [fermer])
  const t = [...s.tuiles, ...Array(Math.max(0, 5 - s.tuiles.length)).fill({ mot: '' })].slice(0, 5)
  const tuile = (x: Tuile, i: number, cls: string) => (
    <div key={i} className={`monte relative grid place-items-center overflow-hidden ${cls}`} style={{ animationDelay: `${i * .12}s`,
      background: x.image ? `center/cover url(${x.image})` : `radial-gradient(circle at ${30 + i * 15}% ${20 + i * 12}%, color-mix(in srgb, ${s.couleur} 35%, white), ${s.couleur} 55%, color-mix(in srgb, ${s.couleur} 60%, black))` }}>
      {x.mot && <span className="titre px-4 text-center text-[clamp(2rem,5vw,4.5rem)] leading-none tracking-wider text-white drop-shadow-[0_2px_12px_rgba(0,0,0,.35)]">{x.mot}</span>}
    </div>
  )
  return (
    <div role="dialog" aria-modal="true" aria-label={`Univers olfactif de ${s.nom}`} className="fixed inset-0 z-[80] grid grid-cols-1 gap-2 overflow-y-auto p-2 md:grid-cols-3 md:grid-rows-[1fr_1.4fr] md:overflow-hidden" style={{ background: `color-mix(in srgb, ${s.couleur} 70%, white)` }}>
      {tuile(t[0], 0, 'min-h-[30vh] md:row-span-1')}
      {tuile(t[1], 1, 'min-h-[30vh]')}
      {tuile(t[2], 2, 'min-h-[30vh]')}
      {tuile(t[3], 3, 'min-h-[30vh]')}
      <div className="monte relative flex min-h-[50vh] flex-col items-center justify-center gap-4 p-6" style={{ background: s.couleur, animationDelay: '.3s' }}>
        {image && <img src={image} alt={s.nom} className="max-h-[48vh] max-w-full object-contain drop-shadow-2xl" />}
        <p className="titre text-2xl text-white">{s.nom}</p>
      </div>
      {tuile(t[4], 4, 'min-h-[30vh]')}
      <button ref={b} onClick={fermer} aria-label="Fermer" className="fixed top-4 right-4 z-10 grid size-14 place-items-center rounded-full bg-black/25 text-3xl text-white backdrop-blur">×</button>
    </div>
  )
}

/** Édition admin des moodboards. */
export function AdminSenteurs() {
  const [liste, setListe] = useState<Senteur[]>([])
  const [msg, setMsg] = useState('')
  useEffect(() => { getSenteurs().then(setListe) }, [])
  const maj = (i: number, f: (s: Senteur) => Senteur) => setListe((l) => l.map((x, k) => (k === i ? f(x) : x)))
  return (
    <div className="flex flex-col gap-4">
      {msg && <p role="status" className="rounded-2xl bg-flamme/15 px-4 py-3 text-sm font-bold">{msg}</p>}
      {liste.map((s, i) => (
        <form key={s.id} onSubmit={async (e) => { e.preventDefault(); try { await saveSenteur(s); setMsg(`${s.nom} enregistré ✓`) } catch (er) { setMsg((er as Error).message) } }}
          className="flex flex-col gap-3 rounded-[20px] border-[1.5px] border-trait bg-papier p-4">
          <div className="flex items-center gap-3">
            <p className="flex-1 font-serif text-lg font-bold">{s.nom} <span className="text-xs text-doux">({s.id})</span></p>
            <input type="color" value={s.couleur} onChange={(e) => maj(i, (x) => ({ ...x, couleur: e.target.value }))} aria-label="Couleur" className="size-10" />
          </div>
          {s.tuiles.map((t, k) => (
            <div key={k} className="grid grid-cols-[1fr_1.4fr_auto] gap-2">
              <input className="champ" value={t.mot} placeholder="Mot" onChange={(e) => maj(i, (x) => ({ ...x, tuiles: x.tuiles.map((y, j) => (j === k ? { ...y, mot: e.target.value.toUpperCase() } : y)) }))} />
              <input className="champ" value={t.image ?? ''} placeholder="URL d'image (facultatif)" onChange={(e) => maj(i, (x) => ({ ...x, tuiles: x.tuiles.map((y, j) => (j === k ? { ...y, image: e.target.value || undefined } : y)) }))} />
              <button type="button" onClick={() => maj(i, (x) => ({ ...x, tuiles: x.tuiles.filter((_, j) => j !== k) }))} aria-label="Retirer" className="px-3 text-sceau">×</button>
            </div>
          ))}
          <div className="flex gap-2">
            {s.tuiles.length < 5 && <button type="button" onClick={() => maj(i, (x) => ({ ...x, tuiles: [...x.tuiles, { mot: '' }] }))} className="btn-ligne !w-auto px-4">+ Mot</button>}
            <button className="btn btn-encre !w-auto px-6">Enregistrer</button>
          </div>
        </form>
      ))}
    </div>
  )
}
