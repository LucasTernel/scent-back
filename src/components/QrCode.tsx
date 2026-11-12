import { renderSVG } from 'uqr'

/** QR code SVG (le texte encodé est lisible par le scanner de l'admin ou un appareil photo). */
export default function QrCode({ texte, className = '' }: { texte: string; className?: string }) {
  return <div role="img" aria-label={`QR code du bon ${texte}`} className={`[&>svg]:size-full ${className}`} dangerouslySetInnerHTML={{ __html: renderSVG(texte, { border: 1 }) }} />
}
