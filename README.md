# Neuro Play Backend

Backend Next.js + Prisma para o sistema IPTV Neuro Play.

## Stack

- **Next.js 14** (App Router, API Routes)
- **Prisma 6** (ORM, MySQL)
- **TailwindCSS 3** + **shadcn/ui** (Painéis Admin/Provedor)
- **jsonwebtoken** + **bcryptjs** (Auth)
- **Docker** + **Traefik** (Deploy)

## Setup Local

```bash
# 1. Instalar dependências
npm install

# 2. Copiar .env.example para .env e configurar
cp .env.example .env

# 3. Gerar Prisma Client
npx prisma generate

# 4. Rodar migrations
npx prisma db push

# 5. Seed (admin + settings + avatares)
npm run db:seed

# 6. Dev server
npm run dev
```

## Scripts

| Comando | Descrição |
|---|---|
| `npm run dev` | Dev server (porta 3000) |
| `npm run build` | Build produção |
| `npm run start` | Start produção |
| `npm run db:push` | Push schema para DB |
| `npm run db:generate` | Gerar Prisma Client |
| `npm run db:studio` | Abrir Prisma Studio |
| `npm run db:seed` | Rodar seed |

## Deploy (Docker)

```bash
docker-compose up -d --build
```

## Estrutura

```
src/
├── app/
│   ├── api/          # API Routes (backend)
│   ├── admin/        # Painel Admin (React)
│   └── provedor/     # Painel Provedor (React)
├── lib/
│   ├── prisma.ts     # Singleton Prisma
│   ├── auth.ts       # JWT + bcrypt
│   └── cache.ts      # Cache em memória
├── middleware.ts      # CORS + security headers
└── types/
    └── index.ts      # Tipos compartilhados
```
