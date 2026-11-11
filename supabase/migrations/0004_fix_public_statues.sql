-- La vue doit lire « statues » avec les droits de son propriétaire (la table reste fermée aux joueurs)
alter view public_statues set (security_invoker = false);
