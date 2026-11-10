// RN5: máquina de estados da ordem de serviço.
const TRANSICOES = {
  ABERTA: ['EM_ANDAMENTO', 'CANCELADA'],
  EM_ANDAMENTO: ['CONCLUIDA', 'CANCELADA'],
  CONCLUIDA: [],
  CANCELADA: [],
};

function podeTransitar(de, para) {
  return (TRANSICOES[de] || []).includes(para);
}

// RN6: OS finalizada fica somente leitura.
function estaFechada(status) {
  return status === 'CONCLUIDA' || status === 'CANCELADA';
}

module.exports = { TRANSICOES, podeTransitar, estaFechada };
