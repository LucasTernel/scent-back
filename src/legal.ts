/** Textes légaux : utilisés par l'appli ET par scripts/legal-statique.mjs (pages HTML lisibles sans JavaScript). */
// ponytail: textes types pour le prototype étudiant, à faire relire avant toute vraie mise en ligne
export const pages: Record<string, { titre: string; court: string; intro: string; sections: [string, string][] }> = {
  mentions: {
    titre: 'Mentions légales', court: 'Mentions', intro: 'Qui édite Scent Back, qui l\'héberge, et dans quel cadre il a été conçu.',
    sections: [
      ['Crédits photos', 'Photos des notes olfactives (vanille, figue, orange, poivre, tabac, rose, miel, menthe, mer, bois, cuir) et logos des jeux : Wikimedia Commons, sous leurs licences libres respectives. Les logos et marques restent la propriété d\'Ubisoft.'],
      ['Éditeur', 'Lucas TERNEL — BUT MMI 3, parcours Développement web (WEB).\nResponsable de la publication : Lucas TERNEL.'],
      ['Cadre du projet', 'Scent Back est réalisé dans le cadre d\'une SAE (situation d\'apprentissage et d\'évaluation) de 3ᵉ année de BUT Métiers du Multimédia et de l\'Internet.\n\nLe projet imagine une collaboration fictive entre Ubisoft (Assassin\'s Creed × The Lapins Crétins) et la marque de bougies La Belle Mèche : une identité de marque (Scent Back), des bougies et coffrets, un pop-up store parisien, et cette application de chasse urbaine où les joueurs retrouvent des statuettes équipées de puces NFC.\n\nProjet pédagogique, non commercial.'],
      ['Équipe projet', 'Lucas TERNEL — MMI3 WEB\nRobin BRIDOUX — MMI3 MUL\nMathis BRIANCHON — MMI3 MUL\nEthan HELDEBAUME — MMI3 MUL\nAdrien POUILLART — MMI3 MUL\nClémentine JASIAK — MMI3 COM\nKenza SALMI — MMI3 COM\nCandice DECROIX — MMI3 COM\n\nWEB : développement web · MUL : création multimédia · COM : stratégie de communication.'],
      ['Hébergement', 'Application hébergée sur un serveur privé loué par Lucas TERNEL auprès de :\nHostinger International Ltd.\n61 Lordou Vironos, 6023 Larnaca, Chypre\nhttps://www.hostinger.fr'],
      ['Base de données et authentification', 'Comptes, photos de capture et points sont gérés par :\nSupabase\n65 Chulia Street, OCBC Centre, Singapour 049513\nhttps://supabase.com'],
      ['Cartographie', 'Fond de carte © les contributeurs OpenStreetMap (licence ODbL) — https://www.openstreetmap.org/copyright'],
      ['Propriété intellectuelle', 'Les marques Assassin\'s Creed et The Lapins Crétins appartiennent à Ubisoft. Elles sont utilisées ici à titre pédagogique uniquement.'],
    ],
  },
  conditions: {
    titre: 'Conditions générales d\'utilisation', court: 'CGU', intro: 'Les règles du jeu : ce que l\'on peut faire avec l\'appli Scent Back, et ce que l\'on ne peut pas faire.',
    sections: [
      ['Objet', 'Les présentes conditions encadrent l\'utilisation de Scent Back, application de chasse urbaine réalisée dans le cadre d\'une SAE du BUT MMI. En créant un compte, tu les acceptes.'],
      ['Compte', 'L\'inscription se fait par e-mail ou avec un compte Google. Tu choisis un nom de code : il doit rester correct (pas d\'insulte, pas d\'usurpation d\'identité). Tu es responsable de la confidentialité de ton mot de passe.'],
      ['Le jeu', 'Le but est de trouver les statuettes cachées, de scanner leur puce NFC sur place et de prendre une photo. Chaque capture rapporte des points, visibles dans ton profil et dans le classement.'],
      ['Règles de bonne conduite', 'Interdit : tricher (fausse position GPS, partage des liens des puces, comptes multiples), dégrader ou déplacer une statuette, publier des photos de personnes sans leur accord ou des contenus choquants.\nEn cas d\'abus, l\'équipe peut retirer des points ou supprimer le compte.'],
      ['Sécurité', 'Reste attentif à ton environnement : respecte le code de la route, les propriétés privées et les horaires des lieux. Ne joue jamais en conduisant. L\'équipe ne peut être tenue responsable d\'un accident survenu pendant la chasse.'],
      ['Points et lots', 'Les points n\'ont aucune valeur monétaire. Ils peuvent servir lors d\'événements du pop-up store, dans la limite des lots disponibles. Le projet étant pédagogique et fictif, aucun lot réel n\'est garanti.'],
      ['Disponibilité', 'L\'application est un prototype étudiant : elle peut être modifiée, interrompue ou fermée à tout moment, notamment à la fin de la SAE.'],
      ['Données personnelles', 'Leur traitement est décrit dans la politique de confidentialité, accessible en bas de la page de connexion et du profil.'],
      ['Contact', 'Pour toute question : Lucas TERNEL, éditeur de l\'application (voir les mentions légales).'],
    ],
  },
  cgv: {
    titre: 'Conditions générales de vente', court: 'CGV', intro: 'Les conditions qui s\'appliquent aux réservations faites sur la boutique Scent Back.',
    sections: [
      ['Boutique de démonstration', 'Scent Back est un projet étudiant pédagogique. La boutique en ligne est une démonstration : aucune commande n\'est facturée, aucun paiement n\'est demandé et aucune coordonnée bancaire n\'est collectée.'],
      ['Produits', '• Box Assassin\'s Creed IV Black Flag : le jeu, la bougie Rhum Marin 140 g et l\'écrin.\n• Bougie Rhum Marin, 140 g de cire végétale.\n• Bougie Figue Tabacée, 70 g (prochainement).\nLes visuels sont non contractuels.'],
      ['Prix', 'Les prix sont affichés en euros, toutes taxes comprises. Ils sont indicatifs dans le cadre de ce prototype.'],
      ['Réservation', 'Ajoutez vos produits au panier puis validez : un numéro de réservation vous est attribué. Il ne s\'agit pas d\'un contrat de vente.'],
      ['Retrait', 'Les réservations se retirent au pop-up store Ubisoft × La Belle Mèche, à Paris, à partir du 13 novembre 2027. Le lieu sera communiqué prochainement.'],
      ['Lots de l\'application', 'Les lots obtenus avec les points de la chasse (autocollants, tote bag, bougies…) sont gratuits, dans la limite des stocks, et se retirent au pop-up sur présentation du bon.'],
      ['Droit de rétractation', 'Aucune vente n\'étant conclue, le droit de rétractation ne s\'applique pas. Dans une version commerciale, vous disposeriez de 14 jours pour vous rétracter (Code de la consommation, art. L221-18).'],
      ['Sécurité des bougies', 'Ne laissez jamais une bougie allumée plus de 3 à 4 heures d\'affilée, ni sans surveillance. Tenez-la hors de portée des enfants et des animaux, sur un support stable et loin de tout objet inflammable.'],
      ['Contact', 'Pour toute question : Lucas TERNEL, éditeur de Scent Back (voir les mentions légales).'],
    ],
  },
  confidentialite: {
    titre: 'Politique de confidentialité', court: 'Confidentialité', intro: 'Quelles données nous collectons, pourquoi, combien de temps, et comment exercer vos droits.',
    sections: [
      ['Qui est responsable de tes données ?', 'Le responsable du traitement est Lucas TERNEL, éditeur de Scent Back, application réalisée dans le cadre d\'une SAE du BUT MMI (projet pédagogique, non commercial).\nContact : lucas.ternel62@gmail.com\nDernière mise à jour : novembre 2026.'],
      ['Données que nous collectons', '• Compte : adresse e-mail, nom de code (pseudo), mot de passe chiffré si tu t\'inscris par e-mail.\n• Profil (facultatif) : prénom et nom.\n• Jeu : statuettes capturées, date de capture, points gagnés, historique des points.\n• Photos : la photo prise au moment d\'une capture.\n• Position GPS : uniquement au moment d\'une capture (latitude, longitude), pour vérifier que tu es bien sur place.\n• Technique : journaux de connexion conservés par nos prestataires pour la sécurité.'],
      ['Données reçues de Google (connexion avec Google)', 'Si tu te connectes avec Google, nous recevons uniquement ton adresse e-mail, ton nom et ta photo de profil Google, via les autorisations « openid », « email » et « profile ».\nCes données servent seulement à créer ton compte et à te reconnaître à la connexion. Nous n\'accédons à aucune autre donnée de ton compte Google (contacts, Gmail, Drive, agenda…).\nL\'utilisation des informations reçues des API Google respecte les règles relatives aux données utilisateur des services API Google (Google API Services User Data Policy), y compris les exigences d\'utilisation limitée (Limited Use).\nCes données ne sont jamais vendues, ni partagées avec des tiers à des fins publicitaires, ni utilisées pour entraîner des modèles d\'intelligence artificielle.'],
      ['Position en temps réel', 'Si tu l\'autorises, ta position est lue en continu pendant que l\'appli est ouverte, pour faire fonctionner le radar qui vibre quand tu approches d\'une statuette. Elle est traitée uniquement sur ton téléphone : elle n\'est ni envoyée ni enregistrée. Seule la position au moment d\'une capture est transmise. Tu peux refuser ou retirer cet accès à tout moment (page Gestion des cookies ou réglages du téléphone).'],
      ['Pourquoi nous utilisons ces données', '• Créer et sécuriser ton compte.\n• Faire fonctionner le jeu : valider les captures, afficher ta collection, tes points et ton historique.\n• Afficher le classement : seuls ton pseudo et ton total de points y apparaissent.\n• Empêcher la triche (vérification de la position au moment de la capture, limitation des tentatives).\nBase légale : l\'exécution du service que tu demandes en créant un compte (RGPD, art. 6.1.b) et ton consentement pour la position en temps réel (art. 6.1.a).'],
      ['Qui peut voir tes données', '• Les autres joueurs voient uniquement ton pseudo et tes points dans le classement.\n• L\'administrateur du projet peut voir des statistiques globales (nombre de joueurs, de scans).\n• Prestataires techniques : Supabase (base de données, authentification, stockage des photos) et Hostinger (hébergement du site). Ils traitent les données uniquement pour faire fonctionner le service.\nAucune donnée n\'est vendue, louée ou utilisée à des fins publicitaires.'],
      ['Durée de conservation', 'Tes données sont conservées tant que ton compte existe. À la suppression du compte, ton profil, tes captures, tes photos et tes points sont supprimés. Le projet étant pédagogique, l\'ensemble des données sera supprimé au plus tard à la fin de l\'année universitaire.'],
      ['Sécurité', 'Les échanges sont chiffrés (HTTPS). L\'accès aux données est limité par des règles de sécurité au niveau de la base : chaque joueur ne peut lire que ses propres captures et photos. Les photos sont stockées dans un espace privé.'],
      ['Tes droits', 'Conformément au RGPD, tu peux accéder à tes données, les rectifier, les supprimer, t\'opposer à leur traitement, en limiter l\'usage et en demander une copie (portabilité).\n• Pseudo, prénom et nom se modifient directement dans ton profil.\n• Pour toute autre demande, dont la suppression de ton compte : lucas.ternel62@gmail.com. Réponse sous 30 jours.\nTu peux aussi déposer une réclamation auprès de la CNIL (www.cnil.fr).\nPour retirer l\'accès de Scent Back à ton compte Google : myaccount.google.com/permissions.'],
      ['Mineurs', 'Scent Back s\'adresse aux personnes de 15 ans et plus. En dessous, l\'accord d\'un parent est nécessaire.'],
      ['Modifications', 'Cette politique peut évoluer. La date de mise à jour est indiquée en haut de la page.'],
    ],
  },
  cookies: {
    titre: 'Gestion des cookies', court: 'Cookies', intro: 'Ce que Scent Back stocke sur votre appareil, et comment changer vos choix.',
    sections: [
      ['Ce qu\'on utilise', 'Aucun cookie publicitaire ni outil de mesure d\'audience. Seulement un stockage local strictement nécessaire : ta session de connexion et tes préférences (dont ce choix).'],
      ['Position en temps réel', 'Utilisée pour le radar, seulement si tu l\'autorises. Tu peux changer d\'avis ci-dessous. Pense aussi à vérifier l\'autorisation dans les réglages de ton navigateur.'],
    ],
  },
}
