import QrCode from '../components/QrCode'
import { renderSVG } from 'uqr'
import { Fragment, useCallback, useState, type FormEvent, type ReactNode } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  adminCollectionsStats, adminScansParJour, adminStats, adminStatues, adminStatuesStats, createCollection, createStatue, updateCollection, updateStatue, enregistrerLot, getLots, supprimerLot, validerBon, type Lot,
  getCollections, getProfile, HEX_RARETE, RARETES, rangRarete, uploadMedia, type Rarity, getBoutiqueOuverte, setBoutiqueOuverte } from '../lib/api'
import { useData } from '../lib/useData'
import { Icon, Lapin, rarityLabel } from '../ui'
import Scene3D from '../components/Scene3D'
import { AdminSenteurs } from '../components/Sentir'

// lien de la puce / du QR : toujours le domaine public (pas localhost quand on génère en local)
const lienNfc = (code: string) => `${location.hostname === 'localhost' ? 'https://scent-back.lucasternel.com' : location.origin}/s/${code}`

/** Écrit le lien sur une puce NFC (Chrome Android uniquement : Web NFC). */
async function ecrireNfc(code: string) {
  if (!('NDEFReader' in window)) return alert(`Web NFC indisponible ici (Chrome Android requis).\nÉcris ce lien sur la puce avec une appli NFC :\n${lienNfc(code)}`)
  // @ts-expect-error Web NFC pas encore dans les types TS
  await new NDEFReader().write({ records: [{ recordType: 'url', data: lienNfc(code) }] })
  alert('Puce NFC écrite ✓')
}

const Champ = ({ label, ...p }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) => (
  <label className="flex flex-col gap-1 text-xs font-bold text-doux">{label}<input className="champ" {...p} /></label>
)
const Carton = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
  <section className={`monte rounded-[20px] border-[1.5px] border-trait bg-papier ${className}`}>{children}</section>
)

/** En-tête admin : ligne retour + action à droite, puis titre complet (jamais coupé) et description. */
function Tete({ sous, titre, retour, action, desc }: { sous?: string; titre: string; retour?: string; action?: ReactNode; desc?: string }) {
  return (
    <header className="monte flex flex-col gap-1.5">
      {(retour || sous || action) && <div className="flex min-h-11 items-center justify-between gap-3">
        {retour
          ? <Link viewTransition data-dir="arriere" to={retour} className="-ml-1 inline-flex min-h-11 items-center gap-1 text-sm font-bold text-doux"><Icon name="retour" size={18} />Retour</Link>
          : <p className="text-sm font-medium text-doux">{sous}</p>}
        {action}
      </div>}
      <h1 className="titre text-[26px] leading-[1.15] [text-wrap:balance]">{titre}</h1>
      {desc && <p className="text-[15px] leading-relaxed text-doux">{desc}</p>}
    </header>
  )
}
const BoutonAjout = ({ to, label }: { to: string; label: string }) => (
  <Link viewTransition to={to} className="flex min-h-11 shrink-0 items-center gap-1 rounded-full bg-flamme px-4 text-sm font-bold text-encre shadow-md"><Icon name="plus" size={18} />{label}</Link>
)

/* ---------- 1. Tableau de bord ---------- */
function Anneau({ v }: { v: number }) {
  const r = 30, c = 2 * Math.PI * r
  return (
    <svg viewBox="0 0 72 72" className="size-[72px] -rotate-90" aria-hidden>
      <circle cx="36" cy="36" r={r} fill="none" stroke="#FCF5E31f" strokeWidth="8" />
      <circle cx="36" cy="36" r={r} fill="none" stroke="var(--color-flamme)" strokeWidth="8" strokeLinecap="round"
        strokeDasharray={c} strokeDashoffset={c * (1 - v / 100)} className="transition-[stroke-dashoffset] duration-700" />
    </svg>
  )
}

