-- Demandes d'amis : on demande, l'autre accepte ou refuse
create table if not exists demandes_amis (
  de uuid not null references profiles on delete cascade,
  a uuid not null references profiles on delete cascade,
  created_at timestamptz not null default now(),
  primary key (de, a), check (de <> a)
);
alter table demandes_amis enable row level security;
create policy "mes demandes" on demandes_amis for select using (de = auth.uid() or a = auth.uid());

-- Demander : si l'autre m'avait déjà demandé, on devient amis directement
drop function if exists add_friend(text);
create function add_friend(code text) returns text
language plpgsql security definer set search_path = public as $$
declare fid uuid;
begin
  select id into fid from profiles where friend_code = upper(code) or username = code;
  if fid is null or fid = auth.uid() then raise exception 'introuvable'; end if;
  if exists (select 1 from friendships where user_id = auth.uid() and friend_id = fid) then return 'ami'; end if;
  if exists (select 1 from demandes_amis where de = fid and a = auth.uid()) then
    delete from demandes_amis where de = fid and a = auth.uid();
    insert into friendships values (auth.uid(), fid, now()), (fid, auth.uid(), now()) on conflict do nothing;
    return 'ami';
  end if;
  insert into demandes_amis (de, a) values (auth.uid(), fid) on conflict do nothing;
  return 'envoyee';
end $$;

create or replace function demandes_recues() returns table (username text, avatar_url text, created_at timestamptz)
language sql security definer set search_path = public stable as $$
  select p.username, p.avatar_url, d.created_at from demandes_amis d join profiles p on p.id = d.de
  where d.a = auth.uid() order by d.created_at desc
$$;

create or replace function repondre_demande(pseudo text, accepter boolean) returns void
language plpgsql security definer set search_path = public as $$
declare fid uuid;
begin
  select id into fid from profiles where username = pseudo;
  delete from demandes_amis where de = fid and a = auth.uid();
  if not found then raise exception 'demande introuvable'; end if;
  if accepter then insert into friendships values (auth.uid(), fid, now()), (fid, auth.uid(), now()) on conflict do nothing; end if;
end $$;

-- Recherche : état de la relation (ami / envoyee / recue / null)
drop function if exists chercher_joueurs(text);
create function chercher_joueurs(q text) returns table (username text, avatar_url text, friend_code text, etat text)
language sql security definer set search_path = public stable as $$
  select p.username, p.avatar_url, p.friend_code,
    case when exists (select 1 from friendships f where f.user_id = auth.uid() and f.friend_id = p.id) then 'ami'
         when exists (select 1 from demandes_amis d where d.de = auth.uid() and d.a = p.id) then 'envoyee'
         when exists (select 1 from demandes_amis d where d.a = auth.uid() and d.de = p.id) then 'recue' end
  from profiles p
  where p.id <> auth.uid() and length(trim(q)) >= 2
    and (p.friend_code = upper(trim(q)) or p.username ilike replace(replace(trim(q), '%', ''), '_', '\_') || '%')
  order by p.username limit 10
$$;
grant execute on function add_friend(text), demandes_recues(), repondre_demande(text, boolean), chercher_joueurs(text) to authenticated;
