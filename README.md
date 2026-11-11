<div align="center">

<img src="public/logo-bleu.png" alt="Scent Back" width="260" />

### La chasse aux lapins encapuchonnés, dans les rues de Paris.

*Un jeu urbain en PWA : trouve les statuettes cachées, scanne leur puce NFC, collectionne les cartes et gagne des points pour le pop-up store.*

<br />

![React](https://img.shields.io/badge/React_19-023341?style=for-the-badge&logo=react&logoColor=FCF5E3)
![TypeScript](https://img.shields.io/badge/TypeScript-023341?style=for-the-badge&logo=typescript&logoColor=FCF5E3)
![Vite](https://img.shields.io/badge/Vite-023341?style=for-the-badge&logo=vite&logoColor=FCF5E3)
![Tailwind](https://img.shields.io/badge/Tailwind_v4-023341?style=for-the-badge&logo=tailwindcss&logoColor=FCF5E3)
![Supabase](https://img.shields.io/badge/Supabase-FF7722?style=for-the-badge&logo=supabase&logoColor=023341)
![PWA](https://img.shields.io/badge/PWA-FF7722?style=for-the-badge&logo=pwa&logoColor=023341)

</div>

---

## Le concept

**Scent Back** est un prototype réalisé en **BUT MMI** (projet étudiant, non commercial). Il imagine une collaboration fictive entre **Ubisoft** (*Assassin's Creed* × *The Lapins Crétins*) et les bougies **La Belle Mèche**, autour d'un pop-up store parisien.

Des statuettes de lapins encapuchonnés sont cachées dans Paris. Chacune porte une **puce NFC**.

1. 🗺️ **Chasse** : une carte façon Pokémon GO et un radar chaud/froid qui fait vibrer le téléphone de plus en plus vite quand on approche.
2. 📲 **Scan** : on approche le téléphone de la puce, la statuette « apparaît » avec un flash, des vibrations et une secousse d'écran.
3. 📸 **Capture** : une photo devient la carte de collection, et les points sont crédités.
4. 🃏 **Collection** : des collections à compléter, des fiches détaillées (image ou modèle 3D) et un classement.

## Fonctionnalités

| Joueur | Admin |
|---|---|
| Carte de chasse plein écran, radar toujours actif | Tableau de bord : joueurs, actifs sur 7 jours, scans sur 14 jours |
| Vibrations + secousses d'écran à l'approche | Top des statuettes les plus trouvées |
| Scan NFC dans l'appli (Chrome Android) ou par lien `/s/CODE` | Joueurs ayant scanné ≥ X statuettes d'une collection |
| Collections avec progression, fiches, modèles 3D | Création et modification des collections (logo + couverture) |
| Transitions de page façon cartes à collectionner | Création des statuettes (image, `.glb`, position GPS) |
| Profil modifiable, classement, pages légales | Écriture des puces NFC depuis le téléphone |
| Bannière de consentement pour la position | Stats d'obtention par statuette |

## Identité visuelle

<table>
<tr>
<td align="center"><img src="https://placehold.co/90x90/023341/023341.png" width="60" /><br /><code>#023341</code><br />Bleu</td>
<td align="center"><img src="https://placehold.co/90x90/FCF5E3/FCF5E3.png" width="60" /><br /><code>#FCF5E3</code><br />Blanc coquille</td>
<td align="center"><img src="https://placehold.co/90x90/FF7722/FF7722.png" width="60" /><br /><code>#FF7722</code><br />Orange</td>
<td>Titres : <b>Orbitron</b><br />Texte : <b>Outfit</b></td>
</tr>
</table>

## Stack

- **Front** : React 19, TypeScript, Vite, Tailwind CSS v4, React Router 7 (View Transitions natives)
- **PWA** : `vite-plugin-pwa`, installable sur l'écran d'accueil
- **Back** : Supabase (Auth Google + e-mail, Postgres + RLS, Storage, Edge Function `claim-statue`)
- **Carte** : Leaflet + OpenStreetMap
- **3D** : `@google/model-viewer` (chargé seulement si la statuette a un modèle)
- **Capteurs** : Geolocation, Vibration et Web NFC (APIs natives du navigateur)

## Démarrer

```bash
git clone https://github.com/LucasTernel/scent-back.git
cd scent-back
npm install
npm run dev
```

> Sans configuration, l'appli tourne en **mode démo** avec des fausses données stockées dans le navigateur.

## Structure

```
src/
├── pages/          Scan (carte), Gallery, Detail, Claim, Account, Classement, Legal, Admin, Login
├── components/     Intro (loader), TabBar (barre à encoche), Consentement
├── lib/            api (Supabase / mock), haptique (vibrations, NFC, distance), consent, useAuth
└── index.css       charte, transitions, carte
supabase/
└── functions/      claim-statue (validation d'une capture)
```

## Vie privée

- La **position en temps réel** sert uniquement au radar. Elle reste sur le téléphone.
- Elle n'est envoyée **qu'au moment d'une capture**, pour vérifier que le joueur est sur place.
- Aucun cookie publicitaire ni traceur. Le front n'utilise que la clé `anon`, et tout le reste est protégé par la RLS.

---

<div align="center">
<sub>Projet étudiant BUT MMI · Assassin's Creed et The Lapins Crétins sont des marques d'Ubisoft, utilisées ici à titre pédagogique.</sub>
</div>
