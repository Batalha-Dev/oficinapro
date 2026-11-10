const prisma = require('../lib/prisma');
const AppError = require('../lib/AppError');

async function garantirCliente(clienteId) {
  const existe = await prisma.cliente.findUnique({ where: { id: clienteId }, select: { id: true } });
  if (!existe) throw new AppError(404, 'Cliente não encontrado');
}

async function listar({ clienteId } = {}) {
  return prisma.veiculo.findMany({
    where: clienteId ? { clienteId } : undefined,
    orderBy: { placa: 'asc' },
    include: { cliente: { select: { id: true, nome: true } }, _count: { select: { ordens: true } } },
  });
}

async function buscar(id) {
  const veiculo = await prisma.veiculo.findUnique({ where: { id }, include: { cliente: true } });
  if (!veiculo) throw new AppError(404, 'Veículo não encontrado');
  return veiculo;
}

async function criar(dados) {
  await garantirCliente(dados.clienteId);
  return prisma.veiculo.create({ data: dados, include: { cliente: { select: { id: true, nome: true } } } });
}

async function atualizar(id, dados) {
  await buscar(id);
  await garantirCliente(dados.clienteId);
  return prisma.veiculo.update({
    where: { id },
    data: dados,
    include: { cliente: { select: { id: true, nome: true } } },
  });
}

// RN3: veículo com ordens de serviço não pode ser excluído (preserva histórico).
async function remover(id) {
  const veiculo = await prisma.veiculo.findUnique({ where: { id }, include: { _count: { select: { ordens: true } } } });
  if (!veiculo) throw new AppError(404, 'Veículo não encontrado');
  if (veiculo._count.ordens > 0) {
    throw new AppError(409, 'Veículo possui ordens de serviço e não pode ser excluído');
  }
  await prisma.veiculo.delete({ where: { id } });
}

module.exports = { listar, buscar, criar, atualizar, remover };
