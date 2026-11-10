// Dados de demonstração para a apresentação. Idempotente: limpa e recria.
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  await prisma.itemServico.deleteMany();
  await prisma.ordemServico.deleteMany();
  await prisma.veiculo.deleteMany();
  await prisma.cliente.deleteMany();

  const ana = await prisma.cliente.create({
    data: { nome: 'Ana Souza', telefone: '(49) 99911-2233', email: 'ana.souza@email.com', cpf: '52998224725' },
  });
  const bruno = await prisma.cliente.create({ data: { nome: 'Bruno Lima', telefone: '(49) 98822-4455' } });
  const carla = await prisma.cliente.create({
    data: { nome: 'Carla Mendes', telefone: '(49) 99733-6677', email: 'carla@email.com' },
  });

  const gol = await prisma.veiculo.create({ data: { placa: 'MKT4B21', marca: 'Volkswagen', modelo: 'Gol', ano: 2018, clienteId: ana.id } });
  const onix = await prisma.veiculo.create({ data: { placa: 'QRS1234', marca: 'Chevrolet', modelo: 'Onix', ano: 2021, clienteId: ana.id } });
  const hb20 = await prisma.veiculo.create({ data: { placa: 'LAG9C88', marca: 'Hyundai', modelo: 'HB20', ano: 2020, clienteId: bruno.id } });
  const strada = await prisma.veiculo.create({ data: { placa: 'BRA2E19', marca: 'Fiat', modelo: 'Strada', ano: 2023, clienteId: carla.id } });

  const os = (veiculoId, descricaoProblema, status, itens, extra = {}) =>
    prisma.ordemServico.create({ data: { veiculoId, descricaoProblema, status, ...extra, itens: { create: itens } } });

  await os(gol.id, 'Barulho na suspensão dianteira', 'ABERTA', []);
  await os(hb20.id, 'Revisão dos 40 mil km', 'EM_ANDAMENTO', [
    { descricao: 'Troca de óleo 5W30', quantidade: 4, valorUnitario: 42.9 },
    { descricao: 'Filtro de óleo', quantidade: 1, valorUnitario: 35 },
    { descricao: 'Mão de obra revisão', quantidade: 1, valorUnitario: 180 },
  ]);
  await os(onix.id, 'Pastilhas de freio gastas', 'CONCLUIDA', [
    { descricao: 'Jogo de pastilhas dianteiras', quantidade: 1, valorUnitario: 189.9 },
    { descricao: 'Mão de obra freios', quantidade: 1, valorUnitario: 120 },
  ], { concluidaEm: new Date() });
  await os(strada.id, 'Ar-condicionado sem gelar', 'ABERTA', [
    { descricao: 'Diagnóstico do sistema de A/C', quantidade: 1, valorUnitario: 90 },
  ]);
  await os(gol.id, 'Cliente desistiu do orçamento de pintura', 'CANCELADA', []);

  console.log('Seed concluído: 3 clientes, 4 veículos, 5 ordens de serviço.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
