const request = require('supertest');
const app = require('../src/app');
const { prisma, limparBanco, criarCliente, criarVeiculo } = require('./helpers');

beforeEach(limparBanco);
afterAll(() => prisma.$disconnect());

describe('API /clientes', () => {
  test('POST cria cliente e retorna 201', async () => {
    const res = await request(app).post('/api/clientes').send({ nome: 'Ana', telefone: '49999990000' });
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ id: expect.any(Number), nome: 'Ana' });
  });

  test('POST sem nome retorna 400 com detalhes', async () => {
    const res = await request(app).post('/api/clientes').send({ telefone: '49999990000' });
    expect(res.status).toBe(400);
    expect(res.body.detalhes[0].campo).toBe('nome');
  });

  test('GET lista clientes', async () => {
    await criarCliente({ nome: 'Bruno' });
    const res = await request(app).get('/api/clientes');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
  });

  test('GET /abc retorna 400 (ID não numérico)', async () => {
    expect((await request(app).get('/api/clientes/abc')).status).toBe(400);
  });

  test('GET /999999 retorna 404', async () => {
    const res = await request(app).get('/api/clientes/999999');
    expect(res.status).toBe(404);
    expect(res.body.erro).toMatch(/não encontrado/);
  });

  test('CPF duplicado retorna 409', async () => {
    await criarCliente({ cpf: '52998224725' });
    const res = await request(app).post('/api/clientes').send({ nome: 'Outro', telefone: '49988887777', cpf: '529.982.247-25' });
    expect(res.status).toBe(409);
    expect(res.body.erro).toMatch(/CPF/);
  });

  test('e-mail vazio em dois clientes não gera conflito', async () => {
    const a = await request(app).post('/api/clientes').send({ nome: 'Ana', telefone: '49999990000', email: '' });
    const b = await request(app).post('/api/clientes').send({ nome: 'Bia', telefone: '49999990001', email: '' });
    expect([a.status, b.status]).toEqual([201, 201]);
  });

  test('PUT atualiza cliente', async () => {
    const c = await criarCliente();
    const res = await request(app).put(`/api/clientes/${c.id}`).send({ nome: 'Novo Nome', telefone: '49911112222' });
    expect(res.status).toBe(200);
    expect(res.body.nome).toBe('Novo Nome');
  });

  test('DELETE cliente sem veículos retorna 204', async () => {
    const c = await criarCliente();
    expect((await request(app).delete(`/api/clientes/${c.id}`)).status).toBe(204);
  });

  test('RN2: DELETE cliente com veículo retorna 409', async () => {
    const c = await criarCliente();
    await criarVeiculo(c.id);
    const res = await request(app).delete(`/api/clientes/${c.id}`);
    expect(res.status).toBe(409);
  });

  test('JSON malformado retorna 400', async () => {
    const res = await request(app).post('/api/clientes').set('Content-Type', 'application/json').send('{nome:');
    expect(res.status).toBe(400);
  });
});
