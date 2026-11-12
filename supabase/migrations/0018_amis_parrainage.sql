-- Parrainage, recherche de joueurs, liste et profil d'amis
alter table profiles add column if not exists parrain_id uuid references profiles on delete set null;
alter table point_transactions drop constraint if exists point_transactions_source_check;
alter table point_transactions add constraint point_transactions_source_check check (source in ('capture','popup','reward','bonus','parrainage'));

-- À l'inscription : code de parrainage (métadonnée « parrain ») → amis + 50 pts chacun
create or replace function handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
declare pid uuid;
begin
  select id into pid from profiles where friend_code = upper(nullif(trim(new.raw_user_meta_data->>'parrain'), ''));
  insert into profiles (id, username, parrain_id) values (new.id, new.raw_user_meta_data->>'username', pid);
  if pid is not null then
    insert into friendships values (new.id, pid, now()), (pid, new.id, now()) on conflict do nothing;
    insert into point_transactions (user_id, amount, source, note) values
      (new.id, 50, 'parrainage', 'Bienvenue, parrainé·e'), (pid, 50, 'parrainage', 'Parrainage');
  end if;
  return new;
end $$;

-- Recherche par pseudo (début) ou code ami exact ; jamais l'e-mail
create or replace function chercher_joueurs(q text) returns table (username text, avatar_url text, friend_code text, ami boolean)
language sql security definer set search_path = public stable as $$
  select p.username, p.avatar_url, p.friend_code,
         exists (select 1 from friendships f where f.user_id = auth.uid() and f.friend_id = p.id)
  from profiles p
  where p.id <> auth.uid() and length(trim(q)) >= 2
    and (p.friend_code = upper(trim(q)) or p.username ilike replace(replace(trim(q), '%', ''), '_', '\_') || '%')
  order by p.username limit 10
$$;

-- Mes amis avec leurs scores
create or replace function mes_amis() returns table (username text, avatar_url text, total int, lapins int)
language sql security definer set search_path = public stable as $$
  select p.username, p.avatar_url,
         coalesce((select sum(amount) from point_transactions t where t.user_id = p.id), 0)::int,
         (select count(*) from captures c where c.user_id = p.id)::int
  from friendships f join profiles p on p.id = f.friend_id
  where f.user_id = auth.uid() order by 3 desc
$$;

-- Profil d'un ami (uniquement si c'est un ami)
create or replace function profil_ami(pseudo text) returns json
language sql security definer set search_path = public stable as $$
  select json_build_object(
    'username', p.username, 'avatar_url', p.avatar_url, 'depuis', p.created_at,
    'total', coalesce((select sum(amount) from point_transactions t where t.user_id = p.id), 0),
    'captures', coalesce((select json_agg(json_build_object('id', s.id, 'nom', s.name, 'rarete', s.rarity, 'model', s.model_url, 'date', c.created_at) order by c.created_at desc)
                 from captures c join statues s on s.id = c.statue_id where c.user_id = p.id), '[]'::json))
  from profiles p
  where p.username = pseudo and exists (select 1 from friendships f where f.user_id = auth.uid() and f.friend_id = p.id)
$$;

create or replace function retirer_ami(pseudo text) returns void
language sql security definer set search_path = public as $$
  delete from friendships where (user_id = auth.uid() and friend_id = (select id from profiles where username = pseudo))
                             or (friend_id = auth.uid() and user_id = (select id from profiles where username = pseudo))
$$;
grant execute on function chercher_joueurs(text), mes_amis(), profil_ami(text), retirer_ami(text) to authenticated;
