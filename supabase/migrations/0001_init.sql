-- Lapins Assassins : schéma, RLS, vues
create extension if not exists pgcrypto;

create table profiles (
  id uuid primary key references auth.users on delete cascade,
  username text unique check (char_length(username) between 3 and 20),
  avatar_url text,
  friend_code text unique not null default upper(substr(md5(random()::text), 1, 6)),
  wallet_code text unique not null default encode(gen_random_bytes(12), 'hex'),
  role text not null default 'player' check (role in ('player','staff','admin')),
  created_at timestamptz not null default now()
);

create table statues (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  name text not null,
  description text,
  hint text,
  district text,
  rarity text not null check (rarity in ('commune','rare','legendaire')),
  points int not null check (points > 0),
  lat double precision not null,
  lng double precision not null,
  radius_m int not null default 75,
  image_url text,
  is_demo boolean not null default false,
  active boolean not null default true
);

create table captures (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles on delete cascade,
  statue_id uuid not null references statues on delete cascade,
  photo_path text,
  lat double precision,
  lng double precision,
  created_at timestamptz not null default now(),
  unique (user_id, statue_id)
);
create index on captures (user_id);

create table point_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles on delete cascade,
  amount int not null check (amount <> 0),
  source text not null check (source in ('capture','popup','reward','bonus')),
  reference_id uuid,
  created_by uuid references profiles on delete set null,
  note text,
  created_at timestamptz not null default now()
);
create index on point_transactions (user_id);

create table rewards (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  cost int not null check (cost > 0),
  stock int not null default 0 check (stock >= 0),
  image_url text
);

create table friendships (
  user_id uuid not null references profiles on delete cascade,
  friend_id uuid not null references profiles on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, friend_id),
  check (user_id <> friend_id)
);

-- Profil créé automatiquement à l'inscription
create function handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, username) values (new.id, new.raw_user_meta_data->>'username');
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function handle_new_user();

-- Ami réciproque
create function add_friend(code text) returns void
language plpgsql security definer set search_path = public as $$
declare fid uuid;
begin
  select id into fid from profiles where friend_code = upper(code) or username = code;
  if fid is null or fid = auth.uid() then raise exception 'Ami introuvable'; end if;
  insert into friendships values (auth.uid(), fid, now()), (fid, auth.uid(), now()) on conflict do nothing;
end $$;

-- Soldes (security_invoker : la RLS des transactions s'applique)
create view wallet_balances with (security_invoker = true) as
select user_id,
  coalesce(sum(amount), 0)::int as total,
  coalesce(sum(amount) filter (where source = 'capture'), 0)::int as paris,
  coalesce(sum(amount) filter (where source in ('popup','bonus')), 0)::int as popup,
  coalesce(-sum(amount) filter (where source = 'reward'), 0)::int as spent
from point_transactions group by user_id;

-- Vue publique des statuettes : ni code, ni position exacte (arrondie à ~300 m)
create view public_statues as
select id, name, description, hint, district, rarity, points, image_url, is_demo,
  round(lat::numeric, 3)::float as zone_lat, round(lng::numeric, 3)::float as zone_lng
from statues where active;
grant select on public_statues to anon, authenticated;

-- Classement des amis (pseudo + solde uniquement)
create function friends_leaderboard() returns table (username text, total int)
language sql security definer set search_path = public stable as $$
  select p.username, coalesce(sum(t.amount), 0)::int
  from profiles p left join point_transactions t on t.user_id = p.id
  where p.id = auth.uid() or p.id in (select friend_id from friendships where user_id = auth.uid())
  group by p.id order by 2 desc;
$$;

-- RLS : tout fermé par défaut, le front ne fait que lire (écritures = Edge Functions service_role)
alter table profiles enable row level security;
alter table statues enable row level security;
alter table captures enable row level security;
alter table point_transactions enable row level security;
alter table rewards enable row level security;
alter table friendships enable row level security;

create policy "profil lisible par soi et ses amis" on profiles for select using (
  id = auth.uid() or id in (select friend_id from friendships where user_id = auth.uid()));
create policy "modifier son pseudo/avatar" on profiles for update using (id = auth.uid())
  with check (id = auth.uid() and role = (select role from profiles where id = auth.uid()));
create policy "mes captures" on captures for select using (user_id = auth.uid());
create policy "mes transactions" on point_transactions for select using (user_id = auth.uid());
create policy "lots visibles" on rewards for select using (true);
create policy "mes amis" on friendships for select using (user_id = auth.uid());
-- statues : aucune policy => illisible côté client, on passe par public_statues

-- Storage : bucket privé des photos
insert into storage.buckets (id, name, public) values ('captures', 'captures', false);
create policy "lire mes photos" on storage.objects for select
  using (bucket_id = 'captures' and (storage.foldername(name))[1] = auth.uid()::text);

-- Anti-triche : tentatives de scan (limite 10/h, gérée par claim-statue)
create table claim_attempts (
  user_id uuid not null references profiles on delete cascade,
  created_at timestamptz not null default now()
);
create index on claim_attempts (user_id, created_at);
alter table claim_attempts enable row level security; -- aucune policy : service_role uniquement

-- Capture + points en une seule transaction SQL (appelée par claim-statue)
create function record_capture(p_user uuid, p_statue uuid, p_photo text, p_lat float, p_lng float)
returns int language plpgsql security definer set search_path = public as $$
declare cid uuid; pts int;
begin
  select points into pts from statues where id = p_statue;
  insert into captures (user_id, statue_id, photo_path, lat, lng)
    values (p_user, p_statue, p_photo, p_lat, p_lng) returning id into cid;
  insert into point_transactions (user_id, amount, source, reference_id)
    values (p_user, pts, 'capture', cid);
  return (select coalesce(sum(amount), 0)::int from point_transactions where user_id = p_user);
end $$;
revoke execute on function record_capture from public, anon, authenticated;
