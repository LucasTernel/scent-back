// Couche de données : Supabase si VITE_SUPABASE_URL est défini, sinon fausses données (localStorage).
import { createClient } from '@supabase/supabase-js'

export type Rarity = 'commune' | 'rare' | 'superrare' | 'epique' | 'legendaire'
/** Ordre des raretés (de la plus courante à la plus rare), couleurs et points de base. */
export const RARETES: Rarity[] = ['commune', 'rare', 'superrare', 'epique', 'legendaire']
export const HEX_RARETE: Record<Rarity, string> = { commune: '#8A7660', rare: '#2F7FB5', superrare: '#1E9E8A', epique: '#7B3FB8', legendaire: '#B3121B' }
export const POINTS_RARETE: Record<Rarity, number> = { commune: 30, rare: 60, superrare: 100, epique: 150, legendaire: 200 }
export const rangRarete = (r: Rarity) => RARETES.indexOf(r)
export type Statue = { id: string; name: string; description: string; hint: string; district: string; rarity: Rarity; points: number; lat: number; lng: number; image?: string; model?: string; collectionId?: string }
export type Collection = { id: string; name: string; description?: string; image_url?: string; logo_url?: string }
export type Capture = { statueId: string; photo?: string; createdAt: string }
export type Tx = { amount: number; source: 'capture' | 'popup' | 'reward' | 'bonus'; note: string; createdAt: string }
export type Wallet = { total: number; paris: number; popup: number; spent: number }

const URL_ = import.meta.env.VITE_SUPABASE_URL as string | undefined
export const MOCK = !URL_
export const supabase = createClient(URL_ || 'http://mock.local', import.meta.env.VITE_SUPABASE_ANON_KEY || 'mock')

/* ---------- Supabase ---------- */

const sb = {
  async getStatues(): Promise<Statue[]> {
    const { data } = await supabase.from('public_statues').select('*').order('points')
    return (data ?? []).map((s) => ({ ...s, lat: s.zone_lat, lng: s.zone_lng, image: s.image_url ?? undefined, model: s.model_url ?? undefined, collectionId: s.collection_id ?? undefined }))
  },
  async getCollections(): Promise<Collection[]> {
    const { data } = await supabase.from('collections').select('id, name, description, image_url, logo_url').order('created_at')
    return data ?? []
  },
  async getCaptures(): Promise<Capture[]> {
    const { data } = await supabase.from('captures').select('statue_id, photo_path, created_at')
    if (!data?.length) return []
    const { data: urls } = await supabase.storage.from('captures').createSignedUrls(data.map((c) => c.photo_path), 3600)
    return data.map((c, i) => ({ statueId: c.statue_id, photo: urls?.[i]?.signedUrl ?? undefined, createdAt: c.created_at }))
  },
  async getTransactions(): Promise<Tx[]> {
    const { data } = await supabase.from('point_transactions').select('amount, source, note, created_at').order('created_at')
    return (data ?? []).map((t) => ({ ...t, note: t.note ?? t.source, createdAt: t.created_at }))
  },
  async getWallet(): Promise<Wallet> {
    const { data } = await supabase.from('wallet_balances').select('total, paris, popup, spent').maybeSingle()
    return data ?? { total: 0, paris: 0, popup: 0, spent: 0 }
  },
  async claimStatue(code: string, photo: Blob, pos?: GeolocationCoordinates) {
    const form = new FormData()
    form.append('code', code)
    form.append('photo', photo, 'photo.jpg')
    if (pos) { form.append('lat', String(pos.latitude)); form.append('lng', String(pos.longitude)) }
    const { data, error } = await supabase.functions.invoke('claim-statue', { body: form })
    if (error) {
      const body = await (error as { context?: Response }).context?.json?.().catch(() => null)
      throw new Error(body?.error ?? 'Impossible de joindre le serveur.')
    }
    return data as { statue: Statue; total: number }
  },
}

/* ---------- Fausses données ---------- */

const S = (id: string, name: string, district: string, hint: string, rarity: Rarity, lat: number, lng: number): Statue =>
  ({ id, name, district, hint, rarity, lat, lng, collectionId: id.startsWith('DEMO') ? 'demo' : 'paris', description: 'Description lore à venir. BWAAAH !', points: POINTS_RARETE[rarity] })

