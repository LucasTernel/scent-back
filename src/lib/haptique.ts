/** Vibrations (Android ; iOS les ignore) + secousse d'écran (partout). */
export const vibrer = (motif: number | number[]) => navigator.vibrate?.(motif)

export function secouer(force: 'leger' | 'fort' = 'fort') {
  const b = document.body
  b.classList.remove('secoue', 'secoue-leger'); void b.offsetWidth // relance l'anim
  b.classList.add(force === 'fort' ? 'secoue' : 'secoue-leger')
  setTimeout(() => b.classList.remove('secoue', 'secoue-leger'), 600)
}

/** Distance en mètres entre deux points GPS (haversine). */
export function distance(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const r = Math.PI / 180, dLat = (b.lat - a.lat) * r, dLng = (b.lng - a.lng) * r
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(dLng / 2) ** 2
  return 6371000 * 2 * Math.asin(Math.sqrt(h))
}

/** Lit l'URL d'une puce NFC et renvoie le CODE de /s/CODE (Web NFC : Chrome Android). */
export const nfcDispo = typeof window !== 'undefined' && 'NDEFReader' in window
export async function ecouterNfc(onCode: (code: string) => void, signal: AbortSignal) {
  // @ts-expect-error Web NFC pas encore dans les types TS
  const r = new NDEFReader()
  await r.scan({ signal })
  r.onreading = (e: { message: { records: { recordType: string; data: DataView }[] } }) => {
    for (const rec of e.message.records) {
      const txt = new TextDecoder().decode(rec.data)
      const code = txt.match(/\/s\/([\w-]+)/)?.[1] ?? (rec.recordType === 'text' ? txt.trim() : '')
      if (code) return onCode(code)
    }
  }
}
