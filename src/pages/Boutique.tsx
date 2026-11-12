import { useState } from 'react'
import { echangerLot, getBons, getBoutiqueOuverte, getLots, getWallet, type Lot } from '../lib/api'
import { secouer, vibrer } from '../lib/haptique'
import { useData } from '../lib/useData'
import { Flamme, Icon } from '../ui'
import { BoutonSentir } from '../components/Sentir'
import QrCode from '../components/QrCode'
import { PRODUITS, euros } from './BoutiqueSite'

/** Boutique : on échange ses points contre des lots, récupérés au pop-up store avec un bon. */
export default function Boutique() {
  const [v, setV] = useState(0)
  const solde = useData(getWallet, v)?.total ?? 0
  const lots = useData(getLots, v) ?? []
  const bons = useData(getBons, v) ?? []
  const ouverte = useData(getBoutiqueOuverte) ?? false
  const [choixOnglet, setOnglet] = useState<'boutique' | 'recompenses'>()
  const onglet = ouverte ? choixOnglet ?? 'boutique' : 'recompenses'
  const [qr, setQr] = useState<{ code: string; lot: string }>()
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
          <p className="text-sm font-medium text-doux">{onglet === 'boutique' ? 'Box et bougies, retrait au pop-up' : 'Tes points contre des récompenses'}</p>
          <h1 className="titre text-[30px]">{onglet === 'boutique' ? 'Boutique' : 'Récompenses'}</h1>
        </div>
        <p className="flex items-center gap-1.5 rounded-full bg-encre py-2 pr-3.5 pl-3 text-[15px] font-bold text-creme" aria-label={`Solde : ${solde} points`}><Flamme />{solde}</p>
      </header>

      {ouverte && (
        <div role="tablist" aria-label="Boutique ou récompenses" className="relative grid grid-cols-2 rounded-full bg-creme-2 p-1">
          <span aria-hidden className={`absolute inset-y-1 left-1 w-[calc(50%-4px)] rounded-full bg-encre transition-transform duration-300 ${onglet === 'recompenses' ? 'translate-x-full' : ''}`} />
          {([['boutique', 'Boutique'], ['recompenses', 'Récompenses']] as const).map(([k, l]) => (
            <button key={k} role="tab" aria-selected={onglet === k} onClick={() => setOnglet(k)} className={`relative min-h-11 rounded-full text-sm font-bold transition-colors ${onglet === k ? 'text-creme' : 'text-doux'}`}>{l}</button>
          ))}
        </div>
      )}

      {msg && <p role="alert" className="rounded-2xl bg-sceau/10 px-4 py-3 text-sm font-medium text-sceau">{msg}</p>}

      {onglet === 'boutique' ? (
        <section aria-labelledby="produits" className="flex flex-col gap-2.5">
          <h2 id="produits" className="sr-only">La boutique</h2>
          <div className="grid grid-cols-2 gap-3 landscape:grid-cols-4">
            {PRODUITS.map((p) => (
              <a key={p.id} href="/boutique-produits" onClick={(e) => e.preventDefault()} className="relative overflow-hidden rounded-[22px] border-[1.5px] border-trait bg-papier">
                <img src={p.image} alt={p.nom} className={`aspect-square w-full bg-white ${p.id === 'box-ac4' ? 'object-cover' : 'object-contain p-4'}`} />
                <BoutonSentir id={p.id} nom={p.nom} className="absolute top-1.5 right-1.5 size-16" />
                <div className="p-3"><p className="font-serif text-sm leading-tight font-bold">{p.nom}</p><p className="mt-1 text-sm font-bold text-flamme">{p.dispo ? euros(p.prix) : 'Prochainement'}</p></div>
              </a>
            ))}
          </div>
          <p className="text-xs text-doux">Commande et retrait au pop-up store Ubisoft × La Belle Mèche.</p>
        </section>
      ) : (<>
      {bons.length > 0 && (
        <section className="monte flex flex-col gap-2.5" aria-labelledby="bons">
          <h2 id="bons" className="font-serif text-lg font-bold">Mes bons</h2>
          {bons.map((b) => (
            <button key={b.code} disabled={b.retire} onClick={() => setQr(b)} aria-label={b.retire ? `${b.lot}, déjà récupéré` : `Afficher le QR code de ${b.lot}`} className={`relative flex w-full items-center gap-4 overflow-hidden rounded-[20px] p-4 text-left ${b.retire ? 'bg-creme-2 text-doux' : 'bg-encre text-creme'}`}>
              <span aria-hidden className="absolute top-1/2 -left-3 size-6 -translate-y-1/2 rounded-full bg-creme" />
              <span aria-hidden className="absolute top-1/2 -right-3 size-6 -translate-y-1/2 rounded-full bg-creme" />
              <div className="min-w-0 flex-1 pl-2">
                <p className="truncate font-bold">{b.lot}</p>
                <p className="text-xs opacity-75">{b.retire ? 'Déjà récupéré' : 'Touche pour afficher le QR code'}</p>
              </div>
              <p className="titre border-l border-dashed border-current/30 pl-4 text-2xl tracking-widest">{b.code}</p>
            </button>
          ))}
        </section>
      )}

      <section aria-labelledby="lots" className="flex flex-col gap-2.5">
        <h2 id="lots" className="sr-only">Récompenses <span className="text-sm font-normal text-doux">· contre tes points</span></h2>
        <ul className="grid grid-cols-2 gap-3 landscape:grid-cols-4">
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
      </>)}

      {qr && (
        <div role="dialog" aria-modal="true" aria-labelledby="qr-titre" className="fixed inset-0 z-50 grid place-items-center bg-encre/80 p-6" onClick={() => setQr(undefined)}>
          <div className="pop flex w-full max-w-sm flex-col items-center gap-3 rounded-[28px] bg-papier p-6 text-center" onClick={(e) => e.stopPropagation()}>
            <h2 id="qr-titre" className="titre text-xl">{qr.lot}</h2>
            <QrCode texte={qr.code} className="size-60 rounded-2xl bg-white p-2" />
            <p className="titre text-2xl tracking-[.2em]">{qr.code}</p>
            <p className="text-xs text-doux">À scanner par l'équipe du pop-up store.</p>
            <button onClick={() => setQr(undefined)} className="btn btn-encre mt-1" autoFocus>Fermer</button>
          </div>
        </div>
      )}

      {nouveau && (
        <div role="dialog" aria-modal="true" aria-labelledby="bravo" className="fixed inset-0 z-50 grid place-items-center bg-encre/70 p-6" onClick={() => setNouveau(undefined)}>
          <div className="pop flex w-full max-w-sm flex-col items-center gap-3 rounded-[28px] bg-papier p-6 text-center" onClick={(e) => e.stopPropagation()}>
            <span className="grid size-14 place-items-center rounded-full bg-flamme text-encre"><Icon name="boutique" size={26} /></span>
            <h2 id="bravo" className="titre text-2xl">C'est à toi !</h2>
            <p className="text-sm text-doux">{nouveau.lot}<br />Montre ce QR code au pop-up store :</p>
            <QrCode texte={nouveau.code} className="size-52 rounded-2xl bg-white p-2" />
            <p className="titre text-2xl tracking-[.2em]">{nouveau.code}</p>
            <p className="text-xs text-doux">Tu le retrouves aussi dans « Mes bons ».</p>
            <button onClick={() => setNouveau(undefined)} className="btn btn-encre mt-1" autoFocus>Super</button>
          </div>
        </div>
      )}
    </div>
  )
}
