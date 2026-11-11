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
