-- Bug : la policy relisait « profiles » dans sa propre vérification → récursion infinie, aucun pseudo modifiable.
-- Correctif : policy simple + droits par colonne (le joueur ne peut modifier QUE pseudo et avatar, jamais son rôle).
drop policy "modifier son pseudo/avatar" on profiles;
create policy "modifier son pseudo/avatar" on profiles for update
  using (id = auth.uid()) with check (id = auth.uid());

revoke update on profiles from authenticated, anon;
grant update (username, avatar_url) on profiles to authenticated;
