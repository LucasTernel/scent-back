import { useState } from 'react'
import { echangerLot, getBons, getLots, getWallet, type Lot } from '../lib/api'
import { secouer, vibrer } from '../lib/haptique'
import { useData } from '../lib/useData'
import { Flamme, Icon } from '../ui'
import { BoutonSentir } from '../components/Sentir'

/** Boutique : on échange ses points contre des lots, récupérés au pop-up store avec un bon. */
export default function Boutique() {
  const [v, setV] = useState(0)
  const solde = useData(getWallet, v)?.total ?? 0
  const lots = useData(getLots, v) ?? []
  const bons = useData(getBons, v) ?? []
  const [choix, setChoix] = useState<string>() // lot en attente de confirmation
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')
  const [nouveau, setNouveau] = useState<{ code: string; lot: string }>()

  async function echanger(l: Lot) {
    if (choix !== l.id) return setChoix(l.id) // 1er appui : on demande confirmation
    setBusy(true); setMsg('')
    try { const r = await echangerLot(l); setNouveau(r); vibrer([60, 40, 60, 40, 200]); secouer(); setV(v + 1) }
    catch (e) { setMsg((e as Error).message); vibrer([200, 100, 200]) }
    setBusy(false); setChoix(undefined)
  }

  return (
    <div className="flex flex-col gap-5">
      <header className="monte flex items-end justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-doux">À récupérer au pop-up store</p>
          <h1 className="titre text-[30px]">Boutique</h1>
        </div>
        <p className="flex items-center gap-1.5 rounded-full bg-encre py-2 pr-3.5 pl-3 text-[15px] font-bold text-creme" aria-label={`Solde : ${solde} points`}><Flamme />{solde}</p>
      </header>

      {msg && <p role="alert" className="rounded-2xl bg-sceau/10 px-4 py-3 text-sm font-medium text-sceau">{msg}</p>}

      {bons.length > 0 && (
        <section className="monte flex flex-col gap-2.5" aria-labelledby="bons">
          <h2 id="bons" className="font-serif text-lg font-bold">Mes bons</h2>
          {bons.map((b) => (
            <div key={b.code} className={`relative flex items-center gap-4 overflow-hidden rounded-[20px] p-4 ${b.retire ? 'bg-creme-2 text-doux' : 'bg-encre text-creme'}`}>
              <span aria-hidden className="absolute top-1/2 -left-3 size-6 -translate-y-1/2 rounded-full bg-creme" />
              <span aria-hidden className="absolute top-1/2 -right-3 size-6 -translate-y-1/2 rounded-full bg-creme" />
              <div className="min-w-0 flex-1 pl-2">
                <p className="truncate font-bold">{b.lot}</p>
                <p className="text-xs opacity-75">{b.retire ? 'Déjà récupéré' : 'Montre ce code au pop-up store'}</p>
              </div>
              <p className="titre border-l border-dashed border-current/30 pl-4 text-2xl tracking-widest">{b.code}</p>
            </div>
          ))}
        </section>
      )}

      <section aria-labelledby="bougies" className="flex flex-col gap-2.5">
        <h2 id="bougies" className="font-serif text-lg font-bold">Les bougies</h2>
        <div className="-mx-5 flex gap-3 overflow-x-auto px-5 pb-2 [scrollbar-width:none]">
          {[['rhum-marin', 'Rhum Marin', '/site/bougie.webp', 'Assassin\'s Creed IV'], ['figue-tabacee', 'Figue Tabacée', '/site/etiquette-pop.webp', 'Prochainement']].map(([id, nom, img, info]) => (
            <div key={id} className="relative w-56 shrink-0 overflow-hidden rounded-[22px] border-[1.5px] border-trait bg-papier">
              <img src={img} alt={`Bougie ${nom}`} className="aspect-square w-full bg-white object-contain p-4" />
              <BoutonSentir id={id} nom={`Bougie ${nom}`} className="absolute top-2 right-2 size-20" />
              <div className="p-3"><p className="font-serif font-bold">{nom}</p><p className="text-xs text-doux">{info}</p></div>
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="lots" className="flex flex-col gap-2.5">
        <h2 id="lots" className="font-serif text-lg font-bold">Les lots</h2>
        <ul className="grid grid-cols-2 gap-3">
          {lots.map((l, i) => {
            const manque = l.cost - solde, ok = manque <= 0 && l.stock > 0
            return (
              <li key={l.id} className="monte flex flex-col gap-2 rounded-[22px] border-[1.5px] border-trait bg-papier p-2 pb-3" style={{ animationDelay: `${i * 50}ms` }}>
                <div className="relative grid aspect-square place-items-center overflow-hidden rounded-[16px] bg-creme-2">
                  {l.image_url ? <img src={l.image_url} alt="" className="absolute inset-0 size-full object-cover" /> : <Icon name="boutique" size={44} className="text-doux" />}
                  <span className="absolute top-2 right-2 rounded-full bg-encre px-2.5 py-1 text-xs font-bold text-creme">{l.cost} pts</span>
                </div>
                <p className="line-clamp-2 min-h-[2.5em] px-1 font-serif text-[13px] leading-snug font-bold">{l.name}</p>
                {l.stock === 0 ? <p className="px-1 text-xs font-bold text-doux">Rupture de stock</p>
                  : manque > 0 ? (
                    <div className="px-1">
                      <div className="h-1.5 overflow-hidden rounded-full bg-creme-2" role="meter" aria-label={`Progression vers ${l.name}`} aria-valuemin={0} aria-valuemax={l.cost} aria-valuenow={Math.min(solde, l.cost)}>
                        <div className="h-full rounded-full bg-flamme" style={{ width: `${Math.min(100, (solde / l.cost) * 100)}%` }} />
                      </div>
                      <p className="mt-1 text-[11px] text-doux">Encore {manque} pts</p>
                    </div>
                  ) : <p className="px-1 text-[11px] text-doux">{l.stock} en stock</p>}
                <button disabled={!ok || busy} onClick={() => echanger(l)}
                  className={`mx-1 min-h-11 rounded-full text-sm font-bold transition disabled:opacity-40 ${choix === l.id ? 'bg-flamme text-encre' : 'bg-encre text-creme'}`}>
                  {busy && choix === l.id ? 'Un instant…' : choix === l.id ? `Confirmer −${l.cost} pts` : 'Échanger'}
                </button>
              </li>
            )
          })}
        </ul>
      </section>

      {nouveau && (
        <div role="dialog" aria-modal="true" aria-labelledby="bravo" className="fixed inset-0 z-50 grid place-items-center bg-encre/70 p-6" onClick={() => setNouveau(undefined)}>
          <div className="pop flex w-full max-w-sm flex-col items-center gap-3 rounded-[28px] bg-papier p-6 text-center" onClick={(e) => e.stopPropagation()}>
            <span className="grid size-14 place-items-center rounded-full bg-flamme text-encre"><Icon name="boutique" size={26} /></span>
            <h2 id="bravo" className="titre text-2xl">C'est à toi !</h2>
            <p className="text-sm text-doux">{nouveau.lot}<br />Montre ce code au pop-up store :</p>
            <p className="titre rounded-2xl bg-creme-2 px-5 py-3 text-4xl tracking-[.2em]">{nouveau.code}</p>
            <p className="text-xs text-doux">Tu le retrouves aussi dans « Mes bons ».</p>
            <button onClick={() => setNouveau(undefined)} className="btn btn-encre mt-1" autoFocus>Super</button>
          </div>
        </div>
      )}
    </div>
  )
}
