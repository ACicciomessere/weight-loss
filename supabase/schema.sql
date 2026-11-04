-- Ejecutar en Supabase > SQL Editor (instalación desde cero).
-- Si ya tenías la base, usar los archivos migrate-*.sql en su lugar.

create table users (
  id   text primary key,
  name text not null
);

insert into users (id, name) values
  ('user1', 'user1'),  -- entra con APP_TOKEN
  ('user2', 'user2');  -- entra con AF_TOKEN

create table weights (
  id          bigint generated always as identity primary key,
  user_id     text not null references users(id),
  kg          numeric(5,1) not null check (kg > 0),
  recorded_at timestamptz not null default now()
);

create table meals (
  id          bigint generated always as identity primary key,
  user_id     text not null references users(id),
  description text not null check (char_length(description) <= 500),
  hunger      smallint check (hunger between 1 and 5),   -- hambre al llegar (opcional)
  satiety     smallint check (satiety between 1 and 5),  -- saciedad después (opcional)
  eaten_at    timestamptz not null default now(),
  image_path  text   -- path dentro del bucket privado; la URL se firma en el servidor
);

create index on weights (user_id, recorded_at);
create index on meals (user_id, eaten_at desc);

-- RLS activado y SIN policies: nadie accede con la publishable key.
-- Solo el servidor de Next, con la secret key (saltea RLS), puede leer/escribir.
alter table users   enable row level security;
alter table weights enable row level security;
alter table meals   enable row level security;

-- Bucket PRIVADO para las fotos (se sirven con URLs firmadas desde el servidor).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('meal-images', 'meal-images', false, 10485760,
        array['image/jpeg','image/png','image/webp','image/heic','image/gif']);