export function AdminAccueil() {
  const [mini, setMini] = useState(3)
  const p = useData(getProfile)
  const stats = useData(adminStats)
  const jours = useData(adminScansParJour) ?? []
  const fn = useCallback(() => adminCollectionsStats(mini), [mini])
  const cols = useData(fn)
  const infos = useData(getCollections)
  const statues = useData(adminStatues) ?? []
  const top = [...(useData(adminStatuesStats) ?? [])].sort((a, b) => b.captures - a.captures).slice(0, 3)
  const actifs = stats?.joueurs ? Math.round((stats.actifs_7j / stats.joueurs) * 100) : 0
  const max = Math.max(1, ...jours.map((j) => j.scans))
  const aujourdhui = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <div className="flex flex-col gap-4">
      <header className="monte">
        <p className="text-sm font-medium text-doux first-letter:uppercase">{aujourdhui}</p>
        <h1 className="titre text-[26px] leading-tight">Salut {p?.username ?? '…'}</h1>
      </header>

      {/* Joueurs + taux d'activité */}
      <section className="monte flex items-center gap-4 rounded-[24px] bg-encre p-5 text-creme">
        <div className="flex-1">
          <p className="text-xs font-bold tracking-wider text-trait">JOUEURS INSCRITS</p>
          <p className="titre text-[44px] leading-none">{stats?.joueurs ?? '…'}</p>
          <p className="mt-1.5 text-sm text-trait"><b className="text-flamme">{stats?.actifs_7j ?? 0}</b> actifs cette semaine</p>
        </div>
        <div className="relative grid place-items-center">
          <Anneau v={actifs} />
          <span className="absolute font-serif text-sm font-bold">{actifs}%</span>
        </div>
      </section>

      {/* Activité 14 jours */}
      <Carton className="p-4">
        <div className="flex items-baseline justify-between">
          <h2 className="font-serif text-[15px] font-bold">Scans · 14 jours</h2>
          <p className="text-xs text-doux"><b className="text-encre">{stats?.captures_7j ?? 0}</b> cette semaine · {stats?.captures ?? 0} au total</p>
        </div>
        <div className="mt-4 flex h-28 items-end gap-1" role="img" aria-label={`Scans par jour : ${jours.map((j) => j.scans).join(', ')}`}>
          {jours.map((j, i) => (
            <div key={j.jour} className="group relative flex h-full flex-1 flex-col justify-end">
              {j.scans > 0 && <span className="mb-0.5 text-center text-[9px] font-bold text-doux">{j.scans}</span>}
              <span className={`rounded-t-[5px] transition-all duration-500 ${i === jours.length - 1 ? 'bg-flamme' : 'bg-encre/85'}`}
                style={{ height: `${Math.max(4, (j.scans / max) * 100)}%`, opacity: j.scans ? 1 : .15, transitionDelay: `${i * 25}ms` }} />
            </div>
          ))}
        </div>
        <div className="mt-1.5 flex justify-between text-[10px] text-doux">
          <span>{jours[0] && new Date(jours[0].jour).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</span><span>Aujourd'hui</span>
        </div>
      </Carton>

      {/* Top statuettes */}
      {top.length > 0 && (
        <Carton className="p-4">
          <h2 className="font-serif text-[15px] font-bold">Les plus trouvées</h2>
          <ol className="mt-3 flex flex-col gap-2.5">
            {top.map((x, i) => {
              const s = statues.find((y) => y.id === x.statue_id)
              return (
                <li key={x.statue_id}>
                  <Link viewTransition to={`/statuette/${x.statue_id}`} className="flex items-center gap-3">
                    <span className={`titre w-6 text-xl ${i === 0 ? 'text-flamme' : 'text-doux'}`}>{i + 1}</span>
                    <span className="grid size-11 shrink-0 place-items-center overflow-hidden rounded-[12px] bg-creme-2">
                      {s?.image_url ? <img src={s.image_url} alt="" className="size-full object-cover" /> : <Lapin className="w-8" />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-bold">{s?.name ?? '…'}</span>
                      <span className="mt-1 block h-1.5 overflow-hidden rounded-full bg-creme-2"><span className="block h-full rounded-full bg-flamme" style={{ width: `${(x.captures / top[0].captures) * 100}%` }} /></span>
                    </span>
                    <span className="text-sm font-bold">{x.captures}</span>
                  </Link>
                </li>
              )
            })}
          </ol>
        </Carton>
      )}

      {/* Collections : joueurs ayant scanné ≥ X statuettes */}
      <Carton className="p-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-serif text-[15px] font-bold">Collections</h2>
          <div className="flex items-center gap-1 rounded-full bg-creme-2 p-1" aria-label="Seuil de statuettes scannées">
            <button onClick={() => setMini(Math.max(1, mini - 1))} aria-label="Moins" className="grid size-8 place-items-center rounded-full bg-papier font-bold">−</button>
            <span className="min-w-14 text-center text-xs font-bold">≥ {mini} scan{mini > 1 ? 's' : ''}</span>
            <button onClick={() => setMini(mini + 1)} aria-label="Plus" className="grid size-8 place-items-center rounded-full bg-papier font-bold">+</button>
          </div>
        </div>
        {cols?.length === 0 && <p className="mt-3 text-sm text-doux">Aucune collection pour l'instant.</p>}
        <ul className="mt-3 flex flex-col gap-3">
          {cols?.map((c) => {
            const logo = infos?.find((x) => x.id === c.id)?.logo_url
            const pct = stats?.joueurs ? Math.round((c.joueurs / stats.joueurs) * 100) : 0
            return (
              <li key={c.id}>
                <Link viewTransition to={`/collections/${c.id}`} className="flex items-center gap-3">
                  <span className="grid size-12 shrink-0 place-items-center overflow-hidden rounded-[14px] bg-encre">
                    {logo ? <img src={logo} alt="" className="size-full object-cover" /> : <Icon name="collection" size={20} className="text-creme" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-bold">{c.name}</span>
                    <span className="mt-1 block h-1.5 overflow-hidden rounded-full bg-creme-2"><span className="block h-full rounded-full bg-encre transition-all duration-500" style={{ width: `${pct}%` }} /></span>
                    <span className="mt-1 block text-[11px] text-doux">{c.statuettes} statuettes · {pct}% des joueurs</span>
                  </span>
                  <span className="text-right"><span className="titre block text-2xl text-flamme">{c.joueurs}</span><span className="text-[10px] font-bold text-doux">JOUEURS</span></span>
                </Link>
              </li>
            )
          })}
        </ul>
      </Carton>
    </div>
  )
}

/* ---------- 2. Collections ---------- */
export function AdminCollections() {
  const fn = useCallback(() => adminCollectionsStats(1), [])
  const orphelines = (useData(adminStatues) ?? []).filter((s) => !s.collection_id).length
  const infos = useData(getCollections)
  const cols = useData(fn)?.concat(orphelines ? [{ id: 'aucune', name: 'Sans collection', statuettes: orphelines, joueurs: 0 }] : [])
  return (
    <div className="flex flex-col gap-5">
      <Tete sous="Espace admin" titre="Collections" action={<BoutonAjout to="/collections/nouvelle" label="Collection" />} />
      <ul className="grid grid-cols-2 gap-3">
        {cols?.map((c, i) => (
          <li key={c.id} className="monte" style={{ animationDelay: `${i * 45}ms` }}>
            <Link viewTransition to={`/collections/${c.id}`} className="relative flex aspect-[4/5] flex-col justify-end gap-1 overflow-hidden rounded-[22px] bg-encre p-4 text-creme">
              {infos?.find((x) => x.id === c.id)?.logo_url && <img src={infos.find((x) => x.id === c.id)!.logo_url} alt="" className="absolute inset-0 size-full object-cover" />}
              <span className="absolute inset-0 bg-gradient-to-t from-encre via-encre/70 to-transparent" />
              <span className="titre relative text-[40px] text-flamme">{c.statuettes}</span>
              <span className="relative text-[11px] font-bold text-trait">STATUETTES</span>
              <span className="relative mt-1 line-clamp-2 font-serif text-[15px] leading-snug font-bold">{c.name}</span>
            </Link>
          </li>
        ))}
      </ul>
      {cols?.length === 0 && <p className="text-center text-sm text-doux">Crée ta première collection avec le bouton en haut.</p>}
    </div>
  )
}

/** Création (/collections/nouvelle) ou modification (/collections/:id/modifier) d'une collection. */
export function AdminFormCollection() {
  const { id } = useParams()
  const navigate = useNavigate()
  const col = useData(getCollections)?.find((c) => c.id === id)
  const [apercu, setApercu] = useState<{ image?: string; logo?: string }>({})
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)
  if (id && !col) return null
  const retour = id ? `/collections/${id}` : '/collections'

  async function envoyer(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); setBusy(true); setMsg('')
    const f = new FormData(e.currentTarget)
    try {
      const up = async (k: string) => { const x = f.get(k) as File; return x?.size ? await uploadMedia(x) : undefined }
      const [image_url, logo_url] = await Promise.all([up('image'), up('logo')])
      const v = { name: String(f.get('name')).trim(), description: String(f.get('description')).trim(), ...(image_url && { image_url }), ...(logo_url && { logo_url }) }
      await (id ? updateCollection(id, v) : createCollection(v))
      navigate(retour, { viewTransition: true })
    } catch (err) { setMsg((err as Error).message) }
    setBusy(false)
  }
  const couverture = apercu.image ?? col?.image_url
  const logo = apercu.logo ?? col?.logo_url
  const choisir = (k: 'image' | 'logo') => (e: React.ChangeEvent<HTMLInputElement>) => { const x = e.target.files?.[0]; if (x) setApercu({ ...apercu, [k]: URL.createObjectURL(x) }) }
  return (
    <div className="flex flex-col gap-5">
      <Tete retour={retour} titre={id ? 'Modifier la collection' : 'Nouvelle collection'} />
      {msg && <p role="alert" className="rounded-2xl bg-sceau/10 px-4 py-3 text-sm text-sceau">{msg}</p>}
      <form onSubmit={envoyer} className="flex flex-col gap-2.5">
        <p className="text-xs font-bold text-doux">Couverture et logo</p>
        <div className="relative mb-8">
          <label className="relative grid aspect-[16/9] cursor-pointer place-items-center overflow-hidden rounded-[22px] border-[1.5px] border-dashed border-trait bg-creme-2 text-doux">
            {couverture && <img src={couverture} alt="" className="absolute inset-0 size-full object-cover" />}
            <span className={`relative flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold ${couverture ? 'bg-encre/80 text-creme' : ''}`}>
              <Icon name="photo" size={18} />{couverture ? 'Changer la couverture' : 'Image de couverture'}
            </span>
            <input name="image" type="file" accept="image/*" className="sr-only" onChange={choisir('image')} />
          </label>
          <label className="absolute -bottom-8 left-4 grid size-24 cursor-pointer place-items-center overflow-hidden rounded-[20px] border-[3px] border-creme bg-papier text-center text-[11px] font-bold text-doux shadow-md">
            {logo ? <img src={logo} alt="" className="size-full object-contain p-2" /> : <span className="flex flex-col items-center gap-1"><Icon name="plus" size={20} />Logo</span>}
            <input name="logo" type="file" accept="image/*" className="sr-only" onChange={choisir('logo')} />
          </label>
        </div>
        <Champ label="Nom" name="name" required defaultValue={col?.name} />
        <label className="flex flex-col gap-1 text-xs font-bold text-doux">Description
          <textarea name="description" rows={3} defaultValue={col?.description} className="champ !h-auto py-3" />
        </label>
        <button disabled={busy} className="btn btn-encre mt-2">{busy ? 'Envoi…' : id ? 'Enregistrer' : 'Créer la collection'}</button>
      </form>
    </div>
  )
}

/* ---------- 3. Statuettes d'une collection ---------- */
export function AdminCollection() {
  const { id } = useParams()
  const cols = useData(getCollections)
  const col = id === 'aucune' ? { name: 'Sans collection', description: '', image_url: undefined, logo_url: undefined } : cols?.find((c) => c.id === id)
  const statues = (useData(adminStatues) ?? []).filter((s) => (s.collection_id ?? 'aucune') === id)
    .sort((a, b) => rangRarete(a.rarity) - rangRarete(b.rarity) || a.name.localeCompare(b.name))
  const stats = useData(adminStatuesStats) ?? []
  return (
    <div className="flex flex-col gap-5">
      {col?.image_url && (
        <div className="monte relative -mx-5 -mt-4">
          <div className="overflow-hidden rounded-b-[32px] border-b-[1.5px] border-trait bg-papier px-4 pt-16 pb-5">
            {col.image_url && <img src={col.image_url} alt="" className="mx-auto max-h-64 w-full object-contain" />}
          </div>
          <Link viewTransition data-dir="arriere" to="/collections" aria-label="Retour" className="absolute top-4 left-4 z-10 grid size-11 place-items-center rounded-full bg-creme/90 text-encre"><Icon name="retour" size={20} /></Link>
          <div className="absolute top-4 right-4"><BoutonAjout to={`/collections/${id}/ajouter`} label="Statuette" /></div>
        </div>
      )}
      <Tete retour={col?.image_url ? undefined : '/collections'} titre={col?.name ?? '…'} desc={col?.description || undefined} action={col?.image_url ? undefined : <BoutonAjout to={`/collections/${id}/ajouter`} label="Statuette" />} />
      <div className="monte flex flex-wrap gap-2" style={{ animationDelay: '.05s' }}>
        {[[statues.length, 'statuettes'], [stats.filter((x) => statues.some((s) => s.id === x.statue_id)).reduce((a, x) => a + x.captures, 0), 'scans']].map(([n, k]) => (
          <span key={k} className="rounded-full bg-encre px-3.5 py-1.5 text-xs font-bold text-creme"><span className="text-flamme">{n}</span> {k}</span>
        ))}
        {id !== 'aucune' && <Link viewTransition to={`/collections/${id}/modifier`} className="ml-auto rounded-full border-[1.5px] border-trait bg-papier px-3.5 py-1.5 text-xs font-bold">Modifier la collection</Link>}
      </div>
      <ul className="grid grid-cols-2 gap-3">
        {statues.map((s, i) => (<Fragment key={s.id}>
          {(i === 0 || statues[i - 1].rarity !== s.rarity) && (
                <li className="col-span-2 mt-2 flex items-center gap-2 first:mt-0">
                  <span aria-hidden className="size-3 rounded-full" style={{ background: HEX_RARETE[s.rarity] }} />
                  <h2 className="font-serif text-sm font-bold">{rarityLabel[s.rarity]}</h2>
                  <span className="text-xs text-doux">{statues.filter((x) => x.rarity === s.rarity).length}</span>
                  <span aria-hidden className="h-px flex-1 bg-trait" />
                </li>
              )}
          <li className="monte" style={{ animationDelay: `${Math.min(i, 8) * 45}ms` }}>
            <Link viewTransition data-vt="zoom" to={`/statuette/${s.id}`} className="flex flex-col gap-2 rounded-[22px] border-[1.5px] border-trait bg-papier p-2 pb-3 active:scale-[.98] transition">
              <Scene3D mini rarity={s.rarity} nom={s.name} model={s.model_url} image={s.image_url} vt={`c-${s.id}`} className="aspect-square rounded-[16px]">
              </Scene3D>
              <span className="line-clamp-2 px-1 font-serif text-[13px] leading-snug font-bold">{s.name}</span>
              <span className="flex items-center justify-between px-1 text-[11px] text-doux">
                <span>{s.points} pts</span>
                <span className="rounded-full bg-creme-2 px-2 py-0.5 font-bold text-encre">{stats.find((x) => x.statue_id === s.id)?.captures ?? 0} scans</span>
              </span>
            </Link>
          </li>
        </Fragment>))}
      </ul>
      {statues.length === 0 && <p className="text-center text-sm text-doux">Aucune statuette. Ajoute-en une avec le bouton en haut.</p>}
    </div>
  )
}

/** Création (/collections/:id/ajouter) ou modification (/statuette/:sid/modifier) d'une statuette. */
export function AdminFormStatue() {
  const { id, sid } = useParams()
  const navigate = useNavigate()
  const s = useData(adminStatues)?.find((x) => x.id === sid)
  const cols = useData(getCollections) ?? []
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)
  const [pos, setPos] = useState<{ lat: string; lng: string }>()
  if (sid && !s) return null
  const lat = pos?.lat ?? (s ? String(s.lat) : ''), lng = pos?.lng ?? (s ? String(s.lng) : '')
  const retour = sid ? `/statuette/${sid}` : `/collections/${id}`

  async function envoyer(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); setBusy(true); setMsg('')
    const f = new FormData(e.currentTarget)
    try {
      const fichier = async (k: string) => { const x = f.get(k) as File; return x?.size ? await uploadMedia(x) : undefined }
      const [image_url, model_url] = await Promise.all([fichier('image'), fichier('model')])
      const col = sid ? String(f.get('collection') || '') : id
      const v = {
        code: String(f.get('code')).trim().toUpperCase(), name: f.get('name'), description: f.get('description'), hint: f.get('hint'),
        district: f.get('district'), rarity: f.get('rarity') as Rarity, points: Number(f.get('points')),
        lat: Number(f.get('lat')), lng: Number(f.get('lng')), collection_id: !col || col === 'aucune' ? null : col,
        ...(image_url && { image_url }), ...(model_url && { model_url }),
      }
      if (sid) await updateStatue(sid, v); else await createStatue(v)
      navigate(retour, { viewTransition: true })
    } catch (err) { setMsg((err as Error).message) }
    setBusy(false)
  }
  const maPosition = () => navigator.geolocation.getCurrentPosition((g) => setPos({ lat: g.coords.latitude.toFixed(6), lng: g.coords.longitude.toFixed(6) }))

  return (
    <div className="flex flex-col gap-5">
      <Tete retour={retour} titre={sid ? 'Modifier la statuette' : 'Nouvelle statuette'} />
      {msg && <p role="alert" className="rounded-2xl bg-sceau/10 px-4 py-3 text-sm text-sceau">{msg}</p>}
      <form onSubmit={envoyer} className="flex flex-col gap-2.5">
        <Champ label="Nom" name="name" required defaultValue={s?.name} />
        <Champ label="Code NFC (dans le lien /s/CODE)" name="code" required pattern="[A-Za-z0-9-]{3,20}" placeholder="LOUVRE-7Q2" defaultValue={s?.code} />
        {sid && <p className="-mt-1 px-1 text-xs text-doux">Changer le code oblige à réécrire la puce NFC.</p>}
        <Champ label="Description (révélée après capture)" name="description" defaultValue={s?.description ?? ''} />
        <Champ label="Indice" name="hint" defaultValue={s?.hint ?? ''} />
        <Champ label="Quartier" name="district" defaultValue={s?.district ?? ''} />
        {sid && (
          <label className="flex flex-col gap-1 text-xs font-bold text-doux">Collection
            <select name="collection" className="champ" defaultValue={s?.collection_id ?? 'aucune'}>
              <option value="aucune">— Sans collection —</option>{cols.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </label>
        )}
        <div className="grid grid-cols-2 gap-2.5">
          <label className="flex flex-col gap-1 text-xs font-bold text-doux">Rareté
            <select name="rarity" className="champ" defaultValue={s?.rarity ?? 'commune'}>{RARETES.map((r) => <option key={r} value={r}>{rarityLabel[r]}</option>)}</select>
          </label>
          <Champ label="Points" name="points" type="number" min={1} defaultValue={s?.points ?? 30} required />
          <Champ label="Latitude" name="lat" required inputMode="decimal" value={lat} onChange={(e) => setPos({ lat: e.target.value, lng })} />
          <Champ label="Longitude" name="lng" required inputMode="decimal" value={lng} onChange={(e) => setPos({ lat, lng: e.target.value })} />
        </div>
        <button type="button" onClick={maPosition} className="btn-ligne"><Icon name="lieu" size={18} />Utiliser ma position</button>
        <Champ label={s?.image_url ? 'Image (laisser vide pour garder l\'actuelle)' : 'Image'} name="image" type="file" accept="image/*" />
        <Champ label={s?.model_url ? 'Modèle 3D .glb (laisser vide pour garder l\'actuel)' : 'Modèle 3D (.glb)'} name="model" type="file" accept=".glb,model/gltf-binary" />
        <button disabled={busy} className="btn btn-encre mt-2">{busy ? 'Envoi…' : sid ? 'Enregistrer' : 'Créer la statuette'}</button>
      </form>
    </div>
  )
}

