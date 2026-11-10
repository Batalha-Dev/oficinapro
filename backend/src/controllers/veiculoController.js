const service = require('../services/veiculoService');
const { veiculoSchema } = require('../validators/veiculo');
const { idParam } = require('../validators/common');

async function listar(req, res) {
  const clienteId = req.query.clienteId ? idParam.parse(req.query.clienteId) : undefined;
  res.json(await service.listar({ clienteId }));
}

async function buscar(req, res) {
  res.json(await service.buscar(idParam.parse(req.params.id)));
}

async function criar(req, res) {
  res.status(201).json(await service.criar(veiculoSchema.parse(req.body)));
}

async function atualizar(req, res) {
  res.json(await service.atualizar(idParam.parse(req.params.id), veiculoSchema.parse(req.body)));
}

async function remover(req, res) {
  await service.remover(idParam.parse(req.params.id));
  res.status(204).end();
}

module.exports = { listar, buscar, criar, atualizar, remover };
