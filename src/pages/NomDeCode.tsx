import { useState } from 'react'
import { messagePseudo, supabase, verifierPseudo } from '../lib/api'
import { Lapin } from '../ui'

/** Après une connexion Google : le profil n'a pas encore de nom de code. */
export default function NomDeCode({ userId, onDone }: { userId: string; onDone: () => void }) {
  const [nom, setNom] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const n = nom.trim().length

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const username = nom.trim()
    const pb = verifierPseudo(username)
    if (pb) return setError(pb)
    setBusy(true)
    const { error } = await supabase.from('profiles').update({ username }).eq('id', userId)
    setBusy(false)
    if (error) setError(messagePseudo(error))
    else onDone()
  }

  return (
    <form onSubmit={submit} noValidate className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-5 px-6">
      <Lapin className="monte mx-auto w-24" />
      <h1 className="titre text-center text-4xl">Ton nom de code</h1>
      <p className="-mt-2 text-center text-doux">C'est lui que verront les autres joueurs dans le classement.</p>
      <div className="flex flex-col gap-1.5">
        <input name="nom-de-code" aria-label="Nom de code" aria-describedby="aide-nom" aria-invalid={!!error} value={nom}
          onChange={(e) => { setNom(e.target.value); setError('') }} maxLength={20} placeholder="ezio_cretin" className={`champ ${error ? '!border-sceau' : ''}`}
          autoFocus autoComplete="off" autoCapitalize="none" autoCorrect="off" spellCheck={false} data-1p-ignore data-lpignore="true" />
        <p id="aide-nom" className="flex justify-between px-1 text-xs text-doux">
          <span>3 à 20 caractères · lettres, chiffres, _ - .</span>
          <span className={n > 0 && n < 3 ? 'font-bold text-sceau' : ''}>{n}/20</span>
        </p>
      </div>
      {error && <p role="alert" className="rounded-2xl bg-sceau/10 px-4 py-3 text-sm font-medium text-sceau">{error}</p>}
      <button disabled={busy || n === 0} className="btn-encre">{busy ? 'Un instant…' : 'Valider'}</button>
    </form>
  )
}
