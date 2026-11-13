/**
 * Animations du site vitrine (ordinateur uniquement, chargé à la demande) :
 * défilement fluide (Lenis) + GSAP ScrollTrigger. Rien ne se lance si l'utilisateur réduit les animations.
 *
 * Attributs reconnus dans le HTML :
 *  data-split            titre découpé en lettres, qui montent une à une
 *  data-parallax="0.2"   l'élément glisse plus lentement que la page
 *  data-volet            image dévoilée par un volet (clip-path) au défilement
 *  data-horizontal       section épinglée dont la piste [data-piste] défile à l'horizontale
 *  data-lapin            section épinglée : le <model-viewer> qu'elle contient tourne avec le défilement
 *  data-curseur          active le curseur personnalisé (sur la racine du site)
 */
export async function lancerAnimations(racine: HTMLElement) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return () => {}
  const [{ gsap }, { ScrollTrigger }, { default: Lenis }] = await Promise.all([import('gsap'), import('gsap/ScrollTrigger'), import('lenis')])
  gsap.registerPlugin(ScrollTrigger)

  // Défilement fluide, synchronisé avec ScrollTrigger
  const lenis = new Lenis({ duration: 1.15, smoothWheel: true })
  lenis.on('scroll', ScrollTrigger.update)
  const tic = (t: number) => lenis.raf(t * 1000)
  gsap.ticker.add(tic); gsap.ticker.lagSmoothing(0)
  // les liens #ancre passent par Lenis
  const ancres = (e: MouseEvent) => {
    const a = (e.target as Element).closest?.('a[href^="#"]') as HTMLAnchorElement | null
    if (!a) return
    const cible = document.querySelector(a.getAttribute('href')!)
    if (cible) { e.preventDefault(); lenis.scrollTo(cible as HTMLElement, { offset: -20 }) }
  }
  racine.addEventListener('click', ancres)
  // Visite automatique : démarre au premier défilement en haut de page ; molette/touche = arrêt pour toute la session
  const stoppee = () => { try { return sessionStorage.getItem('visite-stop') === '1' } catch { return false } }
  let enCours = false
  const visite = () => {
    const exp = document.querySelector<HTMLElement>('[data-experience]')
    if (!exp || enCours || stoppee()) return
    enCours = true
    const fin = exp.offsetTop + exp.offsetHeight - innerHeight
    lenis.scrollTo(fin, { duration: Math.max(10, (fin - scrollY) / 260), easing: (t: number) => t, onComplete: () => { enCours = false } })
    const stop = () => { if (!enCours) return; enCours = false; lenis.scrollTo(scrollY, { immediate: true }); try { sessionStorage.setItem('visite-stop', '1') } catch { /* rien */ } }
    setTimeout(() => { addEventListener('wheel', stop, { once: true }); addEventListener('keydown', stop, { once: true }); addEventListener('touchstart', stop, { once: true }) }, 900)
  }
  const premier = () => { if (scrollY < innerHeight * .5) visite() }
  addEventListener('wheel', premier, { once: true })
  addEventListener('visite-auto', () => { try { sessionStorage.removeItem('visite-stop') } catch { /* rien */ } visite() })

  const ctx = gsap.context(() => {
    // Titres lettre par lettre (découpe toujours depuis le HTML d'origine : sûr même si l'effet est relancé)
    racine.querySelectorAll<HTMLElement>('[data-split]').forEach((el) => {
      el.dataset.origine ??= el.innerHTML
      const lettres = (n: Node): Node[] => {
        if (n.nodeType === 3) return [...(n.textContent ?? '')].map((c) => { const s = document.createElement('span'); s.className = 'lettre inline-block'; s.textContent = c === ' ' ? '\u00a0' : c; return s })
        const copie = n.cloneNode(false) as Element; n.childNodes.forEach((e) => lettres(e).forEach((x) => copie.appendChild(x))); return [copie]
      }
      el.replaceChildren(...el.dataset.origine.split(/<br\s*\/?>/i).map((ligne) => {
        const tmp = document.createElement('div'); tmp.innerHTML = ligne
        const bloc = document.createElement('span'); bloc.className = 'block overflow-hidden pb-[.08em] whitespace-nowrap'
        tmp.childNodes.forEach((n) => lettres(n).forEach((x) => bloc.appendChild(x)))
        return bloc
      }))
      gsap.from(el.querySelectorAll('.lettre'), {
        yPercent: 115, rotate: 6, duration: 1.1, ease: 'power4.out', stagger: .035,
        delay: el.dataset.split === 'loader' ? 2.4 : 0.1,
        scrollTrigger: el.dataset.split === 'loader' ? undefined : { trigger: el, start: 'top 85%' },
      })
    })
    // Parallaxe
    racine.querySelectorAll<HTMLElement>('[data-parallax]').forEach((el) => {
      gsap.to(el, { yPercent: -100 * Number(el.dataset.parallax || .15), ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } })
    })
    // Volets d'images
    racine.querySelectorAll<HTMLElement>('[data-volet]').forEach((el) => {
      gsap.fromTo(el, { clipPath: 'inset(18% 12% 18% 12% round 24px)', scale: 1.08 }, {
        clipPath: 'inset(0% 0% 0% 0% round 18px)', scale: 1, ease: 'none',
        scrollTrigger: { trigger: el, start: 'top 90%', end: 'top 25%', scrub: .6 },
      })
    })
    // Galerie horizontale : la section a une hauteur = largeur à parcourir, son contenu reste collé (CSS sticky).
    // Pas de « pin » GSAP : il déplacerait les nœuds DOM gérés par React.
    racine.querySelectorAll<HTMLElement>('[data-horizontal]').forEach((sec) => {
      const piste = sec.querySelector<HTMLElement>('[data-piste]')
      if (!piste) return
      const distance = () => Math.max(0, piste.scrollWidth - innerWidth + 64)
      const hauteur = () => { sec.style.height = `${innerHeight + distance()}px` }
      hauteur(); ScrollTrigger.addEventListener('refreshInit', hauteur)
      gsap.to(piste, { x: () => -distance(), ease: 'none', scrollTrigger: { trigger: sec, start: 'top top', end: 'bottom bottom', scrub: .8, invalidateOnRefresh: true } })
    })
    // Lapin 3D qui tourne avec le défilement (contenu sticky en CSS)
    racine.querySelectorAll<HTMLElement>('[data-lapin]').forEach((sec) => {
      const mv = sec.querySelector('model-viewer')
      const st = { trigger: sec, start: 'top top', end: 'bottom bottom', scrub: true }
      ScrollTrigger.create({ ...st, onUpdate: (s) => mv?.setAttribute('camera-orbit', `${-30 + s.progress * 390}deg ${80 - s.progress * 12}deg 150%`) })
      sec.querySelectorAll('[data-glisse]').forEach((el, i) => gsap.fromTo(el, { xPercent: i % 2 ? 25 : -25 }, { xPercent: i % 2 ? -25 : 25, ease: 'none', scrollTrigger: st }))
    })
    // Texte qui s'allume mot par mot au défilement (réf. Lando Norris)
    racine.querySelectorAll<HTMLElement>('[data-mots]').forEach((el) => {
      el.dataset.origine ??= el.textContent ?? ''
      el.replaceChildren(...el.dataset.origine.split(/(\s+)/).map((m) => { const s = document.createElement('span'); s.textContent = m; if (m.trim()) s.className = 'mot'; return s }))
      gsap.fromTo(el.querySelectorAll('.mot'), { opacity: .14 }, { opacity: 1, stagger: .08, ease: 'none', scrollTrigger: { trigger: el, start: 'top 80%', end: 'bottom 45%', scrub: true } })
    })
    // Expérience bougie : chaque texte apparaît comme une flamme qui s'allume, puis FOND comme de la cire en partant
    const fondre = (el: HTMLElement) => {
      if (el.dataset.fondu) return
      el.dataset.fondu = '1'
      const lettres: HTMLElement[] = []
      const couper = (n: Node) => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment()
          for (const mot of (n.textContent ?? '').split(/(\s+)/)) {
            if (!mot) continue
            if (/^\s+$/.test(mot)) { frag.append(mot); continue }
            const m = document.createElement('span'); m.className = 'inline-block whitespace-nowrap'
            for (const c of mot) { const s = document.createElement('span'); s.className = 'inline-block'; s.textContent = c; m.append(s); lettres.push(s) }
            frag.append(m)
          }
          n.parentNode!.replaceChild(frag, n)
        } else [...n.childNodes].forEach(couper)
      }
      couper(el)
      return lettres
    }
    racine.querySelectorAll<HTMLElement>('[data-experience] > section').forEach((sec, i) => {
      const lettres = [...sec.querySelectorAll<HTMLElement>('h1, h2, p:not([data-mots])')].flatMap((el) => fondre(el) ?? [])
      if (!lettres.length) return
      const coulure = lettres.map(() => 40 + Math.random() * 140)
      // 1er écran : visible d'office, ne fond que quand on a vraiment commencé à descendre
      const tl = gsap.timeline({ scrollTrigger: i === 0 ? { trigger: sec, start: 'top+=15% top', end: 'bottom top', scrub: .5, onLeaveBack: () => gsap.to([...lettres, ...sec.querySelectorAll('a, button, img')], { y: 0, scaleY: 1, opacity: 1, filter: 'blur(0px)', color: '', duration: .4 }) } : { trigger: sec, start: 'top bottom', end: 'bottom top', scrub: .5 } })
      if (i > 0) tl.fromTo(lettres, { opacity: 0, y: -24, filter: 'blur(10px)', color: '#FF7722' }, { opacity: 1, y: 0, filter: 'blur(0px)', color: '', stagger: { amount: .15, from: 'random' }, duration: .15, ease: 'power2.out' }, 0)
      // départ explicite (lettres entières) : en remontant, le texte se reforme toujours en entier,
      // même si l'allumage du 1er écran n'était pas fini quand on a commencé à défiler
      tl.fromTo(lettres, { y: 0, scaleY: 1, opacity: 1, filter: 'blur(0px)' }, { y: (k) => coulure[k], scaleY: (k) => 1.4 + coulure[k] / 120, transformOrigin: '50% 0%', opacity: 0, filter: 'blur(3px)', stagger: { amount: .15, from: 'random' }, duration: .15, ease: 'power2.in', immediateRender: false }, i === 0 ? .1 : .7)
      tl.fromTo(sec.querySelectorAll('a, button, img'), { opacity: 1, y: 0, filter: 'blur(0px)' }, { opacity: 0, y: 30, filter: 'blur(4px)', duration: .2, immediateRender: false }, i === 0 ? .1 : .7)
      tl.set({}, {}, 1) // durée totale fixe = 1 → apparition 0–0,3, lecture 0,3–0,7, fonte 0,7–1
    })
    // 1er écran : allumage au chargement (après le loader)
    const premiers = document.querySelectorAll<HTMLElement>('[data-experience] > section:first-child .inline-block .inline-block')
    gsap.fromTo(premiers, { opacity: 0, y: -30, filter: 'blur(12px)', color: '#FF7722' }, { opacity: 1, y: 0, filter: 'blur(0px)', color: '', duration: 1.2, ease: 'power3.out', stagger: { each: .025, from: 'center' }, delay: .4 })
    // La box : la photo s'ouvre en plein écran, le titre géant s'efface, puis les 3 éléments arrivent
    racine.querySelectorAll<HTMLElement>('[data-box]').forEach((sec) => {
      const tl = gsap.timeline({ scrollTrigger: { trigger: sec, start: 'top top', end: 'bottom bottom', scrub: .6 } })
      tl.to(sec.querySelector('[data-box-img]'), { clipPath: 'inset(0% 0% 0% 0% round 0px)', ease: 'power2.inOut', duration: 1 })
        .to(sec.querySelector('[data-box-titre]'), { scale: 1.6, opacity: 0, ease: 'power2.in', duration: .7 }, 0)
        .to(sec.querySelector('[data-box-voile]'), { opacity: 1, duration: .4 }, .7)
        .to(sec.querySelectorAll('[data-box-item]'), { opacity: 1, y: 0, stagger: .15, duration: .4 }, .9)
        .from(sec.querySelectorAll('[data-box-item]'), { y: 40, stagger: .15, duration: .4 }, .9)
    })
    // Fin de page : une animation différente par chapitre
    const st = (el: Element, s = 'top 85%', e = 'top 25%') => ({ trigger: el, start: s, end: e, scrub: .6 })
    racine.querySelectorAll('[data-pont]').forEach((el) => gsap.fromTo(el, { opacity: 0, y: 60, letterSpacing: '.08em' }, { opacity: 1, y: 0, letterSpacing: '0em', ease: 'power2.out', scrollTrigger: st(el, 'top 90%', 'top 55%') }))
    racine.querySelectorAll('[data-cercle]').forEach((el) => gsap.fromTo(el, { clipPath: 'circle(8% at 50% 50%)' }, { clipPath: 'circle(75% at 50% 50%)', ease: 'none', scrollTrigger: st(el, 'top bottom', 'top top') }))
    racine.querySelectorAll('[data-croise]').forEach((el) => {
      const [g, d] = [...el.children]
      gsap.fromTo(g, { xPercent: -30, opacity: 0 }, { xPercent: 0, opacity: 1, ease: 'power2.out', scrollTrigger: st(el) })
      if (d) gsap.fromTo(d, { xPercent: 40, rotate: 8, opacity: 0 }, { xPercent: 0, rotate: 0, opacity: 1, ease: 'power2.out', scrollTrigger: st(el) })
    })
    racine.querySelectorAll('[data-cascade]').forEach((el) => gsap.fromTo(el.querySelectorAll('a.group'), { y: 160, opacity: 0, rotate: (i: number) => (i - 1) * 4 }, { y: 0, opacity: 1, rotate: 0, stagger: .12, ease: 'power3.out', scrollTrigger: st(el, 'top 80%', 'top 20%') }))
    racine.querySelectorAll('[data-zoom]').forEach((el) => gsap.fromTo(el.firstElementChild, { scale: .7, opacity: 0, filter: 'blur(12px)' }, { scale: 1, opacity: 1, filter: 'blur(0px)', ease: 'power2.out', scrollTrigger: st(el, 'top 90%', 'top 30%') }))
    // Mots géants qui glissent en sens opposés au défilement (hors section lapin)
    racine.querySelectorAll<HTMLElement>('[data-glisse]').forEach((el, i) => {
      if (el.closest('[data-lapin]')) return
      gsap.fromTo(el, { xPercent: i % 2 ? 8 : -8 }, { xPercent: i % 2 ? -8 : 8, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } })
    })
    // Bougie de l'ouverture : suit doucement la souris (en plus de sa rotation lente)
    const bougie = racine.querySelector<HTMLElement>('[data-bougie-hero]')
    const ouverture = racine.querySelector<HTMLElement>('[data-ouverture]')
    if (bougie && ouverture) {
      const etat = { x: 0, y: 0 }
      const vers = gsap.quickTo(etat, 'x', { duration: 1.2, ease: 'power3', onUpdate: () => bougie.setAttribute('camera-orbit', `${20 + etat.x * 40}deg ${72 - etat.y * 10}deg 210%`) })
      const versY = gsap.quickTo(etat, 'y', { duration: 1.2, ease: 'power3' })
      ouverture.addEventListener('pointermove', (e) => { const r = ouverture.getBoundingClientRect(); vers((e.clientX - r.left) / r.width - .5); versY((e.clientY - r.top) / r.height - .5) })
      bougie.removeAttribute('auto-rotate')
      gsap.to(bougie, { yPercent: 18, ease: 'none', scrollTrigger: { trigger: ouverture, start: 'top top', end: 'bottom top', scrub: true } })
    }
  }, racine)

  // Curseur personnalisé : un point qui suit la souris et grossit sur les éléments cliquables
  let nettoyerCurseur = () => {}
  if (racine.hasAttribute('data-curseur') && matchMedia('(pointer: fine)').matches) {
    const point = document.createElement('div')
    point.className = 'curseur'
    document.body.appendChild(point)
    const x = gsap.quickTo(point, 'x', { duration: .35, ease: 'power3' }), y = gsap.quickTo(point, 'y', { duration: .35, ease: 'power3' })
    const bouge = (e: PointerEvent) => { x(e.clientX); y(e.clientY); point.classList.add('curseur-vu'); point.classList.toggle('curseur-actif', !!(e.target as Element).closest?.('a, button')) }
    addEventListener('pointermove', bouge)
    nettoyerCurseur = () => { removeEventListener('pointermove', bouge); point.remove() }
  }

  requestAnimationFrame(() => ScrollTrigger.refresh())
  return () => { ctx.revert(); gsap.ticker.remove(tic); lenis.destroy(); racine.removeEventListener('click', ancres); removeEventListener('visite-auto', visite); nettoyerCurseur() }
}
