-- Admin : gérer les lots de la boutique et valider les bons au pop-up store
create policy "admin gère les lots" on rewards for all using (is_admin()) with check (is_admin());
create policy "admin voit les bons" on commandes for select using (is_admin());
create policy "admin valide les bons" on commandes for update using (is_admin()) with check (is_admin());
create policy "admin lit les profils" on profiles for select using (is_admin());
