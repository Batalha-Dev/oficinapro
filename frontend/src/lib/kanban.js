import { PROXIMOS } from '../api/client.js';

// Remove acentos e caixa para a busca achar "joao" em "João".
const normalizar = (s) =>
  String(s ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();

// Busca por placa (com ou sem hífen), cliente, modelo ou descrição do problema.
export function filtrarOrdens(ordens, termo) {
  const t = normalizar(termo).replace(/-/g, '').trim();
  if (!t) return ordens;
  return ordens.filter((o) =>
    [o.veiculo.placa, o.veiculo.cliente.nome, o.veiculo.marca, o.veiculo.modelo, o.descricaoProblema, `#${o.id}`]
      .map(normalizar)
      .some((campo) => campo.replace(/-/g, '').includes(t))
  );
}

// Só aceita soltar numa coluna que seja transição válida (espelha a RN5).
export function podeSoltar(statusOrigem, statusDestino) {
  return (PROXIMOS[statusOrigem] || []).includes(statusDestino);
}
