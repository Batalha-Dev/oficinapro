# Spec — Sistema de Gestão de Oficina Mecânica ("OficinaPro")

Data: 2026-11-09 · Disciplina: Laboratório de Programação (UNIFACVEST) · Prof. Willen L. Carneiro

## 1. Objetivo
Aplicação web local para uma pequena oficina mecânica registrar clientes, seus veículos e as ordens de serviço (OS), acompanhando cada OS num quadro kanban por status. Atende às diretrizes do Trabalho de Laboratório B (stack obrigatória, Docker, GitHub, documentação de uso de IA).

## 2. Fora de escopo (YAGNI)
Login/autenticação, deploy em nuvem, estoque de peças, pagamentos, emissão de nota fiscal, multi-oficina. Ficam como candidatos para a parte 2 do trabalho.

## 3. Stack e versões
| Camada | Tecnologia | Restrição |
|---|---|---|
| Runtime | Node.js | `engines.node: ">=22 <25"` |
| Backend | Express 4, nodemon (dev) | — |
| ORM | Prisma | migrações versionadas em `backend/prisma/migrations` |
| Banco | PostgreSQL **16** (`postgres:16-alpine`) via Docker Compose | nunca `latest` |
| Validação | zod | — |
| Frontend | React 18 + Vite + React Router | consome API via Fetch |
| Testes | Jest + supertest (backend) | banco de teste separado |

## 4. Estrutura do repositório
```
backend/   src/{routes,controllers,services,middlewares,validators,lib}  prisma/  tests/
frontend/  src/{pages,components,api}
docs/      arquitetura.md  kanban-prints/  superpowers/{specs,plans}
docker-compose.yml  README.md  DOCUMENTACAO_IA.md  .gitignore  .nvmrc
```

## 5. Modelo de dados
- **Cliente**: id, nome (obrig.), telefone (obrig.), email (opcional, único se informado), cpf (opcional, único, 11 dígitos), criadoEm.
- **Veiculo**: id, placa (única, maiúscula, formato `AAA9999` ou Mercosul `AAA9A99`), marca, modelo, ano (1950..ano atual+1), clienteId → Cliente.
- **OrdemServico**: id, veiculoId → Veiculo, descricaoProblema (obrig.), status (`ABERTA | EM_ANDAMENTO | CONCLUIDA | CANCELADA`, default ABERTA), abertaEm, concluidaEm (nullable).
- **ItemServico**: id, ordemId → OrdemServico (cascade delete), descricao, quantidade (int ≥1), valorUnitario (Decimal(10,2) ≥0).
- Relações: Cliente 1:N Veiculo 1:N OrdemServico 1:N ItemServico.

## 6. Regras de negócio
- RN1 Placa normalizada para maiúsculas sem hífen e validada pelos dois formatos.
- RN2 Cliente com veículos não pode ser excluído (409).
- RN3 Veículo com OS não pode ser excluído (409).
- RN4 Valor total da OS = Σ quantidade × valorUnitario, calculado no servidor (nunca enviado pelo cliente).
- RN5 Transições de status permitidas: ABERTA→EM_ANDAMENTO|CANCELADA; EM_ANDAMENTO→CONCLUIDA|CANCELADA. Demais → 422.
- RN6 OS CONCLUIDA ou CANCELADA não aceita edição nem itens novos (422).
- RN7 Ao concluir, `concluidaEm` é preenchido.

## 7. API REST (prefixo `/api`)
| Método | Rota | Sucesso |
|---|---|---|
| GET/POST | /clientes | 200 / 201 |
| GET/PUT/DELETE | /clientes/:id | 200 / 200 / 204 |
| GET/POST | /veiculos (`?clienteId=`) | 200 / 201 |
| GET/PUT/DELETE | /veiculos/:id | 200 / 200 / 204 |
| GET/POST | /ordens (`?status=`) | 200 / 201 |
| GET/PUT/DELETE | /ordens/:id | 200 / 200 / 204 |
| PATCH | /ordens/:id/status | 200 |
| POST | /ordens/:id/itens | 201 |
| DELETE | /ordens/:id/itens/:itemId | 204 |
| GET | /health | 200 |

Erros: JSON `{ "erro": string, "detalhes"?: [...] }`. 400 validação (zod), 404 não encontrado, 409 conflito (unicidade/RN2/RN3), 422 regra de negócio, 500 genérico sem vazar stack.

## 8. Arquitetura do backend
routes (só mapeamento) → controllers (HTTP: lê req, chama service, responde) → services (regras de negócio + Prisma) . Middleware `errorHandler` converte `AppError`, `ZodError` e erros Prisma (P2002→409, P2025→404). `app.js` exporta o app sem `listen` (testável); `server.js` sobe a porta (3333).

## 9. Frontend
Páginas: Painel (kanban de OS por status, com botões de avançar status), Clientes (lista + formulário), Veículos (lista + formulário com select de cliente), Ordem (detalhe com itens e total). Módulo `api/` centraliza fetch com tratamento de erro. Toda tela trata carregando / erro / vazio. Proxy do Vite `/api → localhost:3333`. Aparência final será refinada depois; base limpa e responsiva agora.

## 10. Testes e critérios de aceitação
- Testes de service para RN1–RN7 e testes de rota (supertest) para CRUD de clientes e fluxo de status da OS, rodando contra banco `oficina_test` no mesmo container.
- Aceitação: `docker compose up -d` + `npm run setup` + `npm run dev` sobem banco, API e frontend; `npm test` verde; seed popula dados de demonstração.

## 11. Gestão e documentação
Repositório GitHub público, Semantic Commits, GitHub Projects (Kanban: Todo / In Progress / Done) com issues por funcionalidade vinculadas aos commits, prints em `docs/kanban-prints/`. `DOCUMENTACAO_IA.md` com a tabela Problema / Prompts / Refinamento / Decisão para cada funcionalidade.
