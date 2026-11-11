import { useNavigate, useParams } from 'react-router-dom'
import { ecrireConsent, lireConsent } from '../lib/consent'
import { useState } from 'react'
import { Icon } from '../ui'
import { pages } from '../legal'


export default function Legal() {
  const { page = '' } = useParams()
  const navigate = useNavigate()
  const p = pages[page]
  const [choix, setChoix] = useState(lireConsent)
  if (!p) return null
  const changer = (c: 'oui' | 'non') => { ecrireConsent(c); setChoix(c) }
  return (
    <div className="flex flex-col gap-5">
      <header className="monte">
        <button onClick={() => (history.length > 1 ? navigate(-1) : navigate('/'))} className="-ml-1 inline-flex min-h-10 items-center gap-1 text-sm font-bold text-doux"><Icon name="retour" size={18} />Retour</button>
        <h1 className="titre text-[26px] leading-tight">{p.titre}</h1>
      </header>
      {p.sections.map(([h, txt]) => (
        <section key={h} className="monte flex flex-col gap-1.5">
          <h2 className="font-serif text-sm font-bold text-flamme">{h}</h2>
          <p className="text-[15px] leading-relaxed whitespace-pre-line text-doux">{txt}</p>
        </section>
      ))}
      {page === 'cookies' && (
        <div className="flex items-center justify-between gap-3 rounded-[20px] border-[1.5px] border-trait bg-papier p-4">
          <span className="font-bold">Position en temps réel</span>
          <button role="switch" aria-checked={choix === 'oui'} aria-label="Position en temps réel" onClick={() => changer(choix === 'oui' ? 'non' : 'oui')}
            className={`relative h-8 w-14 rounded-full transition-colors ${choix === 'oui' ? 'bg-flamme' : 'bg-trait'}`}>
            <span className={`absolute top-1 left-1 size-6 rounded-full bg-papier transition-transform ${choix === 'oui' ? 'translate-x-6' : ''}`} />
          </button>
        </div>
      )}
    </div>
  )
}
