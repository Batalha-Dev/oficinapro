# OficinaPro Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Sistema local de gestão de oficina mecânica (clientes, veículos, ordens de serviço com kanban).

**Architecture:** Monorepo com `backend/` (Express + Prisma, camadas routes→controllers→services, errorHandler central) e `frontend/` (React + Vite consumindo `/api` via proxy). PostgreSQL 16 em Docker Compose com bancos `oficina` e `oficina_test`.

**Tech Stack:** Node 22–24, Express 4, Prisma 6, zod 3, Jest 29 + supertest, React 18, Vite 5, React Router 6, Docker Compose, postgres:16-alpine.

**Spec:** `docs/superpowers/specs/2026-11-09-oficina-mecanica-design.md`

## Global Constraints
- `engines.node: ">=22 <25"` em todos os package.json; `.nvmrc` = `22`.
- Imagem `postgres:16-alpine` (nunca `latest`).
- nodemon no script `dev` do backend; porta API 3333; frontend 5173.
- Erros sempre `{ "erro": string, "detalhes"?: [] }`; status 400/404/409/422/500 conforme spec §7.
- Semantic Commits em português.

## Review Focus
- IDs não numéricos (`/clientes/abc`) → 400, não 500. Teste em Task 3.
- Placa com hífen/minúscula (`abc-1d23`) → aceita e normaliza `ABC1D23`. Teste em Task 2.
- Email vazio `""` no cliente → tratado como ausente, não viola unicidade. Teste em Task 3.
- Duplicata de placa/cpf → 409 com mensagem legível. Teste em Task 3/4.
- Valor monetário enviado como string `"10.50"` → coerção para número. Teste em Task 5.

---

### Task 1: Infra (Docker, Prisma schema, scripts)
**Files:** Create `docker-compose.yml`, `docker/init-test-db.sql`, `.gitignore`, `.nvmrc`, `package.json` (raiz, scripts que delegam), `backend/package.json`, `backend/.env.example`, `backend/prisma/schema.prisma`, `backend/prisma/seed.js`.
- [ ] Compose: serviço `db` postgres:16-alpine, porta 5432, volume nomeado `pgdata`, healthcheck `pg_isready`, init script cria `oficina_test`.
- [ ] Schema com modelos e enum `StatusOS` exatamente como spec §5 (Decimal(10,2), cascade em ItemServico).
- [ ] `docker compose up -d` → healthy; `npx prisma migrate dev --name init` cria migração.
- [ ] Seed: 3 clientes, 4 veículos, 5 OS em status variados com itens.
- [ ] Commit `chore: configura docker, prisma e estrutura do backend`.

### Task 2: Núcleo (AppError, errorHandler, validators, app)
**Files:** `backend/src/lib/{prisma.js,AppError.js}`, `backend/src/middlewares/errorHandler.js`, `backend/src/validators/{common.js,cliente.js,veiculo.js,ordem.js}`, `backend/src/app.js`, `backend/src/server.js`, `backend/tests/validators.test.js`.
**Produces:** `AppError(status:number, mensagem:string)`; `normalizarPlaca(s):string`; schemas zod `clienteSchema`, `veiculoSchema`, `ordemSchema`, `itemSchema`, `statusSchema`, `idParam`.
- [ ] Testes: `normalizarPlaca('abc-1d23') === 'ABC1D23'`; `veiculoSchema` rejeita `'AB12345'`; aceita `ABC1234` e `ABC1D23`; ano 1949 rejeitado.
- [ ] Implementar; errorHandler mapeia ZodError→400, AppError→status, Prisma P2002→409, P2025→404, resto→500.
- [ ] Commit `feat: adiciona validacoes e tratamento central de erros`.

### Task 3: Clientes (service, controller, rotas)
**Files:** `backend/src/{services,controllers,routes}/cliente*.js`, `backend/tests/clientes.test.js`, `backend/tests/setup.js` (limpa tabelas, usa `DATABASE_URL` de teste).
- [ ] Testes supertest: POST 201; GET lista; GET /abc → 400; GET /999 → 404; cpf duplicado → 409; email `""` duas vezes → 201; DELETE com veículo → 409 (RN2).
- [ ] Implementar; rodar `npm test`; commit `feat: cria CRUD de clientes`.

### Task 4: Veículos
**Files:** `backend/src/{services,controllers,routes}/veiculo*.js`, `backend/tests/veiculos.test.js`.
- [ ] Testes: placa normalizada no POST; placa duplicada → 409; clienteId inexistente → 404; filtro `?clienteId=`; DELETE com OS → 409 (RN3).
- [ ] Implementar; commit `feat: cria CRUD de veiculos`.

### Task 5: Ordens de serviço e itens
**Files:** `backend/src/{services,controllers,routes}/ordem*.js`, `backend/src/services/statusOS.js`, `backend/tests/ordens.test.js`.
**Produces:** `podeTransitar(de, para):boolean`; resposta de OS inclui `valorTotal:number` e `veiculo.cliente`.
- [ ] Testes: `podeTransitar` (RN5 tabela completa); valorTotal = Σ (RN4) com `valorUnitario:"10.50"`; ABERTA→CONCLUIDA → 422; concluir preenche `concluidaEm` (RN7); adicionar item em CONCLUIDA → 422 (RN6); filtro `?status=`.
- [ ] Implementar; commit `feat: cria ordens de servico com fluxo de status`.

### Task 6: Frontend
**Files:** `frontend/{package.json,vite.config.js,index.html}`, `frontend/src/{main.jsx,App.jsx,styles.css}`, `frontend/src/api/client.js`, `frontend/src/components/{Estado.jsx,Layout.jsx}`, `frontend/src/pages/{Painel,Clientes,Veiculos,OrdemDetalhe}.jsx`.
**Consumes:** API Tasks 3–5. `api.get/post/put/patch/del(path, body?)` lança `Error(erro)` com mensagem do servidor.
- [ ] Proxy `/api → http://localhost:3333`.
- [ ] Painel: 4 colunas por status, cards com placa/cliente/total, botões de transição válidos, botão nova OS.
- [ ] Clientes/Veículos: tabela + formulário criar/editar/excluir com mensagem de erro do servidor.
- [ ] OrdemDetalhe: itens, adicionar/remover item, total.
- [ ] `npm run build` sem erros; verificação manual no navegador; commit `feat: cria frontend react com kanban de ordens`.

### Task 7: Documentação e GitHub
- [ ] `README.md` (pré-requisitos, passo a passo, scripts), `docs/arquitetura.md`, `DOCUMENTACAO_IA.md` (tabela por funcionalidade com prompts reais).
- [ ] Repositório `oficinapro` público, push; GitHub Project kanban com issues por task, fechadas pelos commits; prints em `docs/kanban-prints/`.
- [ ] Commit `docs: adiciona readme, arquitetura e documentacao de ia`.