const statues: Statue[] = [
  S('LOUVRE-7Q2', 'Lapin de la Pyramide', 'Louvre', 'Là où le verre fait des triangles…', 'epique', 48.8606, 2.3376),
  S('NDAME-K8P', 'Lapin Gargouille', 'Île de la Cité', 'Il guette depuis une cathédrale célèbre…', 'rare', 48.853, 2.3499),
  S('MONTM-3XR', 'Lapin du Sacré-Cœur', 'Montmartre', 'Tout en haut de la butte…', 'superrare', 48.8867, 2.3431),
  S('MARAIS-9TB', 'Lapin Falafel', 'Le Marais', 'Entre les hôtels particuliers et les falafels…', 'commune', 48.8575, 2.359),
  S('CANAL-5MZ', 'Lapin Éclusier', 'Canal Saint-Martin', 'Au bord de l\'eau, près des passerelles vertes…', 'commune', 48.871, 2.365),
  S('EIFFEL-2WD', 'Lapin Saut de la Foi', 'Tour Eiffel', 'Sous la Dame de fer…', 'legendaire', 48.8584, 2.2945),
  S('PNEUF-6HC', 'Lapin du Pont-Neuf', 'Pont-Neuf', 'Près d\'un pont célèbre…', 'commune', 48.8572, 2.3414),
  S('BASTI-4GN', 'Lapin Révolutionnaire', 'Bastille', 'Là où une colonne remplace une forteresse…', 'commune', 48.8532, 2.3691),
  S('OPERA-8LV', 'Lapin Fantôme', 'Opéra', 'Sous les dorures d\'un palais de la musique…', 'superrare', 48.872, 2.3316),
  S('LUXEM-1SJ', 'Lapin Sénateur', 'Luxembourg', 'Dans un jardin royal plein de chaises vertes…', 'rare', 48.8462, 2.3372),
  S('PANTH-7EF', 'Lapin Grand Homme', 'Panthéon', 'Au sommet de la montagne Sainte-Geneviève…', 'epique', 48.8462, 2.3464),
  S('ARC-5YK', 'Lapin Point de Vue', 'Arc de Triomphe', 'Au centre de l\'étoile…', 'legendaire', 48.8738, 2.295),
  { ...S('ULTIME-AC', 'Lapin Ultimate', 'Hôtel de Ville', 'Là où Paris garde ses archives…', 'legendaire', 48.8566, 2.3522), points: 250, model: '/models/lapin-ultimate.glb', description: 'Le maître de la Confrérie. Capuche bleu nuit, épée au poing et sourire de dément.' },
  S('DEMO-1', 'Lapin Démo Commun', 'Salle de l\'oral', 'Dans la salle !', 'commune', 48.8566, 2.3522),
  S('DEMO-2', 'Lapin Démo Rare', 'Salle de l\'oral', 'Dans la salle !', 'rare', 48.8566, 2.3522),
  S('DEMO-3', 'Lapin Démo Légendaire', 'Salle de l\'oral', 'Dans la salle !', 'legendaire', 48.8566, 2.3522),
]
const load = <T,>(k: string, d: T): T => { try { return JSON.parse(localStorage.getItem(k) ?? '') } catch { return d } }
const save = (k: string, v: unknown) => localStorage.setItem(k, JSON.stringify(v))

const mock = {
  getStatues: async () => statues,
  getCollections: async (): Promise<Collection[]> => [{ id: 'paris', name: 'Assassin\'s Creed — 20 ans dans l\'ombre' }, { id: 'demo', name: 'Démo' }],
  getCaptures: async () => load<Capture[]>('captures', []),
  getTransactions: async () => load<Tx[]>('txs', []),
  async getWallet(): Promise<Wallet> {
    const txs = await mock.getTransactions()
    const sum = (f: (t: Tx) => boolean) => txs.filter(f).reduce((a, t) => a + t.amount, 0)
    return { total: sum(() => true), paris: sum((t) => t.source === 'capture'), popup: sum((t) => t.source === 'popup' || t.source === 'bonus'), spent: -sum((t) => t.source === 'reward') }
  },
  async claimStatue(code: string, photo: Blob) {
    const statue = statues.find((s) => s.id === code)
    if (!statue) throw new Error('Code invalide : cette statuette n\'existe pas.')
    const captures = await mock.getCaptures()
    if (captures.some((c) => c.statueId === code)) throw new Error('Tu as déjà synchronisé ce lapin !')
    const now = new Date().toISOString()
    save('captures', [...captures, { statueId: code, photo: URL.createObjectURL(photo), createdAt: now }])
    save('txs', [...(await mock.getTransactions()), { amount: statue.points, source: 'capture', note: statue.name, createdAt: now }])
    return { statue, total: (await mock.getWallet()).total }
  },
}

