import { useState } from 'react'
import { adminAmis } from '../lib/api'
import { useData } from '../lib/useData'
import { Avatar, avatarParDefaut } from '../components/Avatar'
import Classement from './Classement'

/** Admin : classement général + réseau d'amis et parrainages. */
export default function AdminJoueurs() {
  const [onglet, setOnglet] = useState<'classement' | 'amis'>('classement')
  const liens = useData(adminAmis) ?? []
  const nbLiens = liens.reduce((s, l) => s + l.amis.length, 0) / 2, nbParrain = liens.filter((l) => l.parrain).length
  return (
    <div className="flex flex-col gap-5">
      <header><p className="text-sm text-doux">Espace admin</p><h1 className="titre text-[30px]">Joueurs</h1></header>
      <div role="tablist" aria-label="Vue" className="relative grid max-w-md grid-cols-2 rounded-full bg-creme-2 p-1">
        <span aria-hidden className={`absolute inset-y-1 left-1 w-[calc(50%-4px)] rounded-full bg-encre transition-transform duration-300 ${onglet === 'amis' ? 'translate-x-full' : ''}`} />
        {([['classement', 'Classement'], ['amis', 'Amis & parrainage']] as const).map(([k, l]) => (
          <button key={k} role="tab" aria-selected={onglet === k} onClick={() => setOnglet(k)} className={`relative min-h-11 rounded-full text-sm font-bold ${onglet === k ? 'text-creme' : 'text-doux'}`}>{l}</button>
        ))}
      </div>
      {onglet === 'classement' ? <div className="max-w-2xl"><Classement /></div> : (
        <>
          <dl className="grid grid-cols-3 gap-2 lg:max-w-2xl">
            {[['Joueurs', liens.length], ['Amitiés', nbLiens], ['Parrainés', nbParrain]].map(([k, n]) => (
              <div key={k} className="rounded-[18px] border-[1.5px] border-trait bg-papier p-3"><dd className="titre text-2xl">{n}</dd><dt className="text-[11px] font-bold text-doux">{k}</dt></div>
            ))}
          </dl>
          <ul className="grid gap-3 lg:grid-cols-2 xl:grid-cols-3">
            {liens.map((l) => (
              <li key={l.joueur} className="flex gap-3 rounded-[20px] border-[1.5px] border-trait bg-papier p-3">
                <Avatar id={l.avatar_url || avatarParDefaut(l.joueur)} className="size-12 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold">{l.joueur}</p>
                  <p className="text-xs text-doux">{l.amis.length} ami{l.amis.length > 1 ? 's' : ''}{l.parrain && ` · parrainé par ${l.parrain}`}{l.filleuls > 0 && ` · ${l.filleuls} filleul${l.filleuls > 1 ? 's' : ''}`}</p>
                  {l.amis.length > 0 && <p className="mt-1.5 flex flex-wrap gap-1">{l.amis.map((a) => <span key={a} className="rounded-full bg-creme-2 px-2 py-0.5 text-[11px] font-bold">{a}</span>)}</p>}
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}
