-- Boutique : échanger ses points contre un lot → un bon à présenter au pop-up store
create table commandes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles on delete cascade,
  reward_id uuid not null references rewards on delete cascade,
  code text unique not null default upper(substr(md5(random()::text), 1, 6)),
  retire boolean not null default false,
  created_at timestamptz not null default now()
);
alter table commandes enable row level security;
create policy "mes bons" on commandes for select using (user_id = auth.uid());

-- Échange atomique : solde suffisant + stock dispo → débit des points, stock -1, bon créé
create function echanger_lot(lot uuid) returns json
language plpgsql security definer set search_path = public as $$
declare r rewards; solde int; c commandes;
begin
  if auth.uid() is null then raise exception 'connexion requise'; end if;
  select * into r from rewards where id = lot for update;
  if not found then raise exception 'lot introuvable'; end if;
  if r.stock <= 0 then raise exception 'rupture de stock'; end if;
  select coalesce(sum(amount), 0) into solde from point_transactions where user_id = auth.uid();
  if solde < r.cost then raise exception 'points insuffisants'; end if;
  update rewards set stock = stock - 1 where id = lot;
  insert into point_transactions (user_id, amount, source, note) values (auth.uid(), -r.cost, 'reward', r.name);
  insert into commandes (user_id, reward_id) values (auth.uid(), lot) returning * into c;
  return json_build_object('code', c.code, 'lot', r.name);
end $$;
grant execute on function echanger_lot(uuid) to authenticated;
