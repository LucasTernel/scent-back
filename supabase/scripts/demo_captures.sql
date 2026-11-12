-- Démo : donne 3/4 des statuettes actives à un joueur, à des dates aléatoires sur les 30 derniers jours
with joueur as (select '8cb32d07-34df-403c-a718-679d6740286f'::uuid as id),
choix as (
  select s.id, s.name, s.points, now() - (random() * interval '30 days') as quand
  from statues s where s.active and not exists (select 1 from captures c, joueur j where c.user_id = j.id and c.statue_id = s.id)
  order by random()
  limit (select ceil(count(*) * .75) from statues where active)
),
ins as (
  insert into captures (user_id, statue_id, created_at) select j.id, c.id, c.quand from choix c, joueur j returning statue_id, created_at
)
insert into point_transactions (user_id, amount, source, note, created_at)
select j.id, c.points, 'capture', c.name, c.quand from choix c, joueur j;
