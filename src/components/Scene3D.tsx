import { useEffect, useState, type ReactNode } from 'react'
import type { Rarity } from '../lib/api'
import { Lapin } from '../ui'

declare module 'react' {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX { interface IntrinsicElements { 'model-viewer': React.HTMLAttributes<HTMLElement> & Record<string, unknown> } }
}

export const HEX: Record<Rarity, string> = { commune: '#8A7660', rare: '#2F7FB5', legendaire: '#B3121B' }

/** Scène sombre (halo + rayons + socle de la couleur de rareté) avec le modèle 3D qui tourne, l'image, ou le lapin.
 *  mini = vignette de grille (pas de contrôle à la souris/au doigt). debloque = false → silhouette noire. */
export default function Scene3D({ rarity, nom, model, image, debloque = true, mini = false, className = '', vt, children }: {
  rarity: Rarity; nom: string; model?: string | null; image?: string | null; debloque?: boolean; mini?: boolean; className?: string; vt?: string; children?: ReactNode
}) {
  const hex = HEX[rarity]
  const [pret, setPret] = useState(false)
  useEffect(() => { if (model) import('@google/model-viewer').then(() => setPret(true)) }, [model])

  return (
    <div className={`relative overflow-hidden bg-[#011A22] ${className}`} style={vt ? { viewTransitionName: vt } : undefined}>
      <div aria-hidden className="absolute inset-0" style={{ background: `radial-gradient(60% 55% at 50% 42%, ${hex}cc 0%, ${hex}33 45%, transparent 75%)` }} />
      {!mini && <div aria-hidden className="rayons absolute top-[38%] left-1/2 size-[140%] -translate-x-1/2 -translate-y-1/2" style={{ ['--c' as string]: hex }} />}
      <div aria-hidden className="absolute bottom-[13%] left-1/2 h-[7%] w-[62%] -translate-x-1/2 rounded-[50%] border-2" style={{ borderColor: hex, boxShadow: `0 0 40px 8px ${hex}88, inset 0 0 24px ${hex}aa` }} />

      {model ? (
        pret && (
          <model-viewer src={model} alt={debloque ? `Modèle 3D de ${nom}` : 'Silhouette d\'une statuette mystère'}
            {...(mini ? {} : { 'camera-controls': true, 'touch-action': 'none', 'min-camera-orbit': 'auto 45deg auto', 'max-camera-orbit': 'auto 100deg auto' })}
            auto-rotate auto-rotate-delay="0" rotation-per-second={mini ? '18deg' : '24deg'} interaction-prompt="none"
            disable-zoom disable-pan shadow-intensity="1.2" shadow-softness=".8" exposure="1.15"
            camera-orbit="0deg 80deg 145%" camera-target="0m auto 0m" field-of-view="30deg" loading={mini ? 'lazy' : 'eager'}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: mini ? 'none' : undefined, cursor: mini ? undefined : 'grab', zIndex: 1, ['--poster-color' as string]: 'transparent',
              filter: debloque ? `drop-shadow(0 18px 30px ${hex}66)` : 'brightness(0) drop-shadow(0 0 18px #ffffff40)' }} />
        )
      ) : image ? (
        <img src={image} alt={nom} className="absolute inset-0 size-full object-cover" />
      ) : (
        <div className="absolute inset-0 grid place-items-center">{debloque ? <Lapin className="w-1/2" /> : <span className="titre text-7xl text-white/15">?</span>}</div>
      )}
      {children}
    </div>
  )
}
