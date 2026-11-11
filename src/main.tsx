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

// Nouvelle version en ligne → elle remplace l'ancienne et la page se recharge toute seule
registerSW({ immediate: true })

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
