const prisma = require('../src/lib/prisma');

async function limparBanco() {
  await prisma.itemServico.deleteMany();
  await prisma.ordemServico.deleteMany();
  await prisma.veiculo.deleteMany();
  await prisma.cliente.deleteMany();
}

async function criarCliente(dados = {}) {
  return prisma.cliente.create({ data: { nome: 'Cliente Teste', telefone: '49999990000', ...dados } });
}

async function criarVeiculo(clienteId, dados = {}) {
  return prisma.veiculo.create({
    data: { placa: 'TST1A23', marca: 'Fiat', modelo: 'Uno', ano: 2015, clienteId, ...dados },
  });
}

module.exports = { prisma, limparBanco, criarCliente, criarVeiculo };
