insert into statues (code, name, description, hint, district, rarity, points, lat, lng, is_demo) values
('LOUVRE-7Q2', 'Lapin de la Pyramide', 'Il a voulu escalader la pyramide. Elle est en verre.', 'Là où le verre fait des triangles…', 'Louvre', 'legendaire', 150, 48.8606, 2.3376, false),
('NDAME-K8P', 'Lapin Gargouille', 'Se prend pour une gargouille depuis 1163.', 'Il guette depuis une cathédrale célèbre…', 'Île de la Cité', 'rare', 80, 48.8530, 2.3499, false),
('MONTM-3XR', 'Lapin du Sacré-Cœur', 'A monté toutes les marches. Deux fois. Par erreur.', 'Tout en haut de la butte…', 'Montmartre', 'rare', 80, 48.8867, 2.3431, false),
('MARAIS-9TB', 'Lapin Falafel', 'Garde la file d''attente la plus longue de Paris.', 'Entre les hôtels particuliers et les falafels…', 'Le Marais', 'commune', 30, 48.8575, 2.3590, false),
('CANAL-5MZ', 'Lapin Éclusier', 'Ouvre l''écluse, ferme l''écluse, BWAAAH.', 'Au bord de l''eau, près des passerelles vertes…', 'Canal Saint-Martin', 'commune', 30, 48.8710, 2.3650, false),
('EIFFEL-2WD', 'Lapin Saut de la Foi', 'S''est jeté du 3e étage. Atterrissage dans une botte de foin.', 'Sous la Dame de fer…', 'Tour Eiffel', 'legendaire', 150, 48.8584, 2.2945, false),
('PNEUF-6HC', 'Lapin du Pont-Neuf', 'Le plus vieux pont, le lapin le plus crétin.', 'Près d''un pont célèbre…', 'Pont-Neuf', 'commune', 30, 48.8572, 2.3414, false),
('BASTI-4GN', 'Lapin Révolutionnaire', 'Cherche encore la prison.', 'Là où une colonne remplace une forteresse…', 'Bastille', 'commune', 30, 48.8532, 2.3691, false),
('OPERA-8LV', 'Lapin Fantôme', 'Chante faux sous le grand escalier.', 'Sous les dorures d''un palais de la musique…', 'Opéra', 'rare', 80, 48.8720, 2.3316, false),
('LUXEM-1SJ', 'Lapin Sénateur', 'A déposé un amendement BWAAAH.', 'Dans un jardin royal plein de chaises vertes…', 'Luxembourg', 'commune', 30, 48.8462, 2.3372, false),
('PANTH-7EF', 'Lapin Grand Homme', 'Se croit enterré parmi les illustres.', 'Au sommet de la montagne Sainte-Geneviève…', 'Panthéon', 'rare', 80, 48.8462, 2.3464, false),
('ARC-5YK', 'Lapin Point de Vue', 'Synchronisation depuis le toit de l''Arc.', 'Au centre de l''étoile…', 'Arc de Triomphe', 'legendaire', 150, 48.8738, 2.2950, false),
-- Démo oral : modifier lat/lng pour la salle
('DEMO-1', 'Lapin Démo Commun', 'Statuette de démonstration.', 'Dans la salle !', 'Salle de l''oral', 'commune', 30, 48.8566, 2.3522, true),
('DEMO-2', 'Lapin Démo Rare', 'Statuette de démonstration.', 'Dans la salle !', 'Salle de l''oral', 'rare', 80, 48.8566, 2.3522, true),
('DEMO-3', 'Lapin Démo Légendaire', 'Statuette de démonstration.', 'Dans la salle !', 'Salle de l''oral', 'legendaire', 150, 48.8566, 2.3522, true);

insert into rewards (name, cost, stock) values
('Bougie Lapin Assassin (cire de soja)', 300, 50),
('Figurine Lapin Crétin édition Confrérie', 500, 20),
('Tote bag La Belle Mèche x Ubisoft', 150, 100),
('Autocollants BWAAAH', 50, 500);

-- Compte staff de test : créer l'utilisateur dans Auth (staff@test.fr), puis :
-- update profiles set role = 'staff', username = 'staff' where id = (select id from auth.users where email = 'staff@test.fr');
