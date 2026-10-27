# Tracker de comidas y peso

Next.js + Supabase. El navegador no habla con Supabase: todo pasa por `/api/*` de Next,
que usa la secret key. El acceso es por link secreto (`/enter?k=APP_TOKEN`), que deja
una cookie httpOnly; sin ella, todas las rutas devuelven 404.

```bash
cp .env.example .env.local   # completar SUPABASE_URL, SUPABASE_SECRET_KEY y APP_TOKEN
yarn
yarn dev
# abrir http://localhost:3000/enter?k=<APP_TOKEN>
```

Base de datos: correr `supabase/schema.sql` en el SQL Editor (o `migrate-from-v1.sql`
si ya tenías la versión anterior).

Deploy: importar el repo en Vercel y cargar las tres variables de `.env.example`
en Environment Variables.
