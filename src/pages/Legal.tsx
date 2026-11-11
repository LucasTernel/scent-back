import { useNavigate, useParams } from 'react-router-dom'
import { ecrireConsent, lireConsent } from '../lib/consent'
import { useState } from 'react'
import { Icon } from '../ui'

// ponytail: textes types pour le prototype étudiant, à faire relire avant toute vraie mise en ligne
const pages: Record<string, { titre: string; sections: [string, string][] }> = {
  mentions: {
    titre: 'Mentions légales',
    sections: [
      ['Éditeur', 'Scent Back est un prototype réalisé dans le cadre du BUT MMI (projet étudiant, non commercial). Projet fictif inspiré d\'une collaboration Ubisoft × La Belle Mèche.'],
      ['Hébergement', 'Application hébergée par l\'équipe projet. Données stockées chez Supabase (Union européenne).'],
      ['Propriété intellectuelle', 'Les marques Assassin\'s Creed et The Lapins Crétins appartiennent à Ubisoft. Elles sont utilisées ici à titre pédagogique uniquement.'],
    ],
  },
  confidentialite: {
    titre: 'Politique de confidentialité',
    sections: [
      ['Données collectées', 'E-mail, pseudo, prénom et nom (facultatifs), photos de capture, points gagnés, et position GPS au moment d\'une capture uniquement.'],
      ['Position en temps réel', 'Si tu l\'autorises, ta position est lue en continu pendant que l\'appli est ouverte pour faire fonctionner le radar. Elle est traitée sur ton téléphone et n\'est jamais envoyée ni enregistrée.'],
      ['Finalité', 'Faire fonctionner le jeu : vérifier les captures, afficher ta collection et le classement (seuls ton pseudo et tes points y apparaissent).'],
      ['Durée', 'Tes données sont conservées tant que ton compte existe et supprimées avec lui.'],
      ['Tes droits', 'Tu peux consulter et modifier tes infos depuis ton profil. Pour supprimer ton compte et toutes tes données, contacte l\'équipe projet (RGPD, art. 15 à 21).'],
    ],
  },
  cookies: {
    titre: 'Gestion des cookies',
    sections: [
      ['Ce qu\'on utilise', 'Aucun cookie publicitaire ni outil de mesure d\'audience. Seulement un stockage local strictement nécessaire : ta session de connexion et tes préférences (dont ce choix).'],
      ['Position en temps réel', 'Utilisée pour le radar, seulement si tu l\'autorises. Tu peux changer d\'avis ci-dessous. Pense aussi à vérifier l\'autorisation dans les réglages de ton navigateur.'],
    ],
  },
}

export default function Legal() {
  const { page = '' } = useParams()
  const navigate = useNavigate()
  const p = pages[page]
  const [choix, setChoix] = useState(lireConsent)
  if (!p) return null
  const changer = (c: 'oui' | 'non') => { ecrireConsent(c); setChoix(c) }
  return (
    <div className="flex flex-col gap-5">
      <header className="monte">
        <button onClick={() => (history.length > 1 ? navigate(-1) : navigate('/'))} className="-ml-1 inline-flex min-h-10 items-center gap-1 text-sm font-bold text-doux"><Icon name="retour" size={18} />Retour</button>
        <h1 className="titre text-[26px] leading-tight">{p.titre}</h1>
      </header>
      {p.sections.map(([h, txt]) => (
        <section key={h} className="monte flex flex-col gap-1.5">
          <h2 className="font-serif text-sm font-bold text-flamme">{h}</h2>
          <p className="text-[15px] leading-relaxed text-doux">{txt}</p>
        </section>
      ))}
      {page === 'cookies' && (
        <div className="flex items-center justify-between gap-3 rounded-[20px] border-[1.5px] border-trait bg-papier p-4">
          <span className="font-bold">Position en temps réel</span>
          <button role="switch" aria-checked={choix === 'oui'} aria-label="Position en temps réel" onClick={() => changer(choix === 'oui' ? 'non' : 'oui')}
            className={`relative h-8 w-14 rounded-full transition-colors ${choix === 'oui' ? 'bg-flamme' : 'bg-trait'}`}>
            <span className={`absolute top-1 left-1 size-6 rounded-full bg-papier transition-transform ${choix === 'oui' ? 'translate-x-6' : ''}`} />
          </button>
        </div>
      )}
    </div>
  )
}
