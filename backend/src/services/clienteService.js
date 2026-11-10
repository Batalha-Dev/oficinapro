const prisma = require('../lib/prisma');
const AppError = require('../lib/AppError');

async function listar(busca) {
  const where = busca
    ? { OR: [{ nome: { contains: busca, mode: 'insensitive' } }, { telefone: { contains: busca } }] }
    : undefined;
  return prisma.cliente.findMany({
    where,
    orderBy: { nome: 'asc' },
    include: { _count: { select: { veiculos: true } } },
  });
}

async function buscar(id) {
  const cliente = await prisma.cliente.findUnique({ where: { id }, include: { veiculos: true } });
  if (!cliente) throw new AppError(404, 'Cliente não encontrado');
  return cliente;
}

async function criar(dados) {
  return prisma.cliente.create({ data: dados });
}

async function atualizar(id, dados) {
  await buscar(id);
  // Campos opcionais ausentes viram null para permitir apagar e-mail/CPF na edição.
  return prisma.cliente.update({
    where: { id },
    data: { ...dados, email: dados.email ?? null, cpf: dados.cpf ?? null },
  });
}

// RN2: cliente com veículos não pode ser excluído.
async function remover(id) {
  const cliente = await prisma.cliente.findUnique({
    where: { id },
    include: { _count: { select: { veiculos: true } } },
  });
  if (!cliente) throw new AppError(404, 'Cliente não encontrado');
  if (cliente._count.veiculos > 0) {
    throw new AppError(409, 'Cliente possui veículos cadastrados e não pode ser excluído');
  }
  await prisma.cliente.delete({ where: { id } });
}

module.exports = { listar, buscar, criar, atualizar, remover };
