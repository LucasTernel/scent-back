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
  const autres = Object.entries(pages).filter(([k]) => k !== page)
  return (
    <div className="flex flex-col gap-10">
      <header className="monte border-b-2 border-encre pb-8">
        <button onClick={() => (history.length > 1 ? navigate(-1) : navigate('/'))} className="-ml-1 inline-flex min-h-10 items-center gap-1 text-sm font-bold text-doux"><Icon name="retour" size={18} />Retour</button>
        <p className="mt-6 text-xs font-bold tracking-[.25em] text-flamme uppercase">Scent Back · {p.court}</p>
        <h1 className="titre mt-3 text-[clamp(2rem,5vw,4rem)] leading-[1]">{p.titre}</h1>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-doux">{p.intro}</p>
        <p className="mt-3 text-xs text-doux">Dernière mise à jour : novembre 2026</p>
      </header>
      <div className="grid gap-10 lg:grid-cols-[14rem_1fr]">
        <nav aria-label="Sommaire" className="hidden lg:block">
          <ol className="sticky top-6 flex flex-col gap-2 border-l-2 border-trait pl-4 text-sm">
            {p.sections.map(([h], i) => <li key={h}><a href={`#s${i}`} className="text-doux hover:text-encre"><span className="font-serif text-flamme">{String(i + 1).padStart(2, '0')}</span> {h}</a></li>)}
          </ol>
        </nav>
        <div className="flex flex-col">
          {p.sections.map(([h, txt], i) => (
            <section key={h} id={`s${i}`} className="monte grid scroll-mt-6 gap-3 border-t border-trait py-7 first:border-0 first:pt-0 md:grid-cols-[3rem_1fr]">
              <p className="font-serif text-sm font-bold text-flamme">{String(i + 1).padStart(2, '0')}</p>
              <div>
                <h2 className="titre text-xl leading-tight">{h}</h2>
                <p className="mt-3 text-[16px] leading-relaxed whitespace-pre-line text-doux">{txt}</p>
              </div>
            </section>
          ))}
          {page === 'cookies' && (
            <div className="mt-4 flex items-center justify-between gap-3 rounded-[20px] border-[1.5px] border-trait bg-papier p-5">
              <span className="font-bold">Position en temps réel</span>
              <button role="switch" aria-checked={choix === 'oui'} aria-label="Position en temps réel" onClick={() => changer(choix === 'oui' ? 'non' : 'oui')}
                className={`relative h-8 w-14 rounded-full transition-colors ${choix === 'oui' ? 'bg-flamme' : 'bg-trait'}`}>
                <span className={`absolute top-1 left-1 size-6 rounded-full bg-papier transition-transform ${choix === 'oui' ? 'translate-x-6' : ''}`} />
              </button>
            </div>
          )}
        </div>
      </div>
      <nav aria-label="Autres documents" className="grid gap-3 border-t-2 border-encre pt-8 sm:grid-cols-2 lg:grid-cols-4">
        {autres.map(([k, x]) => (
          <a key={k} href={`/legal/${k}`} className="group rounded-[16px] border-[1.5px] border-trait p-4 transition hover:border-encre">
            <p className="text-xs font-bold tracking-[.2em] text-flamme uppercase">{x.court}</p>
            <p className="mt-1 font-bold leading-snug">{x.titre} <span className="inline-block transition group-hover:translate-x-1">→</span></p>
          </a>
        ))}
      </nav>
    </div>
  )
}
