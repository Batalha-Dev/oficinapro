const { ZodError } = require('zod');
const { Prisma } = require('@prisma/client');
const AppError = require('../lib/AppError');

const CAMPOS = { placa: 'placa', cpf: 'CPF', email: 'e-mail' };

// Converte qualquer erro em JSON { erro, detalhes? } com o status HTTP certo.
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      erro: 'Dados inválidos',
      detalhes: err.issues.map((i) => ({ campo: i.path.join('.'), mensagem: i.message })),
    });
  }
  if (err instanceof AppError) {
    return res.status(err.status).json({ erro: err.message });
  }
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      const alvo = [].concat(err.meta?.target || []).map((c) => CAMPOS[c] || c).join(', ');
      return res.status(409).json({ erro: `Já existe um cadastro com este(a) ${alvo || 'valor'}` });
    }
    if (err.code === 'P2025') return res.status(404).json({ erro: 'Registro não encontrado' });
    if (err.code === 'P2003') return res.status(409).json({ erro: 'Registro possui vínculos e não pode ser alterado' });
  }
  if (err instanceof Prisma.PrismaClientValidationError) {
    return res.status(400).json({ erro: 'Dados inválidos' });
  }
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ erro: 'JSON malformado' });
  }
  console.error(err);
  return res.status(500).json({ erro: 'Erro interno do servidor' });
}

module.exports = errorHandler;
