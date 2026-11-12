import { useEffect, useState } from 'react'
import { Logo } from '../ui'
import { couleurBarre } from '../lib/theme'

/**
 * Loader : logo blanc → il se désagrège → l'écran noir se referme en iris
 * sur le rond orange de la zone de scan (#scan-core), comme dans la maquette Figma.
 */
export default function Intro({ ready, onReveal, onDone }: { ready: boolean; onReveal: () => void; onDone: () => void }) {
  const [phase, setPhase] = useState<'logo' | 'fuite' | 'iris' | 'fondu'>('logo')
  const [cible, setCible] = useState({ x: '50%', y: '45%' })

  // iPhone (Safari) : les bandeaux sous l'heure et sous la barre d'outils affichent le fond de la PAGE,
  // pas le loader → on met la page au même bleu le temps du loader (fini le flou crème et la marge)

  useEffect(() => {
    if (!ready) return
    const t1 = setTimeout(() => setPhase('fuite'), 1300)
    const t2 = setTimeout(() => {
      onReveal()
      requestAnimationFrame(() => requestAnimationFrame(() => {
        const r = document.getElementById('scan-core')?.getBoundingClientRect()
        if (!r) return setPhase('fondu') // pas de rond cible (ex. écran de connexion) : simple fondu
        setCible({ x: `${r.left + r.width / 2}px`, y: `${r.top + r.height / 2 + 48}px` })
        setPhase('iris')
      }))
    }, 1750)
    const t3 = setTimeout(onDone, 2900)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [ready, onReveal, onDone])

  const iris = phase === 'iris'
  // fond bleu seulement tant que le logo est affiché ; dès que la page se dévoile, on rend le fond normal
  const bleu = phase === 'logo' || phase === 'fuite'
  useEffect(() => {
    const h = document.documentElement.style, b = document.body.style
    const meta = document.querySelector('meta[name=theme-color]')
    h.backgroundColor = b.backgroundColor = bleu ? '#023341' : ''
    meta?.setAttribute('content', bleu ? '#023341' : couleurBarre()) // barre d'état bleue pendant le logo
    return () => { h.backgroundColor = b.backgroundColor = ''; meta?.setAttribute('content', couleurBarre()) }
  }, [bleu])
  return (
    <div role="status" aria-label="Chargement" className="fixed inset-x-0 -top-12 -bottom-12 z-50 grid place-items-center"
      style={{
        background: iris ? 'var(--color-flamme)' : '#023341',
        clipPath: `circle(${iris ? '32px' : '150vmax'} at ${cible.x} ${cible.y})`,
        opacity: phase === 'fondu' ? 0 : 1, pointerEvents: phase === 'fondu' ? 'none' : undefined,
        transition: 'clip-path 1s cubic-bezier(.75,0,.2,1), background-color .9s ease-in .1s, opacity .6s ease',
      }}>
      <div className="flex flex-col items-center text-center" style={phase !== 'logo' ? { animation: 'desagrege .45s ease-in forwards' } : undefined}>
        <div className="pop grid size-40 place-items-center rounded-full bg-flamme shadow-[0_0_0_14px_#FCF5E314]">
          <Logo className="w-24 text-white" />
        </div>
        <img src="/logo-orange.png" alt="Scent Back" className="monte -my-6 w-64" style={{ animationDelay: '.25s' }} />
        <p className="monte mt-3 text-[11px] font-medium tracking-[.14em] text-creme/70" style={{ animationDelay: '.4s' }}>UBISOFT × LA BELLE MÈCHE</p>
      </div>
    </div>
  )
}
