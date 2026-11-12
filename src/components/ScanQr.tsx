import { useEffect, useRef, useState } from 'react'

/** Scanner de QR code à la caméra (marche aussi sur Safari/iPhone, contrairement au NFC web). Renvoie le code du lapin (/s/CODE). */
export default function ScanQr({ trouve, fermer, extraire = (t) => t.match(/\/s\/([A-Za-z0-9_-]+)/)?.[1] }: { trouve: (code: string) => void; fermer: () => void; extraire?: (texte: string) => string | undefined }) {
  const video = useRef<HTMLVideoElement>(null)
  const [erreur, setErreur] = useState('')
  const cb = useRef({ trouve, extraire }); cb.current = { trouve, extraire } // callbacks à jour sans relancer la caméra
  useEffect(() => {
    let flux: MediaStream | undefined, raf = 0, fini = false
    const canvas = document.createElement('canvas'), ctx = canvas.getContext('2d', { willReadFrequently: true })!
    ;(async () => {
      try {
        const [{ default: jsQR }, f] = await Promise.all([import('jsqr'), navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false })])
        flux = f; if (fini) return f.getTracks().forEach((t) => t.stop())
        const v = video.current!; v.srcObject = f; await v.play()
        const lire = () => {
          if (fini) return
          if (v.readyState === v.HAVE_ENOUGH_DATA) {
            canvas.width = v.videoWidth; canvas.height = v.videoHeight; ctx.drawImage(v, 0, 0)
            const r = jsQR(ctx.getImageData(0, 0, canvas.width, canvas.height).data, canvas.width, canvas.height)
            const code = r && cb.current.extraire(r.data)
            if (code) { fini = true; return cb.current.trouve(code) }
          }
          raf = requestAnimationFrame(lire)
        }
        lire()
      } catch { setErreur('Caméra indisponible. Autorise l\'accès à la caméra, ou scanne le QR code avec l\'appareil photo du téléphone.') }
    })()
    return () => { fini = true; cancelAnimationFrame(raf); flux?.getTracks().forEach((t) => t.stop()) }
  }, [])
  return (
    <div role="dialog" aria-modal="true" aria-label="Scanner le QR code du lapin" className="fixed inset-0 z-50 grid place-items-center bg-black">
      <video ref={video} playsInline muted className="absolute inset-0 size-full object-cover" />
      <div aria-hidden className="relative size-64 rounded-[28px] border-4 border-flamme shadow-[0_0_0_100vmax_rgba(0,0,0,.55)]" />
      <p className="absolute inset-x-6 top-[calc(env(safe-area-inset-top)+24px)] text-center font-bold text-white">{erreur || 'Vise le QR code'}</p>
      <button onClick={fermer} className="absolute bottom-[calc(env(safe-area-inset-bottom)+28px)] min-h-12 rounded-full bg-white px-8 font-bold text-[#023341]">Annuler</button>
    </div>
  )
}
