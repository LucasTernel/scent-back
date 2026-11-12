import ImageProduit from '../components/ImageProduit'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Icon } from '../ui'
import { BoutonSentir } from '../components/Sentir'
import { getProduits, type Categorie, type Produit } from '../lib/api'
import { useData } from '../lib/useData'

/** Boutique du site (ordinateur) — démonstration : vitrine, panier, commande fictive. Aucun paiement, aucune donnée bancaire. */
export const CATEGORIES: [Categorie | 'tout', string][] = [['tout', 'Tout'], ['bundle', 'Bundles'], ['bougie', 'Bougies seules'], ['savon', 'Savons']]
/** Puces de filtre par catégorie (appli mobile). */
export function FiltreCategories({ valeur, choisir }: { valeur: Categorie | 'tout'; choisir: (c: Categorie | 'tout') => void }) {
  return (
    <div role="group" aria-label="Catégories" className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none] md:mx-0 md:px-0">
      {CATEGORIES.map(([k, l]) => (
        <button key={k} aria-pressed={valeur === k} onClick={() => choisir(k)}
          className={`min-h-11 shrink-0 rounded-full border-[1.5px] px-4 text-sm font-bold transition ${valeur === k ? 'border-flamme bg-flamme text-[#023341]' : 'border-trait text-doux hover:border-encre'}`}>{l}</button>
      ))}
    </div>
  )
}
export const euros = (n: number) => n.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })

/* ---------- Panier (navigateur uniquement) ---------- */
type Panier = Record<string, number>
const lirePanier = (): Panier => { try { return JSON.parse(localStorage.getItem('panier') || '{}') } catch { return {} } }
const ecrirePanier = (p: Panier) => { try { localStorage.setItem('panier', JSON.stringify(p)) } catch { /* stockage bloqué */ } dispatchEvent(new Event('panier-maj')) }
/** Panier partagé entre l'en-tête, la vitrine et la page panier. */
export function usePanier() {
  const [panier, setPanier] = useState<Panier>(lirePanier)
  useEffect(() => { const maj = () => setPanier(lirePanier()); addEventListener('panier-maj', maj); addEventListener('storage', maj); return () => { removeEventListener('panier-maj', maj); removeEventListener('storage', maj) } }, [])
  const changer = (id: string, d: number) => { const p = lirePanier(), q = Math.max(0, Math.min(9, (p[id] ?? 0) + d)); if (q) p[id] = q; else delete p[id]; ecrirePanier(p) }
  const nb = Object.values(panier).reduce((s, n) => s + n, 0)
  return { panier, changer, vider: () => ecrirePanier({}), nb }
}

/** Icône panier de l'en-tête, avec le nombre d'articles. */
export function BoutonPanier() {
  const { nb } = usePanier()
  return (
    <Link to="/panier" aria-label={`Panier, ${nb} article${nb > 1 ? 's' : ''}`} className="relative grid size-11 place-items-center rounded-[10px] border-2 border-[#FCF5E3]/40 transition hover:border-[#FCF5E3]">
      <Icon name="boutique" size={20} />
      {nb > 0 && <span className="absolute -top-2 -right-2 grid size-6 place-items-center rounded-full bg-flamme text-xs font-bold text-[#023341]">{nb}</span>}
    </Link>
  )
}

function Quantite({ q, nom, moins, plus }: { q: number; nom: string; moins: () => void; plus: () => void }) {
  const b = 'grid size-9 place-items-center rounded-[8px] border-2 border-trait font-bold transition hover:border-encre'
  return (
    <div className="flex items-center gap-2" role="group" aria-label={`Quantité de ${nom}`}>
      <button onClick={moins} aria-label={`Retirer un ${nom}`} className={b}>−</button>
      <span className="w-5 text-center font-bold" aria-live="polite">{q}</span>
      <button onClick={plus} aria-label={`Ajouter un ${nom}`} className={b}>+</button>
    </div>
  )
}

