-- Separate from Portal leads and Dough Deck payroll. Matches requested link-access editing.
create table if not exists public.gg_hub_state (
  id text primary key check (id = 'operations'),
  payload jsonb not null check (jsonb_typeof(payload) = 'object'),
  revision bigint not null default 1,
  updated_at timestamptz not null default now()
);
alter table public.gg_hub_state enable row level security;
grant select on public.gg_hub_state to anon, authenticated;
revoke insert, update, delete on public.gg_hub_state from anon, authenticated;
drop policy if exists gg_hub_read on public.gg_hub_state;
create policy gg_hub_read on public.gg_hub_state for select to anon, authenticated using (true);

create or replace function public.gg_hub_save(expected_revision bigint, new_payload jsonb)
returns bigint language plpgsql security definer set search_path = public as $$
declare current_revision bigint;
begin
  if octet_length(new_payload::text) > 5000000 or jsonb_typeof(new_payload) <> 'object'
     or jsonb_typeof(new_payload->'items') is distinct from 'array'
     or jsonb_typeof(new_payload->'categories') is distinct from 'array'
     or jsonb_typeof(new_payload->'cards') is distinct from 'array'
  then raise exception 'Invalid hub content'; end if;
  perform pg_advisory_xact_lock(722105);
  select revision into current_revision from public.gg_hub_state where id='operations' for update;
  if coalesce(current_revision,0) <> expected_revision then raise exception 'GG_CONFLICT'; end if;
  if current_revision is null then
    insert into public.gg_hub_state(id,payload,revision) values('operations',new_payload,1);
    return 1;
  end if;
  update public.gg_hub_state set payload=new_payload, revision=current_revision+1, updated_at=now() where id='operations';
  return current_revision+1;
end;
$$;
revoke all on function public.gg_hub_save(bigint,jsonb) from public;
grant execute on function public.gg_hub_save(bigint,jsonb) to anon, authenticated;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('gg-hub-files','gg-hub-files',true,20971520,array['application/pdf','image/jpeg','image/png','image/webp','text/plain','text/csv','application/vnd.openxmlformats-officedocument.wordprocessingml.document','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'])
on conflict(id) do nothing;
drop policy if exists gg_hub_files_read on storage.objects;
drop policy if exists gg_hub_files_insert on storage.objects;
drop policy if exists gg_hub_files_delete on storage.objects;
create policy gg_hub_files_read on storage.objects for select to anon, authenticated using(bucket_id='gg-hub-files');
create policy gg_hub_files_insert on storage.objects for insert to anon, authenticated with check(bucket_id='gg-hub-files');
create policy gg_hub_files_delete on storage.objects for delete to anon, authenticated using(bucket_id='gg-hub-files');