/* ---------- 4. Fiche statuette (vue joueur + stats d'obtention) ---------- */
function telechargerQr(texte: string, nom: string) {
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob([renderSVG(texte, { border: 2 })], { type: 'image/svg+xml' })); a.download = nom; a.click()
  setTimeout(() => URL.revokeObjectURL(a.href), 1000)
}

export function AdminStatue() {
  const { id } = useParams()
  const s = useData(adminStatues)?.find((x) => x.id === id)
  const st = useData(adminStatuesStats)?.find((x) => x.statue_id === id)
  const joueurs = useData(adminStats)?.joueurs
  if (!s) return null
  const n = st?.captures ?? 0
  const taux = joueurs ? Math.round((n / joueurs) * 100) : 0
  return (
    <div className="-mx-5 -mt-4 flex flex-col">
      <Scene3D rarity={s.rarity} nom={s.name} model={s.model_url} image={s.image_url} vt={`c-${s.id}`} className="h-[min(56dvh,460px)] rounded-b-[36px]">
        <Link viewTransition data-vt="zoom" data-dir="arriere" to={s.collection_id ? `/collections/${s.collection_id}` : '/collections'} aria-label="Retour"
          className="absolute top-4 left-4 z-10 grid size-11 place-items-center rounded-full bg-white/15 text-white ring-1 ring-white/25 backdrop-blur-md"><Icon name="retour" size={20} /></Link>
        <Link viewTransition to={`/statuette/${s.id}/modifier`} className="absolute top-4 right-4 z-10 flex min-h-11 items-center rounded-full bg-flamme px-4 text-sm font-bold text-encre shadow-md">Modifier</Link>
      </Scene3D>
      <div className="flex flex-col gap-5 px-5 pt-5">
        <div className="monte">
          <span className="inline-block rounded-full px-3 py-1 text-[11px] font-bold text-creme" style={{ background: `var(--color-${s.rarity})` }}>{rarityLabel[s.rarity]} · {s.district}</span>
          <h1 className="titre mt-2 text-[28px] leading-tight">{s.name}</h1>
        </div>

        <section className="monte grid grid-cols-3 gap-2" aria-label="Stats d'obtention">
          {[['Obtentions', String(n)], ['Des joueurs', `${taux} %`], ['Dernière', st?.derniere ? new Date(st.derniere).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) : '—']].map(([k, v], i) => (
            <div key={k} className={`rounded-[18px] p-3 ${i === 0 ? 'bg-encre text-creme' : 'border-[1.5px] border-trait bg-papier'}`}>
              <p className={`titre text-[22px] ${i === 0 ? 'text-flamme' : ''}`}>{v}</p>
              <p className="text-[11px] font-bold opacity-70">{k}</p>
            </div>
          ))}
        </section>
        <div className="monte h-2 overflow-hidden rounded-full bg-creme-2"><div className="h-full rounded-full bg-flamme" style={{ width: `${taux}%` }} /></div>

        <section className="monte flex flex-col gap-1.5"><h2 className="font-serif text-sm font-bold text-flamme">Histoire</h2><p className="text-[15px] leading-relaxed text-doux">{s.description || '—'}</p></section>
        <section className="monte flex flex-col gap-1.5"><h2 className="font-serif text-sm font-bold text-flamme">Indice</h2><p className="text-[15px] text-doux">« {s.hint || '—'} »</p></section>

        <Carton className="flex items-center gap-3 p-4">
          <div className="min-w-0 flex-1"><p className="text-xs font-bold text-doux">PUCE NFC · {s.points} pts</p><p className="truncate font-mono text-sm">{lienNfc(s.code)}</p></div>
          <button onClick={() => ecrireNfc(s.code).catch((e) => alert(e.message))} className="min-h-11 shrink-0 rounded-full bg-encre px-4 text-xs font-bold text-creme">Lier NFC</button>
        </Carton>

        {/* QR code fixe du lapin (même lien que la puce) : pour les téléphones sans NFC web (iPhone/Safari) */}
        <Carton className="flex items-center gap-4 p-4">
          <QrCode texte={lienNfc(s.code)} className="size-28 shrink-0 rounded-xl bg-white p-1" />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-doux">QR CODE · assigné à ce lapin</p>
            <p className="mt-1 text-sm">À imprimer et coller sous la statuette, à côté de la puce.</p>
            <button onClick={() => telechargerQr(lienNfc(s.code), `qr-${s.code}.svg`)} className="mt-2 min-h-11 rounded-full bg-encre px-4 text-xs font-bold text-creme">Télécharger (SVG)</button>
          </div>
        </Carton>
      </div>
    </div>
  )
}