/* ---------- Vitrine ---------- */
export default function BoutiqueSite() {
  const tous = useData(getProduits) ?? []
  const [cat, setCat] = useState<Categorie | 'tout'>('tout')
  const { panier, changer } = usePanier()
  const [ajoute, setAjoute] = useState<string>()
  const [lic, setLic] = useState<string>()
  const licences = [...new Set(tous.map((p) => p.licence).filter(Boolean))] as string[]
  const liste = tous.filter((p) => (cat === 'tout' || p.categorie === cat) && (!lic || p.licence === lic))
  const vedette = tous.find((p) => p.categorie === 'bundle' && p.dispo && !p.epuise)
  const ajouter = (p: Produit) => { changer(p.id, 1); setAjoute(p.nom); setTimeout(() => setAjoute(undefined), 2200) }

  return (
    <main id="contenu" className="mx-auto max-w-6xl px-5 py-12 md:px-8">
      {/* Mise en avant : le bundle */}
      {vedette && (
        <section aria-label="À la une" className="relative grid overflow-hidden rounded-[28px] bg-[#023341] text-[#FCF5E3] md:grid-cols-[1.1fr_1fr]">
          <ImageProduit src={vedette.image} alt={vedette.nom} className="aspect-[16/10] h-full max-h-[460px] w-full" />
          <div className="flex flex-col justify-center gap-4 p-8 md:p-12">
            <p className="text-xs font-bold tracking-[.25em] text-flamme uppercase">À la une · {vedette.licence === 'All Stars' ? 'Édition limitée' : 'Bundle'}</p>
            {vedette.licence === 'All Stars' && <p className="w-fit rounded-full border-2 border-flamme px-3 py-1 text-sm font-bold text-flamme">Dans la limite des 1 000 premières commandes</p>}
            <h1 className="titre text-[clamp(2rem,3.4vw,3.4rem)] leading-[1]">{vedette.nom}</h1>
            <p className="text-[#FCF5E3]/75">{vedette.detail.replace(' Dans la limite des 1 000 premières commandes.', '')}</p>
            <div className="mt-2 flex flex-wrap items-center gap-4">
              <p className="titre text-4xl">{euros(vedette.prix)}</p>
              <button onClick={() => ajouter(vedette)} className="min-h-12 rounded-[10px] bg-flamme px-6 font-bold text-[#023341] transition hover:brightness-110">Ajouter au panier</button>
            </div>
          </div>
        </section>
      )}

      <div className="mt-12 grid items-start gap-10 lg:grid-cols-[220px_1fr]">
        {/* Menu de choix */}
        <nav aria-label="Catégories" className="lg:sticky lg:top-6">
          <p className="mb-3 text-xs font-bold tracking-[.22em] text-doux uppercase">Catégories</p>
          <ul className="flex gap-2 overflow-x-auto lg:flex-col">
            {CATEGORIES.map(([k, l]) => {
              const n = k === 'tout' ? tous.length : tous.filter((p) => p.categorie === k).length
              return (
                <li key={k}>
                  <button aria-pressed={cat === k} onClick={() => setCat(k)}
                    className={`flex min-h-11 w-full items-center justify-between gap-3 rounded-[12px] px-4 text-left font-bold whitespace-nowrap transition ${cat === k ? 'bg-flamme text-[#023341]' : 'hover:bg-creme-2'}`}>
                    {l}<span className={`text-sm ${cat === k ? '' : 'text-doux'}`}>{n}</span>
                  </button>
                </li>
              )
            })}
          </ul>
          {licences.length > 0 && <>
            <p className="mt-8 mb-3 text-xs font-bold tracking-[.22em] text-doux uppercase">Licences</p>
            <ul className="flex flex-wrap gap-2">
              {licences.map((l) => (
                <li key={l}><button aria-pressed={lic === l} onClick={() => setLic(lic === l ? undefined : l)}
                  className={`min-h-10 rounded-full border-[1.5px] px-3.5 text-sm font-bold transition ${lic === l ? 'border-flamme bg-flamme text-[#023341]' : 'border-trait hover:border-encre'}`}>{l}</button></li>
              ))}
            </ul>
          </>}
        </nav>

        <section aria-label="Produits">
          <h2 className="titre text-3xl">{CATEGORIES.find(([k]) => k === cat)?.[1]}{lic && <span className="text-flamme"> · {lic}</span>}</h2>
          {liste.length === 0 && <p className="mt-6 text-doux">Aucun produit dans cette sélection.</p>}
          <ul className="mt-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {liste.map((p) => (
              <li key={p.id} className="group flex flex-col overflow-hidden rounded-[22px] border-[1.5px] border-trait bg-papier transition hover:-translate-y-1 hover:shadow-xl">
                <div className="relative overflow-hidden">
                  <ImageProduit src={p.image} alt={p.nom} className="aspect-[4/3] w-full" />
                  {<BoutonSentir id={p.id} nom={p.nom} image={p.image} petit className="absolute top-3 right-3" />}
                  {p.epuise && <span className="absolute inset-0 grid place-items-center bg-[#011A22]/70"><span className="-rotate-6 rounded-[10px] bg-flamme px-4 py-2 text-center font-bold text-[#023341] shadow-xl"><span className="titre block text-lg leading-none">Sold out</span><span className="text-xs">Victime de son succès</span></span></span>}
                  {!p.dispo && <span className="absolute top-3 left-3 rounded-[8px] bg-[#023341] px-2.5 py-1 text-xs font-bold text-[#FCF5E3]">Prochainement</span>}
                </div>
                <div className="flex flex-1 flex-col p-4">
                  {p.licence && <p className="mb-1 text-[11px] font-bold tracking-[.18em] text-flamme uppercase">{p.licence}</p>}
                  <h3 className="titre text-lg leading-tight">{p.nom}</h3>
                  <p className="mt-2 line-clamp-2 flex-1 text-sm text-doux">{p.detail}</p>
                  <div className="mt-4 flex items-center justify-between gap-3">
                    <p className="titre text-xl">{euros(p.prix)}</p>
                    {p.epuise ? <span className="text-sm font-bold text-flamme">Épuisé</span>
                      : !p.dispo ? <span className="text-sm font-bold text-doux">Bientôt</span>
                      : panier[p.id] ? <Quantite q={panier[p.id]} nom={p.nom} moins={() => changer(p.id, -1)} plus={() => changer(p.id, 1)} />
                      : <button onClick={() => ajouter(p)} aria-label={`Ajouter ${p.nom} au panier`} className="grid size-11 place-items-center rounded-full bg-[#023341] text-[#FCF5E3] transition hover:bg-flamme hover:text-[#023341]"><Icon name="plus" size={20} /></button>}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {ajoute && (
        <div role="status" className="pop fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-4 rounded-full bg-[#023341] py-2 pr-2 pl-5 text-[#FCF5E3] shadow-2xl">
          <span><b>{ajoute}</b> ajouté au panier</span>
          <Link to="/panier" className="min-h-10 content-center rounded-full bg-flamme px-4 text-sm font-bold text-[#023341]">Voir le panier</Link>
        </div>
      )}
    </main>
  )
}

