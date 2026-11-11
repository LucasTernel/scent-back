import { Link } from 'react-router-dom'
import { getLeaderboard, getProfile } from '../lib/api'
import { useData } from '../lib/useData'
import { Icon } from '../ui'

export default function Classement() {
  const liste = useData(getLeaderboard)
  const moi = useData(getProfile)?.username
  return (
    <div className="flex flex-col gap-5">
      <header className="monte">
        <Link viewTransition data-dir="arriere" to="/compte" className="-ml-1 inline-flex min-h-10 items-center gap-1 text-sm font-bold text-doux"><Icon name="retour" size={18} />Compte</Link>
        <h1 className="titre text-[32px]">Classement</h1>
      </header>
      <ol className="monte overflow-hidden rounded-[20px] border-[1.5px] border-trait bg-papier">
        {!liste && <li className="p-4 text-sm text-doux">Chargement…</li>}
        {liste?.map((j, i) => (
          <li key={j.username} className={`flex items-center gap-3 border-t border-creme-2 px-4 py-3 first:border-0 ${j.username === moi ? 'bg-flamme/12' : ''}`}>
            <span className={`titre w-8 text-xl ${i < 3 ? 'text-flamme' : 'text-doux'}`}>{i + 1}</span>
            <span className="flex-1 truncate font-medium">{j.username}{j.username === moi && <span className="text-doux"> (toi)</span>}</span>
            <span className="font-bold">{j.total} pts</span>
          </li>
        ))}
      </ol>
    </div>
  )
}