export const { getStatues, getCollections, getCaptures, getTransactions, getWallet, claimStatue } = MOCK ? mock : sb

export async function getProfile(): Promise<{ username: string; friend_code: string; created_at: string; role: string; email: string }> {
  if (MOCK) return { username: 'ezio_cretin', friend_code: 'K7Q2', created_at: new Date().toISOString(), role: 'player', email: 'ezio@exemple.fr' }
  const { data: { user } } = await supabase.auth.getUser()
  const { data } = await supabase.from('profiles').select('username, friend_code, created_at, role').eq('id', user!.id).single()
  return { ...data!, email: user!.email ?? '' }
}
/** Règle du nom de code : renvoie le problème en clair, ou '' si c'est bon. */
export function verifierPseudo(s: string) {
  if (s.length < 3) return `Trop court : 3 caractères minimum (tu en as ${s.length}).`
  if (s.length > 20) return `Trop long : 20 caractères maximum (tu en as ${s.length}).`
  if (!/^[\p{L}\p{N}_.-]+$/u.test(s)) return 'Lettres, chiffres, « _ », « - » et « . » uniquement (pas d\'espace ni d\'emoji).'
  return ''
}
/** Erreur Supabase → message compréhensible. */
export function messagePseudo(e: { code?: string; message?: string }) {
  if (e.code === '23505') return 'Ce nom de code est déjà pris, essaie une variante (ex. ajoute un chiffre).'
  if (e.code === '23514') return 'Le nom de code doit faire entre 3 et 20 caractères.'
  return 'Impossible d\'enregistrer le nom de code pour le moment. Réessaie dans un instant.'
}

export async function setUsername(username: string) {
  const pb = verifierPseudo(username)
  if (pb) throw new Error(pb)
  if (MOCK) return
  const { data: { user } } = await supabase.auth.getUser()
  const { error } = await supabase.from('profiles').update({ username }).eq('id', user!.id)
  if (error) throw new Error(messagePseudo(error))
}
export async function getLeaderboard(): Promise<{ username: string; total: number }[]> {
  if (MOCK) return [{ username: 'altair_bwaah', total: 620 }, { username: 'ezio_cretin', total: (await mock.getWallet()).total }, { username: 'lapin_furtif', total: 180 }].sort((a, b) => b.total - a.total)
  const { data, error } = await supabase.rpc('leaderboard')
  if (error) throw error
  return data
}

/** Prénom / nom : stockés dans les métadonnées du compte (pas de colonne en plus). */
export async function getIdentite(): Promise<{ prenom: string; nom: string }> {
  if (MOCK) return load('identite', { prenom: '', nom: '' })
  const { data: { user } } = await supabase.auth.getUser()
  return { prenom: user?.user_metadata.prenom ?? '', nom: user?.user_metadata.nom ?? '' }
}
export async function setIdentite(v: { prenom: string; nom: string }) {
  if (MOCK) return save('identite', v)
  const { error } = await supabase.auth.updateUser({ data: v })
  if (error) throw error
}

/* ---------- Admin (Supabase uniquement, protégé par RLS is_admin()) ---------- */

export type StatueAdmin = { id: string; code: string; name: string; rarity: Rarity; points: number; collection_id: string | null; image_url: string | null; model_url: string | null; description: string | null; hint: string | null; district: string | null; lat: number; lng: number }
export async function adminStatues(): Promise<StatueAdmin[]> {
  const { data, error } = await supabase.from('statues').select('id, code, name, rarity, points, collection_id, image_url, model_url, description, hint, district, lat, lng').order('name')
  if (error) throw error
  return data
}
const rpc = async <T,>(f: string, args?: object): Promise<T> => {
  const { data, error } = await supabase.rpc(f, args)
  if (error) throw error
  return data
}
export const adminStats = () => rpc<{ joueurs: number; actifs_7j: number; captures: number; captures_7j: number }>('admin_stats')
export const adminCollectionsStats = (mini: number) => rpc<{ id: string; name: string; statuettes: number; joueurs: number }[]>('admin_collections_stats', { mini })
export const adminScansParJour = () => rpc<{ jour: string; scans: number }[]>('admin_scans_par_jour')
export const adminStatuesStats = () => rpc<{ statue_id: string; captures: number; derniere: string }[]>('admin_statues_stats')

