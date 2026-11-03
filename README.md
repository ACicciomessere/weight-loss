# Tracker de comidas y peso

Next.js + Supabase. El navegador no habla con Supabase: todo pasa por `/api/*` de Next,
que usa la secret key. El acceso es por link secreto (`/enter?k=<token>`), que deja
una cookie httpOnly; sin ella, todas las rutas devuelven 404.

Hay dos usuarios, cada uno con sus propios datos: `APP_TOKEN` entra como `user1` y
`AF_TOKEN` como `user2`.

```bash
cp .env.example .env.local   # completar SUPABASE_URL, SUPABASE_SECRET_KEY, APP_TOKEN y AF_TOKEN
yarn
yarn dev
# abrir http://localhost:3000/enter?k=<APP_TOKEN>
```

Base de datos: correr `supabase/schema.sql` en el SQL Editor si arrancás de cero.
Si ya tenías la base, correr las migraciones que falten, en orden:
`migrate-from-v1.sql` (solo desde la v1) y `migrate-users-satiety.sql` (usuarios y saciedad;
asigna todos los datos existentes a `user1`).

Deploy: importar el repo en Vercel y cargar las variables de `.env.example`
en Environment Variables.
