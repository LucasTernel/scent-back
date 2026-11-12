// Validation d'un scan : JWT, code, distance, doublon, limite, photo, points.
import { createClient } from 'npm:@supabase/supabase-js@2'

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}
const DEMO = Deno.env.get('DEMO_MODE') === 'true'

function meters(lat1: number, lng1: number, lat2: number, lng2: number) {
  const r = (d: number) => (d * Math.PI) / 180
  const a = Math.sin(r(lat2 - lat1) / 2) ** 2 + Math.cos(r(lat1)) * Math.cos(r(lat2)) * Math.sin(r(lng2 - lng1) / 2) ** 2
  return 6371000 * 2 * Math.asin(Math.sqrt(a))
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  const fail = (error: string, status = 400) =>
    new Response(JSON.stringify({ error }), { status, headers: { ...cors, 'Content-Type': 'application/json' } })

  const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
  const jwt = req.headers.get('Authorization')?.replace('Bearer ', '') ?? ''
  const { data: { user } } = await db.auth.getUser(jwt)
  if (!user) return fail('Connecte-toi pour synchroniser un lapin.', 401)

  const form = await req.formData()
  const code = String(form.get('code') ?? '')
  const lat = Number(form.get('lat'))
  const lng = Number(form.get('lng'))
  const photo = form.get('photo')
  if (!(photo instanceof File) || photo.size > 3_000_000) return fail('Photo manquante ou trop lourde.')

  const hourAgo = new Date(Date.now() - 3600_000).toISOString()
  const { count } = await db.from('claim_attempts').select('*', { count: 'exact', head: true }).eq('user_id', user.id).gte('created_at', hourAgo)
  if ((count ?? 0) >= 10) return fail('Trop de tentatives, reviens dans une heure.', 429)
  await db.from('claim_attempts').insert({ user_id: user.id })

  const { data: statue } = await db.from('statues').select('*').eq('code', code).eq('active', true).maybeSingle()
  if (!statue) return fail('Code invalide : cette statuette n\'existe pas.', 404)

  const { data: already } = await db.from('captures').select('id').eq('user_id', user.id).eq('statue_id', statue.id).maybeSingle()
  if (already) return fail('Tu as déjà synchronisé ce lapin !', 409)

  // SANS_POSITION=true (secret Supabase) : pas de contrôle de distance, ex. démo à l'oral loin de Paris
  if (!(DEMO && statue.is_demo) && Deno.env.get('SANS_POSITION') !== 'true') {
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return fail('Position GPS requise.')
    const d = meters(lat, lng, statue.lat, statue.lng)
    if (d > statue.radius_m) return fail(`Trop loin de la cible (${Math.round(d)} m).`, 403)
  }

  const path = `${user.id}/${statue.id}.jpg`
  const up = await db.storage.from('captures').upload(path, photo, { contentType: 'image/jpeg', upsert: true })
  if (up.error) return fail('Échec de l\'envoi de la photo.', 500)

  const { data: total, error } = await db.rpc('record_capture', {
    p_user: user.id, p_statue: statue.id, p_photo: path, p_lat: lat || null, p_lng: lng || null,
  })
  if (error) return fail('Tu as déjà synchronisé ce lapin !', 409) // contrainte unique

  return new Response(
    JSON.stringify({ statue: { id: statue.id, name: statue.name, rarity: statue.rarity, points: statue.points, description: statue.description, district: statue.district, hint: '', lat: 0, lng: 0 }, total }),
    { headers: { ...cors, 'Content-Type': 'application/json' } },
  )
})