export async function uploadMedia(file: File) {
  const path = `${crypto.randomUUID()}-${file.name.replace(/[^\w.-]/g, '_')}`
  const { error } = await supabase.storage.from('medias').upload(path, file)
  if (error) throw error
  return supabase.storage.from('medias').getPublicUrl(path).data.publicUrl
}
export async function updateCollection(id: string, v: { name: string; description: string; image_url?: string; logo_url?: string }) {
  const { error } = await supabase.from('collections').update(v).eq('id', id)
  if (error) throw error
}
export async function createCollection(v: { name: string; description: string; image_url?: string; logo_url?: string }) {
  const { error } = await supabase.from('collections').insert(v)
  if (error) throw error
}
export async function updateStatue(id: string, v: Record<string, unknown>) {
  const { error } = await supabase.from('statues').update(v).eq('id', id)
  if (error) throw error
}
export async function createStatue(v: Record<string, unknown>) {
  const { error } = await supabase.from('statues').insert(v)
  if (error) throw error
}

// mode démo : un modèle 3D unique par statuette (mêmes fichiers que la base)
for (const s of statues) if (!s.model) s.model = `/models/lapin-${s.id === 'BASTI-4GN' ? 'revolutionnaire' : s.id.startsWith('DEMO') ? s.id.toLowerCase() : s.id.split('-')[0].toLowerCase()}.glb`

/* ---------- Boutique ---------- */
export type Lot = { id: string; name: string; cost: number; stock: number; image_url: string | null }
export type Bon = { code: string; lot: string; retire: boolean; created_at: string }
const LOTS_DEMO: Lot[] = [
  { id: 'l1', name: 'Autocollants BWAAAH', cost: 50, stock: 500, image_url: null },
  { id: 'l2', name: 'Tote bag La Belle Mèche x Ubisoft', cost: 150, stock: 100, image_url: null },
  { id: 'l3', name: 'Bougie Lapin Assassin (cire de soja)', cost: 300, stock: 50, image_url: null },
  { id: 'l4', name: 'Figurine Lapin Crétin édition Confrérie', cost: 500, stock: 20, image_url: null },
]
export async function getLots(): Promise<Lot[]> {
  if (MOCK) return LOTS_DEMO
  const { data } = await supabase.from('rewards').select('id, name, cost, stock, image_url').order('cost')
  return data ?? []
}
export async function getBons(): Promise<Bon[]> {
  if (MOCK) return load<Bon[]>('bons', [])
  const { data } = await supabase.from('commandes').select('code, retire, created_at, rewards(name)').order('created_at', { ascending: false })
  return (data ?? []).map((c) => ({ code: c.code, retire: c.retire, created_at: c.created_at, lot: (c.rewards as unknown as { name: string } | null)?.name ?? 'Lot' }))
}
export async function echangerLot(lot: Lot): Promise<{ code: string; lot: string }> {
  if (MOCK) {
    if ((await mock.getWallet()).total < lot.cost) throw new Error('Pas assez de points pour ce lot.')
    const code = Math.random().toString(36).slice(2, 8).toUpperCase(), now = new Date().toISOString()
    save('txs', [...(await mock.getTransactions()), { amount: -lot.cost, source: 'reward', note: lot.name, createdAt: now }])
    save('bons', [{ code, lot: lot.name, retire: false, created_at: now }, ...(await getBons())])
    return { code, lot: lot.name }
  }
  const { data, error } = await supabase.rpc('echanger_lot', { lot: lot.id })
  if (error) throw new Error(
    error.message.includes('insuffisants') ? 'Pas assez de points pour ce lot.'
    : error.message.includes('rupture') ? 'Ce lot est en rupture de stock.'
    : 'Échange impossible pour le moment, réessaie.')
  return data
}

export const resetMock = () => { for (const k of ['captures', 'txs', 'bons']) localStorage.removeItem(k) }

/* ---------- Utilitaires capture ---------- */

export function getPosition() {
  return new Promise<GeolocationCoordinates>((ok, ko) =>
    navigator.geolocation.getCurrentPosition((p) => ok(p.coords), () => ko(new Error('GPS refusé : autorise la localisation pour valider la capture.')), { enableHighAccuracy: true, timeout: 15000 }))
}

export async function compress(file: File, max = 1280): Promise<Blob> {
  const img = await createImageBitmap(file)
  const k = Math.min(1, max / Math.max(img.width, img.height))
  const c = document.createElement('canvas')
  c.width = img.width * k
  c.height = img.height * k
  c.getContext('2d')!.drawImage(img, 0, 0, c.width, c.height)
  return new Promise((ok) => c.toBlob((b) => ok(b!), 'image/jpeg', 0.8))
}
