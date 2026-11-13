import { useEffect, useState } from 'react'
import { Icon } from '../ui'

type Invite = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> }
let invite: Invite | undefined // Android/Chrome : l'invitation native, gardée pour le bouton
addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); invite = e as Invite; dispatchEvent(new Event('installable')) })

const installee = () => matchMedia('(display-mode: standalone)').matches || (navigator as Navigator & { standalone?: boolean }).standalone === true
const ios = () => /iphone|ipad|ipod/i.test(navigator.userAgent)
const masquee = () => { try { return Date.now() - Number(localStorage.getItem('install-plus-tard') ?? 0) < 3 * 864e5 } catch { return false } }

/** Bandeau « installe l'appli » sur téléphone, tant qu'elle tourne dans le navigateur (masquable 3 jours). */
export default function Installer({ flottant = false }: { flottant?: boolean }) {
  const [voir, setVoir] = useState(() => !installee() && !masquee() && matchMedia('(pointer: coarse)').matches)
  const [, maj] = useState(0)
  const [aide, setAide] = useState(false)
  useEffect(() => { const f = () => maj((n) => n + 1); addEventListener('installable', f); return () => removeEventListener('installable', f) }, [])
  if (!voir) return null
  const plusTard = () => { try { localStorage.setItem('install-plus-tard', String(Date.now())) } catch { /* rien */ } setVoir(false) }
  const installer = async () => {
    if (invite) { await invite.prompt(); const r = await invite.userChoice; if (r.outcome === 'accepted') setVoir(false); invite = undefined }
    else setAide(true)
  }
  return (
    <div role="region" aria-label="Installer l'appli" className={`${flottant ? 'fixed inset-x-3 bottom-[calc(max(.75rem,env(safe-area-inset-bottom)_-_10px)+92px)] z-[45] mx-auto max-w-md' : ''} rounded-[20px] bg-[#023341] p-3.5 text-[#FCF5E3] shadow-xl ring-1 ring-[#FCF5E3]/15`}>
      <div className="flex items-center gap-3">
        <img src="/apple-touch-icon.png" alt="" className="size-11 shrink-0 rounded-[12px]" />
        <p className="min-w-0 flex-1 text-sm leading-snug"><b className="block">Installe Scent Back — La Chasse</b><span className="text-[#FCF5E3]/70">En plein écran, plus rapide, avec les vibrations du radar.</span></p>
        <button onClick={plusTard} aria-label="Plus tard" className="grid size-9 shrink-0 place-items-center rounded-full text-lg text-[#FCF5E3]/60">×</button>
      </div>
      {aide ? (
        <ol className="mt-3 list-decimal space-y-1 rounded-[14px] bg-[#FCF5E3]/10 p-3 pl-8 text-sm">
          {ios() ? <><li>Touche le bouton <b>Partager</b> (carré avec une flèche) en bas de Safari</li><li>Choisis <b>« Sur l'écran d'accueil »</b></li><li>Touche <b>Ajouter</b></li></>
            : <><li>Ouvre le menu <b>⋮</b> en haut à droite</li><li>Choisis <b>« Installer l'application »</b> ou « Ajouter à l'écran d'accueil »</li><li>Confirme</li></>}
        </ol>
      ) : (
        <button onClick={installer} className="mt-3 flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-flamme font-bold text-[#023341]"><Icon name="plus" size={18} />Installer l'appli</button>
      )}
    </div>
  )
}
