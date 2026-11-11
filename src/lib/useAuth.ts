import { useCallback, useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { MOCK, supabase } from './api'

// undefined = chargement ; null = déconnecté
export function useAuth() {
  const [session, setSession] = useState<Session | null | undefined>()

  useEffect(() => {
    if (MOCK) { setSession(null); return }
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => data.subscription.unsubscribe()
  }, [])

  // pseudo du profil : null = à choisir (connexion Google/Apple)
  const [username, setUsername] = useState<string | null>()
  const [role, setRole] = useState<string>()
  const refresh = useCallback(async () => {
    if (!session) return setUsername(undefined)
    const { data } = await supabase.from('profiles').select('username, role').eq('id', session.user.id).maybeSingle()
    setUsername(data?.username ?? null)
    setRole(data?.role)
  }, [session])
  useEffect(() => { refresh() }, [refresh])

  return { session, username, role, refresh, loading: session === undefined || (!!session && username === undefined) }
}