/* ---------- Page panier ---------- */
export function PanierSite() {
  const tous = useData(getProduits) ?? []
  const { panier, changer, vider } = usePanier()
  const navigate = useNavigate()
  const lignes = tous.filter((p) => panier[p.id])
  const total = lignes.reduce((s, p) => s + p.prix * panier[p.id], 0)
  const valider = () => { const num = 'SB-' + Math.random().toString(36).slice(2, 7).toUpperCase(); vider(); navigate(`/commande?num=${num}&total=${total.toFixed(2)}`) }
  return (
    <main id="contenu" className="mx-auto max-w-6xl px-5 py-12 md:px-8">
      <Link to="/boutique" className="inline-flex min-h-10 items-center gap-1 text-sm font-bold text-doux"><Icon name="retour" size={18} />Continuer mes achats</Link>
      <h1 className="titre mt-3 text-[clamp(2.4rem,5vw,4rem)] leading-none">Mon panier</h1>
      {lignes.length === 0 ? (
        <div className="mt-10 flex flex-col items-start gap-4 rounded-[22px] border-2 border-dashed border-trait p-10">
          <p className="text-lg text-doux">Ton panier est vide.</p>
          <Link to="/boutique" className="min-h-12 content-center rounded-[10px] bg-flamme px-6 font-bold text-[#023341]">Voir la boutique</Link>
        </div>
      ) : (
        <div className="mt-10 grid items-start gap-10 lg:grid-cols-[1fr_360px]">
          <ul className="divide-y divide-trait border-y border-trait">
            {lignes.map((p) => (
              <li key={p.id} className="flex items-center gap-5 py-5">
                <img src={p.image} alt="" className="size-24 shrink-0 rounded-[14px] object-cover" />
                <div className="min-w-0 flex-1"><p className="titre text-lg leading-tight">{p.nom}</p><p className="text-sm text-doux">{euros(p.prix)} l'unité</p></div>
                <Quantite q={panier[p.id]} nom={p.nom} moins={() => changer(p.id, -1)} plus={() => changer(p.id, 1)} />
                <p className="titre w-28 text-right text-xl">{euros(p.prix * panier[p.id])}</p>
                <button onClick={() => changer(p.id, -panier[p.id])} aria-label={`Retirer ${p.nom} du panier`} className="grid size-10 place-items-center rounded-full text-doux hover:text-sceau">×</button>
              </li>
            ))}
          </ul>
          <aside className="rounded-[22px] bg-[#023341] p-6 text-[#FCF5E3] lg:sticky lg:top-6">
            <h2 className="titre text-xl">Récapitulatif</h2>
            <p className="mt-4 flex justify-between text-sm"><span>Sous-total</span><span>{euros(total)}</span></p>
            <p className="mt-2 flex justify-between text-sm"><span>Retrait au pop-up store</span><span>Gratuit</span></p>
            <p className="mt-4 flex items-baseline justify-between border-t border-[#FCF5E3]/20 pt-4"><span className="font-bold">Total</span><span className="titre text-3xl">{euros(total)}</span></p>
            <button onClick={valider} className="mt-6 min-h-12 w-full rounded-[10px] bg-flamme font-bold text-[#023341] transition hover:brightness-110">Valider la commande</button>
            <p className="mt-3 text-center text-xs text-[#FCF5E3]/60">Démonstration : aucun paiement ne sera demandé.</p>
          </aside>
        </div>
      )}
    </main>
  )
}

