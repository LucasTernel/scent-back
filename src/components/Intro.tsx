import { useEffect, useState } from 'react'
import { Logo } from '../ui'

/**
 * Loader : logo blanc → il se désagrège → l'écran noir se referme en iris
 * sur le rond orange de la zone de scan (#scan-core), comme dans la maquette Figma.
 */
export default function Intro({ ready, onReveal, onDone }: { ready: boolean; onReveal: () => void; onDone: () => void }) {
  const [phase, setPhase] = useState<'logo' | 'fuite' | 'iris' | 'fondu'>('logo')
  const [cible, setCible] = useState({ x: '50%', y: '45%' })

  useEffect(() => {
    if (!ready) return
    const t1 = setTimeout(() => setPhase('fuite'), 1300)
    const t2 = setTimeout(() => {
      onReveal()
      requestAnimationFrame(() => requestAnimationFrame(() => {
        const r = document.getElementById('scan-core')?.getBoundingClientRect()
        if (!r) return setPhase('fondu') // pas de rond cible (ex. écran de connexion) : simple fondu
        setCible({ x: `${r.left + r.width / 2}px`, y: `${r.top + r.height / 2}px` })
        setPhase('iris')
      }))
    }, 1750)
    const t3 = setTimeout(onDone, 2900)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [ready, onReveal, onDone])

  const iris = phase === 'iris'
  return (
    <div role="status" aria-label="Chargement" className="fixed inset-0 z-50 grid place-items-center"
      style={{
        background: iris ? 'var(--color-flamme)' : 'var(--color-encre)',
        clipPath: `circle(${iris ? '32px' : '150vmax'} at ${cible.x} ${cible.y})`,
        opacity: phase === 'fondu' ? 0 : 1, pointerEvents: phase === 'fondu' ? 'none' : undefined,
        transition: 'clip-path 1s cubic-bezier(.75,0,.2,1), background-color .9s ease-in .1s, opacity .6s ease',
      }}>
      <div className="flex flex-col items-center text-center" style={phase !== 'logo' ? { animation: 'desagrege .45s ease-in forwards' } : undefined}>
        <div className="pop grid size-40 place-items-center rounded-full bg-flamme shadow-[0_0_0_14px_#FCF5E314]">
          <Logo className="w-24 text-white" />
        </div>
        <img src="/logo-blanc.png" alt="Scent Back" className="monte -my-6 w-64" style={{ animationDelay: '.25s' }} />
        <p className="monte mt-3 text-[11px] font-medium tracking-[.14em] text-creme/70" style={{ animationDelay: '.4s' }}>UBISOFT × LA BELLE MÈCHE</p>
      </div>
    </div>
  )
}