/* ---------- 5. Boutique : valider les bons + gérer les lots ---------- */
function FormLot({ lot, fini }: { lot?: Lot; fini: () => void }) {
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')
  async function envoyer(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); setBusy(true); setMsg('')
    const f = new FormData(e.currentTarget)
    try {
      const img = f.get('image') as File
      await enregistrerLot(lot?.id, { name: String(f.get('name')).trim(), cost: Number(f.get('cost')), stock: Number(f.get('stock')), ...(img?.size ? { image_url: await uploadMedia(img) } : {}) })
      fini()
    } catch (err) { setMsg((err as Error).message); setBusy(false) }
  }
  return (
    <form onSubmit={envoyer} className="flex flex-col gap-2.5 border-t border-creme-2 p-4">
      {msg && <p role="alert" className="text-sm text-sceau">{msg}</p>}
      <Champ label="Nom du lot" name="name" required defaultValue={lot?.name} />
      <div className="grid grid-cols-2 gap-2.5">
        <Champ label="Prix (points)" name="cost" type="number" min={1} required defaultValue={lot?.cost ?? 100} />
        <Champ label="Stock" name="stock" type="number" min={0} required defaultValue={lot?.stock ?? 10} />
      </div>
      <Champ label={lot?.image_url ? 'Image (laisser vide pour garder l\'actuelle)' : 'Image'} name="image" type="file" accept="image/*" />
      <div className="grid grid-cols-2 gap-2">
        <button type="button" onClick={fini} className="btn-ligne">Annuler</button>
        <button disabled={busy} className="btn btn-encre">{busy ? '…' : 'Enregistrer'}</button>
      </div>
    </form>
  )
}

