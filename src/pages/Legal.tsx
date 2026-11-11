import { useNavigate, useParams } from 'react-router-dom'
import { ecrireConsent, lireConsent } from '../lib/consent'
import { useState } from 'react'
import { Icon } from '../ui'

// ponytail: textes types pour le prototype étudiant, à faire relire avant toute vraie mise en ligne
const pages: Record<string, { titre: string; sections: [string, string][] }> = {
  mentions: {
    titre: 'Mentions légales',
    sections: [
      ['Éditeur', 'Lucas TERNEL — BUT MMI 3, parcours Développement web (WEB).\nResponsable de la publication : Lucas TERNEL.'],
      ['Cadre du projet', 'Scent Back est réalisé dans le cadre d\'une SAE (situation d\'apprentissage et d\'évaluation) de 3ᵉ année de BUT Métiers du Multimédia et de l\'Internet.\n\nLe projet imagine une collaboration fictive entre Ubisoft (Assassin\'s Creed × The Lapins Crétins) et la marque de bougies La Belle Mèche : une identité de marque (Scent Back), des bougies et coffrets, un pop-up store parisien, et cette application de chasse urbaine où les joueurs retrouvent des statuettes équipées de puces NFC.\n\nProjet pédagogique, non commercial.'],
      ['Équipe projet', 'Lucas TERNEL — MMI3 WEB\nRobin BRIDOUX — MMI3 MUL\nMathis BRIANCHON — MMI3 MUL\nEthan HELDEBAUME — MMI3 MUL\nAdrien POUILLART — MMI3 MUL\nClémentine JASIAK — MMI3 COM\nKenza SALMI — MMI3 COM\nCandice DECROIX — MMI3 COM\n\nWEB : développement web · MUL : création multimédia · COM : stratégie de communication.'],
      ['Hébergement', 'Application hébergée sur un serveur privé loué par Lucas TERNEL auprès de :\nHostinger International Ltd.\n61 Lordou Vironos, 6023 Larnaca, Chypre\nhttps://www.hostinger.fr'],
      ['Base de données et authentification', 'Comptes, photos de capture et points sont gérés par :\nSupabase\n65 Chulia Street, OCBC Centre, Singapour 049513\nhttps://supabase.com'],
      ['Cartographie', 'Fond de carte © les contributeurs OpenStreetMap (licence ODbL) — https://www.openstreetmap.org/copyright'],
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
          <p className="text-[15px] leading-relaxed whitespace-pre-line text-doux">{txt}</p>
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