/* ---------- Validation (fictive) ---------- */
export function CommandeOk() {
  const [q] = useSearchParams()
  const num = q.get('num') ?? 'SB-DEMO', total = Number(q.get('total') ?? 0)
  return (
    <main id="contenu" className="mx-auto grid min-h-[70vh] max-w-xl place-items-center px-5 py-16 text-center">
      <div className="flex flex-col items-center gap-5">
        <span className="pop grid size-24 place-items-center rounded-full bg-flamme text-[#023341]">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
        </span>
        <h1 className="titre text-[clamp(2.2rem,5vw,3.6rem)] leading-none">Commande validée</h1>
        <p className="text-lg text-doux">C'est tout bon ! Ta commande de <b className="text-encre">{euros(total)}</b> t'attend au pop-up store Ubisoft × La Belle Mèche, à Paris.</p>
        <p className="w-full rounded-[16px] bg-creme-2 px-5 py-4"><span className="block text-xs text-doux">Numéro de commande (fictif)</span><span className="titre text-3xl tracking-widest">{num}</span></p>
        <p className="text-xs text-doux">Démonstration : aucun paiement n'a été effectué.</p>
        <Link to="/boutique" className="min-h-12 content-center rounded-[10px] bg-[#023341] px-6 font-bold text-[#FCF5E3]">Retour à la boutique</Link>
      </div>
    </main>
  )
}
