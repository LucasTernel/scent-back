import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ajouterAmi, chercherJoueurs, getAmis, getProfile, getProfilAmi, HEX_RARETE, retirerAmi, type Joueur } from '../lib/api'
import { useData } from '../lib/useData'
import { Avatar, avatarParDefaut } from '../components/Avatar'
import Scene3D from '../components/Scene3D'
import { Flamme, Icon } from '../ui'

const av = (j: { avatar_url: string | null; username: string }) => j.avatar_url || avatarParDefaut(j.username)
const Retour = ({ to = '/compte' }: { to?: string }) => <Link to={to} viewTransition className="-ml-1 inline-flex min-h-10 items-center gap-1 text-sm font-bold text-doux"><Icon name="retour" size={18} />Retour</Link>

/** Liste d'amis + recherche par pseudo ou code ami + invitation (parrainage). */
export default function Amis() {
  const [v, setV] = useState(0)
  const amis = useData(getAmis, v) ?? []
  const moi = useData(getProfile)
  const [q, setQ] = useState('')
  const [res, setRes] = useState<Joueur[]>()
  const [msg, setMsg] = useState('')
  useEffect(() => {
    if (q.trim().length < 2) return setRes(undefined)
    const t = setTimeout(() => chercherJoueurs(q.trim()).then(setRes).catch((e) => setMsg(e.message)), 300)
    return () => clearTimeout(t)
  }, [q, v])
  const ajouter = async (j: Joueur) => { try { await ajouterAmi(j.friend_code ?? j.username); setMsg(`${j.username} est maintenant ton ami ✓`); setV(v + 1) } catch (e) { setMsg((e as Error).message) } }
  const lien = moi && `${location.origin}/?parrain=${moi.friend_code}`
  const inviter = async () => {
    if (!lien) return
    try { if (navigator.share) await navigator.share({ title: 'Scent Back', text: `Rejoins-moi sur Scent Back avec mon code ${moi!.friend_code} : +50 pts chacun !`, url: lien }); else { await navigator.clipboard.writeText(lien); setMsg('Lien copié ✓') } } catch { /* partage annulé */ }
  }

  return (
    <div className="flex flex-col gap-5">
      <header className="monte"><Retour /><h1 className="titre text-[30px]">Mes amis</h1></header>
      {msg && <p role="status" className="rounded-2xl bg-flamme/12 px-4 py-3 text-sm font-medium">{msg}</p>}

      <section className="monte rounded-[22px] bg-encre p-4 text-creme">
        <p className="font-serif text-lg font-bold">Parraine un ami</p>
        <p className="mt-1 text-sm opacity-80">Il s'inscrit avec ton code : <b>+50 pts</b> pour vous deux.</p>
        <div className="mt-3 flex items-center gap-3">
          <p className="titre flex-1 rounded-2xl bg-creme/10 px-4 py-2.5 text-center text-2xl tracking-[.25em]">{moi?.friend_code ?? '……'}</p>
          <button onClick={inviter} className="min-h-12 rounded-full bg-flamme px-5 font-bold text-encre">Inviter</button>
        </div>
      </section>

      <section className="flex flex-col gap-2.5">
        <label className="flex items-center gap-2 rounded-full border-[1.5px] border-trait bg-papier px-4">
          <Icon name="recherche" size={18} className="text-doux" />
          <input value={q} onChange={(e) => { setQ(e.target.value); setMsg('') }} placeholder="Pseudo ou code ami" aria-label="Chercher un joueur par pseudo ou code ami" autoCapitalize="none" className="min-h-12 flex-1 bg-transparent outline-none" />
        </label>
        {res && (res.length ? (
          <ul className="flex flex-col gap-2">
            {res.map((j) => (
              <li key={j.username} className="flex items-center gap-3 rounded-[18px] border-[1.5px] border-trait bg-papier p-2.5">
                <Avatar id={av(j)} className="size-11" />
                <p className="min-w-0 flex-1 truncate font-bold">{j.username}</p>
                {j.ami ? <span className="text-xs font-bold text-doux">Déjà ami</span>
                  : <button onClick={() => ajouter(j)} className="min-h-10 rounded-full bg-encre px-4 text-sm font-bold text-creme">Ajouter</button>}
              </li>
            ))}
          </ul>
        ) : <p className="px-2 text-sm text-doux">Aucun joueur trouvé.</p>)}
      </section>

      <section className="flex flex-col gap-2.5">
        <h2 className="font-serif text-lg font-bold">{amis.length} ami{amis.length > 1 ? 's' : ''}</h2>
        {amis.length === 0 && <p className="text-sm text-doux">Cherche un pseudo ou partage ton code pour commencer.</p>}
        <ul className="flex flex-col gap-2">
          {amis.map((a, i) => (
            <li key={a.username}>
              <Link to={`/amis/${encodeURIComponent(a.username)}`} viewTransition className="flex items-center gap-3 rounded-[18px] border-[1.5px] border-trait bg-papier p-2.5">
                <span className="w-5 text-center text-sm font-bold text-doux">{i + 1}</span>
                <Avatar id={av(a)} className="size-12" />
                <span className="min-w-0 flex-1"><b className="block truncate">{a.username}</b><span className="text-xs text-doux">{a.lapins} lapin{a.lapins > 1 ? 's' : ''}</span></span>
                <span className="flex items-center gap-1 font-bold"><Flamme />{a.total}</span>
                <Icon name="chevron" size={18} className="text-doux" />
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}

/** Profil d'un ami : avatar, points, lapins capturés en 3D. */
export function ProfilAmi() {
  const { pseudo = '' } = useParams()
  const p = useData(useCallback(() => getProfilAmi(pseudo), [pseudo]))
  const navigate = useNavigate()
  if (p === null) return <div className="flex flex-col gap-4"><Retour to="/amis" /><p className="text-doux">Ce joueur n'est pas (ou plus) dans tes amis.</p></div>
  if (!p) return <p className="text-doux">Chargement…</p>
  const retirer = async () => { if (!confirm(`Retirer ${p.username} de tes amis ?`)) return; await retirerAmi(p.username); navigate('/amis') }
  return (
    <div className="flex flex-col gap-5">
      <Retour to="/amis" />
      <header className="monte flex flex-col items-center gap-3 text-center">
        <Avatar id={av(p)} className="size-28 shadow-xl" />
        <h1 className="titre text-[28px]">{p.username}</h1>
        <p className="text-xs text-doux">Chasseur depuis le {new Date(p.depuis).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        <div className="grid w-full grid-cols-2 gap-3">
          <p className="rounded-[18px] bg-encre p-3 text-creme"><span className="titre block text-3xl text-flamme">{p.total}</span><span className="text-xs font-bold opacity-80">POINTS</span></p>
          <p className="rounded-[18px] bg-encre p-3 text-creme"><span className="titre block text-3xl">{p.captures.length}</span><span className="text-xs font-bold opacity-80">LAPINS</span></p>
        </div>
      </header>
      <section className="flex flex-col gap-2.5">
        <h2 className="font-serif text-lg font-bold">Sa collection</h2>
        {p.captures.length === 0 ? <p className="text-sm text-doux">Pas encore de lapin capturé.</p> : (
          <ul className="grid grid-cols-2 gap-3">
            {p.captures.map((c) => (
              <li key={c.id} className="overflow-hidden rounded-[20px] border-[1.5px] border-trait bg-papier">
                <Scene3D mini rarity={c.rarete} nom={c.nom} model={c.model} debloque className="aspect-square" />
                <p className="p-2.5 pb-0 font-serif text-sm leading-tight font-bold">{c.nom}</p>
                <p className="px-2.5 pb-2.5 text-[11px] font-bold" style={{ color: HEX_RARETE[c.rarete] }}>{new Date(c.date).toLocaleDateString('fr-FR')}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
      <button onClick={retirer} className="min-h-11 text-sm font-bold text-sceau underline">Retirer de mes amis</button>
    </div>
  )
}
