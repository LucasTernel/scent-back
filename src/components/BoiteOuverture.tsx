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
    scene.environmentIntensity = .9
    const lum = new THREE.DirectionalLight(0xfff1dc, 1.6); lum.position.set(1, 3, 2); scene.add(lum)
    const cam = new THREE.PerspectiveCamera(30, 1, .01, 20)
    let couvercle: THREE.Object3D | undefined, boite: THREE.Object3D | undefined, pos0 = new THREE.Vector3()
    new GLTFLoader().load('/models/boite.glb', (g) => {
      boite = g.scene; scene.add(boite)
      const b = new THREE.Box3().setFromObject(boite), c = b.getCenter(new THREE.Vector3())
      boite.position.sub(c)
      couvercle = boite.getObjectByName('Couvercle'); if (couvercle) pos0 = couvercle.position.clone()
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
      if (couvercle) { couvercle.position.set(pos0.x, pos0.y + k * .3, pos0.z - k * .32); couvercle.rotation.x = k * 1.1 }
      if (boite) boite.rotation.y = -.45 + p * .55 + Math.sin(t * .6) * .03
      const d = 1.25 - k * .1
      cam.position.set(0, .45 + k * .35, d); cam.lookAt(0, k * .06, -k * .08)
      renderer.render(scene, cam)
    }
    boucle()
    return () => { cancelAnimationFrame(raf); removeEventListener('resize', taille); renderer.dispose(); el.replaceChildren() }
  }, [])
  return <div ref={hote} aria-hidden className="size-full" />
}
