import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { getIdentite, getProfile, getWallet, MOCK, resetMock, setIdentite, setUsername, supabase } from '../lib/api'
import { useData } from '../lib/useData'
import { Icon, Lapin } from '../ui'

const Info = ({ k, v }: { k: string; v?: string }) => (
  <div className="flex items-center justify-between gap-3 border-t border-creme-2 px-4 py-3 first:border-0">
    <dt className="text-sm text-doux">{k}</dt><dd className="truncate text-right font-medium">{v || '—'}</dd>
  </div>
)

export default function Account() {
  const [v, setV] = useState(0)
  const p = useData(getProfile, v)
  const id = useData(getIdentite, v)
  const w = useData(getWallet)
  const [edition, setEdition] = useState(false)
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)
  const depuis = p && new Date(p.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })

  async function enregistrer(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); setBusy(true); setMsg('')
    const f = new FormData(e.currentTarget)
    try {
      const pseudo = String(f.get('pseudo')).trim()
      if (pseudo !== p?.username) await setUsername(pseudo)
      await setIdentite({ prenom: String(f.get('prenom')).trim(), nom: String(f.get('nom')).trim() })
      setEdition(false); setV(v + 1); setMsg('Infos enregistrées ✓')
    } catch (err) { setMsg((err as Error).message) }
    setBusy(false)
  }

  return (
    <div className="flex flex-col gap-5">
      <header className="monte flex items-center gap-3.5">
        <span className="grid size-[60px] shrink-0 place-items-end justify-center overflow-hidden rounded-full bg-creme-2"><Lapin className="w-11 translate-y-1" /></span>
        <div className="min-w-0 flex-1">
          <h1 className="titre truncate text-[24px]">{p?.username ?? '…'}</h1>
          <p className="text-xs text-doux">Membre depuis le {depuis}</p>
        </div>
        {p?.role === 'admin'
          ? <span className="rounded-full bg-flamme px-3 py-1 text-xs font-bold">ADMIN</span>
          : <p className="text-right"><span className="titre block text-[26px] text-flamme">{w?.total ?? 0}</span><span className="text-[11px] font-bold text-doux">POINTS</span></p>}
      </header>

      {msg && <p role="status" className="rounded-2xl bg-flamme/12 px-4 py-3 text-sm font-medium">{msg}</p>}

      <section className="monte overflow-hidden rounded-[20px] border-[1.5px] border-trait bg-papier" style={{ animationDelay: '.06s' }}>
        <div className="flex items-center justify-between px-4 pt-3.5 pb-2">
          <h2 className="font-serif text-lg font-bold">Mes infos</h2>
          {!edition && <button onClick={() => { setEdition(true); setMsg('') }} className="min-h-10 rounded-full bg-encre px-4 text-xs font-bold text-creme">Modifier</button>}
        </div>
        {edition ? (
          <form onSubmit={enregistrer} className="flex flex-col gap-2.5 px-4 pb-4">
            <label className="flex flex-col gap-1 text-xs font-bold text-doux">Pseudo
              <input name="pseudo" className="champ" defaultValue={p?.username} required minLength={3} maxLength={20} />
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <label className="flex flex-col gap-1 text-xs font-bold text-doux">Prénom
                <input name="prenom" className="champ" defaultValue={id?.prenom} autoComplete="given-name" maxLength={40} />
              </label>
              <label className="flex flex-col gap-1 text-xs font-bold text-doux">Nom
                <input name="nom" className="champ" defaultValue={id?.nom} autoComplete="family-name" maxLength={40} />
              </label>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={() => setEdition(false)} className="btn-ligne">Annuler</button>
              <button disabled={busy} className="btn btn-encre">{busy ? '…' : 'Enregistrer'}</button>
            </div>
          </form>
        ) : (
          <dl>
            <Info k="Pseudo" v={p?.username} />
            <Info k="Prénom" v={id?.prenom} />
            <Info k="Nom" v={id?.nom} />
            <Info k="E-mail" v={p?.email} />
            <Info k="Code ami" v={p?.friend_code} />
          </dl>
        )}
      </section>

      {p?.role !== 'admin' && <nav className="monte overflow-hidden rounded-[20px] border-[1.5px] border-trait bg-papier" style={{ animationDelay: '.12s' }}>
        {[['/classement', 'Classement', 'Les meilleurs chasseurs de lapins']].map(([to, t, s]) => (
          <Link viewTransition key={to} to={to} className="flex min-h-16 items-center gap-3 border-t border-creme-2 px-4 py-3 first:border-0 active:bg-creme-2">
            <span className="flex-1"><span className="block font-serif text-[16px] font-bold">{t}</span><span className="block text-xs text-doux">{s}</span></span>
            <Icon name="chevron" size={18} className="text-doux" />
          </Link>
        ))}
      </nav>}

      {MOCK
        ? <button onClick={() => { resetMock(); location.reload() }} className="btn-ligne">Réinitialiser les fausses données</button>
        : <button onClick={() => supabase.auth.signOut()} className="btn-ligne"><Icon name="sortie" size={18} />Se déconnecter</button>}

      <footer className="flex flex-col items-center gap-1 pt-2 text-xs text-doux">
        <div className="flex flex-wrap justify-center">
          {[['mentions', 'Mentions légales'], ['confidentialite', 'Confidentialité'], ['cookies', 'Cookies']].map(([k, t], i) => (
            <span key={k} className="flex items-center">{i > 0 && <span aria-hidden className="px-1">·</span>}
              <Link viewTransition to={`/legal/${k}`} className="inline-flex min-h-10 items-center px-1 underline-offset-2 hover:underline">{t}</Link>
            </span>
          ))}
        </div>
        <p>Scent Back · projet étudiant MMI</p>
      </footer>
    </div>
  )
}
