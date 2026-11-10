# Roteiro da apresentação (10 minutos)

## Antes de entrar na sala (checklist)

- [ ] Docker Desktop aberto e "Engine running".
- [ ] `npm run demo:reset` (ou `powershell -File scripts\reset-demo.ps1`). Banco limpo, OS de #1 a #5.
- [ ] `npm run dev`, com http://localhost:5173 aberto e **deslogado**.
- [ ] Abas abertas: o app, o [kanban do GitHub](https://github.com/users/Batalha-Dev/projects/2/views/2), o [histórico de commits](https://github.com/Batalha-Dev/oficinapro/commits/main) e o `DOCUMENTACAO_IA.md`.
- [ ] Um terminal pronto na raiz para rodar `npm test`.

## Sequência

| Tempo | Quem | O que mostrar | O que falar |
|---|---|---|---|
| 0:00–1:00 | Pessoa A | Tela de login → entrar com `mecanico@oficinapro.com` / `oficina123` | O problema: oficinas pequenas controlam OS no papel ou no WhatsApp. O OficinaPro acompanha cada carro do diagnóstico à entrega. |
| 1:00–3:00 | Pessoa A | Painel: números do mês, **buscar "hb20"**, **arrastar** a OS #4 de Aberta para Em andamento | As colunas que não aceitam o card ficam apagadas, porque o fluxo de status (RN5) é validado no front **e** no back. |
| 3:00–4:00 | Pessoa A | Abrir a OS #4 → adicionar "Carga de gás" R$ 150 → total recalculado → Concluir | O total é calculado **no servidor**, em centavos. OS concluída vira somente leitura (RN6). |
| 4:00–5:00 | Pessoa B | Clientes → tentar excluir **Ana Souza** → mensagem de erro | Regra RN2: o banco também protege com `onDelete: Restrict`. |
| 5:00–5:30 | Pessoa B | Veículos → "Histórico" do Gol (MKT-4B21) | A linha do tempo de todas as OS do carro. |
| 5:30–7:00 | Pessoa B | VS Code: `routes → controllers → services`; `docker-compose.yml` (postgres:16); terminal `npm test` (73 testes) | Separação de responsabilidades; versões dentro do limite exigido; testes automatizados. |
| 7:00–8:30 | Pessoa A | GitHub: kanban com as issues fechadas, commits semânticos (`Closes #n`), selo verde da CI | Gestão ágil integrada ao código. A CI roda os testes em Node 22 e 24 a cada push. |
| 8:30–10:00 | Pessoa B | `DOCUMENTACAO_IA.md`: os itens 4, 7 e 11 | Postura crítica: o Docker que não subia, os testes que falhavam por causa do Jest, o bug que só apareceu no clone limpo. A IA errou, e nós revisamos e corrigimos. |

## Plano B

| Problema na hora | Ação |
|---|---|
| Dados bagunçados ou IDs diferentes | `npm run demo:reset` (≈ 20 s) |
| Docker não sobe | Mostrar os prints em `docs/telas/` e explicar o caso do socket órfão (item 4 da documentação de IA) |
| Porta 3333 ou 5173 ocupada | Fechar outros terminais (`npx kill-port 3333 5173`) e rodar `npm run dev` de novo |
| Esqueceu a senha | Está no README, seção "Como rodar" |
