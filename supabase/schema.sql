-- Ejecutar en Supabase > SQL Editor

create table weights (
  id          bigint generated always as identity primary key,
  kg          numeric(5,1) not null check (kg > 0),
  recorded_at timestamptz not null default now()
);

create table meals (
  id          bigint generated always as identity primary key,
  description text not null check (char_length(description) <= 500),
  eaten_at    timestamptz not null default now(),
  image_path  text   -- path dentro del bucket privado; la URL se firma en el servidor
);

create index on weights (recorded_at);
create index on meals (eaten_at desc);

-- RLS activado y SIN policies: nadie accede con la publishable key.
-- Solo el servidor de Next, con la secret key (saltea RLS), puede leer/escribir.
alter table weights enable row level security;
alter table meals   enable row level security;

-- Bucket PRIVADO para las fotos (se sirven con URLs firmadas desde el servidor).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('meal-images', 'meal-images', false, 10485760,
        array['image/jpeg','image/png','image/webp','image/heic','image/gif']);
