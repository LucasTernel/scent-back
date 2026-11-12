import { useEffect, useRef, useState } from 'react'
import { Etiquette } from './Landing'
import { Icon } from '../ui'
import { BoutonSentir } from '../components/Sentir'

/** Boutique du site (ordinateur) — démonstration : panier + commande fictive, aucun paiement, aucune donnée bancaire. */
type Produit = { id: string; nom: string; detail: string; prix: number; image: string; dispo: boolean }
export const PRODUITS: Produit[] = [
  { id: 'box-ac4', nom: 'Box Assassin\'s Creed IV Black Flag', detail: 'Le jeu PS5 + la bougie Rhum Marin 140 g, dans l\'écrin en forme de logo.', prix: 59.9, image: '/site/box.webp', dispo: true },
  { id: 'rhum-marin', nom: 'Bougie Rhum Marin', detail: '140 g · cire 100 % végétale · coulée en France. Brûle le temps du jeu.', prix: 24.9, image: '/site/bougie.webp', dispo: true },
  { id: 'figue-tabacee', nom: 'Bougie Figue Tabacée', detail: '70 g · cire 100 % végétale. La prochaine licence de la collection All Stars.', prix: 16.9, image: '/site/etiquette-pop.webp', dispo: false },
]
export const euros = (n: number) => n.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })
type Panier = Record<string, number>
const lirePanier = (): Panier => { try { return JSON.parse(localStorage.getItem('panier') || '{}') } catch { return {} } }

export default function BoutiqueSite() {
  const [panier, setPanier] = useState<Panier>(lirePanier)
  const [commande, setCommande] = useState<{ num: string; total: number }>()
  useEffect(() => { try { localStorage.setItem('panier', JSON.stringify(panier)) } catch { /* rien */ } }, [panier])
  const lignes = PRODUITS.filter((p) => panier[p.id])
  const total = lignes.reduce((s, p) => s + p.prix * panier[p.id], 0)
  const nb = lignes.reduce((s, p) => s + panier[p.id], 0)
  const changer = (id: string, d: number) => setPanier((pa) => { const q = Math.max(0, Math.min(9, (pa[id] ?? 0) + d)); const n = { ...pa, [id]: q }; if (!q) delete n[id]; return n })
  const commander = () => { setCommande({ num: 'SB-' + Math.random().toString(36).slice(2, 7).toUpperCase(), total }); setPanier({}) }

  return (
    <main id="contenu" className="mx-auto max-w-6xl px-5 py-12 md:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b-2 border-encre pb-6">
        <div>
          <p className="text-xs font-bold tracking-[.22em] text-doux uppercase">Ubisoft <span className="text-flamme">×</span> La Belle Mèche</p>
          <h1 className="titre mt-3 text-[clamp(2.4rem,5vw,4.4rem)] leading-none">La boutique</h1>
        </div>
        <p className="rounded-[10px] border-2 border-dashed border-trait px-4 py-2 text-sm text-doux">Boutique de démonstration · aucun paiement</p>
      </div>

      <div className="mt-12 grid items-start gap-10 lg:grid-cols-[1fr_340px]">
        <ul className="grid gap-x-6 gap-y-10 sm:grid-cols-2">
          {PRODUITS.map((p) => (
            <li key={p.id}>
              <Etiquette className="h-full" corps="flex h-full flex-col p-4" larg="30%" arche="1.7rem">
                <div className="relative overflow-hidden rounded-[10px] bg-white">
                  <img src={p.image} alt={p.nom} loading="lazy" className={`aspect-[4/3] w-full ${p.id === 'box-ac4' ? 'object-cover' : 'object-contain p-3'}`} />
                  <BoutonSentir id={p.id} nom={p.nom} className="absolute top-3 right-3 size-20" />
                  {!p.dispo && <span className="absolute top-3 left-3 rounded-[8px] bg-[#023341] px-2.5 py-1 text-xs font-bold text-[#FCF5E3]">Prochainement</span>}
                </div>
                <h2 className="titre mt-4 text-xl leading-tight">{p.nom}</h2>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-doux">{p.detail}</p>
                <div className="mt-4 flex items-center justify-between gap-3 border-t border-trait pt-4">
                  <p className="titre text-2xl">{euros(p.prix)}</p>
                  {p.dispo
                    ? panier[p.id]
                      ? <Quantite q={panier[p.id]} nom={p.nom} moins={() => changer(p.id, -1)} plus={() => changer(p.id, 1)} />
                      : <button onClick={() => changer(p.id, 1)} className="min-h-11 rounded-[10px] bg-[#023341] px-4 text-sm font-bold text-[#FCF5E3] transition hover:bg-[#0E4D61] dark:bg-flamme dark:text-[#023341]">Ajouter au panier</button>
                    : <span className="text-sm font-bold text-doux">Bientôt</span>}
                </div>
              </Etiquette>
            </li>
          ))}
        </ul>

        {/* Panier */}
        <aside aria-labelledby="titre-panier" className="lg:sticky lg:top-6">
          <Etiquette corps="p-5" larg="34%" arche="1.6rem">
            <h2 id="titre-panier" className="titre flex items-center justify-between text-xl">Panier <span className="font-sans text-sm font-bold text-doux">{nb} article{nb > 1 ? 's' : ''}</span></h2>
            {lignes.length === 0
              ? <p className="mt-4 text-sm text-doux">Ton panier est vide. Ajoute une box ou une bougie.</p>
              : <ul className="mt-4 divide-y divide-trait border-y border-trait">
                  {lignes.map((p) => (
                    <li key={p.id} className="flex items-center gap-3 py-3">
                      <img src={p.image} alt="" className="size-12 shrink-0 rounded-[8px] bg-white object-contain" />
                      <div className="min-w-0 flex-1"><p className="truncate text-sm font-bold">{p.nom}</p><p className="text-xs text-doux">{euros(p.prix)}</p></div>
                      <Quantite q={panier[p.id]} nom={p.nom} moins={() => changer(p.id, -1)} plus={() => changer(p.id, 1)} petit />
                    </li>
                  ))}
                </ul>}
            <p className="mt-4 flex items-baseline justify-between"><span className="text-sm font-bold">Total</span><span className="titre text-2xl">{euros(total)}</span></p>
            <p className="mt-1 text-xs text-doux">Retrait au pop-up store Ubisoft × La Belle Mèche, Paris.</p>
            <button onClick={commander} disabled={!nb} className="mt-5 min-h-12 w-full rounded-[10px] bg-flamme font-bold text-[#023341] transition disabled:opacity-40">Commander (démo)</button>
          </Etiquette>
          <p className="mt-4 text-xs leading-relaxed text-doux">Tu cherches les lots du pop-up ? Ils s'échangent contre des points dans l'appli de chasse, sur ton téléphone.</p>
        </aside>
      </div>

      {commande && <Confirmation {...commande} fermer={() => setCommande(undefined)} />}
    </main>
  )
}