export function AdminBoutique() {
  const [v, setV] = useState(0)
  const lots = useData(getLots, v) ?? []
  const [edition, setEdition] = useState<string>() // id du lot édité, ou 'nouveau'
  const [code, setCode] = useState('')
  const [bon, setBon] = useState<{ ok: boolean; texte: string }>()
  const fini = () => { setEdition(undefined); setV(v + 1) }
  const ouverte = useData(getBoutiqueOuverte, v) ?? false
  const basculer = async () => { try { await setBoutiqueOuverte(!ouverte); setV(v + 1) } catch (err) { alert((err as Error).message) } }

  async function valider(e: FormEvent) {
    e.preventDefault()
    try {
      const r = await validerBon(code)
      setBon(r.deja ? { ok: false, texte: `Déjà utilisé : ${r.lot} (${r.joueur})` } : { ok: true, texte: `À remettre : ${r.lot} à ${r.joueur}` })
      if (!r.deja) setCode('')
    } catch (err) { setBon({ ok: false, texte: (err as Error).message }) }
  }
  const supprimer = async (l: Lot) => {
    if (!confirm(`Supprimer « ${l.name} » ?`)) return
    try { await supprimerLot(l.id); setV(v + 1) } catch (err) { alert((err as Error).message) }
  }

  return (
    <div className="flex flex-col gap-5">
      <Tete sous="Espace admin" titre="Boutique" action={<button onClick={() => setEdition('nouveau')} className="flex min-h-11 shrink-0 items-center gap-1 rounded-full bg-flamme px-4 text-sm font-bold text-encre shadow-md"><Icon name="plus" size={18} />Lot</button>} />

      <Carton className="flex items-center justify-between gap-4 p-4">
        <div>
          <h2 className="font-serif text-lg font-bold">Boutique en ligne</h2>
          <p className="text-xs text-doux">{ouverte ? 'Visible sur le site et dans l\'appli.' : 'Masquée : ni le site ni l\'appli ne montrent les produits.'} Les récompenses en points restent toujours actives.</p>
        </div>
        <button role="switch" aria-checked={ouverte} aria-label="Boutique en ligne ouverte" onClick={basculer}
          className={`relative h-8 w-14 shrink-0 rounded-full transition-colors ${ouverte ? 'bg-flamme' : 'bg-trait'}`}>
          <span className={`absolute top-1 left-1 size-6 rounded-full bg-papier transition-transform ${ouverte ? 'translate-x-6' : ''}`} />
        </button>
      </Carton>

      <Carton className="p-4">
        <h2 className="font-serif text-lg font-bold">Valider un bon</h2>
        <p className="mb-3 text-xs text-doux">Le joueur te montre son code au pop-up store.</p>
        <form onSubmit={valider} className="flex gap-2">
          <input value={code} onChange={(e) => { setCode(e.target.value.toUpperCase()); setBon(undefined) }} aria-label="Code du bon" placeholder="AB12CD" maxLength={6}
            className="champ flex-1 text-center font-mono text-lg tracking-[.3em] uppercase" autoComplete="off" autoCapitalize="characters" />
          <button disabled={code.length < 6} className="btn btn-encre !w-auto px-5">Valider</button>
        </form>
        {bon && <p role="status" className={`mt-3 rounded-2xl px-4 py-3 text-sm font-bold ${bon.ok ? 'bg-flamme/15' : 'bg-sceau/10 text-sceau'}`}>{bon.ok ? '✓ ' : ''}{bon.texte}</p>}
      </Carton>

      <Carton className="overflow-hidden">
        <h2 className="px-4 pt-3.5 pb-2 font-serif text-lg font-bold">Lots ({lots.length})</h2>
        {edition === 'nouveau' && <FormLot fini={fini} />}
        {lots.map((l) => (
          <div key={l.id} className="border-t border-creme-2">
            <div className="flex items-center gap-3 px-4 py-3">
              <span className="grid size-12 shrink-0 place-items-center overflow-hidden rounded-[12px] bg-creme-2">
                {l.image_url ? <img src={l.image_url} alt="" className="size-full object-cover" /> : <Icon name="boutique" size={22} className="text-doux" />}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold">{l.name}</p>
                <p className="text-xs text-doux">{l.cost} pts · {l.stock === 0 ? <b className="text-sceau">rupture</b> : `${l.stock} en stock`}</p>
              </div>
              <button onClick={() => setEdition(edition === l.id ? undefined : l.id)} className="min-h-10 rounded-full border-[1.5px] border-trait px-3 text-xs font-bold">Modifier</button>
              <button onClick={() => supprimer(l)} aria-label={`Supprimer ${l.name}`} className="grid size-10 place-items-center rounded-full text-sceau"><span aria-hidden className="text-lg">×</span></button>
            </div>
            {edition === l.id && <FormLot lot={l} fini={fini} />}
          </div>
        ))}
      </Carton>

      <h2 className="titre mt-4 text-xl">« Cliquez pour sentir »</h2>
      <AdminSenteurs />
    </div>
  )
}
