const request = require('supertest');
const app = require('../src/app');
const { prisma, limparBanco, criarCliente, criarVeiculo } = require('./helpers');

beforeEach(limparBanco);
afterAll(() => prisma.$disconnect());

const novo = (clienteId, extra = {}) => ({ placa: 'abc-1d23', marca: 'Fiat', modelo: 'Argo', ano: 2022, clienteId, ...extra });

describe('API /veiculos', () => {
  test('RN1: POST normaliza a placa', async () => {
    const c = await criarCliente();
    const res = await request(app).post('/api/veiculos').send(novo(c.id));
    expect(res.status).toBe(201);
    expect(res.body.placa).toBe('ABC1D23');
  });

  test('placa duplicada retorna 409', async () => {
    const c = await criarCliente();
    await criarVeiculo(c.id, { placa: 'ABC1D23' });
    const res = await request(app).post('/api/veiculos').send(novo(c.id));
    expect(res.status).toBe(409);
    expect(res.body.erro).toMatch(/placa/);
  });

  test('placa inválida retorna 400', async () => {
    const c = await criarCliente();
    expect((await request(app).post('/api/veiculos').send(novo(c.id, { placa: 'XX123' }))).status).toBe(400);
  });

  test('cliente inexistente retorna 404', async () => {
    expect((await request(app).post('/api/veiculos').send(novo(999999))).status).toBe(404);
  });

  test('filtra por clienteId', async () => {
    const a = await criarCliente();
    const b = await criarCliente({ nome: 'Outro' });
    await criarVeiculo(a.id, { placa: 'AAA1111' });
    await criarVeiculo(b.id, { placa: 'BBB2222' });
    const res = await request(app).get(`/api/veiculos?clienteId=${a.id}`);
    expect(res.body.map((v) => v.placa)).toEqual(['AAA1111']);
  });

  test('RN3: DELETE veículo com OS retorna 409', async () => {
    const c = await criarCliente();
    const v = await criarVeiculo(c.id);
    await prisma.ordemServico.create({ data: { veiculoId: v.id, descricaoProblema: 'Teste' } });
    expect((await request(app).delete(`/api/veiculos/${v.id}`)).status).toBe(409);
  });

  test('DELETE veículo sem OS retorna 204', async () => {
    const c = await criarCliente();
    const v = await criarVeiculo(c.id);
    expect((await request(app).delete(`/api/veiculos/${v.id}`)).status).toBe(204);
  });
});
