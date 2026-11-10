const request = require('supertest');
const app = require('../src/app');
const { hashSenha } = require('../src/services/authService');
const { prisma, api, limparBanco, criarCliente, criarVeiculo } = require('./helpers');

beforeAll(async () => {
  await prisma.usuario.deleteMany();
  await prisma.usuario.create({
    data: { nome: 'Mecânico', email: 'mecanico@teste.com', senhaHash: await hashSenha('senha123') },
  });
});
beforeEach(limparBanco);
afterAll(() => prisma.$disconnect());

describe('autenticação', () => {
  test('login correto devolve token e dados do usuário sem a senha', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'MECANICO@teste.com', senha: 'senha123' });
    expect(res.status).toBe(200);
    expect(res.body.token).toEqual(expect.any(String));
    expect(res.body.usuario).toEqual({ id: expect.any(Number), nome: 'Mecânico', email: 'mecanico@teste.com' });
  });

  test('senha errada e e-mail inexistente dão a mesma resposta 401', async () => {
    const a = await request(app).post('/api/auth/login').send({ email: 'mecanico@teste.com', senha: 'errada' });
    const b = await request(app).post('/api/auth/login').send({ email: 'ninguem@teste.com', senha: 'senha123' });
    expect([a.status, b.status]).toEqual([401, 401]);
    expect(a.body.erro).toBe(b.body.erro);
  });

  test('rotas de negócio sem token retornam 401', async () => {
    expect((await request(app).get('/api/clientes')).status).toBe(401);
    expect((await request(app).get('/api/ordens').set('Authorization', 'Bearer invalido')).status).toBe(401);
  });

  test('health continua público', async () => {
    expect((await request(app).get('/api/health')).status).toBe(200);
  });

  test('GET /auth/eu devolve o usuário do token', async () => {
    const res = await api().get('/api/auth/eu');
    expect(res.body.nome).toBe('Teste');
  });
});

describe('histórico e resumo', () => {
  test('filtra ordens por veículo (histórico)', async () => {
    const c = await criarCliente();
    const v1 = await criarVeiculo(c.id, { placa: 'AAA1A11' });
    const v2 = await criarVeiculo(c.id, { placa: 'BBB2B22' });
    await api().post('/api/ordens').send({ veiculoId: v1.id, descricaoProblema: 'Freio' });
    await api().post('/api/ordens').send({ veiculoId: v2.id, descricaoProblema: 'Motor' });
    const res = await api().get(`/api/ordens?veiculoId=${v1.id}`);
    expect(res.body.map((o) => o.descricaoProblema)).toEqual(['Freio']);
  });

  test('resumo soma o faturamento das OS concluídas no mês', async () => {
    const c = await criarCliente();
    const v = await criarVeiculo(c.id);
    const os = (
      await api()
        .post('/api/ordens')
        .send({
          veiculoId: v.id,
          descricaoProblema: 'Revisão',
          itens: [{ descricao: 'Óleo', quantidade: 2, valorUnitario: 50 }],
        })
    ).body;
    await api().post('/api/ordens').send({ veiculoId: v.id, descricaoProblema: 'Aberta' });
    await api().patch(`/api/ordens/${os.id}/status`).send({ status: 'EM_ANDAMENTO' });
    await api().patch(`/api/ordens/${os.id}/status`).send({ status: 'CONCLUIDA' });

    const res = await api().get('/api/resumo');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      porStatus: { ABERTA: 1, EM_ANDAMENTO: 0, CONCLUIDA: 1, CANCELADA: 0 },
      concluidasNoMes: 1,
      faturamentoMes: 100,
      ticketMedio: 100,
    });
  });
});
