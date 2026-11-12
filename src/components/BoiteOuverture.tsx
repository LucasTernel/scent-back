import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'

/** La box (export du .blend) : le couvercle se soulève et pivote au fil du défilement de la section parente [data-boite]. */
export default function BoiteOuverture() {
  const hote = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = hote.current!, sec = el.closest('[data-boite]') as HTMLElement
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5)); renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.outputColorSpace = THREE.SRGBColorSpace
    el.appendChild(renderer.domElement)
    const scene = new THREE.Scene()
    scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), .04).texture
    scene.environmentIntensity = .35
    const lum = new THREE.DirectionalLight(0xfff1dc, 3.2); lum.position.set(1.5, 3, 1.5); scene.add(lum)
    const contre = new THREE.DirectionalLight(0xff9a50, 1.4); contre.position.set(-2, 1.2, -2); scene.add(contre)
    renderer.toneMappingExposure = .85
    const cam = new THREE.PerspectiveCamera(30, 1, .01, 20)
    let couvercle: THREE.Object3D | undefined, boite: THREE.Object3D | undefined, pos0 = new THREE.Vector3()
    new GLTFLoader().load('/models/boite.glb', (g) => {
      boite = g.scene; scene.add(boite)
      const b = new THREE.Box3().setFromObject(boite), c = b.getCenter(new THREE.Vector3())
      boite.position.sub(c)
      const brut = boite.getObjectByName('Couvercle')
      if (brut) { // pivot placé sur le bord arrière du couvercle : il bascule comme un vrai couvercle à charnière
        const bb = new THREE.Box3().setFromObject(brut), pivot = new THREE.Group()
        pivot.position.set(0, bb.max.y, bb.min.z); brut.parent!.add(pivot); pivot.attach(brut)
        couvercle = pivot; pos0 = pivot.position.clone()
      }
    })
    const taille = () => { const r = el.getBoundingClientRect(); renderer.setSize(r.width, r.height); cam.aspect = r.width / r.height; cam.updateProjectionMatrix() }
    taille(); addEventListener('resize', taille)
    let raf = 0, t = 0
    const boucle = () => {
      raf = requestAnimationFrame(boucle)
      const r = sec.getBoundingClientRect()
      if (r.bottom < 0 || r.top > innerHeight) return
      t += 1 / 60
      const p = Math.min(1, Math.max(0, -r.top / (r.height - innerHeight)))
      const o = Math.min(1, p / .7), k = o * o * (3 - 2 * o)
      if (couvercle) { couvercle.position.copy(pos0)
        couvercle.rotation.x = -k * 1.75 } // charnière arrière : il bascule vers l’arrière
      if (boite) boite.rotation.y = -.35 + p * .35 + Math.sin(t * .6) * .03
      const d = 1.25 - k * .5
      cam.position.set(0, .5 + k * .45, d); cam.lookAt(0, .02, -k * .04)
      renderer.render(scene, cam)
    }
    boucle()
    return () => { cancelAnimationFrame(raf); removeEventListener('resize', taille); renderer.dispose(); el.replaceChildren() }
  }, [])
  return <div ref={hote} aria-hidden className="size-full" />
}
