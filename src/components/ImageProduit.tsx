/** Image produit : remplit toute la case (recadrée au centre), sans bords. */
export default function ImageProduit({ src, alt, className = '' }: { src: string; alt: string; className?: string }) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <img src={src} alt={alt} loading="lazy" className="size-full object-cover transition duration-700 group-hover:scale-105" />
    </div>
  )
}
