-- Solo si ya habías corrido el schema anterior (con policies anon y bucket público).
drop policy if exists "anon all" on weights;
drop policy if exists "anon all" on meals;
drop policy if exists "anon upload" on storage.objects;
drop policy if exists "anon read"   on storage.objects;
drop policy if exists "anon delete" on storage.objects;

update storage.buckets
set public = false, file_size_limit = 10485760,
    allowed_mime_types = array['image/jpeg','image/png','image/webp','image/heic','image/gif']
where id = 'meal-images';

alter table meals rename column image_url to image_path;
-- convertir URLs públicas viejas en paths
update meals set image_path = split_part(image_path, '/meal-images/', 2) where image_path like 'http%';

alter table meals drop constraint if exists description_len;
alter table meals add constraint description_len check (char_length(description) <= 500);
