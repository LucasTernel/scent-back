import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ecrireConsent, lireConsent } from '../lib/consent'
import { Icon } from '../ui'

/** Bannière au premier lancement : position en temps réel (radar) + stockage nécessaire. */
export default function Consentement() {
  const [choix, setChoix] = useState(lireConsent)
  useEffect(() => { const f = () => setChoix(lireConsent()); addEventListener('consent', f); return () => removeEventListener('consent', f) }, [])
  if (choix) return null
  return (
    <div role="dialog" aria-modal="true" aria-labelledby="consent-titre" className="fixed inset-0 z-50 flex items-end bg-encre/50 p-3 pb-[max(.75rem,env(safe-area-inset-bottom))]">
      <div className="monte mx-auto flex w-full max-w-md flex-col gap-3 rounded-[26px] bg-papier p-5 shadow-xl">
        <span className="grid size-11 place-items-center rounded-full bg-flamme"><Icon name="lieu" size={20} /></span>
        <h2 id="consent-titre" className="titre text-xl">Ta position, ton choix</h2>
        <p className="text-sm leading-relaxed text-doux">
          Scent Back utilise ta <b className="text-encre">position en temps réel</b> pendant que l'appli est ouverte, pour le radar qui vibre quand tu approches d'une statuette.
          Elle reste sur ton téléphone. Elle n'est envoyée qu'au moment d'une capture, pour vérifier que tu es bien sur place.
        </p>
        <p className="text-xs text-doux">Pas de cookies publicitaires ni de traceurs : seulement le stockage nécessaire à ta connexion. <Link viewTransition to="/legal/cookies" className="font-bold text-encre underline">En savoir plus</Link></p>
        <div className="mt-1 grid grid-cols-2 gap-2">
          <button onClick={() => ecrireConsent('non')} className="btn-ligne">Refuser</button>
          <button onClick={() => ecrireConsent('oui')} className="btn btn-encre">Autoriser</button>
        </div>
      </div>
    </div>
  )
}
