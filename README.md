# NexusERP 🏢

Sistema de gestión empresarial (ERP) moderno construido con un stack full stack de nivel producción.

## Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | Next.js 14 (App Router + Server Components) |
| Backend | NestJS 10 (Arquitectura modular) |
| Base de datos | PostgreSQL 16 |
| ORM | Prisma 7 |
| Autenticación | Auth.js + JWT |
| Estilos | TailwindCSS |
| Contenedores | Docker + Docker Compose |
| Lenguaje | TypeScript (modo estricto) |

## Módulos del sistema

- **Autenticación** — Registro, login, roles (Admin, Empleado, Viewer)
- **Clientes** — CRUD completo con auditoría
- **Facturación** — Generación de facturas con exportación PDF
- **Reportes** — Dashboard con métricas y gráficas

## Requisitos previos

- [Node.js 20+](https://nodejs.org)
- [Docker Desktop](https://www.docker.com/products/docker-desktop)

## Instalación y uso

```bash
# 1. Clonar el repositorio
git clone https://github.com/AlejandroAngeles-dev/Nexus-erp.git
cd Nexus-erp

# 2. Levantar la base de datos
docker compose up -d

# 3. Instalar dependencias del backend
cd apps/api
npm install

# 4. Configurar variables de entorno
cp .env.example .env
# Edita .env con tus valores

# 5. Ejecutar migraciones
npx prisma migrate dev

# 6. Levantar el backend
npm run start:dev
```

## Variables de entorno

Crea un archivo `.env` en `apps/api/` basándote en `.env.example`:

```env
DATABASE_URL="postgresql://nexus_admin:TU_PASSWORD@localhost:5432/nexuserp_dev"
JWT_SECRET="tu-secret-key"
```



## Fases de desarrollo

- [x] Fase 1 — Cimientos: Docker, PostgreSQL, NestJS, Prisma
- [ ] Fase 2 — Autenticación: Auth.js, JWT, roles
- [ ] Fase 3 — Módulos de negocio: Clientes, Facturación
- [ ] Fase 4 — Frontend: Dashboard, gráficas, exportación
- [ ] Fase 5 — Deploy: CI/CD, producción

## Autor

**Alejandro Ángeles** — [GitHub](https://github.com/AlejandroAngeles-dev)