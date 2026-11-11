-- Classement public : pseudo + total uniquement (contourne la RLS de façon contrôlée)
create or replace function leaderboard()
returns table (username text, total int)
language sql stable security definer set search_path = public as $$
  select p.username, coalesce(sum(t.amount), 0)::int
  from profiles p left join point_transactions t on t.user_id = p.id
  where p.username is not null
  group by p.username order by 2 desc limit 50
$$;
grant execute on function leaderboard() to authenticated;
