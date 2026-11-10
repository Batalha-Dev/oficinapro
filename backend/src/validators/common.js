const { z } = require('zod');

// Placa antiga (ABC1234) ou Mercosul (ABC1D23), após remover hífen/espaços.
const PLACA_REGEX = /^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/;

function normalizarPlaca(valor) {
  return String(valor)
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '');
}

const idParam = z.coerce
  .number({ invalid_type_error: 'ID deve ser numérico' })
  .int('ID inválido')
  .positive('ID inválido')
  .max(2147483647, 'ID inválido'); // limite do INT4 do Postgres: evita erro 500

// String opcional: "" ou só espaços vira undefined (não grava vazio no banco).
const textoOpcional = z.preprocess(
  (v) => (typeof v === 'string' && v.trim() === '' ? undefined : v),
  z.string().trim().optional()
);

module.exports = { z, PLACA_REGEX, normalizarPlaca, idParam, textoOpcional };
