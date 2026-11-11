import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { getCaptures, getProfile, getStatues, getWallet } from '../lib/api'
import { lireConsent } from '../lib/consent'
import { distance, ecouterNfc, nfcDispo, secouer, vibrer } from '../lib/haptique'
import { useData } from '../lib/useData'
import { Flamme, Icon } from '../ui'

const COUL = { commune: '#8A7660', rare: '#2F7FB5', legendaire: '#B3121B' }
const icone = (html: string, w: number, h = w) => L.divIcon({ html, className: '', iconSize: [w, h], iconAnchor: [w / 2, h] })

/** Chasse façon Pokémon GO : carte plein écran, radar toujours actif, scan NFC. */
export default function Scan() {
  const statues = useData(getStatues) ?? []
  const captures = useData(getCaptures) ?? []
  const wallet = useData(getWallet)
  const profile = useData(getProfile)
  const navigate = useNavigate()
  const found = new Set(captures.map((c) => c.statueId))
  const restants = statues.filter((s) => !found.has(s.id))

  // Position en continu (radar toujours actif, sauf si refusé dans la bannière). Reste sur le téléphone.
  const [moi, setMoi] = useState<{ lat: number; lng: number }>()
  const [refus, setRefus] = useState(lireConsent() === 'non')
  useEffect(() => {
    if (refus) return
    const id = navigator.geolocation.watchPosition((p) => setMoi({ lat: p.coords.latitude, lng: p.coords.longitude }), () => setRefus(true), { enableHighAccuracy: true })
    return () => navigator.geolocation.clearWatch(id)
  }, [refus])
  useEffect(() => { const f = () => setRefus(lireConsent() === 'non'); addEventListener('consent', f); return () => removeEventListener('consent', f) }, [])

  const d = moi && restants.length ? Math.min(...restants.map((s) => distance(moi, s))) : undefined
  const niveau = d === undefined ? null : d < 80 ? 3 : d < 250 ? 2 : d < 600 ? 1 : 0
  useEffect(() => {
    if (!niveau) return
    const bip = () => { vibrer(niveau === 3 ? [70, 60, 70] : 50); if (niveau === 3) secouer('leger') }
    bip()
    const t = setInterval(bip, [0, 3000, 1500, 700][niveau])
    return () => clearInterval(t)
  }, [niveau])

  // NFC dans l'appli (Chrome Android) ; ailleurs la puce ouvre directement /s/CODE
  const [nfc, setNfc] = useState(false)
  useEffect(() => {
    if (!nfc) return
    const ctrl = new AbortController()
    ecouterNfc((code) => { vibrer([100, 50, 200]); secouer(); setTimeout(() => navigate(`/s/${code}`, { viewTransition: true }), 350) }, ctrl.signal).catch(() => setNfc(false))
    return () => ctrl.abort()
  }, [nfc, navigate])

  // La carte occupe tout l'écran : la page elle-même ne doit pas défiler
  useEffect(() => { document.documentElement.classList.add('sans-defilement'); return () => document.documentElement.classList.remove('sans-defilement') }, [])

  // Carte Leaflet (OpenStreetMap), recolorée façon jeu en CSS
  const boite = useRef<HTMLDivElement>(null)
  const carte = useRef<L.Map>(null)
  const calque = useRef<L.LayerGroup>(null)
  const joueur = useRef<L.Marker>(null)
  const suivi = useRef(true)
  const premier = useRef(true)
  useEffect(() => {
    const m = L.map(boite.current!, { zoomControl: false, attributionControl: false }).setView([48.8566, 2.3422], 13)
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(m)
    L.control.zoom({ position: 'topright', zoomInTitle: 'Zoomer', zoomOutTitle: 'Dézoomer' }).addTo(m)
    m.on('dragstart', () => { suivi.current = false })
    // le radar autour du joueur suit le zoom (taille réelle ~ quelques centaines de mètres)
    const taille = () => joueur.current?.getElement()?.style.setProperty('--taille', `${Math.max(36, Math.min(160, 120 * 2 ** (m.getZoom() - 16)))}px`)
    m.on('zoom', taille)
    calque.current = L.layerGroup().addTo(m)
    carte.current = m
    return () => { m.remove() }
  }, [])
  useEffect(() => {
    const g = calque.current
    if (!g) return
    g.clearLayers()
    for (const s of statues) {
      const ok = found.has(s.id)
      if (!ok) L.circle([s.lat, s.lng], { radius: 110, color: COUL[s.rarity], weight: 2, dashArray: '6 6', fillOpacity: .12, interactive: false }).addTo(g)
      L.marker([s.lat, s.lng], {
        interactive: false,
        icon: ok ? icone('<div class="pin-ok">✓</div>', 26, 13) : icone(`<div class="pin-zone" style="--c:${COUL[s.rarity]}"><div class="pin-lapin"><b>?</b></div></div>`, 40, 52),
      }).addTo(g)
    }
  }, [statues.length, captures.length]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    const m = carte.current
    if (!m || !moi) return
    if (!joueur.current) joueur.current = L.marker([moi.lat, moi.lng], { icon: icone('<div class="joueur"><span></span></div>', 120, 60), zIndexOffset: 1000, interactive: false }).addTo(m)
    joueur.current.setLatLng([moi.lat, moi.lng])
    joueur.current.getElement()?.style.setProperty('--taille', `${Math.max(36, Math.min(160, 120 * 2 ** (m.getZoom() - 16)))}px`)
    joueur.current.getElement()?.style.setProperty('--vitesse', `${[3, 2, 1.2, .6][niveau ?? 0]}s`)
    if (premier.current) { premier.current = false; m.setView([moi.lat, moi.lng], 16) } // zoom seulement au 1er point GPS
    else if (suivi.current) m.panTo([moi.lat, moi.lng]) // ensuite on suit sans toucher au zoom choisi
  }, [moi, niveau])
  const toutVoir = () => {
    suivi.current = false
    const pts = statues.filter((s) => !found.has(s.id)).map((s) => [s.lat, s.lng] as [number, number])
    if (moi) pts.push([moi.lat, moi.lng])
    if (pts.length) carte.current?.fitBounds(pts, { padding: [60, 60], paddingBottomRight: [60, 280] })
  }
  const recentrer = () => { suivi.current = true; if (moi) carte.current?.setView([moi.lat, moi.lng], 17) }

  const etat = refus ? 'Active ta position pour le radar' : niveau === null ? 'Recherche du signal…' : ['Froid… cherche ailleurs', 'Tiède, continue', 'Chaud ! Tout près', 'BRÛLANT ! Elle est là'][niveau]

  return (
    <>
      <div className="carte-chasse fixed inset-0 z-0"><div ref={boite} className="size-full" aria-label="Carte de chasse" /></div>

      <header className="pointer-events-none fixed inset-x-0 top-[calc(env(safe-area-inset-top)+3.5rem)] z-10 mx-auto flex max-w-md items-center justify-between px-4 pt-2">
        <span className="pointer-events-auto rounded-full bg-papier/95 px-4 py-2 text-sm font-bold shadow-md">{profile?.username ?? '…'} · {found.size}/{statues.length}</span>
        <span className="pointer-events-auto flex items-center gap-1.5 rounded-full bg-encre py-2 pr-3.5 pl-3 text-[15px] font-bold text-creme shadow-md"><Flamme />{wallet?.total ?? 0}</span>
      </header>

      <details className="credits fixed bottom-[262px] left-4 z-10">
        <summary aria-label="Crédits de la carte" className="grid size-8 cursor-pointer list-none place-items-center rounded-full bg-papier font-serif text-sm font-bold shadow-md">i</summary>
        <p className="absolute bottom-10 left-0 rounded-xl bg-papier px-3 py-2 text-[11px] whitespace-nowrap shadow-md">© <a href="https://www.openstreetmap.org/copyright" className="underline">OpenStreetMap</a></p>
      </details>
      <button onClick={toutVoir} className="fixed right-4 bottom-[322px] z-10 flex h-12 items-center gap-1.5 rounded-full bg-papier px-4 text-sm font-bold text-encre shadow-md">
        <Icon name="collection" size={18} />Lapins
      </button>
      <button onClick={recentrer} aria-label="Me recentrer" className="fixed right-4 bottom-[262px] z-10 grid size-12 place-items-center rounded-full bg-papier text-encre shadow-md">
        <Icon name="lieu" size={20} />
      </button>

      <section className="fixed inset-x-0 bottom-[104px] z-[35] mx-auto max-w-md px-4">
        <div className="flex flex-col gap-3 rounded-[26px] bg-encre p-4 text-creme shadow-xl">
          <div className="flex items-center gap-3">
            <span id="scan-core" className="relative grid size-14 shrink-0 place-items-center rounded-full bg-flamme text-encre">
              <span className="onde absolute inset-0 rounded-full border-2 border-flamme" style={{ animationDuration: `${[3, 2, 1.1, .5][niveau ?? 0]}s` }} />
              <Icon name="nfc" size={26} />
            </span>
            <div className="min-w-0 flex-1" aria-live="polite">
              <p className="text-[10px] font-bold tracking-[.18em] text-flamme">RADAR</p>
              <p className="font-serif text-[15px] leading-tight font-bold">{etat}</p>
              {d !== undefined && <p className="text-xs text-trait">Lapin le plus proche : ~{d < 1000 ? `${Math.round(d / 10) * 10} m` : `${(d / 1000).toFixed(1)} km`}</p>}
            </div>
          </div>
          {nfcDispo
            ? <button onClick={() => setNfc(!nfc)} aria-pressed={nfc} className={`btn min-h-12 text-sm ${nfc ? 'bg-flamme text-encre' : 'bg-creme text-encre'}`}><Icon name="nfc" size={18} />{nfc ? 'Approche la puce…' : 'Scanner la puce NFC'}</button>
            : <p className="text-center text-xs text-trait">Approche ton téléphone de la puce sous la statuette.</p>}
        </div>
      </section>
    </>
  )
}
