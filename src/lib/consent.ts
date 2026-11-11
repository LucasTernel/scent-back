/** Choix de l'utilisateur sur la position en temps réel (stocké sur le téléphone). */
export type Choix = 'oui' | 'non' | null
export const lireConsent = (): Choix => { try { return localStorage.getItem('consent-position') as Choix } catch { return null } }
export function ecrireConsent(c: 'oui' | 'non') {
  try { localStorage.setItem('consent-position', c) } catch { /* navigation privée */ }
  window.dispatchEvent(new Event('consent'))
  if (c === 'oui') navigator.geolocation.getCurrentPosition(() => {}, () => {}) // déclenche la demande d'autorisation
}
