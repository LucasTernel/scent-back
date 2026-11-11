import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App'

// Type d'animation de page (flip de carte / zoom) choisi par le lien cliqué, lu par le CSS des View Transitions
document.addEventListener('click', (e) => {
  const a = (e.target as Element).closest?.('a')
  if (a) Object.assign(document.documentElement.dataset, { vt: a.dataset.vt ?? 'flip', dir: a.dataset.dir ?? 'avant' })
}, true)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
