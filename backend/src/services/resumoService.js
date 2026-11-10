const prisma = require('../lib/prisma');
const { formatar } = require('./ordemService');

// Números do mês corrente para o topo do painel.
async function doMes(agora = new Date()) {
  const inicio = new Date(agora.getFullYear(), agora.getMonth(), 1);
  const fim = new Date(agora.getFullYear(), agora.getMonth() + 1, 1);

  const [grupos, concluidas] = await Promise.all([
    prisma.ordemServico.groupBy({ by: ['status'], _count: { _all: true } }),
    prisma.ordemServico.findMany({
      where: { status: 'CONCLUIDA', concluidaEm: { gte: inicio, lt: fim } },
      include: { itens: true },
    }),
  ]);

  const porStatus = { ABERTA: 0, EM_ANDAMENTO: 0, CONCLUIDA: 0, CANCELADA: 0 };
  for (const g of grupos) porStatus[g.status] = g._count._all;

  const centavos = concluidas.reduce((s, o) => s + Math.round(formatar(o).valorTotal * 100), 0);
  const qtd = concluidas.length;

  return {
    porStatus,
    concluidasNoMes: qtd,
    faturamentoMes: centavos / 100,
    ticketMedio: qtd ? Math.round(centavos / qtd) / 100 : 0,
  };
}

module.exports = { doMes };
