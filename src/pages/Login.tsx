import { LogoMarque } from '../ui'
import { Link } from 'react-router-dom'
import { useState } from 'react'
import { getStatues, supabase, verifierPseudo, type Statue } from '../lib/api'
import { useData } from '../lib/useData'
import { Carte } from '../ui'

const s = (name: string, district: string, rarity: Statue['rarity'], points: number): Statue => ({ id: name, name, district, rarity, points, description: '', hint: '', lat: 0, lng: 0 })
const exemples = [s('Lapin Gargouille', 'Île de la Cité', 'rare', 80), s('Lapin de la Pyramide', 'Louvre', 'legendaire', 150), s('Lapin Falafel', 'Le Marais', 'commune', 30)]

export default function Login() {
  const [mode, setMode] = useState<'signup' | 'login'>('signup')
  // Retour de Google avec une erreur (?error=…) → message clair, et on nettoie l'adresse
  const [error, setError] = useState(() => {
    const q = new URLSearchParams(location.search + location.hash.replace('#', '&'))
    if (!q.get('error')) return ''
    history.replaceState(null, '', location.pathname)
    return q.get('error_code') === 'bad_oauth_state'
      ? 'La connexion Google a expiré. Réessaie.'
      : `Connexion Google impossible : ${q.get('error_description') ?? q.get('error')}`
  })
  const [info, setInfo] = useState('')
  const [busy, setBusy] = useState(false)
  const statues = useData(getStatues)
  const pick = (r: Statue['rarity']) => statues?.find((x) => x.rarity === r && !x.name.includes('Démo'))
  const cartes = statues?.length ? [pick('rare'), pick('legendaire'), pick('commune')].map((x, i) => x ?? exemples[i]) : exemples

  async function oauth(provider: 'google') {
    setError('')
    const { error } = await supabase.auth.signInWithOAuth({ provider, options: { redirectTo: location.origin } })
    if (error) setError(error.message.includes('not enabled') ? 'Connexion Google pas encore activée.' : error.message)
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    const email = String(f.get('email')), password = String(f.get('password'))
    const pb = mode === 'signup' ? verifierPseudo(String(f.get('username')).trim()) : ''
    if (pb) return setError(pb)
    setBusy(true); setError(''); setInfo('')
    const { data, error } = mode === 'login'
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password, options: { data: { username: String(f.get('username')).trim() } } })
    setBusy(false)
    if (error) setError(
      error.message.includes('Invalid login') ? 'E-mail ou mot de passe incorrect.'
      : error.message.includes('Database error') ? 'Ce nom de code est déjà pris, essaie une variante (ex. ajoute un chiffre).'
      : error.message.includes('rate limit') ? 'Trop d\'inscriptions d\'affilée, réessaie dans quelques minutes.'
      : error.message.includes('already registered') ? 'Un compte existe déjà avec cet e-mail.'
      : error.message)
    else if (mode === 'signup' && !data.session) setInfo('Compte créé. Confirme ton e-mail puis connecte-toi.')
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-2.5 overflow-x-clip px-6 pt-[max(1rem,env(safe-area-inset-top))] pb-6">
      <div className="relative mx-auto -mb-2 h-[150px] w-[342px] origin-top scale-[.6] [@media(max-height:860px)]:hidden" aria-hidden>
        {[[-10, 8, 18, 0], [10, 174, 22, 1], [0, 91, 0, 2]].map(([rot, x, y, z]) => {
          const c = cartes[[0, 2, 1][z]]
          return <div key={z} className="monte cq absolute w-[160px]" style={{ left: x, top: y, rotate: `${rot}deg`, zIndex: z, animationDelay: `${z * 90}ms` }}><Carte statue={c} /></div>
        })}
      </div>
      <div className="flex items-center gap-2">
        <LogoMarque className="-my-6 -ml-5 w-32 shrink-0" />
        <div><h1 className="titre text-[22px] leading-tight">Scent Back</h1><p className="text-sm font-medium text-doux">Rejoins la Confrérie.</p></div>
      </div>

      <div role="tablist" aria-label="Choix" className="relative grid grid-cols-2 rounded-3xl bg-creme-2 p-1">
        <span aria-hidden className={`absolute inset-y-1 left-1 w-[calc(50%-4px)] rounded-[20px] bg-papier shadow-sm transition-transform duration-300 ${mode === 'login' ? 'translate-x-full' : ''}`} />
        {(['signup', 'login'] as const).map((m) => (
          <button key={m} type="button" role="tab" aria-selected={mode === m} onClick={() => { setMode(m); setError(''); setInfo('') }}
            className={`relative min-h-10 text-sm font-bold transition-colors ${mode === m ? '' : 'text-doux'}`}>
            {m === 'signup' ? 'Inscription' : 'Connexion'}
          </button>
        ))}
      </div>

      {error && <p role="alert" className="rounded-2xl bg-sceau/10 px-4 py-3 text-sm text-sceau">{error}</p>}
      <div className="flex flex-col gap-2.5">
        <button type="button" onClick={() => oauth('google')} className="btn-ligne !min-h-12">
          <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 38.2 44 33 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>
          {mode === 'signup' ? 'S\'inscrire' : 'Continuer'} avec Google
        </button>
      </div>
      <div className="flex items-center gap-3 text-xs font-bold tracking-widest text-doux" aria-hidden>
        <span className="h-px flex-1 bg-trait" />OU PAR E-MAIL<span className="h-px flex-1 bg-trait" />
      </div>

      <form onSubmit={submit} className="flex flex-col gap-2.5">
        {mode === 'signup' && (
          <label className="flex flex-col gap-1 text-[13px] font-medium">Nom de code
            <input name="username" required maxLength={20} placeholder="ezio_cretin" autoComplete="off" autoCapitalize="none" autoCorrect="off" spellCheck={false} data-1p-ignore className="champ !min-h-12" />
          </label>
        )}
        <label className="flex flex-col gap-1 text-[13px] font-medium">E-mail
          <input name="email" type="email" required autoComplete="email" inputMode="email" placeholder="toi@exemple.fr" className="champ !min-h-12" />
        </label>
        <label className="flex flex-col gap-1 text-[13px] font-medium">Mot de passe
          <input name="password" type="password" required minLength={6} placeholder="6 caractères minimum"
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'} className="champ !min-h-12" />
        </label>
        {info && <p role="status" className="rounded-2xl bg-papier px-4 py-3 text-sm">{info}</p>}
        <button disabled={busy} className="btn-encre !min-h-12">
          {busy ? 'Un instant…' : mode === 'signup' ? 'Rejoindre la Confrérie' : 'Se connecter'}
        </button>
      </form>
      <footer className="mt-auto flex flex-wrap justify-center pt-2 text-xs text-doux">
        {[['mentions', 'Mentions légales'], ['conditions', 'CGU'], ['cgv', 'CGV'], ['confidentialite', 'Confidentialité'], ['cookies', 'Cookies']].map(([k, l], i) => (
          <span key={k} className="flex items-center">{i > 0 && <span aria-hidden className="px-1">·</span>}
            <Link viewTransition to={`/legal/${k}`} className="inline-flex min-h-10 items-center px-1 underline-offset-2 hover:underline">{l}</Link>
          </span>
        ))}
      </footer>
    </div>
  )
}
