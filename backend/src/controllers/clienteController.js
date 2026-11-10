const service = require('../services/clienteService');
const { clienteSchema } = require('../validators/cliente');
const { idParam } = require('../validators/common');

// Controllers só lidam com HTTP: validam entrada, chamam o service e respondem.
// Express 5 repassa erros de funções async ao errorHandler automaticamente.

async function listar(req, res) {
  res.json(await service.listar(req.query.busca));
}

async function buscar(req, res) {
  res.json(await service.buscar(idParam.parse(req.params.id)));
}

async function criar(req, res) {
  res.status(201).json(await service.criar(clienteSchema.parse(req.body)));
}

async function atualizar(req, res) {
  res.json(await service.atualizar(idParam.parse(req.params.id), clienteSchema.parse(req.body)));
}

async function remover(req, res) {
  await service.remover(idParam.parse(req.params.id));
  res.status(204).end();
}

module.exports = { listar, buscar, criar, atualizar, remover };
