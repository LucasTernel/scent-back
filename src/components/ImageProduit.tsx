/** Image produit : le cadre prend les proportions de l'image (100 % largeur et hauteur, ni recadrage ni bords). */
export default function ImageProduit({ src, alt, className = '' }: { src: string; alt: string; className?: string }) {
  return (
    <div className={`relative overflow-hidden ${className.replace(/(^|\s)aspect-\S+/g, '').replace(/(^|\s)h-full/g, '')}`}>
      <img src={src} alt={alt} loading="lazy" className="block h-auto w-full transition duration-700 group-hover:scale-105" />
    </div>
  )
}
