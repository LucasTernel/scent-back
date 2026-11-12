/** Image produit sans recadrage : le visuel entier, et le même visuel flouté pour remplir le cadre (photos larges ou carrées). */
export default function ImageProduit({ src, alt, className = '' }: { src: string; alt: string; className?: string }) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <img src={src} alt="" aria-hidden className="absolute inset-0 size-full scale-110 object-cover blur-xl brightness-75" />
      <img src={src} alt={alt} loading="lazy" className="relative size-full object-contain transition duration-700 group-hover:scale-105" />
    </div>
  )
}
