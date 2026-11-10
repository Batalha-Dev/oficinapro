const request = require('supertest');
const app = require('../src/app');
const prisma = require('../src/lib/prisma');
const { gerarToken } = require('../src/services/authService');

async function limparBanco() {
  await prisma.itemServico.deleteMany();
  await prisma.ordemServico.deleteMany();
  await prisma.veiculo.deleteMany();
  await prisma.cliente.deleteMany();
}

// Cliente HTTP já autenticado: as rotas de negócio exigem login.
function api() {
  return request.agent(app).set('Authorization', `Bearer ${gerarToken({ id: 1, nome: 'Teste' })}`);
}

async function criarCliente(dados = {}) {
  return prisma.cliente.create({ data: { nome: 'Cliente Teste', telefone: '49999990000', ...dados } });
}

async function criarVeiculo(clienteId, dados = {}) {
  return prisma.veiculo.create({
    data: { placa: 'TST1A23', marca: 'Fiat', modelo: 'Uno', ano: 2015, clienteId, ...dados },
  });
}

module.exports = { prisma, api, limparBanco, criarCliente, criarVeiculo };
