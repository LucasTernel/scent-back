import { useEffect, useState } from 'react'
import { secouer, vibrer } from '../lib/haptique'
import { Link, useParams } from 'react-router-dom'
import { claimStatue, compress, getPosition, MOCK } from '../lib/api'
import { Carte, Icon, rarityLabel, Sceau } from '../ui'

type Result = Awaited<ReturnType<typeof claimStatue>>
const DEMO = import.meta.env.VITE_DEMO_MODE === 'true'

function Ecran({ children, sombre }: { children: React.ReactNode; sombre?: boolean }) {
  return (
    <div className={`relative min-h-dvh overflow-hidden ${sombre ? 'bg-encre text-creme' : ''}`}>
      {sombre && <div aria-hidden className="absolute top-24 left-1/2 size-[520px] -translate-x-1/2 rounded-full bg-sceau/40 blur-[90px]" />}
      <div className="relative mx-auto flex min-h-dvh max-w-md flex-col px-6 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        <Link viewTransition to="/" aria-label="Retour" className={`grid size-11 place-items-center rounded-full ${sombre ? 'bg-creme/10' : 'bg-papier'}`}><Icon name="retour" size={20} /></Link>
        {children}
      </div>
    </div>
  )
}

export default function Claim() {
  const { code = '' } = useParams()
  const [result, setResult] = useState<Result>()
  const [photo, setPhoto] = useState<string>()
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  useEffect(() => { vibrer([100, 50, 200]); secouer() }, []) // puce détectée

  async function onPhoto(file?: File) {
    if (!file) return
    setBusy(true)
    try {
      const pos = MOCK ? undefined : await getPosition().catch((e) => { if (DEMO && code.startsWith('DEMO')) return undefined; throw e })
      const blob = await compress(file)
      setPhoto(URL.createObjectURL(blob))
      setResult(await claimStatue(code, blob, pos))
      vibrer([60, 40, 60, 40, 250]); secouer()
    } catch (e) { setError((e as Error).message); vibrer([200, 100, 200]) }
    setBusy(false)
  }

  if (error) return (
    <Ecran>
      <div className="my-auto flex flex-col items-center text-center">
        <span className="pop grid size-20 place-items-center rounded-full bg-sceau text-3xl text-papier">✕</span>
        <h1 className="titre mt-6 text-4xl">Désynchronisé</h1>
        <p className="mt-3 max-w-xs text-doux">{error}</p>
      </div>
      <Link viewTransition to="/" className="btn-encre">Retour à la chasse</Link>
    </Ecran>
  )

  if (result) return (
    <Ecran sombre>
      <div className="my-auto flex flex-col items-center gap-3.5 text-center">
        <span className="monte flex items-center gap-2 rounded-full bg-or/15 py-1.5 pr-3.5 pl-1.5 text-[11px] font-bold tracking-widest text-or uppercase">
          <Sceau rarity={result.statue.rarity} size={22} />Nouvelle carte {rarityLabel[result.statue.rarity]}
        </span>
        <div className="revele cq my-2 w-[230px] text-encre"><Carte statue={result.statue} photo={photo} /></div>
        <h1 className="titre pop text-[56px]" style={{ animationDelay: '.7s' }}>BWAAAH !</h1>
        <p className="monte text-[15px] text-trait" style={{ animationDelay: '.8s' }}>Synchronisation crétine réussie</p>
        <p className="monte flex items-baseline gap-2.5" style={{ animationDelay: '.9s' }}>
          <span className="titre text-[40px] text-flamme">+{result.statue.points}</span>
          <span className="text-[15px] text-trait">pts · total {result.total}</span>
        </p>
      </div>
      <Link viewTransition to="/galerie" className="btn bg-papier text-encre">Voir ma collection</Link>
    </Ecran>
  )

  return (
    <Ecran>
      <div aria-hidden className="flash pointer-events-none fixed inset-0 z-50 bg-flamme" />
      <div className="my-auto flex flex-col items-center text-center">
        <div className="relative grid size-32 place-items-center">
          <span className="onde absolute inset-0 rounded-full border-2 border-flamme/60" />
          <span className="invoque grid size-20 place-items-center rounded-full bg-flamme"><Icon name="nfc" size={34} /></span>
        </div>
        <p className="mt-6 text-xs font-bold tracking-widest text-flamme">LAPIN DÉTECTÉ · {code}</p>
        <h1 className="titre mt-2 text-4xl">Prends-le<br />en photo</h1>
        <p className="mt-3 max-w-xs text-doux">La photo devient ta carte. Ta position n'est vérifiée qu'une fois, maintenant.</p>
      </div>
      <label className={`btn-encre cursor-pointer ${busy ? 'pointer-events-none opacity-60' : ''}`}>
        <Icon name="photo" size={20} />{busy ? 'Synchronisation…' : 'Ouvrir l\'appareil photo'}
        <input type="file" accept="image/*" capture="environment" className="sr-only" disabled={busy} onChange={(e) => onPhoto(e.target.files?.[0])} />
      </label>
    </Ecran>
  )
}
