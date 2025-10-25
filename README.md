# SkVoid Marketplace

Plataforma full-stack (Next.js + Express) para marketplace gamer com carteira interna, integrações Mercado Pago e foco em segurança antifraude.

## Estrutura

- `apps/frontend` – Frontend Next.js + Tailwind (tema dark LED azul).
- `apps/backend` – API Node.js/Express com Prisma, PostgreSQL e Redis.
- `docs` – OpenAPI, Postman collection e UI kit.

## Pré-requisitos

- Node.js 18+
- PostgreSQL e Redis acessíveis
- pnpm ou npm com suporte a workspaces

## Configuração

1. Copie os arquivos `.env.example` para `.env` nas pastas `apps/backend` e `apps/frontend` e preencha as variáveis obrigatórias (ver lista na especificação).
2. Instale dependências na raiz: `npm install`
3. Execute as migrações e seeds do backend:
   ```bash
   cd apps/backend
   npx prisma migrate deploy
   npx prisma db seed
   ```
4. Inicie backend e frontend simultaneamente na raiz:
   ```bash
   npm run dev
   ```

## Scripts principais

- `npm run build` – build frontend e backend
- `npm run start` – inicia somente o backend compilado
- `npm run test` – roda testes unitários e E2E mínimos

## Banco de dados

O schema Prisma cobre usuários, carteira, transações, anúncios, ordens, tickets, chat, auditoria, planos de assinatura, bans e eventos de risco. Seeds geram 20 usuários, 30+ anúncios e 10 ordens concluídas.

## Documentação & Collections

- OpenAPI JSON: `apps/backend/docs/openapi.json`
- Postman collection: `docs/postman_collection.json`
- UI kit: `docs/ui-kit.md`

## CI

GitHub Actions (`.github/workflows/ci.yml`) executa lint, build e testes.

## Deploy na plataforma builder

Configure variáveis de ambiente indicadas e utilize os scripts `npm run build` seguido de `npm run start`. Mantenha o webhook público `/webhooks/mp` exposto.

### Migração entre ambientes

- Ajuste as variáveis `DB_URL`, `REDIS_URL` e chaves do Mercado Pago conforme o ambiente.
- Execute `npm run build` e `npm run start` após atualizar secrets.
- Utilize `npm run migrate:deploy --workspace apps/backend` para aplicar migrações no ambiente de produção.
