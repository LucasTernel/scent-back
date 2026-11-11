-- Scans par jour sur les 14 derniers jours (jours vides inclus), admin uniquement
create function admin_scans_par_jour() returns table (jour date, scans int)
language plpgsql stable security definer set search_path = public as $$
begin
  if not is_admin() then raise exception 'réservé aux admins'; end if;
  return query
    select d::date, (select count(*)::int from captures c where c.created_at::date = d::date)
    from generate_series(current_date - 13, current_date, interval '1 day') d order by 1;
end $$;
grant execute on function admin_scans_par_jour() to authenticated;
