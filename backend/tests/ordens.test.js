const request = require('supertest');
const app = require('../src/app');
const { podeTransitar } = require('../src/services/statusOS');
const { prisma, limparBanco, criarCliente, criarVeiculo } = require('./helpers');

beforeEach(limparBanco);
afterAll(() => prisma.$disconnect());

async function criarOS(itens = []) {
  const c = await criarCliente();
  const v = await criarVeiculo(c.id);
  const res = await request(app)
    .post('/api/ordens')
    .send({ veiculoId: v.id, descricaoProblema: 'Motor falhando', itens });
  return res.body;
}

const status = (id, s) => request(app).patch(`/api/ordens/${id}/status`).send({ status: s });

describe('RN5: máquina de estados', () => {
  test.each([
    ['ABERTA', 'EM_ANDAMENTO', true],
    ['ABERTA', 'CANCELADA', true],
    ['ABERTA', 'CONCLUIDA', false],
    ['EM_ANDAMENTO', 'CONCLUIDA', true],
    ['EM_ANDAMENTO', 'CANCELADA', true],
    ['EM_ANDAMENTO', 'ABERTA', false],
    ['CONCLUIDA', 'ABERTA', false],
    ['CANCELADA', 'EM_ANDAMENTO', false],
  ])('%s -> %s = %s', (de, para, esperado) => {
    expect(podeTransitar(de, para)).toBe(esperado);
  });
});

describe('API /ordens', () => {
  test('RN4: valor total calculado no servidor (valor em string)', async () => {
    const os = await criarOS([
      { descricao: 'Óleo', quantidade: 4, valorUnitario: '10.50' },
      { descricao: 'Mão de obra', valorUnitario: 80 },
    ]);
    expect(os.status).toBe('ABERTA');
    expect(os.valorTotal).toBe(122);
    expect(os.veiculo.cliente.nome).toBe('Cliente Teste');
  });

  test('veículo inexistente retorna 404', async () => {
    const res = await request(app).post('/api/ordens').send({ veiculoId: 999999, descricaoProblema: 'Teste' });
    expect(res.status).toBe(404);
  });

  test('pular de ABERTA para CONCLUIDA retorna 422', async () => {
    const os = await criarOS();
    expect((await status(os.id, 'CONCLUIDA')).status).toBe(422);
  });

  test('RN7: concluir preenche concluidaEm', async () => {
    const os = await criarOS();
    await status(os.id, 'EM_ANDAMENTO');
    const res = await status(os.id, 'CONCLUIDA');
    expect(res.status).toBe(200);
    expect(res.body.concluidaEm).not.toBeNull();
  });

  test('status inválido retorna 400', async () => {
    const os = await criarOS();
    expect((await status(os.id, 'PERDIDA')).status).toBe(400);
  });

  test('RN6: adicionar item em OS concluída retorna 422', async () => {
    const os = await criarOS();
    await status(os.id, 'EM_ANDAMENTO');
    await status(os.id, 'CONCLUIDA');
    const res = await request(app).post(`/api/ordens/${os.id}/itens`).send({ descricao: 'Extra', valorUnitario: 10 });
    expect(res.status).toBe(422);
  });

  test('adiciona e remove item recalculando o total', async () => {
    const os = await criarOS();
    const add = await request(app)
      .post(`/api/ordens/${os.id}/itens`)
      .send({ descricao: 'Vela', quantidade: 4, valorUnitario: 25.25 });
    expect(add.status).toBe(201);
    expect(add.body.valorTotal).toBe(101);
    const itemId = add.body.itens[0].id;
    expect((await request(app).delete(`/api/ordens/${os.id}/itens/${itemId}`)).status).toBe(204);
    expect((await request(app).get(`/api/ordens/${os.id}`)).body.valorTotal).toBe(0);
  });

  test('filtra por status', async () => {
    const a = await criarOS();
    await status(a.id, 'CANCELADA');
    const res = await request(app).get('/api/ordens?status=CANCELADA');
    expect(res.body).toHaveLength(1);
    expect((await request(app).get('/api/ordens?status=XYZ')).status).toBe(400);
  });

  test('RN6: OS cancelada não pode ser excluída', async () => {
    const os = await criarOS();
    await status(os.id, 'CANCELADA');
    expect((await request(app).delete(`/api/ordens/${os.id}`)).status).toBe(422);
  });

  test('IDs e quantidades fora do limite retornam 400, não 500', async () => {
    expect((await request(app).get('/api/ordens/99999999999')).status).toBe(400);
    const r = await request(app).post('/api/ordens').send({ veiculoId: 99999999999, descricaoProblema: 'abc' });
    expect(r.status).toBe(400);
    const os = await criarOS();
    const item = await request(app)
      .post(`/api/ordens/${os.id}/itens`)
      .send({ descricao: 'X', quantidade: 3000000000, valorUnitario: 1 });
    expect(item.status).toBe(400);
  });

  test('rota inexistente retorna 404 em JSON', async () => {
    const res = await request(app).get('/api/nada');
    expect(res.status).toBe(404);
    expect(res.body.erro).toBeDefined();
  });
});
