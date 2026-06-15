# Variables de entorno para producción

## Backend (Railway) — apps/api

| Variable | Valor | Origen |
|---|---|---|
| `DATABASE_URL` | Generada automáticamente | Railway (al agregar PostgreSQL) |
| `JWT_SECRET` | String aleatorio de 64+ caracteres | Generar manualmente |
| `JWT_EXPIRES_IN` | `7d` | Manual |
| `FRONTEND_URL` | `https://tu-proyecto.vercel.app` | Después del deploy en Vercel |
| `NODE_ENV` | `production` | Manual |

## Frontend (Vercel) — apps/web

| Variable | Valor | Origen |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `https://tu-proyecto.up.railway.app/api` | Después del deploy en Railway |

## Orden recomendado de deploy

1. Railway: crear proyecto + PostgreSQL + backend (sin `FRONTEND_URL` todavía)
2. Copiar la URL pública del backend de Railway
3. Vercel: crear proyecto con `NEXT_PUBLIC_API_URL` = URL de Railway
4. Copiar la URL de Vercel
5. Railway: agregar `FRONTEND_URL` = URL de Vercel y redeploy