import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js'

/**
 * La bougie dans le noir (Three.js) : la flamme est la seule vraie source de lumière, elle vacille,
 * des braises montent, et la caméra voyage d'un point de vue à l'autre au fil du défilement de [data-experience].
 * Au chapitre « défi », la cire fond réellement et la mèche descend. Le compteur [data-cire-g] est mis à jour ici
 * (sans état React : rien ne se redessine pendant le défilement).
 */

// Points de vue (unités de la scène : la bougie fait ~0,93 de haut). cible.x décale la bougie à l'écran.
const VUES: { pos: [number, number, number]; cible: [number, number, number] }[] = [
  { pos: [0, 0.62, 3.3], cible: [0, 0.48, 0] },        // 0 · Fermez les yeux : la flamme dans le noir
  { pos: [1.5, 0.95, 2.2], cible: [-0.55, 0.5, 0] },   // 1 · manifeste (texte à gauche)
  { pos: [-1.3, 0.55, 1.6], cible: [0.5, 0.45, 0] },   // 2 · voir / entendre / sentir (texte à droite)
  { pos: [0.5, 1.6, 1.25], cible: [-0.3, 0.7, 0] },  // 3 · la mèche, vue de dessus
  { pos: [0.05, 0.46, 1.25], cible: [0.38, 0.46, 0] }, // 4 · l'étiquette
  { pos: [1.3, 0.75, 1.75], cible: [-0.5, 0.42, 0] },  // 5 · le défi : la cire fond
  { pos: [0, 0.62, 3.1], cible: [0, 0.45, 0] },        // 6 · règle d'or : on recule
]

/** Texture de flamme (dégradé en goutte) dessinée sur un canvas. */
function textureFlamme(coeur: boolean) {
  const c = document.createElement('canvas'); c.width = 64; c.height = 128
  const g = c.getContext('2d')!
  const grad = g.createRadialGradient(32, 92, 2, 32, 80, 60)
  if (coeur) { grad.addColorStop(0, '#ffffff'); grad.addColorStop(.35, '#fff1b8'); grad.addColorStop(1, 'rgba(255,190,80,0)') }
  else { grad.addColorStop(0, '#ffd27a'); grad.addColorStop(.4, '#ff8a2a'); grad.addColorStop(1, 'rgba(255,90,20,0)') }
  g.fillStyle = grad
  g.beginPath(); g.moveTo(32, 4); g.bezierCurveTo(52, 50, 60, 84, 32, 122); g.bezierCurveTo(4, 84, 12, 50, 32, 4); g.fill()
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace
  return t
}