function Quantite({ q, nom, moins, plus, petit = false }: { q: number; nom: string; moins: () => void; plus: () => void; petit?: boolean }) {
  const b = `grid ${petit ? 'size-8' : 'size-10'} place-items-center rounded-[8px] border-2 border-encre font-bold`
  return (
    <div className="flex items-center gap-2" role="group" aria-label={`Quantité de ${nom}`}>
      <button onClick={moins} aria-label={`Retirer un ${nom}`} className={b}>−</button>
      <span className="w-5 text-center font-bold" aria-live="polite">{q}</span>
      <button onClick={plus} aria-label={`Ajouter un ${nom}`} className={b}>+</button>
    </div>
  )
}

function Confirmation({ num, total, fermer }: { num: string; total: number; fermer: () => void }) {
  const bouton = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    bouton.current?.focus()
    const echap = (e: KeyboardEvent) => e.key === 'Escape' && fermer()
    addEventListener('keydown', echap); return () => removeEventListener('keydown', echap)
  }, [fermer])
  return (
    <div role="dialog" aria-modal="true" aria-labelledby="cmd-titre" className="fixed inset-0 z-50 grid place-items-center bg-[#023341]/70 p-5" onClick={fermer}>
      <div onClick={(e) => e.stopPropagation()} className="pop w-full max-w-md">
        <Etiquette corps="flex flex-col items-center gap-4 p-8 text-center" larg="30%" arche="2rem">
          <span className="grid size-14 place-items-center rounded-full bg-flamme text-2xl text-[#023341]"><Icon name="boutique" size={26} /></span>
          <h2 id="cmd-titre" className="titre text-2xl">Commande confirmée</h2>
          <p className="text-doux">Ta commande de <b className="text-encre">{euros(total)}</b> t'attend au pop-up store.</p>
          <p className="w-full rounded-[10px] bg-creme-2 px-4 py-3"><span className="block text-xs text-doux">Numéro de commande (fictif)</span><span className="titre text-2xl tracking-widest">{num}</span></p>
          <p className="text-xs text-doux">Démonstration : aucun paiement n'a été effectué.</p>
          <button ref={bouton} onClick={fermer} className="min-h-12 w-full rounded-[10px] bg-[#023341] font-bold text-[#FCF5E3]">Fermer</button>
        </Etiquette>
      </div>
    </div>
  )
}
