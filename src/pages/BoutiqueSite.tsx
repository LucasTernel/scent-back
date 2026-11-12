import ImageProduit from '../components/ImageProduit'
import { useCallback, useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { Icon } from '../ui'
import { BoutonSentir, photo, senteursDe } from '../components/Sentir'
import { dateLivraison, getProduitsVente, type Categorie, type Produit } from '../lib/api'
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
  const tous = useData(getProduitsVente) ?? []
  const [cat, setCat] = useState<Categorie | 'tout'>('tout')
  const { panier, changer } = usePanier()
  const [ajoute, setAjoute] = useState<string>()
  const [lic, setLic] = useState<string>()
  const licences = [...new Set(tous.map((p) => p.licence).filter(Boolean))] as string[]
  const liste = tous.filter((p) => (cat === 'tout' || p.categorie === cat) && (!lic || p.licence === lic))
  const vedette = tous.find((p) => p.categorie === 'bundle' && p.dispo && !p.epuise) ?? tous.find((p) => p.categorie === 'bundle')
  const ajouter = (p: Produit) => { changer(p.id, 1); setAjoute(p.nom); setTimeout(() => setAjoute(undefined), 2200) }

  return (
    <main id="contenu" className="mx-auto max-w-6xl px-5 py-12 md:px-8">
      {/* Mise en avant : le bundle */}
      {vedette && (
        <section aria-label="À la une" className="relative grid overflow-hidden rounded-[28px] bg-[#023341] text-[#FCF5E3] md:grid-cols-[1.1fr_1fr]">
          <Link to={`/produit/${vedette.id}`} className="contents"><ImageProduit src={vedette.image} alt={vedette.nom} className="aspect-[16/10] h-full max-h-[460px] w-full" /></Link>
          <div className="flex flex-col justify-center gap-4 p-8 md:p-12">
            <p className="text-xs font-bold tracking-[.25em] text-flamme uppercase">À la une · {vedette.licence === 'All Stars' ? 'Édition limitée' : 'Bundle'}</p>
            {vedette.licence === 'All Stars' && <p className="w-fit rounded-full border-2 border-flamme px-3 py-1 text-sm font-bold text-flamme">Dans la limite des 1 000 premières commandes</p>}
            {vedette.precommande && <p className="text-sm font-bold">Précommande · livraison prévue le {dateLivraison(vedette.precommande)}</p>}
            <h1 className="titre text-[clamp(2rem,3.4vw,3.4rem)] leading-[1]">{vedette.nom}</h1>
            <p className="text-[#FCF5E3]/75">{vedette.detail.replace(' Dans la limite des 1 000 premières commandes.', '')}</p>
            <div className="mt-2 flex flex-wrap items-center gap-4">
              <p className="titre text-4xl">{euros(vedette.prix)}</p>
              {vedette.dispo && !vedette.epuise
                ? <button onClick={() => ajouter(vedette)} className="min-h-12 rounded-[10px] bg-flamme px-6 font-bold text-[#023341] transition hover:brightness-110">{vedette.precommande ? 'Précommander' : 'Ajouter au panier'}</button>
                : <span className="min-h-12 content-center rounded-[10px] border-2 border-[#FCF5E3]/40 px-6 font-bold">{vedette.epuise ? 'Victime de son succès' : 'Prochainement'}</span>}
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
                  <Link to={`/produit/${p.id}`} aria-label={`Fiche produit : ${p.nom}`}><ImageProduit src={p.image} alt={p.nom} className="aspect-[4/3] w-full" /></Link>
                  {<BoutonSentir id={p.id} nom={p.nom} image={p.image} petit className="absolute top-3 right-3" />}
                  {p.epuise && <span className="absolute inset-0 grid place-items-center bg-[#011A22]/70"><span className="-rotate-6 rounded-[10px] bg-flamme px-4 py-2 text-center font-bold text-[#023341] shadow-xl"><span className="titre block text-lg leading-none">Sold out</span><span className="text-xs">Victime de son succès</span></span></span>}
                  {p.precommande && !p.epuise && <span className="absolute top-3 left-3 rounded-[8px] bg-flamme px-2.5 py-1 text-xs font-bold text-[#023341]">Précommande</span>}
                  {!p.dispo && <span className="absolute top-3 left-3 rounded-[8px] bg-[#023341] px-2.5 py-1 text-xs font-bold text-[#FCF5E3]">Prochainement</span>}
                </div>
                <div className="flex flex-1 flex-col p-4">
                  {p.licence && <p className="mb-1 text-[11px] font-bold tracking-[.18em] text-flamme uppercase">{p.licence}</p>}
                  <h3 className="titre text-lg leading-tight"><Link to={`/produit/${p.id}`} className="hover:text-flamme">{p.nom}</Link></h3>
                  <p className="mt-2 line-clamp-2 flex-1 text-sm text-doux">{p.detail}</p>
                  {p.precommande && <p className="mt-2 text-xs font-bold text-flamme">Livraison prévue le {dateLivraison(p.precommande)}</p>}
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
  const tous = useData(getProduitsVente) ?? []
  const { panier, changer, vider } = usePanier()
  const navigate = useNavigate()
  const lignes = tous.filter((p) => panier[p.id] && p.dispo && !p.epuise)
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
                <div className="min-w-0 flex-1"><p className="titre text-lg leading-tight">{p.nom}</p><p className="text-sm text-doux">{euros(p.prix)} l'unité{p.precommande && ` · précommande, livraison prévue le ${dateLivraison(p.precommande)}`}</p></div>
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

/* ---------- Fiche produit (site et appli) ---------- */
const CONTENU: Record<string, [string, string][]> = {
  'box-ac4': [['Le jeu', 'Assassin\'s Creed IV Black Flag · PS5'], ['La bougie', 'Rhum Marin · 140 g'], ['L\'écrin', 'En forme de logo Assassin\'s Creed']],
  'bundle-prince-of-persia': [['Le jeu', 'Prince of Persia : The Lost Crown · PS5'], ['La bougie', 'Figue Tabacée · 140 g'], ['L\'écrin', 'Coffre au trésor']],
  'bundle-the-division': [['Le jeu', 'Tom Clancy\'s The Division · PS5'], ['La bougie', 'Cèdre Poivré · 140 g'], ['L\'écrin', 'Mallette d\'agent SHD']],
  'bundle-all-stars': [['Les jeux', 'Assassin\'s Creed IV · The Division · Prince of Persia (PS5)'], ['Les bougies', 'Rhum Marin · Cèdre Poivré · Figue Tabacée'], ['Le coffret', 'Collector, limité aux 1 000 premières commandes']],
}
export function FicheProduit({ mobile = false }: { mobile?: boolean }) {
  const params = useParams(), { pathname } = useLocation()
  const id = params.id ?? pathname.split('/').pop() // site : rendu hors <Routes>
  const tous = useData(getProduitsVente)
  const notes = useData(useCallback(() => senteursDe(id ?? ''), [id]))
  const { panier, changer } = usePanier()
  const p = tous?.find((x) => x.id === id)
  if (!tous) return null
  if (!p) return <main id="contenu" className="mx-auto max-w-6xl px-5 py-12"><p className="text-doux">Ce produit n'existe pas (ou plus).</p><Link to="/boutique" className="font-bold underline">Retour à la boutique</Link></main>
  const lien = (x: Produit) => (mobile ? `/boutique/${x.id}` : `/produit/${x.id}`)
  const achetable = p.dispo && !p.epuise
  const statut = p.epuise ? ['Sold out', 'Victime de son succès'] : !p.dispo ? ['Prochainement', 'Disponible au lancement de la collection'] : p.precommande ? ['Précommande', `Livraison prévue le ${dateLivraison(p.precommande)}`] : ['En stock', 'Retrait au pop-up store, Paris']
  const autres = tous.filter((x) => x.id !== p.id && (x.licence === p.licence || x.categorie === p.categorie)).slice(0, mobile ? 4 : 3)
  const contenu = CONTENU[p.id]

  return (
    <main id="contenu" className={mobile ? '-mx-5 -mt-4 flex flex-col' : ''}>
      {/* Bandeau : visuel sur fond flouté de lui-même */}
      <section className="relative overflow-hidden bg-creme text-encre">
        <img src={p.image} alt="" aria-hidden className="absolute inset-0 size-full scale-125 object-cover opacity-35 blur-3xl dark:opacity-50" />
        <div className={`relative mx-auto grid max-w-6xl items-center gap-8 ${mobile ? 'px-5 pt-4 pb-8' : 'px-8 py-14 lg:grid-cols-[1.25fr_1fr] lg:gap-14'}`}>
          <div className="relative">
            <Link to="/boutique" viewTransition className="mb-4 inline-flex min-h-10 items-center gap-1 text-sm font-bold text-encre/80"><Icon name="retour" size={18} />Boutique</Link>
            <ImageProduit src={p.image} alt={p.nom} className="aspect-[4/3] w-full rounded-[28px] shadow-[0_30px_80px_rgba(0,0,0,.45)] ring-1 ring-encre/10" />
            {p.epuise && <span className="absolute inset-0 top-14 grid place-items-center"><span className="titre -rotate-6 rounded-[14px] bg-flamme px-6 py-3 text-3xl text-[#023341] shadow-2xl">Sold out</span></span>}
          </div>
          <div className="flex flex-col gap-5">
            <div className="flex flex-wrap gap-2">
              {p.licence && <span className="rounded-full bg-encre/10 px-3 py-1 text-xs font-bold tracking-[.18em] uppercase">{p.licence}</span>}
              <span className="rounded-full bg-encre/10 px-3 py-1 text-xs font-bold tracking-[.18em] uppercase">{CATEGORIES.find(([k]) => k === p.categorie)?.[1]}</span>
              {p.licence === 'All Stars' && <span className="rounded-full bg-flamme px-3 py-1 text-xs font-bold text-[#023341]">1 000 exemplaires</span>}
            </div>
            <h1 className="titre text-[clamp(2.2rem,4.2vw,3.8rem)] leading-[.95]">{p.nom}</h1>
            <p className="max-w-md text-lg leading-relaxed text-encre/75">{p.detail.replace(' Dans la limite des 1 000 premières commandes.', '')}</p>
            <div className="flex items-end gap-4">
              <p className="titre text-5xl">{euros(p.prix)}</p>
              <p className="pb-1.5 text-sm text-encre/60">TTC</p>
            </div>
            <div className={`flex items-center gap-3 rounded-[18px] p-4 ${achetable ? 'bg-flamme/15 ring-1 ring-flamme/40' : 'bg-encre/8'}`}>
              <span className={`size-3 shrink-0 rounded-full ${achetable ? 'bg-flamme shadow-[0_0_0_4px_rgba(255,119,34,.25)]' : 'bg-encre/40'}`} />
              <p><b>{statut[0]}</b><span className="block text-sm text-encre/70">{statut[1]}</span></p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {!mobile && achetable && (panier[p.id]
                ? <><div className="rounded-[12px] bg-papier px-2 py-1.5"><Quantite q={panier[p.id]} nom={p.nom} moins={() => changer(p.id, -1)} plus={() => changer(p.id, 1)} /></div><Link to="/panier" className="min-h-12 content-center rounded-[12px] bg-flamme px-6 font-bold text-[#023341]">Voir le panier →</Link></>
                : <button onClick={() => changer(p.id, 1)} className="min-h-14 flex-1 rounded-[14px] bg-flamme px-8 text-lg font-bold text-[#023341] transition hover:brightness-110 sm:flex-none">{p.precommande ? 'Précommander' : 'Ajouter au panier'}</button>)}
              <BoutonSentir id={p.id} nom={p.nom} image={p.image} petit className="!min-h-14 !px-6 !text-base" />
            </div>
          </div>
        </div>
      </section>

      <div className={`mx-auto flex w-full max-w-6xl flex-col gap-12 ${mobile ? 'px-5 pt-8' : 'px-8 py-16'}`}>
        {/* Contenu du coffret */}
        {contenu && (
          <section aria-labelledby="contenu-titre">
            <h2 id="contenu-titre" className="titre text-2xl">Dans le coffret</h2>
            <ul className={`mt-5 grid gap-3 ${mobile ? '' : 'sm:grid-cols-3'}`}>
              {contenu.map(([k, v], i) => (
                <li key={k} className="flex gap-4 rounded-[20px] border-[1.5px] border-trait bg-papier p-5">
                  <span className="titre text-3xl text-flamme">0{i + 1}</span>
                  <p><b className="block">{k}</b><span className="text-sm text-doux">{v}</span></p>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Notes olfactives avec photos */}
        {!!notes?.length && (
          <section aria-labelledby="notes-titre">
            <h2 id="notes-titre" className="titre text-2xl">Notes olfactives</h2>
            {notes.map((s) => (
              <div key={s.id} className="mt-5">
                {notes.length > 1 && <p className="mb-2 font-bold" style={{ color: s.couleur }}>{s.nom}</p>}
                <ul className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                  {s.tuiles.map((x) => (
                    <li key={x.mot} className="relative grid aspect-square place-items-center overflow-hidden rounded-[18px]"
                      style={{ background: photo(x) ? `linear-gradient(rgba(0,0,0,.3),rgba(0,0,0,.3)), center/cover url(${photo(x)})` : `radial-gradient(circle at 35% 30%, color-mix(in srgb, ${s.couleur} 35%, white), ${s.couleur})` }}>
                      <span className="titre text-sm tracking-wider text-white drop-shadow sm:text-base">{x.mot}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </section>
        )}

        {/* Retrait / garanties */}
        <section className={`grid gap-3 ${mobile ? '' : 'sm:grid-cols-3'}`} aria-label="Infos pratiques">
          {[['lieu', 'Retrait au pop-up', '23 rue de Bretagne, Paris'], ['boutique', 'Édition officielle', 'Ubisoft × La Belle Mèche'], ['photo', 'Cire 100 % végétale', 'Bougies coulées en France']].map(([ic, a, b]) => (
            <div key={a} className="flex items-center gap-4 rounded-[20px] bg-creme-2 p-5">
              <span className="grid size-12 shrink-0 place-items-center rounded-full bg-[#023341] text-[#FCF5E3]"><Icon name={ic as 'lieu'} size={20} /></span>
              <p><b className="block">{a}</b><span className="text-sm text-doux">{b}</span></p>
            </div>
          ))}
        </section>

        {/* Vous aimerez aussi */}
        {autres.length > 0 && (
          <section aria-labelledby="aussi-titre">
            <h2 id="aussi-titre" className="titre text-2xl">Vous aimerez aussi</h2>
            <ul className={`mt-5 grid gap-4 ${mobile ? 'grid-cols-2' : 'sm:grid-cols-3'}`}>
              {autres.map((x) => (
                <li key={x.id}>
                  <Link to={lien(x)} viewTransition className="group block overflow-hidden rounded-[20px] border-[1.5px] border-trait bg-papier">
                    <ImageProduit src={x.image} alt={x.nom} className="aspect-[4/3] w-full" />
                    <p className="p-3 pb-0 font-serif text-sm leading-tight font-bold">{x.nom}</p>
                    <p className="px-3 pb-3 text-sm font-bold text-flamme">{euros(x.prix)}</p>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </main>
  )
}