export default function SceneBougie() {
  const hote = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = hote.current!
    const sombre = () => document.documentElement.dataset.theme === 'sombre'
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' })
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5))
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.outputColorSpace = THREE.SRGBColorSpace
    el.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(32, 1, 0.01, 50)
    camera.position.set(...VUES[0].pos)
    const cible = new THREE.Vector3(...VUES[0].cible)

    const ambiance = new THREE.AmbientLight(0xffffff, 0.08)
    const lune = new THREE.DirectionalLight(0x9fc2ff, 0.25); lune.position.set(-3, 4, -2)
    const flamme = new THREE.PointLight(0xffa860, 3.2, 7, 1.6); flamme.castShadow = false
    scene.add(ambiance, lune, flamme)

    // sol très sombre qui reçoit la lueur
    const sol = new THREE.Mesh(new THREE.CircleGeometry(6, 64), new THREE.MeshStandardMaterial({ color: 0x1a1410, roughness: .95 }))
    sol.rotation.x = -Math.PI / 2; scene.add(sol)

    const appliquerTheme = () => {
      const s = sombre()
      scene.background = new THREE.Color(s ? 0x03121a : 0xe9dfcb)
      scene.fog = new THREE.Fog(s ? 0x03121a : 0xe9dfcb, 3, 8)
      ambiance.intensity = s ? 0.07 : 0.9
      ;(sol.material as THREE.MeshStandardMaterial).color.set(s ? 0x0b1a20 : 0xd9ccb0)
    }
    appliquerTheme()
    const obs = new MutationObserver(appliquerTheme); obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })

    // flamme (2 sprites additifs) + braises
    const spriteFlamme = (coeur: boolean, l: number, h: number) => {
      const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: textureFlamme(coeur), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }))
      s.scale.set(l, h, 1); s.center.set(.5, .05); return s
    }
    const flammeExt = spriteFlamme(false, .085, .2), flammeInt = spriteFlamme(true, .045, .12)
    const groupeFlamme = new THREE.Group(); groupeFlamme.add(flammeExt, flammeInt); scene.add(groupeFlamme)
    const NB = 40
    const braisesGeo = new THREE.BufferGeometry()
    const posB = new Float32Array(NB * 3), vieB = new Float32Array(NB).map(() => Math.random())
    braisesGeo.setAttribute('position', new THREE.BufferAttribute(posB, 3))
    const braises = new THREE.Points(braisesGeo, new THREE.PointsMaterial({ color: 0xffb060, size: .006, transparent: true, opacity: .55, blending: THREE.AdditiveBlending, depthWrite: false }))
    scene.add(braises)

    // la bougie
    let cire: THREE.Object3D | undefined, haut: THREE.Group | undefined, hauteurCire = .56
    const sommetMeche = new THREE.Vector3(0, .82, 0)
    new GLTFLoader().load('/models/bougie-rhum-marin.glb', (g) => {
      const b = g.scene; b.scale.setScalar(10); scene.add(b); b.updateMatrixWorld(true)
      cire = b.getObjectByName('Cire'); const meche = b.getObjectByName('Meche')
      if (cire) {
        const box = new THREE.Box3().setFromObject(cire); hauteurCire = box.max.y - box.min.y
        const pivot = new THREE.Group(); pivot.position.set(0, box.min.y, 0); scene.add(pivot); pivot.attach(cire); cire = pivot
      }
      haut = new THREE.Group(); scene.add(haut)
      if (meche) { haut.attach(meche); const bm = new THREE.Box3().setFromObject(meche); sommetMeche.set(0, bm.max.y, 0) }
      dispatchEvent(new Event('scene-bougie-prete'))
    })

    // bloom
    const composer = new EffectComposer(renderer)
    composer.addPass(new RenderPass(scene, camera))
    const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), .7, .5, .8); composer.addPass(bloom)
    composer.addPass(new OutputPass())

    const taille = () => { const w = innerWidth, h = innerHeight; renderer.setSize(w, h); composer.setSize(w, h); camera.aspect = w / h; camera.updateProjectionMatrix() }
    taille(); addEventListener('resize', taille)
    const souris = { x: 0, y: 0 }
    const bouge = (e: PointerEvent) => { souris.x = e.clientX / innerWidth - .5; souris.y = e.clientY / innerHeight - .5 }
    addEventListener('pointermove', bouge)

    const vPos = new THREE.Vector3(), vCib = new THREE.Vector3(), a = new THREE.Vector3(), bb = new THREE.Vector3()
    const lisse = (x: number) => x * x * (3 - 2 * x)
    const compteur = document.querySelector<HTMLElement>('[data-cire-g]')
    let raf = 0, t = 0, fonte = 0
    const boucle = () => {
      raf = requestAnimationFrame(boucle)
      const exp = document.querySelector<HTMLElement>('[data-experience]')
      const r = exp?.getBoundingClientRect()
      if (r && r.bottom < 0) { el.style.visibility = 'hidden'; return } // scène passée : on arrête de calculer
      el.style.visibility = 'visible'
      t += 1 / 60
      const p = r ? Math.min(1, Math.max(0, -r.top / (r.height - innerHeight))) : 0
      const f = p * (VUES.length - 1), i = Math.min(VUES.length - 2, Math.floor(f)), k = lisse(f - i)
      vPos.copy(a.set(...VUES[i].pos)).lerp(bb.set(...VUES[i + 1].pos), k)
      vCib.copy(a.set(...VUES[i].cible)).lerp(bb.set(...VUES[i + 1].cible), k)
      vPos.x += souris.x * .18; vPos.y -= souris.y * .1
      camera.position.lerp(vPos, .07); cible.lerp(vCib, .07); camera.lookAt(cible)

      // le défi : la cire fond entre le chapitre 4,6 et 5,8 (puis reste basse)
      const viseFonte = Math.min(.85, Math.max(0, (f - 4.6) / 1.2) * .85)
      fonte += (viseFonte - fonte) * .08
      if (cire) cire.scale.y = 1 - fonte
      const baisse = fonte * hauteurCire
      if (haut) haut.position.y = -baisse
      if (compteur) compteur.textContent = String(Math.round(140 * (1 - fonte / .85 * .99)))

      // flamme vivante
      const vac = 1 + Math.sin(t * 13) * .05 + Math.sin(t * 29) * .04 + (Math.random() - .5) * .06
      groupeFlamme.position.set(sommetMeche.x, sommetMeche.y - baisse - .005, sommetMeche.z)
      flammeExt.scale.set(.085 * (2 - vac), .2 * vac, 1); flammeInt.scale.set(.045, .12 * vac, 1)
      flamme.position.set(0, sommetMeche.y - baisse + .06, 0); flamme.intensity = 3.2 * vac
      // braises
      for (let n = 0; n < NB; n++) {
        vieB[n] += .006 + (n % 5) * .001
        if (vieB[n] > 1) vieB[n] = 0
        const v = vieB[n]
        posB[n * 3] = Math.sin(n * 12.9 + t * (1 + n % 3)) * .05 * v
        posB[n * 3 + 1] = sommetMeche.y - baisse + .08 + v * .9
        posB[n * 3 + 2] = Math.cos(n * 7.3 + t) * .05 * v
      }
      braisesGeo.attributes.position.needsUpdate = true
      bloom.strength = sombre() ? .7 : .35
      composer.render()
    }
    boucle()

    return () => { cancelAnimationFrame(raf); obs.disconnect(); removeEventListener('resize', taille); removeEventListener('pointermove', bouge); renderer.dispose(); el.replaceChildren() }
  }, [])

  return <div ref={hote} aria-hidden className="fixed inset-0 z-0" />
}
