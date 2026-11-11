/// <reference types="vite-plugin-pwa/client" />
import { StrictMode } from 'react'
import { registerSW } from 'virtual:pwa-register'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App'

// Type d'animation de page (flip de carte / zoom) choisi par le lien cliqué, lu par le CSS des View Transitions
document.addEventListener('click', (e) => {
  const a = (e.target as Element).closest?.('a')
  if (a) Object.assign(document.documentElement.dataset, { vt: a.dataset.vt ?? 'flip', dir: a.dataset.dir ?? 'avant' })
}, true)

// Mise à jour forcée : à chaque nouvelle version en ligne, l'ancien cache est jeté et la page se recharge.
// On vérifie au lancement, à chaque retour sur l'appli (iPhone : appli rouverte) et toutes les minutes.
registerSW({
  immediate: true,
  onRegisteredSW(_url, r) {
    if (!r) return
    const verifier = () => { if (navigator.onLine) r.update() }
    setInterval(verifier, 60_000)
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') verifier() })
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
