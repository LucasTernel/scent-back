-- Moodboard « Cliquez pour sentir », modifiable par l'admin
create table senteurs (
  id text primary key,            -- ex. 'rhum-marin', 'box-ac4', 'figue-tabacee'
  nom text not null,
  couleur text not null default '#C98A3E',
  tuiles jsonb not null default '[]' -- [{ "mot": "MARIN", "image": "https://…" }]
);
alter table senteurs enable row level security;
create policy "senteurs lisibles" on senteurs for select using (true);
create policy "admin gère senteurs" on senteurs for all using (is_admin()) with check (is_admin());
insert into senteurs (id, nom, couleur, tuiles) values
 ('rhum-marin', 'Rhum Marin', '#C98A3E', '[{"mot":"MARIN"},{"mot":"AMBRÉ"},{"mot":"BOISÉ"},{"mot":"VANILLÉ"},{"mot":"ÉPICÉ"}]'),
 ('box-ac4', 'Rhum Marin', '#C98A3E', '[{"mot":"MARIN"},{"mot":"AMBRÉ"},{"mot":"BOISÉ"},{"mot":"VANILLÉ"},{"mot":"ÉPICÉ"}]'),
 ('figue-tabacee', 'Figue Tabacée', '#B5632E', '[{"mot":"FRUITÉ"},{"mot":"TABAC"},{"mot":"VERT"},{"mot":"BOISÉ"},{"mot":"DOUX"}]');
