// Génère dist/legal/<page>/index.html : pages légales lisibles SANS JavaScript (robots Google, vérification OAuth).
import { mkdirSync, writeFileSync } from 'node:fs'
import { pages } from '../src/legal.ts'

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const liens = Object.entries(pages).map(([k, p]) => `<a href="/legal/${k}">${esc(p.titre)}</a>`).join(' · ')

for (const [k, p] of Object.entries(pages)) {
  const corps = p.sections.map(([h, t], i) => `<section id="s${i}"><span class="n">${String(i + 1).padStart(2, '0')}</span><div><h2>${esc(h)}</h2><p>${esc(t).replace(/\n/g, '<br>')}</p></div></section>`).join('\n')
  const html = `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(p.titre)} — Scent Back</title><meta name="description" content="${esc(p.titre)} de Scent Back, jeu de chasse urbaine (projet étudiant BUT MMI).">
<link rel="icon" href="/favicon.ico"><link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=Outfit:wght@400;600&display=swap" rel="stylesheet">
<style>body{margin:0;background:#FCF5E3;color:#023341;font:16px/1.65 Outfit,system-ui,sans-serif}main{max-width:720px;margin:0 auto;padding:32px 20px 60px}
header{display:flex;align-items:center;gap:12px}header img{width:120px}h1{font:900 clamp(28px,5vw,52px)/1 Orbitron,sans-serif;margin:12px 0 14px}h2{font:700 19px Orbitron,sans-serif;margin:0 0 8px}section{display:grid;grid-template-columns:3rem 1fr;gap:12px;padding:26px 0;border-top:1px solid #DCD2BA}.n{font:700 13px Orbitron,sans-serif;color:#B8470D}.k{font-weight:700;font-size:12px;letter-spacing:.25em;text-transform:uppercase;color:#B8470D;margin:32px 0 0}.i{font-size:18px}.d{font-size:12px}hr{border:0;border-top:2px solid #023341;margin:28px 0}
p{margin:0;color:#3d5560}a{color:#023341}nav{margin-top:40px;font-size:14px}@media (prefers-color-scheme:dark){body{background:#023341;color:#FCF5E3}p{color:#c9d6db}a{color:#FCF5E3}}</style></head>
<body><main><header><a href="/"><img src="/logo-bleu.png" alt="Scent Back"></a></header><p class="k">Scent Back · ${esc(p.court)}</p><h1>${esc(p.titre)}</h1><p class="i">${esc(p.intro)}</p><p class="d">Dernière mise à jour : novembre 2026</p><hr>
${corps}
<nav><a href="/">← Retour à Scent Back</a><br><br>${liens}</nav></main></body></html>`
  mkdirSync(`dist/legal/${k}`, { recursive: true })
  writeFileSync(`dist/legal/${k}/index.html`, html)
}
console.log('pages légales statiques :', Object.keys(pages).join(', '))
