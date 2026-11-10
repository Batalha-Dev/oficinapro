const prisma = require('../lib/prisma');
const AppError = require('../lib/AppError');
const { podeTransitar, estaFechada } = require('./statusOS');

const INCLUDE = {
  veiculo: { include: { cliente: { select: { id: true, nome: true, telefone: true } } } },
  itens: { orderBy: { id: 'asc' } },
};

// RN4: total calculado no servidor; Decimal do Prisma vira number com 2 casas.
function formatar(ordem) {
  const itens = ordem.itens.map((i) => ({ ...i, valorUnitario: Number(i.valorUnitario) }));
  const centavos = itens.reduce((soma, i) => soma + Math.round(i.valorUnitario * 100) * i.quantidade, 0);
  return { ...ordem, itens, valorTotal: centavos / 100 };
}

async function carregar(id) {
  const ordem = await prisma.ordemServico.findUnique({ where: { id }, include: INCLUDE });
  if (!ordem) throw new AppError(404, 'Ordem de serviço não encontrada');
  return ordem;
}

async function carregarAberta(id) {
  const ordem = await carregar(id);
  if (estaFechada(ordem.status)) {
    throw new AppError(422, 'Ordem de serviço finalizada não pode ser alterada');
  }
  return ordem;
}

async function listar({ status, veiculoId } = {}) {
  const ordens = await prisma.ordemServico.findMany({
    where: { ...(status && { status }), ...(veiculoId && { veiculoId }) },
    orderBy: { abertaEm: 'desc' },
    include: INCLUDE,
  });
  return ordens.map(formatar);
}

async function buscar(id) {
  return formatar(await carregar(id));
}

async function criar({ veiculoId, descricaoProblema, itens }) {
  const veiculo = await prisma.veiculo.findUnique({ where: { id: veiculoId }, select: { id: true } });
  if (!veiculo) throw new AppError(404, 'Veículo não encontrado');
  const ordem = await prisma.ordemServico.create({
    data: { veiculoId, descricaoProblema, itens: { create: itens } },
    include: INCLUDE,
  });
  return formatar(ordem);
}

async function atualizar(id, { descricaoProblema }) {
  await carregarAberta(id);
  return formatar(await prisma.ordemServico.update({ where: { id }, data: { descricaoProblema }, include: INCLUDE }));
}

// OS finalizada é histórico: não pode ser apagada (RN6).
async function remover(id) {
  await carregarAberta(id);
  await prisma.ordemServico.delete({ where: { id } });
}

async function alterarStatus(id, novo) {
  const ordem = await carregar(id);
  if (!podeTransitar(ordem.status, novo)) {
    throw new AppError(422, `Não é possível mudar de ${ordem.status} para ${novo}`);
  }
  const data = { status: novo, concluidaEm: novo === 'CONCLUIDA' ? new Date() : null }; // RN7
  return formatar(await prisma.ordemServico.update({ where: { id }, data, include: INCLUDE }));
}

async function adicionarItem(id, item) {
  await carregarAberta(id);
  await prisma.itemServico.create({ data: { ...item, ordemId: id } });
  return buscar(id);
}

async function removerItem(id, itemId) {
  await carregarAberta(id);
  const { count } = await prisma.itemServico.deleteMany({ where: { id: itemId, ordemId: id } });
  if (count === 0) throw new AppError(404, 'Item não encontrado nesta ordem');
}

module.exports = { formatar, listar, buscar, criar, atualizar, remover, alterarStatus, adicionarItem, removerItem };
