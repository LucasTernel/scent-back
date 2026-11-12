/** Thème clair / sombre : suit le téléphone (auto) ou le choix fait dans le Profil. */
export type Choix = 'auto' | 'clair' | 'sombre'
const media = matchMedia('(prefers-color-scheme: dark)')

export const lireTheme = (): Choix => { try { return (localStorage.getItem('theme') as Choix) || 'auto' } catch { return 'auto' } }
export const estSombre = () => (lireTheme() === 'auto' ? media.matches : lireTheme() === 'sombre')
export const couleurBarre = () => (estSombre() ? '#023341' : '#FCF5E3')

export function appliquerTheme() {
  document.documentElement.dataset.theme = estSombre() ? 'sombre' : 'clair'
  document.querySelector('meta[name=theme-color]')?.setAttribute('content', couleurBarre())
}
export function choisirTheme(c: Choix) {
  try { localStorage.setItem('theme', c) } catch { /* navigation privée */ }
  appliquerTheme()
}
media.addEventListener('change', appliquerTheme) // le téléphone passe en sombre → l'appli suit

/** Taille du texte (accessibilité) : 0 = normal, 1 = A+, 2 = A++, 3 = A+++ (agrandit tout ce qui est en rem). */
export const TAILLES = ['100%', '112.5%', '125%', '140%']
export const lireTaille = () => { try { return Math.min(3, Math.max(0, Number(localStorage.getItem('taille')) || 0)) } catch { return 0 } }
export function appliquerTaille() { document.documentElement.style.fontSize = TAILLES[lireTaille()] }
export function choisirTaille(n: number) {
  try { localStorage.setItem('taille', String(n)) } catch { /* navigation privée */ }
  appliquerTaille()
}
