-- Migración: usuarios (APP_TOKEN = user1, AF_TOKEN = user2) + saciedad por comida.
-- Correr UNA vez en Supabase > SQL Editor, ANTES de deployar el código nuevo.
-- Todo va en una transacción: si algo falla, no queda nada a medias.
begin;

create table users (
  id   text primary key,
  name text not null
);
alter table users enable row level security;

insert into users (id, name) values
  ('user1', 'user1'),  -- el que entra con APP_TOKEN (todos los datos actuales)
  ('user2', 'user2');  -- el que entra con AF_TOKEN

-- El default 'user1' rellena todas las filas existentes; después se saca
-- para que cada insert nuevo tenga que decir explícitamente de quién es.
alter table weights add column user_id text not null default 'user1' references users(id);
alter table meals   add column user_id text not null default 'user1' references users(id);
alter table weights alter column user_id drop default;
alter table meals   alter column user_id drop default;

create index on weights (user_id, recorded_at);
create index on meals   (user_id, eaten_at desc);

-- Saciedad 1–5. Nullable: las comidas cargadas antes no la tienen.
alter table meals add column satiety smallint check (satiety between 1 and 5);

commit;
