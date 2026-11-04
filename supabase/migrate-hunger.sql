-- Migración: nivel de hambre (1–5) con el que se llega a cada comida.
-- Correr UNA vez en Supabase > SQL Editor, después de migrate-users-satiety.sql
-- y ANTES de deployar el código nuevo. Opcional, como la saciedad.
alter table meals add column hunger smallint check (hunger between 1 and 5);
