import { useEffect, useState } from 'react'

/** Compte à rebours en volets (flip clock) jusqu'au pop-up. */
const reste = (cible: number) => {
  const s = Math.max(0, Math.floor((cible - Date.now()) / 1000))
  return { jours: Math.floor(s / 86400), heures: Math.floor(s / 3600) % 24, minutes: Math.floor(s / 60) % 60, secondes: s % 60 }
}

function Volet({ valeur, label }: { valeur: number; label: string }) {
  const txt = String(valeur).padStart(2, '0')
  const large = txt.length > 2
  return (
    <div className="flex flex-col items-center gap-3">
      <p className="text-xs font-bold tracking-[.25em] uppercase opacity-80">{label}</p>
      <div className={`volet relative h-[clamp(5rem,9vw,9rem)] ${large ? 'w-[clamp(8rem,14vw,14rem)]' : 'w-[clamp(5.5rem,10vw,10rem)]'} [perspective:600px]`}>
        <span className="volet-fond titre grid size-full place-items-center rounded-[14px] bg-[#023341] text-[clamp(2.6rem,5vw,5rem)] text-[#FCF5E3] shadow-[0_12px_30px_rgba(0,0,0,.35)]">{txt}</span>
        <span key={txt} aria-hidden className="volet-flip titre absolute inset-x-0 top-0 grid h-1/2 place-items-end justify-center overflow-hidden rounded-t-[14px] bg-[#0B4A5E] text-[clamp(2.6rem,5vw,5rem)] text-[#FCF5E3]">
          <span className="translate-y-1/2 leading-none">{txt}</span>
        </span>
        <span aria-hidden className="absolute inset-x-0 top-1/2 h-[2px] -translate-y-1/2 bg-black/40" />
      </div>
    </div>
  )
}

export default function Compteur({ date }: { date: string }) {
  const cible = new Date(date).getTime()
  const [r, setR] = useState(() => reste(cible))
  useEffect(() => { setR(reste(cible)); const id = setInterval(() => setR(reste(cible)), 1000); return () => clearInterval(id) }, [cible])
  return (
    <div role="timer" aria-label={`Ouverture dans ${r.jours} jours, ${r.heures} heures, ${r.minutes} minutes`} className="flex flex-wrap justify-center gap-[clamp(.75rem,1.5vw,1.5rem)]">
      <Volet valeur={r.jours} label="Jours" /><Volet valeur={r.heures} label="Heures" /><Volet valeur={r.minutes} label="Minutes" /><Volet valeur={r.secondes} label="Secondes" />
    </div>
  )
}
