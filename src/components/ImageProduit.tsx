/** Image produit : cadre 16:10 identique partout ; les visuels sont préparés à ce format (fond prolongé, pas de bandes). */
export default function ImageProduit({ src, alt, className = '' }: { src: string; alt: string; className?: string }) {
  return (
    <div className={`relative aspect-[16/10] overflow-hidden ${className.replace(/(^|\s)aspect-\S+/g, '')}`}>
      <img src={src} alt={alt} loading="lazy" className="size-full object-cover transition duration-700 group-hover:scale-105" />
    </div>
  )
}
