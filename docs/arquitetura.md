# Arquitetura — OficinaPro

## Visão geral

```
Navegador (React, :5173)
   │  fetch /api/...   (proxy do Vite em desenvolvimento)
   ▼
Express (:3333)   middleware autenticar (JWT) protege tudo exceto /auth e /health
   routes → controllers → services → Prisma Client
   │                                      │
   └── errorHandler (erros → JSON)        ▼
                                PostgreSQL 16 (Docker, :5432)
                                bancos: oficina / oficina_test
```

## Por que estas camadas

| Camada | Responsabilidade | Não pode |
|---|---|---|
| `routes/` | Mapear verbo + URL para um controller | Ter lógica |
| `controllers/` | Ler `req`, validar com zod, chamar o service, responder com o status HTTP certo | Acessar o banco |
| `services/` | Regras de negócio (RN1–RN7) e acesso via Prisma | Conhecer `req`/`res` |
| `validators/` | Schemas zod (formato dos dados, normalização de placa/CPF) | Consultar o banco |
| `middlewares/errorHandler` | Traduzir `ZodError` → 400, `AppError` → status próprio, erros do Prisma (P2002 → 409, P2025 → 404) e o resto → 500 sem vazar detalhes | — |

Com essa separação, as regras ficam num lugar só e podem ser testadas, e trocar o framework HTTP não afeta os services.

## Modelo de dados

```
Cliente 1 ── N Veiculo 1 ── N OrdemServico 1 ── N ItemServico
```

- `Veiculo → Cliente` e `OrdemServico → Veiculo` usam `onDelete: Restrict`. Além da checagem no service (que dá uma mensagem amigável), o banco também impede apagar o histórico.
- `ItemServico → OrdemServico` usa `onDelete: Cascade`: apagar a OS remove os itens.
- O valor é `Decimal(10,2)` no banco. O total é somado em centavos inteiros para evitar erro de ponto flutuante.

## Decisões de engenharia

| Decisão | Motivo |
|---|---|
| Total da OS calculado no servidor, nunca enviado pelo cliente | Impede manipular o valor pelo navegador (segurança/consistência). |
| Máquina de estados em `statusOS.js` | Regra pura, testável sem banco; o frontend espelha só para decidir os botões, e quem valida é o backend. |
| `app.js` separado de `server.js` | Permite que o supertest use o app sem abrir porta. |
| Banco `oficina_test` criado por script de init do Docker | Os testes nunca apagam os dados de demonstração. |
| Express 5 | Repassa erros de funções `async` ao errorHandler sem `try/catch` em cada controller. |
| Proxy do Vite para `/api` | Evita configurar CORS e URLs absolutas no frontend. |
| Componente `Crud` genérico no frontend | Clientes e Veículos compartilham lista, modal, erro e exclusão; só mudam colunas e formulário. |
| Login com JWT no cabeçalho `Authorization` (não cookie) | É stateless e simples de testar com supertest. Expira em 8 h (um turno). O token fica no `localStorage`; com XSS seria vulnerável, mas o React escapa todo o texto renderizado e não usamos `dangerouslySetInnerHTML`. |
| Mesma mensagem para e-mail inexistente e senha errada | Não revela quais e-mails estão cadastrados. |
| Middleware `autenticar` aplicado no roteador, depois de `/auth` | Uma linha protege todas as rotas de negócio; uma rota nova já nasce protegida. |
| Busca e "pode soltar aqui?" em `frontend/src/lib/kanban.js` | Funções puras, testadas com Vitest sem renderizar nada. |
| Seed com `TRUNCATE … RESTART IDENTITY` | A demonstração sempre começa na OS #1. |
| CI em Node 22 **e** 24 | Prova que o projeto roda nos dois extremos da faixa de versão exigida. |
| Estilos em tokens CSS (`:root`) | O visual pode ser refinado depois trocando apenas variáveis. |
