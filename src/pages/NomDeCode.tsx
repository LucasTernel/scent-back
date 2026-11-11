import { useState } from 'react'
import { supabase } from '../lib/api'
import { Lapin } from '../ui'

/** Après Google/Apple : le profil n'a pas encore de pseudo. */
export default function NomDeCode({ userId, onDone }: { userId: string; onDone: () => void }) {
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setBusy(true)
    const username = String(new FormData(e.currentTarget).get('username')).trim()
    const { error } = await supabase.from('profiles').update({ username }).eq('id', userId)
    setBusy(false)
    if (error) setError(error.code === '23505' ? 'Ce nom de code est déjà pris.' : '3 à 20 caractères.')
    else onDone()
  }

  return (
    <form onSubmit={submit} className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-5 px-6">
      <Lapin className="monte mx-auto w-24" />
      <h1 className="titre text-center text-4xl">Ton nom de code</h1>
      <p className="-mt-2 text-center text-doux">C'est lui que verront tes amis dans le classement.</p>
      <input name="username" aria-label="Nom de code" required minLength={3} maxLength={20} placeholder="ezio_cretin" className="champ" autoFocus />
      {error && <p role="alert" className="rounded-2xl bg-sceau/10 px-4 py-3 text-sm text-sceau">{error}</p>}
      <button disabled={busy} className="btn-encre">{busy ? 'Un instant…' : 'Valider'}</button>
    </form>
  )
}
